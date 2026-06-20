import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Organization } from '@/lib/models';
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

    const organization = await Organization.findById(decoded.organizationId);

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch organization', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { name, timezone, currency, language } = await request.json();

    const organization = await Organization.findByIdAndUpdate(
      decoded.organizationId,
      {
        name,
        'settings.timezone': timezone,
        'settings.currency': currency,
        'settings.language': language,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Organization updated successfully',
      organization,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to update organization', error: error.message },
      { status: 500 }
    );
  }
}
