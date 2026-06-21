import { NextRequest, NextResponse } from 'next/server';
import { Student, Attendance, Transaction, BehaviourLog } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'attendance';
    const selectedClass = searchParams.get('class') || '8';
    const dateFrom = searchParams.get('dateFrom') || '2026-06-01';
    const dateTo = searchParams.get('dateTo') || '2026-06-30';

    const fullClassName = selectedClass.startsWith('Class') ? selectedClass : `Class ${selectedClass}`;

    if (type === 'attendance') {
      const students = await TenantQuery.find(Student, headerTenantId, { class: fullClassName });
      const studentIds = students.map((s: any) => s._id);

      const start = new Date(dateFrom);
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);

      const attendanceRecords = await TenantQuery.find(Attendance, headerTenantId, {
        studentId: { $in: studentIds },
        date: { $gte: start, $lte: end },
      });

      const data = students.map((s: any) => {
        const studentAttendance = attendanceRecords.filter(
          (r: any) => r.studentId.toString() === s._id.toString()
        );
        const present = studentAttendance.filter((r: any) => r.status === 'present' || r.status === 'late').length;
        const absent = studentAttendance.filter((r: any) => r.status === 'absent').length;
        const total = present + absent;
        const percentage = total > 0 ? `${Math.round((present / total) * 100)}%` : '100%';

        return {
          name: `${s.firstName} ${s.lastName || ''}`.trim(),
          roll: s.rollNumber || 'N/A',
          present,
          absent,
          percentage,
        };
      });

      return NextResponse.json({ data });
    }

    if (type === 'income') {
      const incomes = await TenantQuery.find(Transaction, headerTenantId, {
        type: 'income',
        date: { $gte: dateFrom, $lte: dateTo },
      });

      const data = incomes.map((inc: any) => ({
        title: inc.title,
        amount: inc.amount,
        category: inc.category,
        payer: inc.payer || 'Anonymous',
        date: inc.date.includes('-') ? new Date(inc.date).toLocaleDateString() : inc.date,
      }));

      return NextResponse.json({ data });
    }

    if (type === 'expenses') {
      const expenses = await TenantQuery.find(Transaction, headerTenantId, {
        type: 'expense',
        date: { $gte: dateFrom, $lte: dateTo },
      });

      const data = expenses.map((exp: any) => ({
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        vendor: exp.vendor || 'Unknown Vendor',
        date: exp.date.includes('-') ? new Date(exp.date).toLocaleDateString() : exp.date,
      }));

      return NextResponse.json({ data });
    }

    if (type === 'behaviour') {
      const logs = await TenantQuery.find(BehaviourLog, headerTenantId, {
        class: fullClassName,
        createdAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
      });

      const data = logs.map((log: any) => ({
        name: log.studentName,
        roll: log.studentRoll || 'N/A',
        incident: log.incident,
        type: log.type,
        points: log.points,
      }));

      return NextResponse.json({ data });
    }

    return NextResponse.json({ data: [] });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
