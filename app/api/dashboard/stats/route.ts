import { NextRequest, NextResponse } from 'next/server';
import { Student, Teacher, Staff, Fee, Attendance, Session, Salary, Section } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';

export async function GET(request: NextRequest) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const { service } = tenantContext;

    // Fetch metrics scoped to tenant
    const totalStudents = await service.countDocuments(Student, {});
    const totalTeachers = await service.countDocuments(Teacher, {});
    const totalStaff = await service.countDocuments(Staff, {});
    const totalSessions = await service.countDocuments(Session, {});

    // Compute unique classes list dynamically
    const studentClasses = await Student.distinct('class', { tenantId: service.getTenantId() });
    const sectionClasses = await Section.distinct('class', { tenantId: service.getTenantId() });
    const uniqueClasses = Array.from(new Set([...studentClasses, ...sectionClasses]));
    const totalClasses = uniqueClasses.length;

    // Calculate dynamic expenses based on paid salaries
    const salaries = await service.find(Salary, { status: 'paid' });
    let totalExpenses = 0;
    salaries.forEach((s: any) => {
      totalExpenses += s.netSalary || 0;
    });

    // Fees aggregated data
    const fees = await service.find(Fee, {});
    let collectedFees = 0;
    let pendingFees = 0;
    fees.forEach((f: any) => {
      collectedFees += f.amountPaid || 0;
      pendingFees += (f.amount || 0) - (f.amountPaid || 0);
    });

    // Attendance stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await service.find(Attendance, {
      date: { $gte: today }
    });

    const presentStudents = todayAttendance.filter((a: any) => a.status === 'present').length;
    const studentAttendanceRate = todayAttendance.length > 0 
      ? Math.round((presentStudents / todayAttendance.length) * 100) 
      : 0;

    // Active academic session name
    const activeSessionDoc = await service.findOne(Session, { status: 'active' });
    const activeSessionName = activeSessionDoc ? activeSessionDoc.name : (totalSessions > 0 ? '2026-2027' : '—');

    const stats = {
      totalStudents: totalStudents,
      totalStaff: totalTeachers + totalStaff,
      totalClasses: totalClasses,
      totalExpenses: totalExpenses,
      studentAttendance: studentAttendanceRate > 0 ? `${studentAttendanceRate}%` : '—',
      staffAttendance: '—', // Staff attendance tracking is not implemented in schemas
      collectedFees: collectedFees,
      pendingFees: pendingFees,
      activeSession: activeSessionName,
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch dashboard stats', error: error.message },
      { status: 500 }
    );
  }
}
