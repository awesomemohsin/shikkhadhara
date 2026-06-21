import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Student, Section, Fee } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';
import { logAction } from '@/lib/audit-logger';

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

    const data = await request.json(); // Expect { students: Array }
    if (!data.students || !Array.isArray(data.students)) {
      return NextResponse.json({ message: 'Invalid data format. Expected an array of students' }, { status: 400 });
    }

    const createdStudents = [];
    for (const studentData of data.students) {
      // Validate required fields
      if (!studentData.firstName || !studentData.class) {
        continue;
      }
      
      const student = await TenantQuery.create(Student, headerTenantId, {
        ...studentData,
        enrollmentId: `ENR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      });
      createdStudents.push(student);

      // Auto-generate tuition fee for the student
      try {
        const section = await TenantQuery.findOne(Section, headerTenantId, { class: studentData.class });
        const monthlyFee = section?.monthlyFee || 0;
        const discount = studentData.isSpecialChild ? (studentData.discountPercentage || 0) : 0;
        const finalAmount = monthlyFee * (1 - (discount / 100));

        const today = new Date();
        const currentMonth = today.toLocaleString('default', { month: 'short' });
        const currentYear = today.getFullYear();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);

        await TenantQuery.create(Fee, headerTenantId, {
          studentId: student._id,
          feeType: 'Tuition Fee',
          amount: finalAmount,
          amountPaid: 0,
          dueDate,
          status: 'pending',
          month: currentMonth,
          year: currentYear,
          description: `Auto-generated tuition fee for Class ${student.class}${discount > 0 ? ` (Special Child Discount: ${discount}%)` : ''}`
        });
      } catch (feeError) {
        console.error('Failed to auto-generate tuition fee:', feeError);
      }
    }

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'create',
      'Student',
      'bulk',
      `Bulk imported ${createdStudents.length} students`
    );

    return NextResponse.json({ 
      message: `Successfully imported ${createdStudents.length} students`,
      count: createdStudents.length 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to bulk import students', error: error.message },
      { status: 500 }
    );
  }
}
