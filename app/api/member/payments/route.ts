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
          take: 10,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(member.installments);
  } catch (error) {
    console.error('Member payments API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}