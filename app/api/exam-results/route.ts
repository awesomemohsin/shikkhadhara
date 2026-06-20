import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ExamResult, Exam } from '@/lib/models';
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
    const examId = searchParams.get('examId');
    const studentId = searchParams.get('studentId');

    let query: any = { organizationId: decoded.organizationId };

    if (examId) query.examId = examId;
    if (studentId) query.studentId = studentId;

    const results = await ExamResult.find(query)
      .populate('examId', 'name subject')
      .populate('studentId', 'firstName lastName enrollmentId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch results', error: error.message },
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

    // Handle bulk results
    if (Array.isArray(data)) {
      const records = data.map((record) => {
        const exam = record.exam || {};
        const percentage = (record.marksObtained / exam.totalMarks) * 100;
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        return {
          ...record,
          organizationId: decoded.organizationId,
          recordedBy: decoded.userId,
          percentage,
          grade,
          status: percentage >= exam.passingMarks ? 'pass' : 'fail',
        };
      });

      const results = await ExamResult.insertMany(records);
      return NextResponse.json({ results }, { status: 201 });
    }

    // Single result
    const exam = await Exam.findById(data.examId);
    const percentage = (data.marksObtained / exam.totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const result = new ExamResult({
      ...data,
      organizationId: decoded.organizationId,
      recordedBy: decoded.userId,
      percentage,
      grade,
      status: percentage >= exam.passingMarks ? 'pass' : 'fail',
    });

    await result.save();

    return NextResponse.json({ result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to record result', error: error.message },
      { status: 500 }
    );
  }
}
