import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Payment, Fee, Invoice } from '@/lib/models';
import { verifyToken } from '@/lib/auth-utils';
import { logAction } from '@/lib/audit-logger';

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
    const status = searchParams.get('status');

    let query: any = { organizationId: decoded.organizationId };

    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('studentId', 'firstName lastName enrollmentId')
      .populate('feeId', 'feeType amount dueDate')
      .sort({ paymentDate: -1 });

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch payments', error: error.message },
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

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payment = new Payment({
      ...data,
      organizationId: decoded.organizationId,
      transactionId,
      status: 'completed',
      paymentDate: new Date(),
      processedBy: decoded.userId,
    });

    await payment.save();

    // Update fee record
    const fee = await Fee.findById(data.feeId);
    if (fee) {
      fee.amountPaid = (fee.amountPaid || 0) + data.amount;

      // Update status based on amount paid
      if (fee.amountPaid >= fee.amount) {
        fee.status = 'paid';
        fee.paidDate = new Date();
      } else {
        fee.status = 'partial';
      }

      await fee.save();
    }

    await logAction(
      decoded.tenantId || decoded.organizationId,
      decoded.userId,
      decoded.email,
      'create',
      'Payment',
      payment._id.toString(),
      `Recorded payment of ৳${payment.amount} via ${payment.paymentMethod} (Transaction ID: ${transactionId})`
    );

    return NextResponse.json(
      {
        payment,
        message: 'Payment recorded successfully',
        transactionId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to record payment', error: error.message },
      { status: 500 }
    );
  }
}
