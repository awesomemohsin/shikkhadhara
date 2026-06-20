import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LeaveRequest } from '@/lib/models';
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
    const { status, remarks } = data;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ message: 'Invalid or missing status parameter' }, { status: 400 });
    }

    const leave = await TenantQuery.findOneAndUpdate(
      LeaveRequest,
      headerTenantId,
      { _id: id },
      {
        status,
        remarks,
        approvedBy: decoded.userId,
        updatedAt: new Date(),
      }
    );

    if (!leave) {
      return NextResponse.json({ message: 'Leave request not found' }, { status: 404 });
    }

    return NextResponse.json({ leave });
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
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    
    // Find the leave request first to check ownership and status
    const leave = await TenantQuery.findOne(LeaveRequest, headerTenantId, { _id: id });
    if (!leave) {
      return NextResponse.json({ message: 'Leave request not found' }, { status: 404 });
    }

    const isAdmin = ['admin', 'super_admin', 'owner'].includes(decoded.role);
    
    // Non-admins can only delete their own PENDING leaves
    if (!isAdmin) {
      if (leave.userId.toString() !== decoded.userId) {
        return NextResponse.json({ message: 'Forbidden: Cannot access another user\'s leave request' }, { status: 403 });
      }
      if (leave.status !== 'pending') {
        return NextResponse.json({ message: 'Forbidden: Cannot delete an already approved or rejected leave request' }, { status: 400 });
      }
    }

    await TenantQuery.deleteOne(LeaveRequest, headerTenantId, { _id: id });

    return NextResponse.json({ message: 'Leave request deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
