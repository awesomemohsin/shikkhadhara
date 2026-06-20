import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Tenant } from '@/lib/models';
import { hashPassword, generateToken, verifyToken } from '@/lib/auth-utils';
import { seedOrganizationData } from '@/lib/seed';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, firstName, lastName, organizationName, role = 'admin', tenantId: providedTenantId } = await request.json();

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Tenant Creation Guard: Only owner (mohsindude5@gmail.com) can create tenants
    let tenantId = providedTenantId;
    if (organizationName) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json(
          { message: 'Unauthorized: Owner token required to create new tenants' },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      if (!decoded || decoded.email !== 'mohsindude5@gmail.com' || decoded.role !== 'owner') {
        return NextResponse.json(
          { message: 'Forbidden: Only the owner (mohsindude5@gmail.com) can create new tenants' },
          { status: 403 }
        );
      }

      // Generate subdomain slug from name
      const subdomain = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Create tenant
      const tenant = new Tenant({
        name: organizationName,
        subdomain,
        type: 'school',
        email,
        settings: {
          timezone: 'Asia/Dhaka',
          currency: 'BDT',
          language: 'en',
        },
      });
      await tenant.save();
      tenantId = tenant._id;

      // Auto-seed premium demo data for this tenant
      try {
        await seedOrganizationData(tenant._id);
      } catch (seedErr) {
        console.error('Seeding tenant data failed:', seedErr);
      }
    }

    // Fallback: If no tenant is created/provided, resolve to the default tenant
    if (!tenantId) {
      const defaultTenant = await Tenant.findOne({ subdomain: 'shikkhadhara' });
      if (defaultTenant) {
        tenantId = defaultTenant._id;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with either regular role or owner role if email matches owner
    const finalRole = (email === 'mohsindude5@gmail.com') ? 'owner' : role;

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: finalRole,
      tenantId,
      status: 'active',
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      organizationId: user.tenantId, // compatibility
    });

    // Return response
    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          organizationId: user.tenantId, // compatibility
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed', error: error.message },
      { status: 500 }
    );
  }
}
