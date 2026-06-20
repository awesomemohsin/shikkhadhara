import { NextRequest, NextResponse } from 'next/server';
import { Student } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';

export async function GET(request: NextRequest) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const class_ = searchParams.get('class');
    const status = searchParams.get('status');

    let query: any = {};
    if (class_) query.class = class_;
    if (status) query.status = status;

    const students = await tenantContext.service.find(Student, query, null, { sort: { firstName: 1 } });

    return NextResponse.json({ students });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { message: 'Failed to fetch students', error: error.message },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const data = await request.json();

    const student = await tenantContext.service.create(Student, {
      ...data,
      enrollmentId: `ENR-${Date.now()}`,
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { message: 'Failed to create student', error: error.message },
      { status }
    );
  }
}
