import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { FeeCategory } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { verifyToken } from '@/lib/auth-utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (!decoded || !['admin', 'super_admin', 'owner'].includes(decoded.role)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    // Check duplicate excluding current ID
    const existing = await TenantQuery.findOne(FeeCategory, headerTenantId, {
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id }
    });
    if (existing) {
      return NextResponse.json({ message: 'Fee category with this name already exists' }, { status: 409 });
    }

    const category = await TenantQuery.findOneAndUpdate(
      FeeCategory,
      headerTenantId,
      { _id: id },
      {
        name: name.trim(),
        description,
        updatedAt: new Date(),
      }
    );

    if (!category) {
      return NextResponse.json({ message: 'Fee category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (!decoded || !['admin', 'super_admin', 'owner'].includes(decoded.role)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { id } = await params;
    const result = await TenantQuery.deleteOne(FeeCategory, headerTenantId, { _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Fee category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Fee category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
