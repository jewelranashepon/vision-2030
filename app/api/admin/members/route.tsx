import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const members = await prisma.member.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        installments: {
          select: {
            amount: true,
          },
        },
        _count: {
          select: {
            installments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const membersWithStats = members.map(member => ({
      ...member,
      totalPaid: member.installments.reduce((sum, inst) => sum + inst.amount, 0),
    }));

    return NextResponse.json(membersWithStats);
  } catch (error) {
    console.error('Members API error:', error);
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

    const { name, email, membershipId, password } = await request.json();

    if (!name || !email || !membershipId || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check if membership ID already exists
    const existingMember = await prisma.member.findUnique({
      where: { membershipId },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: 'Membership ID already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'MEMBER',
        },
      });

      const member = await tx.member.create({
        data: {
          membershipId,
          userId: user.id,
        },
      });

      return { user, member };
    });

    return NextResponse.json({
      message: 'Member created successfully',
      member: result.member,
    });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}