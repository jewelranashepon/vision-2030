import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get current and last month
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      .toISOString().slice(0, 7);

    // Get total and active members
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({
      where: { active: true },
    });

    // Get this month's collection
    const thisMonthResult = await prisma.installment.aggregate({
      _sum: { amount: true },
      where: {
        month: currentMonth,
      },
    });
    const thisMonthCollection = thisMonthResult._sum.amount || 0;

    // Get last month's collection
    const lastMonthResult = await prisma.installment.aggregate({
      _sum: { amount: true },
      where: {
        month: lastMonth,
      },
    });
    const lastMonthCollection = lastMonthResult._sum.amount || 0;

    // Get total collection
    const totalCollectionResult = await prisma.installment.aggregate({
      _sum: { amount: true },
    });
    const totalCollection = totalCollectionResult._sum.amount || 0;

    // Get average payment
    const totalInstallments = await prisma.installment.count();
    const averagePayment = totalInstallments > 0 ? totalCollection / totalInstallments : 0;

    return NextResponse.json({
      totalMembers,
      activeMembers,
      thisMonthCollection,
      lastMonthCollection,
      totalCollection,
      averagePayment,
    });
  } catch (error) {
    console.error('System overview API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}