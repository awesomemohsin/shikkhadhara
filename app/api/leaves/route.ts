import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LeaveRequest, User } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { verifyToken } from '@/lib/auth-utils';

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

    const { role, userId } = decoded;
    const isAdmin = ['admin', 'super_admin', 'owner'].includes(role);

    let filter: any = {};
    // If not admin, restrict to user's own leaves
    if (!isAdmin) {
      filter.userId = userId;
    }

    const leaves = await TenantQuery.find(LeaveRequest, headerTenantId, filter, null, {
      sort: { createdAt: -1 }
    });

    // Populate user profile info (firstName, lastName) for admin display
    const leavesWithUser = await Promise.all(
      leaves.map(async (leave: any) => {
        const doc = leave.toObject();
        const userObj = await User.findById(doc.userId).select('firstName lastName role');
        doc.user = userObj;
        return doc;
      })
    );

    return NextResponse.json({ leaves: leavesWithUser });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const data = await request.json();
    const { leaveType, startDate, endDate, reason } = data;

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ message: 'Missing required leave fields' }, { status: 400 });
    }

    const leave = await TenantQuery.create(LeaveRequest, headerTenantId, {
      userId: decoded.userId,
      userEmail: decoded.email,
      role: decoded.role,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'pending',
    });

    return NextResponse.json({ leave }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
