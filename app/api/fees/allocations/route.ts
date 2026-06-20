import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { FeeAllocation, FeeCategory, Student, Fee } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';
import { TenantQuery } from '@/lib/db/tenant-query';
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

    const allocations = await TenantQuery.find(FeeAllocation, headerTenantId, {}, null, {
      sort: { createdAt: -1 }
    });

    // Populate category info manual since we use tenant isolation find
    const populated = await Promise.all(
      allocations.map(async (alloc: any) => {
        const doc = alloc.toObject();
        if (doc.feeCategoryId) {
          const category = await TenantQuery.findById(FeeCategory, headerTenantId, doc.feeCategoryId);
          doc.category = category;
        }
        return doc;
      })
    );

    return NextResponse.json({ allocations: populated });
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
    const { feeCategoryId, class: className, amount, dueDate, month, year, description } = data;

    if (!feeCategoryId || !className || !amount || !dueDate || !month || !year) {
      return NextResponse.json({ message: 'Missing required allocation parameters' }, { status: 400 });
    }

    // Resolve Category Name
    const category = await TenantQuery.findById(FeeCategory, headerTenantId, feeCategoryId);
    if (!category) {
      return NextResponse.json({ message: 'Fee category not found' }, { status: 404 });
    }

    // Save allocation record
    const allocation = await TenantQuery.create(FeeAllocation, headerTenantId, {
      feeCategoryId,
      class: className,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      month,
      year: parseInt(year),
      description,
    });

    // 1. Bulk Generate Student Invoices (Fees)
    const activeStudents = await TenantQuery.find(Student, headerTenantId, {
      class: className,
      status: 'active',
    });

    let generatedCount = 0;

    for (const student of activeStudents) {
      // Calculate final billing amount applying discount waivers
      const discount = student.discountPercentage || 0;
      const finalAmount = parseFloat(amount) * (1 - (discount / 100));

      await TenantQuery.create(Fee, headerTenantId, {
        studentId: student._id,
        feeType: category.name,
        amount: finalAmount,
        amountPaid: 0,
        dueDate: new Date(dueDate),
        status: 'pending',
        month,
        year: parseInt(year),
        description: description || `Billing for Class ${className} - ${category.name}`,
      });

      generatedCount++;
    }

    await logAction(
      headerTenantId,
      decoded.userId,
      decoded.email,
      'create',
      'FeeAllocation',
      allocation._id.toString(),
      `Allocated fee ${category.name} to Class ${className} (Amount: ৳${amount}). Generated ${generatedCount} student invoices.`
    );

    return NextResponse.json({
      allocation,
      generatedInvoicesCount: generatedCount,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 550 });
  }
}
