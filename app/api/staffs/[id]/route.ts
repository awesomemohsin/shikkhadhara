import { NextRequest, NextResponse } from 'next/server';
import { Teacher } from '@/lib/models';
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
    const teacher = await TenantQuery.findById(Teacher, headerTenantId, id);

    if (!teacher) {
      return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch staff member', error: error.message },
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
    const teacher = await TenantQuery.findOneAndUpdate(
      Teacher,
      headerTenantId,
      { _id: id },
      { ...data, updatedAt: new Date() }
    );

    if (!teacher) {
      return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
    }

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'update',
      'Teacher',
      teacher._id.toString(),
      `Updated staff member ${teacher.firstName} ${teacher.lastName}`
    );

    return NextResponse.json({ teacher });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to update staff member', error: error.message },
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
    const teacher = await TenantQuery.findById(Teacher, headerTenantId, id);
    if (!teacher) {
      return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
    }

    await TenantQuery.deleteOne(Teacher, headerTenantId, { _id: id });

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'delete',
      'Teacher',
      id,
      `Deleted staff member ${teacher.firstName} ${teacher.lastName}`
    );

    return NextResponse.json({ message: 'Staff member deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to delete staff member', error: error.message },
      { status: 500 }
    );
  }
}
