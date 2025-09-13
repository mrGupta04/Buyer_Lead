// app/api/buyers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { BuyerFormSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

// Helper function to create buyer history
async function createBuyerHistory(
  buyerId: string,
  changedBy: string,
  action: 'create' | 'update',
  oldData: any = null,
  newData: any = null
) {
  let diff: Record<string, { old: any; new: any }> = {};

  if (action === 'create') {
    Object.keys(newData).forEach(key => {
      if (newData[key] !== undefined && newData[key] !== null) {
        diff[key] = {
          old: null,
          new: newData[key]
        };
      }
    });
  } else if (action === 'update' && oldData && newData) {
    Object.keys(newData).forEach(key => {
      const oldValue = oldData[key];
      const newValue = newData[key];
      
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

// GET - Fetch buyer details (for view page)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        history: {
          orderBy: { changedAt: 'desc' },
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update buyer
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current buyer data for comparison
    const currentBuyer = await prisma.buyer.findUnique({
      where: { id: params.id }
    });

    if (!currentBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = BuyerFormSchema.parse(body);
    
    // Check if phone already exists (excluding current buyer)
    if (validatedData.phone !== currentBuyer.phone) {
      const existingBuyer = await prisma.buyer.findFirst({
        where: { 
          phone: validatedData.phone,
          id: { not: params.id }
        }
      });
      
      if (existingBuyer) {
        return NextResponse.json(
          { error: 'A buyer with this phone number already exists' },
          { status: 400 }
        );
      }
    }
    
    const updatedBuyer = await prisma.buyer.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        bhk: validatedData.bhk as any,
      },
    });
    
    // Create detailed history entry for update
    await createBuyerHistory(
      params.id,
      session.user.id,
      'update',
      currentBuyer,
      validatedData
    );
    
    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    
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

// DELETE - Delete buyer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id }
    });

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Create history entry before deletion
    await createBuyerHistory(
      params.id,
      session.user.id,
      'update', // Use update action for deletion tracking
      buyer,
      { status: 'DELETED' } // Mark as deleted
    );

    // Actually delete the buyer
    await prisma.buyer.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}