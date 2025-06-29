import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const memberId = params.id;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        installments: {
          select: {
            id: true,
            month: true,
            amount: true,
            paymentDate: true,
          },
          orderBy: {
            month: 'desc',
          },
        },
        _count: {
          select: {
            installments: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      );
    }

    // Calculate total paid
    const totalPaid = member.installments.reduce((sum, inst) => sum + inst.amount, 0);

    const memberWithStats = {
      ...member,
      totalPaid,
    };

    return NextResponse.json(memberWithStats);
  } catch (error) {
    console.error('Member details API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}