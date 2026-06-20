import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Tenant, User } from '@/lib/models';
import { verifyToken } from '@/lib/auth-utils';
import { seedOrganizationData } from '@/lib/seed';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'owner') {
      return NextResponse.json({ message: 'Forbidden: Owner privileges required' }, { status: 403 });
    }

    const tenants = await Tenant.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ tenants });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch tenants', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized: Token missing' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'owner') {
      return NextResponse.json({ message: 'Forbidden: Owner privileges required' }, { status: 403 });
    }

    const { name, subdomain, type = 'school', email, password } = await request.json();

    if (!name || !subdomain || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const normalizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if subdomain is already taken
    const existing = await Tenant.findOne({ subdomain: normalizedSubdomain });
    if (existing) {
      return NextResponse.json({ message: 'Subdomain already taken' }, { status: 409 });
    }

    const tenant = new Tenant({
      name,
      subdomain: normalizedSubdomain,
      type,
      email,
      settings: {
        theme: 'light',
        primaryColor: '#3b82f6',
        timezone: 'Asia/Dhaka',
        currency: 'BDT',
        language: 'en',
      },
    });

    await tenant.save();

    // Auto-create Classes 1 to 10 with initial Section A and General Subject Group
    try {
      const { Section, SubjectGroup } = await import('@/lib/models');
      const sectionsToCreate = [];
      const subjectGroupsToCreate = [];
      
      for (let i = 1; i <= 10; i++) {
        const className = `Class ${i}`;
        sectionsToCreate.push({
          tenantId: tenant._id,
          class: className,
          name: 'A',
          monthlyFee: 0,
          status: 'active'
        });
        subjectGroupsToCreate.push({
          tenantId: tenant._id,
          class: className,
          name: 'General',
          subjects: [],
          description: `General subjects for ${className}`
        });
      }
      
      await Section.insertMany(sectionsToCreate);
      await SubjectGroup.insertMany(subjectGroupsToCreate);
    } catch (academicsErr) {
      console.warn('Auto-provisioning classes 1 to 10 failed:', academicsErr);
    }

    // Create the default administrator account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      tenantId: tenant._id,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: 'School',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
    });
    await adminUser.save();

    return NextResponse.json({
      tenant,
      adminEmail: email,
      adminPassword: password
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create tenant', error: error.message },
      { status: 500 }
    );
  }
}
