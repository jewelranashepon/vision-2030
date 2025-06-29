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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        installments: {
          select: {
            amount: true,
            month: true,
          },
          orderBy: {
            month: 'desc',
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    const totalPaid = member.installments.reduce((sum, inst) => sum + inst.amount, 0);
    const paymentCount = member.installments.length;
    const lastPayment = member.installments.length > 0 ? member.installments[0].month : null;

    const profile = {
      membershipId: member.membershipId,
      active: member.active,
      createdAt: member.createdAt,
      user: member.user,
      totalPaid,
      paymentCount,
      lastPayment,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Member profile API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}