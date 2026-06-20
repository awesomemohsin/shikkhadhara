import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Notification, SMSLog, WhatsAppLog } from '@/lib/models';
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

    const notifications = await Notification.find({ organizationId: decoded.organizationId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch notifications', error: error.message },
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
    const { type, message, recipients, title } = data;

    // Handle bulk notifications
    if (Array.isArray(recipients)) {
      const notifications = [];
      for (const recipient of recipients) {
        // Create notification record
        const notif = new Notification({
          organizationId: decoded.organizationId,
          recipientId: recipient._id,
          recipientRole: recipient.role,
          type,
          title,
          message,
          status: 'pending',
        });

        await notif.save();
        notifications.push(notif);

        // Handle different types
        if (type === 'sms' && recipient.phone) {
          const smsLog = new SMSLog({
            organizationId: decoded.organizationId,
            phoneNumber: recipient.phone,
            message,
            provider: 'mock',
            status: 'sent',
            messageId: `SMS-${Date.now()}`,
          });
          await smsLog.save();

          // Update notification status
          notif.status = 'sent';
          notif.sentAt = new Date();
          await notif.save();
        } else if (type === 'whatsapp' && recipient.phone) {
          const waLog = new WhatsAppLog({
            organizationId: decoded.organizationId,
            phoneNumber: recipient.phone,
            message,
            provider: 'mock',
            status: 'sent',
            messageId: `WA-${Date.now()}`,
          });
          await waLog.save();

          notif.status = 'sent';
          notif.sentAt = new Date();
          await notif.save();
        }
      }

      return NextResponse.json({ notifications }, { status: 201 });
    }

    // Single notification
    const notification = new Notification({
      organizationId: decoded.organizationId,
      ...data,
      status: 'pending',
    });

    await notification.save();

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create notification', error: error.message },
      { status: 500 }
    );
  }
}
