import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
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
    });

    if (!member) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      );
    }

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { active: !member.active },
    });

    return NextResponse.json({
      message: `Member ${updatedMember.active ? 'activated' : 'deactivated'} successfully`,
      member: updatedMember,
    });
  } catch (error) {
    console.error('Toggle member status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}