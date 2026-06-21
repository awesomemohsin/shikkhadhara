import { NextRequest, NextResponse } from 'next/server';
import { BookIssue, LibraryBook } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const headerTenantId = request.headers.get('x-tenant-id') || tenantContext.tenantId;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { role, tenantId: tokenTenantId, organizationId: tokenOrgId } = decoded;
    const userTenantId = tokenTenantId || tokenOrgId;

    if (!validateRequestAccess(role, userTenantId, Role.TEACHER, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const id = params.id;
    const data = await request.json(); // e.g. status: 'returned'

    const issue = await TenantQuery.findById(BookIssue, headerTenantId, id);
    if (!issue) {
      return NextResponse.json({ message: 'Issuance log not found' }, { status: 404 });
    }

    const oldStatus = issue.status;
    const newStatus = data.status;

    issue.status = newStatus;
    if (newStatus === 'returned') {
      issue.returnDate = new Date();
    }
    await issue.save();

    // Adjust availability
    if (oldStatus === 'issued' && newStatus === 'returned') {
      const book = await TenantQuery.findById(LibraryBook, headerTenantId, issue.bookId);
      if (book) {
        book.available = Math.min(book.quantity, book.available + 1);
        await book.save();
      }
    }

    return NextResponse.json({ issue });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const headerTenantId = request.headers.get('x-tenant-id') || tenantContext.tenantId;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { role, tenantId: tokenTenantId, organizationId: tokenOrgId } = decoded;
    const userTenantId = tokenTenantId || tokenOrgId;

    if (!validateRequestAccess(role, userTenantId, Role.TEACHER, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const id = params.id;
    const issue = await TenantQuery.findById(BookIssue, headerTenantId, id);
    if (!issue) {
      return NextResponse.json({ message: 'Issuance log not found' }, { status: 404 });
    }

    // If it was never returned, increment available book count back
    if (issue.status === 'issued') {
      const book = await TenantQuery.findById(LibraryBook, headerTenantId, issue.bookId);
      if (book) {
        book.available = Math.min(book.quantity, book.available + 1);
        await book.save();
      }
    }

    await TenantQuery.deleteOne(BookIssue, headerTenantId, { _id: id });
    return NextResponse.json({ message: 'Issuance log deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
