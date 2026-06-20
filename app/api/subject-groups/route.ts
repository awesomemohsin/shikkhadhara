import { NextRequest, NextResponse } from 'next/server';
import { SubjectGroup } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';
import { logAction } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const headerTenantId = request.headers.get('x-tenant-id') || tenantContext.tenantId;
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');
    
    const query: any = {};
    if (className) {
      query.class = className;
    }

    const subjectGroups = await TenantQuery.find(SubjectGroup, headerTenantId, query, null, { sort: { name: 1 } });
    return NextResponse.json({ subjectGroups });
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

    if (!validateRequestAccess(role, userTenantId, Role.INSTITUTION_ADMIN, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const data = await request.json();
    const subjectGroup = await TenantQuery.create(SubjectGroup, headerTenantId, data);

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'create',
      'SubjectGroup',
      subjectGroup._id.toString(),
      `Created subject group ${subjectGroup.name} for Class ${subjectGroup.class}`
    );

    return NextResponse.json({ subjectGroup }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing subject group id parameter' }, { status: 400 });
    }

    const data = await request.json();
    const subjectGroup = await TenantQuery.findOneAndUpdate(
      SubjectGroup,
      headerTenantId,
      { _id: id },
      { ...data, updatedAt: new Date() }
    );

    if (!subjectGroup) {
      return NextResponse.json({ message: 'Subject Group not found' }, { status: 404 });
    }

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'update',
      'SubjectGroup',
      id,
      `Updated subject group ${subjectGroup.name} (Class ${subjectGroup.class})`
    );

    return NextResponse.json({ subjectGroup });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const className = searchParams.get('class');

    if (!id && !className) {
      return NextResponse.json({ message: 'Missing subject group id or class parameter' }, { status: 400 });
    }

    if (id) {
      const sg = await TenantQuery.findById(SubjectGroup, headerTenantId, id);
      if (!sg) {
        return NextResponse.json({ message: 'Subject Group not found' }, { status: 404 });
      }

      await TenantQuery.deleteOne(SubjectGroup, headerTenantId, { _id: id });

      await logAction(
        headerTenantId,
        decoded.userId,
        decoded.email,
        'delete',
        'SubjectGroup',
        id,
        `Deleted subject group ${sg.name} for Class ${sg.class}`
      );

      return NextResponse.json({ message: 'Subject Group deleted successfully' });
    } else {
      await TenantQuery.deleteMany(SubjectGroup, headerTenantId, { class: className });
      await logAction(
        headerTenantId,
        decoded.userId,
        decoded.email,
        'delete',
        'SubjectGroup',
        undefined,
        `Deleted all subject groups for Class ${className}`
      );
      return NextResponse.json({ message: `All subject groups for Class ${className} deleted successfully` });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
