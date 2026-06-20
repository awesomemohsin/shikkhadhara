import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const headerTenantId = request.headers.get('x-tenant-id') || 'not-resolved';
  const headerTenantSubdomain = request.headers.get('x-tenant-subdomain') || 'not-resolved';

  return NextResponse.json({
    message: 'Tenant verification route',
    tenantId: headerTenantId,
    subdomain: headerTenantSubdomain,
    headers: {
      'x-tenant-id': headerTenantId,
      'x-tenant-subdomain': headerTenantSubdomain,
    }
  });
}
export const dynamic = 'force-dynamic';
