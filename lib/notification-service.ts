import { SMSLog, Notification } from './models';
import axios from 'axios';
import { TenantService } from './tenant-service';

export async function sendGuardianAttendanceNotification(
  tenantService: TenantService,
  student: any,
  attendanceRecord: any,
  webhookUrl?: string
) {
  const { firstName, lastName, guardianName, guardianPhone } = student;
  const { status, date, remarks } = attendanceRecord;

  if (!guardianPhone) return;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusText = status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : status === 'late' ? 'Late' : 'Excused';
  const message = `Dear Guardian (${guardianName}), your child ${firstName} ${lastName} has been marked as ${statusText.toUpperCase()} on ${formattedDate}. Remarks: ${remarks || 'None'}.`;

  try {
    // 1. Create a notification record scoped to tenant
    await tenantService.create(Notification, {
      recipientRole: 'parent',
      type: 'sms',
      title: `Attendance Alert: ${statusText.toUpperCase()}`,
      message,
      status: 'sent',
      sentAt: new Date(),
    });

    // 2. Create SMS log scoped to tenant
    await tenantService.create(SMSLog, {
      phoneNumber: guardianPhone,
      message,
      provider: 'mock',
      status: 'sent',
      messageId: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    // 3. Trigger webhook if configured
    if (webhookUrl) {
      axios.post(webhookUrl, {
        event: 'attendance.recorded',
        timestamp: new Date().toISOString(),
        tenantId: tenantService.getTenantId().toString(),
        data: {
          studentId: student._id.toString(),
          studentName: `${firstName} ${lastName}`,
          guardianName,
          guardianPhone,
          status,
          date,
          remarks,
        },
      }).catch((err) => {
        console.error(`[Webhook] Failed to dispatch attendance webhook to ${webhookUrl}:`, err.message);
      });
    }

    console.log(`[Notification] Scoped SMS sent to guardian ${guardianPhone}: ${message}`);
  } catch (error) {
    console.error('[Notification] Error dispatching parent notification:', error);
  }
}
