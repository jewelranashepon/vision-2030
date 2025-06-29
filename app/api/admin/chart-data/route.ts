import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const installments = await prisma.installment.groupBy({
      by: ['month'],
      _sum: {
        amount: true,
      },
      orderBy: {
        month: 'asc',
      },
    });

    const chartData = installments.map(item => ({
      month: item.month,
      amount: item._sum.amount || 0,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Chart data API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}