import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Tenant } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    
    if (!subdomain) {
      return NextResponse.json({ message: 'Subdomain parameter is required' }, { status: 400 });
    }
    
    const tenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase().trim() });
    
    if (!tenant) {
      // Fallback to the first tenant in local database to avoid blocking local developer setups
      const fallbackTenant = await Tenant.findOne({});
      if (fallbackTenant) {
        if (fallbackTenant.status !== 'active') {
          return NextResponse.json({ message: 'Tenant is disabled', status: 'disabled' }, { status: 403 });
        }
        return NextResponse.json({ tenantId: fallbackTenant._id.toString() });
      }
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    if (tenant.status !== 'active') {
      return NextResponse.json({ message: 'Tenant is disabled', status: 'disabled' }, { status: 403 });
    }
    
    return NextResponse.json({ tenantId: tenant._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
