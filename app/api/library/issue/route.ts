import { NextRequest, NextResponse } from 'next/server';
import { BookIssue, LibraryBook } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
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

    if (!validateRequestAccess(role, userTenantId, Role.STUDENT, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    // Find and populate book info
    const filter = TenantQuery.injectTenantFilter(headerTenantId, {});
    const issues = await BookIssue.find(filter)
      .populate('bookId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ issues });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const data = await request.json();
    if (!data.bookId || !data.borrowerType || !data.borrowerId || !data.borrowerName || !data.dueDate) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Verify book availability
    const book = await TenantQuery.findById(LibraryBook, headerTenantId, data.bookId);
    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }
    if (book.available <= 0) {
      return NextResponse.json({ message: 'Book is currently out of stock / unavailable' }, { status: 400 });
    }

    // Create issue record
    const issue = await TenantQuery.create(BookIssue, headerTenantId, {
      bookId: data.bookId,
      borrowerType: data.borrowerType,
      borrowerId: data.borrowerId,
      borrowerName: data.borrowerName,
      dueDate: new Date(data.dueDate),
      status: 'issued',
    });

    // Decrement available count
    book.available = Math.max(0, book.available - 1);
    await book.save();

    return NextResponse.json({ issue }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
