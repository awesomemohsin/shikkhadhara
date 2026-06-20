import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { 
  Tenant, 
  User, 
  Student, 
  Teacher, 
  Section, 
  SubjectGroup, 
  Fee, 
  Payment, 
  Attendance, 
  Exam, 
  ExamResult, 
  Salary,
  AuditLog 
} from '@/lib/models';
import { verifyToken } from '@/lib/auth-utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'owner') {
      return NextResponse.json({ message: 'Forbidden: Owner privileges required' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const updatedTenant = await Tenant.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!updatedTenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    // Also update the tenant's admin user email if it was changed
    if (data.email) {
      await User.findOneAndUpdate(
        { tenantId: id, role: 'admin' },
        { $set: { email: data.email.toLowerCase().trim() } }
      );
    }

    return NextResponse.json({ tenant: updatedTenant });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to update tenant', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'owner') {
      return NextResponse.json({ message: 'Forbidden: Owner privileges required' }, { status: 403 });
    }

    const { id } = await params;

    // Verify tenant exists
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    // Clean up all data associated with this tenant
    await Tenant.deleteOne({ _id: id });
    await User.deleteMany({ tenantId: id });
    await Student.deleteMany({ tenantId: id });
    await Teacher.deleteMany({ tenantId: id });
    await Section.deleteMany({ tenantId: id });
    await SubjectGroup.deleteMany({ tenantId: id });
    await Fee.deleteMany({ tenantId: id });
    await Payment.deleteMany({ tenantId: id });
    await Attendance.deleteMany({ tenantId: id });
    await Exam.deleteMany({ tenantId: id });
    await ExamResult.deleteMany({ tenantId: id });
    await Salary.deleteMany({ tenantId: id });
    await AuditLog.deleteMany({ tenantId: id });

    return NextResponse.json({ message: 'Tenant and all associated data deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to delete tenant', error: error.message },
      { status: 500 }
    );
  }
}
