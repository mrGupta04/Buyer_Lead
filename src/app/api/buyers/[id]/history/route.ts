// app/api/buyers/[id]/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma }from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const buyerId = params.id;
    
    // Verify the buyer exists and user has access
    const buyer = await prisma.buyer.findUnique({
      where: { id: buyerId },
      select: { id: true }
    });
    
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    // Fetch the history for this buyer
    const history = await prisma.buyerHistory.findMany({
      where: {
        buyerId: buyerId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        changedAt: 'desc'
      }
    });
    
    // Format the response
    const formattedHistory = history.map(item => ({
      id: item.id,
      changedAt: item.changedAt.toISOString(),
      changedBy: {
        name: item.user.name,
        email: item.user.email
      },
      diff: item.diff as Record<string, { old: any; new: any }>
    }));
    
    return NextResponse.json(formattedHistory);
    
  } catch (error) {
    console.error('Error fetching buyer history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}