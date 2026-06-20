import { NextRequest, NextResponse } from 'next/server';
import { Student } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';
import { logAction } from '@/lib/audit-logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const { id } = await params;
    const headerTenantId = request.headers.get('x-tenant-id') || tenantContext.tenantId;
    const student = await TenantQuery.findById(Student, headerTenantId, id);

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch student', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (!validateRequestAccess(role, userTenantId, Role.INSTITUTION_ADMIN, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const student = await TenantQuery.findOneAndUpdate(
      Student,
      headerTenantId,
      { _id: id },
      { ...data, updatedAt: new Date() }
    );

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'update',
      'Student',
      student._id.toString(),
      `Updated student ${student.firstName} ${student.lastName}`
    );

    return NextResponse.json({ student });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to update student', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (!validateRequestAccess(role, userTenantId, Role.INSTITUTION_ADMIN, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { id } = await params;
    const student = await TenantQuery.findById(Student, headerTenantId, id);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    await TenantQuery.deleteOne(Student, headerTenantId, { _id: id });

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'delete',
      'Student',
      id,
      `Deleted student ${student.firstName} ${student.lastName}`
    );

    return NextResponse.json({ message: 'Student deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to delete student', error: error.message },
      { status: 500 }
    );
  }
}
