import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Student, Section, Fee, Parent } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';
import { logAction } from '@/lib/audit-logger';

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

    const { role, tenantId: tokenTenantId, organizationId: tokenOrgId, userId } = decoded;
    const userTenantId = tokenTenantId || tokenOrgId;

    // Permit STUDENT and above roles
    if (!validateRequestAccess(role, userTenantId, Role.STUDENT, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const class_ = searchParams.get('class');
    const status = searchParams.get('status');

    let query: any = {};
    if (class_) query.class = class_;
    if (status) query.status = status;

    // Enforce role-based strict scoping
    if (role === 'student') {
      query.userId = userId;
    } else if (role === 'parent') {
      const parentDoc = await TenantQuery.findOne(Parent, headerTenantId, { userId });
      if (!parentDoc) {
        return NextResponse.json({ students: [] });
      }
      query._id = { $in: parentDoc.childrenIds };
    }

    const students = await TenantQuery.find(Student, headerTenantId, query, null, { sort: { firstName: 1 } });
    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch students', error: error.message },
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

    // Only admins and owner can add students
    if (!validateRequestAccess(role, userTenantId, Role.INSTITUTION_ADMIN, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const data = await request.json();
    const student = await TenantQuery.create(Student, headerTenantId, {
      ...data,
      enrollmentId: `ENR-${Date.now()}`,
    });

    try {
      const section = await TenantQuery.findOne(Section, headerTenantId, { class: data.class });
      const monthlyFee = section?.monthlyFee || 0;
      
      const discount = data.isSpecialChild ? (data.discountPercentage || 0) : 0;
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

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'create',
      'Student',
      student._id.toString(),
      `Created student ${student.firstName} ${student.lastName} in Class ${student.class}`
    );

    return NextResponse.json({ student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create student', error: error.message },
      { status: 550 }
    );
  }
}
