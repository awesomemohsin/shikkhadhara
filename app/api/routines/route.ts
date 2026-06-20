import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Routine, Teacher } from '@/lib/models';
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

    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');
    const section = searchParams.get('section');
    const teacherId = searchParams.get('teacherId');

    let filter: any = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (teacherId) filter.teacherId = teacherId;

    // Retrieve routines and populate the teacher details
    const routines = await TenantQuery.find(Routine, headerTenantId, filter);
    
    // Manual population of teacherId since we are in tenant isolation queries
    const routinesWithTeacher = await Promise.all(
      routines.map(async (routine: any) => {
        const doc = routine.toObject();
        if (doc.teacherId) {
          const teacher = await TenantQuery.findById(Teacher, headerTenantId, doc.teacherId);
          doc.teacher = teacher;
        }
        return doc;
      })
    );

    return NextResponse.json({ routines: routinesWithTeacher });
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
    if (!decoded || !['admin', 'super_admin', 'owner'].includes(decoded.role)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const data = await request.json();
    const { class: className, section, subject, teacherId, dayOfWeek, startTime, endTime, room } = data;

    if (!className || !section || !subject || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ message: 'Missing required routine fields' }, { status: 400 });
    }

    // 1. Conflict Check: Teacher overlap in this tenant
    // Find all routines scheduled for this teacher on this day
    const teacherRoutines = await TenantQuery.find(Routine, headerTenantId, {
      teacherId,
      dayOfWeek,
    });

    for (const rot of teacherRoutines) {
      if (startTime < rot.endTime && endTime > rot.startTime) {
        return NextResponse.json(
          { message: `Teacher scheduling conflict: This teacher is already assigned to ${rot.class} (${rot.section}) from ${rot.startTime} to ${rot.endTime} on ${dayOfWeek}.` },
          { status: 400 }
        );
      }
    }

    // 2. Conflict Check: Class/Section overlap in this tenant
    const classRoutines = await TenantQuery.find(Routine, headerTenantId, {
      class: className,
      section,
      dayOfWeek,
    });

    for (const rot of classRoutines) {
      if (startTime < rot.endTime && endTime > rot.startTime) {
        return NextResponse.json(
          { message: `Class schedule conflict: ${className} (${section}) already has a class scheduled for ${rot.subject} from ${rot.startTime} to ${rot.endTime} on ${dayOfWeek}.` },
          { status: 400 }
        );
      }
    }

    // 3. Conflict Check: Room overlap in this tenant (if room is provided)
    if (room) {
      const roomRoutines = await TenantQuery.find(Routine, headerTenantId, {
        room,
        dayOfWeek,
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

    // Create routine entry
    const routine = await TenantQuery.create(Routine, headerTenantId, {
      class: className,
      section,
      subject,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    });

    return NextResponse.json({ routine }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
