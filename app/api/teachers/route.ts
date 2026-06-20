import { NextRequest, NextResponse } from 'next/server';
import { Teacher } from '@/lib/models';
import { getTenantContext } from '@/lib/tenant-context';

export async function GET(request: NextRequest) {
  try {
    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json({ message: 'Tenant context unresolved' }, { status: 400 });
    }

    const teachers = await tenantContext.service.find(Teacher, {}, null, { sort: { firstName: 1 } });

    return NextResponse.json({ teachers });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { message: 'Failed to fetch teachers', error: error.message },
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

    const teacher = await tenantContext.service.create(Teacher, {
      ...data,
      employeeId: `EMP-${Date.now()}`,
    });

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { message: 'Failed to create teacher', error: error.message },
      { status }
    );
  }
}
