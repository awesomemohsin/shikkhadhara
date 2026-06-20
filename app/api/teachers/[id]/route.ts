import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Teacher } from '@/lib/models';
import { verifyToken } from '@/lib/auth-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const teacher = await Teacher.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!teacher || teacher.organizationId.toString() !== decoded.organizationId) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to update teacher', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const teacher = await Teacher.findById(params.id);

    if (!teacher || teacher.organizationId.toString() !== decoded.organizationId) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    await Teacher.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Teacher deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to delete teacher', error: error.message },
      { status: 500 }
    );
  }
}
