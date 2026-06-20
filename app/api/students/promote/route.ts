import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Student } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
import { validateRequestAccess, Role } from '@/lib/auth/rbac';
import { verifyToken } from '@/lib/auth-utils';
import { logAction } from '@/lib/audit-logger';

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

    const { role, tenantId: tokenTenantId, organizationId: tokenOrgId } = decoded;
    const userTenantId = tokenTenantId || tokenOrgId;

    if (!validateRequestAccess(role, userTenantId, Role.INSTITUTION_ADMIN, headerTenantId)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { targetClass, targetSection, promotions } = await request.json();

    if (!targetClass || !promotions || !Array.isArray(promotions) || promotions.length === 0) {
      return NextResponse.json({ message: 'Missing targetClass or promotions array' }, { status: 400 });
    }

    let modifiedCount = 0;
    for (const promo of promotions) {
      const updateData: any = { class: targetClass };
      if (targetSection !== undefined) updateData.section = targetSection;
      if (promo.rollNumber !== undefined) updateData.rollNumber = promo.rollNumber;
      
      const updated = await TenantQuery.findOneAndUpdate(
        Student,
        headerTenantId,
        { _id: promo.studentId },
        { $set: updateData }
      );
      if (updated) modifiedCount++;
    }

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'update',
      'Student',
      undefined,
      `Promoted ${modifiedCount} students to Class ${targetClass} Sec ${targetSection || 'N/A'}`
    );

    return NextResponse.json({ message: 'Promotion completed successfully', modifiedCount });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to promote students', error: error.message },
      { status: 500 }
    );
  }
}
