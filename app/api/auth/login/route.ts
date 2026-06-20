import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Tenant } from '@/lib/models';
import { verifyPassword, generateToken } from '@/lib/auth-utils';
import { getTenantContext } from '@/lib/tenant-context';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const tenantContext = await getTenantContext(request);
    if (!tenantContext) {
      return NextResponse.json(
        { message: 'Tenant context unresolved' },
        { status: 400 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Strict tenant-scoped user query
    const user = await User.findOne({ email, tenantId: tenantContext.tenantId }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { message: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.tenantId, // compatibility
    });

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: tenantContext.tenantId,
          organizationId: tenantContext.tenantId, // compatibility
          profileImage: user.profileImage,
        },
        tenant: tenantContext.tenant,
        organization: tenantContext.tenant, // compatibility
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}
