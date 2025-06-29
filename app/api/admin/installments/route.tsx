import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const installments = await prisma.installment.findMany({
      include: {
        member: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    return NextResponse.json(installments);
  } catch (error) {
    console.error('Installments API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { memberId, month, amount } = await request.json();

    if (!memberId || !month || !amount) {
      return NextResponse.json(
        { message: 'Member, month, and amount are required' },
        { status: 400 }
      );
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json(
        { message: 'Invalid month format. Use YYYY-MM format.' },
        { status: 400 }
      );
    }

    // Check if installment already exists for this member and month
    const existingInstallment = await prisma.installment.findUnique({
      where: {
        memberId_month: {
          memberId,
          month,
        },
      },
    });

    if (existingInstallment) {
      return NextResponse.json(
        { message: 'Installment already exists for this member and month' },
        { status: 400 }
      );
    }

    // Create payment date - use the 15th of the specified month
    const [year, monthNum] = month.split('-');
    const paymentDate = new Date(parseInt(year), parseInt(monthNum) - 1, 15);

    const installment = await prisma.installment.create({
      data: {
        memberId,
        month,
        amount: parseFloat(amount),
        paymentDate,
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Installment added successfully',
      installment,
    });
  } catch (error) {
    console.error('Create installment error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}