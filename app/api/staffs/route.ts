import { NextRequest, NextResponse } from 'next/server';
import { Teacher, User } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken, hashPassword } from '@/lib/auth-utils';
import { logAction } from '@/lib/audit-logger';

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

    const { role, tenantId: tokenTenantId, organizationId: tokenOrgId } = decoded;
    const userTenantId = tokenTenantId || tokenOrgId;

    // Only Admin or Owner can fetch the staff directory
    if (!validateRequestAccess(role, userTenantId, Role.INSTITUTION_ADMIN, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const teachers = await TenantQuery.find(Teacher, headerTenantId, {}, null, { sort: { firstName: 1 } });
    return NextResponse.json({ teachers });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch staffs', error: error.message },
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

    // Only Admin or Owner can register staffs
    if (!validateRequestAccess(role, userTenantId, Role.INSTITUTION_ADMIN, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const data = await request.json();

    // Auto-create a user login account if email is provided
    let userId = undefined;
    if (data.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (!existingUser) {
        const hashedPassword = await hashPassword('staff123'); // Default password for new staff additions
        const userDoc = new User({
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'teacher', // Gives them standard teacher portal access
          tenantId: headerTenantId,
          status: 'active',
        });
        await userDoc.save();
        userId = userDoc._id;
      } else {
        userId = existingUser._id;
      }
    }

    const teacher = await TenantQuery.create(Teacher, headerTenantId, {
      ...data,
      userId,
      employeeId: `EMP-${Date.now()}`,
    });

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'create',
      'Teacher',
      teacher._id.toString(),
      `Created staff member ${teacher.firstName} ${teacher.lastName}`
    );

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create staff member', error: error.message },
      { status: 500 }
    );
  }
}
