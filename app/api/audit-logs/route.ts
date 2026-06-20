import { NextRequest, NextResponse } from 'next/server';
import { AuditLog } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');
    const userEmail = searchParams.get('userEmail');

    const query: any = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: 'i' };

    const logs = await TenantQuery.find(AuditLog, headerTenantId, query, null, {
      sort: { createdAt: -1 },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
