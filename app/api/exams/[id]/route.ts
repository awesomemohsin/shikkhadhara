import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Exam } from '@/lib/models';
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
    const exam = await Exam.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!exam || exam.organizationId.toString() !== decoded.organizationId) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to update exam', error: error.message },
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

    const exam = await Exam.findById(params.id);

    if (!exam || exam.organizationId.toString() !== decoded.organizationId) {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 });
    }

    await Exam.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Exam deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to delete exam', error: error.message },
      { status: 500 }
    );
  }
}
