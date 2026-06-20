import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Routine } from '@/lib/models';
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
    const { class: className, section, subject, teacherId, dayOfWeek, startTime, endTime, room } = data;

    if (!className || !section || !subject || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ message: 'Missing required routine fields' }, { status: 400 });
    }

    // 1. Conflict Check: Teacher overlap (excluding current routine ID)
    const teacherRoutines = await TenantQuery.find(Routine, headerTenantId, {
      teacherId,
      dayOfWeek,
      _id: { $ne: id },
    });

    for (const rot of teacherRoutines) {
      if (startTime < rot.endTime && endTime > rot.startTime) {
        return NextResponse.json(
          { message: `Teacher scheduling conflict: This teacher is already assigned to ${rot.class} (${rot.section}) from ${rot.startTime} to ${rot.endTime} on ${dayOfWeek}.` },
          { status: 400 }
        );
      }
    }

    // 2. Conflict Check: Class/Section overlap (excluding current routine ID)
    const classRoutines = await TenantQuery.find(Routine, headerTenantId, {
      class: className,
      section,
      dayOfWeek,
      _id: { $ne: id },
    });

    for (const rot of classRoutines) {
      if (startTime < rot.endTime && endTime > rot.startTime) {
        return NextResponse.json(
          { message: `Class schedule conflict: ${className} (${section}) already has a class scheduled for ${rot.subject} from ${rot.startTime} to ${rot.endTime} on ${dayOfWeek}.` },
          { status: 400 }
        );
      }
    }

    // 3. Conflict Check: Room overlap (excluding current routine ID)
    if (room) {
      const roomRoutines = await TenantQuery.find(Routine, headerTenantId, {
        room,
        dayOfWeek,
        _id: { $ne: id },
      });

      for (const rot of roomRoutines) {
        if (startTime < rot.endTime && endTime > rot.startTime) {
          return NextResponse.json(
            { message: `Room conflict: Room ${room} is already booked for ${rot.class} (${rot.section}) from ${rot.startTime} to ${rot.endTime} on ${dayOfWeek}.` },
            { status: 400 }
          );
        }
      }
    }

    const routine = await TenantQuery.findOneAndUpdate(
      Routine,
      headerTenantId,
      { _id: id },
      {
        class: className,
        section,
        subject,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        room,
        updatedAt: new Date(),
      }
    );

    if (!routine) {
      return NextResponse.json({ message: 'Routine not found' }, { status: 404 });
    }

    return NextResponse.json({ routine });
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
    const result = await TenantQuery.deleteOne(Routine, headerTenantId, { _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Routine not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Routine deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
