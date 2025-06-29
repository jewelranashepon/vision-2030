import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'MEMBER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.userId },
      include: {
        installments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    const totalPaid = member.installments.reduce((sum, inst) => sum + inst.amount, 0);
    const paymentCount = member.installments.length;
    const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0;
    const lastPayment = member.installments.length > 0 ? member.installments[0].month : null;

    return NextResponse.json({
      totalPaid,
      paymentCount,
      averagePayment,
      lastPayment,
    });
  } catch (error) {
    console.error('Member stats API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}