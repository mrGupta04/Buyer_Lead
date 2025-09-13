// app/api/buyers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { BuyerFormSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

// Helper function to create detailed history entries
async function createBuyerHistory(
  buyerId: string,
  changedBy: string,
  action: 'create' | 'update',
  oldData: any = null,
  newData: any = null
) {
  let diff: Record<string, { old: any; new: any }> = {};

  if (action === 'create') {
    // For creation, show all fields as new
    Object.keys(newData).forEach(key => {
      if (newData[key] !== undefined && newData[key] !== null) {
        diff[key] = {
          old: null,
          new: newData[key]
        };
      }
    });
  } else if (action === 'update' && oldData && newData) {
    // For updates, show only changed fields
    Object.keys(newData).forEach(key => {
      const oldValue = oldData[key];
      const newValue = newData[key];
      
      // Compare values (handle arrays and objects properly)
      const oldValueStr = Array.isArray(oldValue) ? oldValue.join(',') : JSON.stringify(oldValue);
      const newValueStr = Array.isArray(newValue) ? newValue.join(',') : JSON.stringify(newValue);
      
      if (oldValueStr !== newValueStr) {
        diff[key] = {
          old: oldValue,
          new: newValue
        };
      }
    });
  }

  // Only create history if there are changes
  if (Object.keys(diff).length > 0) {
    await prisma.buyerHistory.create({
      data: {
        buyerId,
        changedBy,
        diff,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = BuyerFormSchema.parse(body);
    
    // Check if phone already exists
    const existingBuyer = await prisma.buyer.findFirst({
      where: { phone: validatedData.phone }
    });
    
    if (existingBuyer) {
      return NextResponse.json(
        { error: 'A buyer with this phone number already exists' },
        { status: 400 }
      );
    }
    
    const buyer = await prisma.buyer.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        bhk: validatedData.bhk as any,
      },
    });
    
    // Create detailed history entry for creation
    await createBuyerHistory(
      buyer.id,
      session.user.id,
      'create',
      null,
      validatedData
    );
    
    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    console.error('Error creating buyer:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city');
    const propertyType = searchParams.get('propertyType');
    const status = searchParams.get('status');
    const timeline = searchParams.get('timeline');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;
    
    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: {
            select: { name: true, email: true }
          },
          // Include history count or recent history if needed
          history: {
            take: 1,
            orderBy: { changedAt: 'desc' },
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      }),
      prisma.buyer.count({ where })
    ]);
    
    return NextResponse.json({
      buyers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}