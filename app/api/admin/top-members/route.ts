import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const topMembers = await prisma.member.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        installments: {
          select: {
            amount: true,
          },
        },
      },
      where: {
        active: true,
      },
    });

    const membersWithStats = topMembers
      .map(member => ({
        membershipId: member.membershipId,
        user: member.user,
        totalPaid: member.installments.reduce((sum, inst) => sum + inst.amount, 0),
        paymentCount: member.installments.length,
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 6);

    return NextResponse.json(membersWithStats);
  } catch (error) {
    console.error('Top members API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}