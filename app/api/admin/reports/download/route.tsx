import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Build where clause for filtering
    const whereClause: any = {};
    if (year && year !== 'all') {
      whereClause.month = { startsWith: year };
    }
    if (month && month !== 'all') {
      if (whereClause.month) {
        // If year is also specified, combine them
        whereClause.month = { startsWith: `${year || new Date().getFullYear()}-${month}` };
      } else {
        // If only month is specified, get all years for that month
        whereClause.month = { endsWith: `-${month}` };
      }
    }

    // Get all installments for the filtered period
    const installments = await prisma.installment.findMany({
      where: whereClause,
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
      orderBy: [
        { month: 'asc' },
        { member: { membershipId: 'asc' } },
      ],
    });

    if (format === 'csv') {
      const csvHeaders = [
        'Member ID',
        'Member Name',
        'Month',
        'Amount',
        'Payment Date',
      ];

      const csvRows = installments.map(inst => [
        inst.member.membershipId,
        inst.member.user.name,
        inst.month,
        inst.amount.toString(),
        new Date(inst.paymentDate).toLocaleDateString(),
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
      ].join('\n');

      const fileName = `membership-report-${year !== 'all' && year ? year : 'all-time'}-${month !== 'all' && month ? month : 'all-months'}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    // For PDF format, return JSON data that can be processed by frontend
    if (format === 'pdf') {
      const reportData = {
        filters: {
          year: year || 'All Years',
          month: month || 'All Months',
        },
        installments: installments.map(inst => ({
          membershipId: inst.member.membershipId,
          memberName: inst.member.user.name,
          month: inst.month,
          amount: inst.amount,
          paymentDate: new Date(inst.paymentDate).toLocaleDateString(),
        })),
        summary: {
          totalInstallments: installments.length,
          totalAmount: installments.reduce((sum, inst) => sum + inst.amount, 0),
          uniqueMembers: new Set(installments.map(inst => inst.member.membershipId)).size,
          averagePayment: installments.length > 0 ? installments.reduce((sum, inst) => sum + inst.amount, 0) / installments.length : 0,
        },
      };

      const fileName = `membership-report-${year !== 'all' && year ? year : 'all-time'}-${month !== 'all' && month ? month : 'all-months'}.json`;

      return NextResponse.json(reportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    return NextResponse.json({ message: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Download report error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}