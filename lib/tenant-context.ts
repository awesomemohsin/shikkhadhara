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

  let tenantDoc: any = null;
  let tokenTenantId = '';

  // 1. Try to resolve tenant from JWT token first if available
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (decoded) {
      tokenTenantId = decoded.tenantId || decoded.organizationId || '';
    }
  }

  if (tokenTenantId) {
    tenantDoc = await Tenant.findById(tokenTenantId);
  }

  // 2. If no token or tenant not found by token, resolve via subdomain
  if (!tenantDoc) {
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

    // Fetch tenant (using cache)
    const cached = tenantCache.get(subdomain);
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
  }

  if (!tenantDoc) {
    return null;
  }

  const tenantId = tenantDoc._id.toString();

  // 3. Optional JWT Validation: if token is present, ensure it matches the resolved tenant ID
  if (tokenTenantId && tokenTenantId !== tenantId) {
    // Cross-tenant access attempted
    throw new Error('Unauthorized: Tenant mismatch');
  }

  // Check if token belongs to an owner role
  let isOwner = false;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (decoded && decoded.role === 'owner') {
      isOwner = true;
    }
  }

  if (tenantDoc.status !== 'active' && !isOwner) {
    throw new Error('Tenant account is deactivated. Please contact support.');
  }

  if (tenantId) {
    request.headers.set('x-tenant-id', tenantId);
  }

  return {
    tenantId,
    tenant: tenantDoc,
    service: new TenantService(tenantDoc._id),
    featureFlags: tenantDoc.featureFlags || {},
    settings: tenantDoc.settings || {},
  };
}
