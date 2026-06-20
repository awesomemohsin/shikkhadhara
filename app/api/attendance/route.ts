import { NextRequest, NextResponse } from 'next/server';
import { Attendance, Student } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { verifyToken } from '@/lib/auth-utils';
import { sendGuardianAttendanceNotification } from '@/lib/notification-service';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    // Feature Flag Check
    if (tenantContext.featureFlags?.attendance === false) {
      return NextResponse.json(
        { message: 'Attendance module is disabled for this institution.' },
        { status: 403 }
      );
    }

    const headerTenantId = request.headers.get('x-tenant-id') || tenantContext.tenantId;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { role, tenantId: tokenTenantId, organizationId: tokenOrgId } = decoded;
    const userTenantId = tokenTenantId || tokenOrgId;

    // Verify RBAC access
    if (!validateRequestAccess(role, userTenantId, Role.TEACHER, headerTenantId)) {
      return NextResponse.json(
        { message: 'Forbidden: Insufficient permissions or tenant mismatch' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const class_ = searchParams.get('class');
    const date = searchParams.get('date');

    let query: any = {};

    if (class_) query.class = class_;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Query strictly isolated through TenantQuery
    const attendance = await TenantQuery.find(Attendance, headerTenantId, query, null, {
      sort: { date: -1 },
    });

    // Populate student info
    const populatedAttendance = await Attendance.populate(attendance, {
      path: 'studentId',
      select: 'firstName lastName enrollmentId guardianName guardianPhone',
    });

    return NextResponse.json({ attendance: populatedAttendance });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch attendance', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    // Feature Flag Check
    if (tenantContext.featureFlags?.attendance === false) {
      return NextResponse.json(
        { message: 'Attendance module is disabled for this institution.' },
        { status: 403 }
      );
    }

    const headerTenantId = request.headers.get('x-tenant-id') || tenantContext.tenantId;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { role, tenantId: tokenTenantId, organizationId: tokenOrgId, userId: recordedBy } = decoded;
    const userTenantId = tokenTenantId || tokenOrgId;

    // Verify RBAC access
    if (!validateRequestAccess(role, userTenantId, Role.TEACHER, headerTenantId)) {
      return NextResponse.json(
        { message: 'Forbidden: Insufficient permissions or tenant mismatch' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const webhookUrl = tenantContext.settings.notificationWebhook || tenantContext.settings.webhookUrl;

    // Handle bulk attendance
    if (Array.isArray(data)) {
      const records = data.map((record) => ({
        ...record,
        recordedBy,
      }));

      // Insert using TenantQuery wrapper
      const attendance = await TenantQuery.insertMany(Attendance, headerTenantId, records);

      // Filter absent/late records for guardian alert
      const absentOrLateRecords = records.filter(
        (r) => r.status === 'absent' || r.status === 'late'
      );

      if (absentOrLateRecords.length > 0) {
        const studentIds = absentOrLateRecords.map((r) => r.studentId);
        const students = await TenantQuery.find(Student, headerTenantId, { _id: { $in: studentIds } });
        const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

        for (const record of absentOrLateRecords) {
          const student = studentMap.get(record.studentId.toString());
          if (student) {
            sendGuardianAttendanceNotification(tenantContext.service, student, record, webhookUrl);
          }
        }
      }

      return NextResponse.json({ attendance }, { status: 201 });
    }

    // Single attendance record
    const attendance = await TenantQuery.create(Attendance, headerTenantId, {
      ...data,
      recordedBy,
    });

    if (data.status === 'absent' || data.status === 'late') {
      const student = await TenantQuery.findById(Student, headerTenantId, data.studentId);
      if (student) {
        sendGuardianAttendanceNotification(tenantContext.service, student, data, webhookUrl);
      }
    }

    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to record attendance', error: error.message },
      { status: 500 }
    );
  }
}
