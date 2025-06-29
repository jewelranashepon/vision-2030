import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, membershipId, password } = await request.json();
    const memberId = params.id;

    if (!name || !email || !membershipId) {
      return NextResponse.json(
        { message: 'Name, email, and membership ID are required' },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email !== member.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Check if membership ID is being changed and if it already exists
    if (membershipId !== member.membershipId) {
      const existingMember = await prisma.member.findUnique({
        where: { membershipId },
      });

      if (existingMember) {
        return NextResponse.json(
          { message: 'Membership ID already exists' },
          { status: 400 }
        );
      }
    }

    // Update user and member in a transaction
    await prisma.$transaction(async (tx) => {
      const updateData: any = {
        name,
        email,
      };

      if (password) {
        updateData.password = await hashPassword(password);
      }

      await tx.user.update({
        where: { id: member.userId },
        data: updateData,
      });

      await tx.member.update({
        where: { id: memberId },
        data: { membershipId },
      });
    });

    return NextResponse.json({
      message: 'Member updated successfully',
    });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}