import { AuditLog } from './models';
import { TenantQuery } from './db/tenant-query';

export async function logAction(
  tenantId: string,
  userId: string,
  userEmail: string,
  action: 'create' | 'update' | 'delete',
  entity: string,
  entityId: string | undefined,
  details: string
) {
  try {
    await TenantQuery.create(AuditLog, tenantId, {
      userId,
      userEmail,
      action,
      entity,
      entityId,
      details,
    });
  } catch (error) {
    console.error('Failed to save audit log:', error);
  }
}
