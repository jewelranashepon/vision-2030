import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get total members
    const totalMembers = await prisma.member.count({
      where: { active: true },
    });

    // Get total collection
    const totalCollectionResult = await prisma.installment.aggregate({
      _sum: { amount: true },
    });
    const totalCollection = totalCollectionResult._sum.amount || 0;

    // Get this month's collection
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const thisMonthCollectionResult = await prisma.installment.aggregate({
      _sum: { amount: true },
      where: {
        month: currentMonth,
      },
    });
    const thisMonthCollection = thisMonthCollectionResult._sum.amount || 0;

    // Calculate pending amount (estimated based on active members)
    const expectedMonthlyCollection = totalMembers * 5000; // Assuming 5000 per member per month
    const currentMonthPaid = thisMonthCollection;
    const totalPending = Math.max(0, expectedMonthlyCollection - currentMonthPaid);

    return NextResponse.json({
      totalMembers,
      totalCollection,
      totalPending,
      thisMonthCollection,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}