import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Fee, Student } from '@/lib/models';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    let query: any = { organizationId: decoded.organizationId };

    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    const fees = await Fee.find(query)
      .populate('studentId', 'firstName lastName enrollmentId')
      .sort({ dueDate: -1 });

    return NextResponse.json({ fees });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch fees', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();

    // Handle bulk fee creation
    if (Array.isArray(data)) {
      const records = data.map((record) => ({
        ...record,
        organizationId: decoded.organizationId,
        status: 'pending',
        amountPaid: 0,
      }));

      const fees = await Fee.insertMany(records);
      return NextResponse.json({ fees }, { status: 201 });
    }

    // Single fee record
    const fee = new Fee({
      ...data,
      organizationId: decoded.organizationId,
      status: 'pending',
      amountPaid: 0,
    });

    await fee.save();

    return NextResponse.json({ fee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create fee', error: error.message },
      { status: 500 }
    );
  }
}
