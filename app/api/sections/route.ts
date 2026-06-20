import { NextRequest, NextResponse } from 'next/server';
import { Section } from '@/lib/models';
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

    const sections = await TenantQuery.find(Section, headerTenantId, query, null, { sort: { name: 1 } });
    return NextResponse.json({ sections });
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
    const section = await TenantQuery.create(Section, headerTenantId, data);

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'create',
      'Section',
      section._id.toString(),
      `Created section ${section.name} for Class ${section.class}`
    );

    return NextResponse.json({ section }, { status: 201 });
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
    const className = searchParams.get('class');

    const data = await request.json();

    if (id) {
      const section = await TenantQuery.findOneAndUpdate(
        Section,
        headerTenantId,
        { _id: id },
        { ...data, updatedAt: new Date() }
      );
      if (!section) {
        return NextResponse.json({ message: 'Section not found' }, { status: 404 });
      }
      await logAction(
        headerTenantId,
        decoded.userId,
        decoded.email,
        'update',
        'Section',
        id,
        `Updated section ${section.name} (Class ${section.class})`
      );
      return NextResponse.json({ section });
    } else if (className) {
      const result = await TenantQuery.updateMany(
        Section,
        headerTenantId,
        { class: className },
        { ...data, updatedAt: new Date() }
      );
      await logAction(
        headerTenantId,
        decoded.userId,
        decoded.email,
        'update',
        'Section',
        undefined,
        `Updated monthly fee / settings for all sections of Class ${className}`
      );
      return NextResponse.json({ message: 'Sections updated successfully', count: result.modifiedCount });
    } else {
      return NextResponse.json({ message: 'Missing id or class query parameter' }, { status: 400 });
    }
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
      return NextResponse.json({ message: 'Missing section id or class parameter' }, { status: 400 });
    }

    if (id) {
      const section = await TenantQuery.findById(Section, headerTenantId, id);
      if (!section) {
        return NextResponse.json({ message: 'Section not found' }, { status: 404 });
      }
      await TenantQuery.deleteOne(Section, headerTenantId, { _id: id });
      await logAction(
        headerTenantId,
        decoded.userId,
        decoded.email,
        'delete',
        'Section',
        id,
        `Deleted section ${section.name} of Class ${section.class}`
      );
      return NextResponse.json({ message: 'Section deleted successfully' });
    } else {
      await TenantQuery.deleteMany(Section, headerTenantId, { class: className });
      await logAction(
        headerTenantId,
        decoded.userId,
        decoded.email,
        'delete',
        'Section',
        undefined,
        `Deleted all sections for Class ${className}`
      );
      return NextResponse.json({ message: `All sections for Class ${className} deleted successfully` });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
