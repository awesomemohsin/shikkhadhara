import { NextRequest } from 'next/server';
import dbConnect from './mongodb';
import { Tenant } from './models';
import { TenantService } from './tenant-service';
import { verifyToken } from './auth-utils';

// Simple in-memory cache for tenants to avoid query overhead
const tenantCache = new Map<string, { tenant: any; expiry: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

export interface TenantContext {
  tenantId: string;
  tenant: any;
  service: TenantService;
  featureFlags: any;
  settings: any;
}

export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
  await dbConnect();

  // 1. Resolve subdomain
  let subdomain = request.headers.get('x-tenant-subdomain') || '';

  // Fallback check: parse from host header if middleware didn't set it (e.g. direct fetch calls in dev)
  if (!subdomain) {
    const host = request.headers.get('host') || '';
    // Exclude localhost/127.0.0.1
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const parts = host.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }
  }

  // Local development fallback
  if (!subdomain) {
    // Check search params
    const { searchParams } = new URL(request.url);
    subdomain = searchParams.get('tenant') || searchParams.get('subdomain') || '';
  }

  // If still no subdomain, default to 'shikkhadhara' for local development ease
  if (!subdomain) {
    subdomain = 'shikkhadhara';
  }

  subdomain = subdomain.toLowerCase().trim();

  // 2. Fetch tenant (using cache)
  const cached = tenantCache.get(subdomain);
  let tenantDoc: any = null;

  if (cached && cached.expiry > Date.now()) {
    tenantDoc = cached.tenant;
  } else {
    tenantDoc = await Tenant.findOne({ subdomain });
    if (!tenantDoc) {
      // If the default falls back to 'shikkhadhara' but database has no such tenant,
      // let's grab the first tenant in the DB to prevent breaking
      tenantDoc = await Tenant.findOne({});
    }

    if (tenantDoc) {
      tenantCache.set(subdomain, {
        tenant: tenantDoc,
        expiry: Date.now() + CACHE_TTL,
      });
    }
  }

  if (!tenantDoc) {
    return null;
  }

  const tenantId = tenantDoc._id.toString();

  // 3. Optional JWT Validation: if token is present, ensure it matches the current tenant
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (decoded) {
      const tokenTenantId = decoded.tenantId || decoded.organizationId;
      if (tokenTenantId && tokenTenantId !== tenantId) {
        // Cross-tenant access attempted
        throw new Error('Unauthorized: Tenant mismatch');
      }
    }
  }

  return {
    tenantId,
    tenant: tenantDoc,
    service: new TenantService(tenantDoc._id),
    featureFlags: tenantDoc.featureFlags || {},
    settings: tenantDoc.settings || {},
  };
}
