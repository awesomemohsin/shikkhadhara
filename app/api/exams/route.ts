import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Exam, ExamResult } from '@/lib/models';
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
    const class_ = searchParams.get('class');
    const status = searchParams.get('status');

    let query: any = { organizationId: decoded.organizationId };

    if (class_) query.class = class_;
    if (status) query.status = status;

    const exams = await Exam.find(query).sort({ date: -1 });

    return NextResponse.json({ exams });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch exams', error: error.message },
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

    const exam = new Exam({
      ...data,
      organizationId: decoded.organizationId,
      createdBy: decoded.userId,
    });

    await exam.save();

    return NextResponse.json({ exam }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create exam', error: error.message },
      { status: 500 }
    );
  }
}
