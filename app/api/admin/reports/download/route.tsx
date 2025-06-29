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
    const reportType = searchParams.get('reportType') || 'monthly-installments';
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const startMonth = searchParams.get('startMonth');
    const endMonth = searchParams.get('endMonth');

    // Build where clause for filtering
    const whereClause: any = {};
    
    if (startMonth && endMonth) {
      whereClause.month = {
        gte: startMonth,
        lte: endMonth,
      };
    } else {
      if (year && year !== 'all') {
        whereClause.month = { startsWith: year };
      }
      if (month && month !== 'all') {
        if (whereClause.month) {
          whereClause.month = { startsWith: `${year || new Date().getFullYear()}-${month}` };
        } else {
          whereClause.month = { endsWith: `-${month}` };
        }
      }
    }

    let data: any = {};
    let fileName = '';

    switch (reportType) {
      case 'monthly-installments':
        data = await generateMonthlyInstallmentsReport(whereClause);
        fileName = `monthly-installments-${year || 'all'}-${month || 'all'}`;
        break;
      
      case 'yearly-summary':
        data = await generateYearlySummaryReport(whereClause);
        fileName = `yearly-summary-${year || 'all'}`;
        break;
      
      case 'member-wise':
        data = await generateMemberWiseReport(whereClause);
        fileName = `member-wise-report-${year || 'all'}`;
        break;
      
      case 'payment-trends':
        data = await generatePaymentTrendsReport(whereClause);
        fileName = `payment-trends-${year || 'all'}`;
        break;
      
      case 'executive-summary':
        data = await generateExecutiveSummaryReport(whereClause);
        fileName = `executive-summary-${year || 'all'}`;
        break;
      
      case 'detailed-transactions':
        data = await generateDetailedTransactionsReport(whereClause);
        fileName = `detailed-transactions-${year || 'all'}`;
        break;
      
      default:
        data = await generateMonthlyInstallmentsReport(whereClause);
        fileName = `monthly-installments-${year || 'all'}`;
    }

    if (format === 'csv') {
      const csvContent = generateCSV(data, reportType);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}.csv"`,
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

async function generateMonthlyInstallmentsReport(whereClause: any) {
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

  const monthlyData = await prisma.installment.groupBy({
    by: ['month'],
    _sum: { amount: true },
    _count: { id: true },
    where: whereClause,
    orderBy: { month: 'asc' },
  });

  return {
    installments,
    monthlyData: monthlyData.map(item => ({
      month: item.month,
      totalAmount: item._sum.amount || 0,
      count: item._count.id,
      averageAmount: item._count.id > 0 ? (item._sum.amount || 0) / item._count.id : 0,
    })),
    summary: {
      totalInstallments: installments.length,
      totalAmount: installments.reduce((sum, inst) => sum + inst.amount, 0),
      uniqueMembers: new Set(installments.map(inst => inst.member.membershipId)).size,
    },
  };
}

async function generateYearlySummaryReport(whereClause: any) {
  const yearlyData = await prisma.installment.groupBy({
    by: ['month'],
    _sum: { amount: true },
    _count: { id: true },
    where: whereClause,
  });

  const yearlyGrouped = yearlyData.reduce((acc: any, item) => {
    const year = item.month.split('-')[0];
    if (!acc[year]) {
      acc[year] = { totalAmount: 0, count: 0, months: [] };
    }
    acc[year].totalAmount += item._sum.amount || 0;
    acc[year].count += item._count.id;
    acc[year].months.push({
      month: item.month,
      amount: item._sum.amount || 0,
      count: item._count.id,
    });
    return acc;
  }, {});

  return {
    yearlyData: Object.entries(yearlyGrouped).map(([year, data]: [string, any]) => ({
      year,
      totalAmount: data.totalAmount,
      count: data.count,
      averageAmount: data.count > 0 ? data.totalAmount / data.count : 0,
      months: data.months,
    })),
  };
}

async function generateMemberWiseReport(whereClause: any) {
  const members = await prisma.member.findMany({
    include: {
      user: { select: { name: true } },
      installments: {
        where: whereClause,
        select: { amount: true, month: true, paymentDate: true },
      },
    },
    where: { active: true },
  });

  return {
    members: members.map(member => {
      const totalPaid = member.installments.reduce((sum, inst) => sum + inst.amount, 0);
      const paymentCount = member.installments.length;
      const lastPayment = member.installments.length > 0 
        ? member.installments.sort((a, b) => b.month.localeCompare(a.month))[0]
        : null;
      
      return {
        membershipId: member.membershipId,
        memberName: member.user.name,
        totalPaid,
        paymentCount,
        averagePayment: paymentCount > 0 ? totalPaid / paymentCount : 0,
        lastPayment: lastPayment?.month || null,
        lastPaymentDate: lastPayment?.paymentDate || null,
        installments: member.installments,
      };
    }).sort((a, b) => b.totalPaid - a.totalPaid),
  };
}

async function generatePaymentTrendsReport(whereClause: any) {
  const monthlyTrends = await prisma.installment.groupBy({
    by: ['month'],
    _sum: { amount: true },
    _count: { id: true },
    _avg: { amount: true },
    where: whereClause,
    orderBy: { month: 'asc' },
  });

  return {
    trends: monthlyTrends.map(item => ({
      month: item.month,
      totalAmount: item._sum.amount || 0,
      count: item._count.id,
      averageAmount: item._avg.amount || 0,
    })),
    analysis: {
      growthRate: calculateGrowthRate(monthlyTrends),
      seasonality: analyzeSeasonality(monthlyTrends),
    },
  };
}

async function generateExecutiveSummaryReport(whereClause: any) {
  const totalCollection = await prisma.installment.aggregate({
    _sum: { amount: true },
    _count: { id: true },
    _avg: { amount: true },
    where: whereClause,
  });

  const memberStats = await prisma.member.aggregate({
    _count: { id: true },
    where: { active: true },
  });

  const topMembers = await prisma.member.findMany({
    include: {
      user: { select: { name: true } },
      installments: {
        where: whereClause,
        select: { amount: true },
      },
    },
    where: { active: true },
  });

  const topMembersWithTotals = topMembers
    .map(member => ({
      membershipId: member.membershipId,
      memberName: member.user.name,
      totalPaid: member.installments.reduce((sum, inst) => sum + inst.amount, 0),
      paymentCount: member.installments.length,
    }))
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);

  return {
    summary: {
      totalCollection: totalCollection._sum.amount || 0,
      totalInstallments: totalCollection._count.id,
      averagePayment: totalCollection._avg.amount || 0,
      totalMembers: memberStats._count.id,
    },
    topMembers: topMembersWithTotals,
  };
}

async function generateDetailedTransactionsReport(whereClause: any) {
  const transactions = await prisma.installment.findMany({
    where: whereClause,
    include: {
      member: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: [
      { paymentDate: 'desc' },
      { member: { membershipId: 'asc' } },
    ],
  });

  return {
    transactions: transactions.map(transaction => ({
      id: transaction.id,
      membershipId: transaction.member.membershipId,
      memberName: transaction.member.user.name,
      memberEmail: transaction.member.user.email,
      month: transaction.month,
      amount: transaction.amount,
      paymentDate: transaction.paymentDate,
      createdAt: transaction.createdAt,
    })),
  };
}

function generateCSV(data: any, reportType: string): string {
  let csvContent = '';

  switch (reportType) {
    case 'monthly-installments':
      csvContent = generateMonthlyInstallmentsCSV(data);
      break;
    case 'yearly-summary':
      csvContent = generateYearlySummaryCSV(data);
      break;
    case 'member-wise':
      csvContent = generateMemberWiseCSV(data);
      break;
    case 'payment-trends':
      csvContent = generatePaymentTrendsCSV(data);
      break;
    case 'executive-summary':
      csvContent = generateExecutiveSummaryCSV(data);
      break;
    case 'detailed-transactions':
      csvContent = generateDetailedTransactionsCSV(data);
      break;
    default:
      csvContent = generateMonthlyInstallmentsCSV(data);
  }

  return csvContent;
}

function generateMonthlyInstallmentsCSV(data: any): string {
  const headers = [
    'Member ID',
    'Member Name',
    'Month',
    'Amount (₹)',
    'Payment Date',
  ];

  const rows = data.installments.map((inst: any) => [
    inst.member.membershipId,
    inst.member.user.name,
    inst.month,
    inst.amount.toString(),
    new Date(inst.paymentDate).toLocaleDateString(),
  ]);

  return [
    headers.join(','),
    ...rows.map((row: string[]) => row.map(field => `"${field}"`).join(',')),
  ].join('\n');
}

function generateYearlySummaryCSV(data: any): string {
  const headers = [
    'Year',
    'Total Amount (₹)',
    'Payment Count',
    'Average Amount (₹)',
  ];

  const rows = data.yearlyData.map((year: any) => [
    year.year,
    year.totalAmount.toString(),
    year.count.toString(),
    year.averageAmount.toFixed(2),
  ]);

  return [
    headers.join(','),
    ...rows.map((row: string[]) => row.map(field => `"${field}"`).join(',')),
  ].join('\n');
}

function generateMemberWiseCSV(data: any): string {
  const headers = [
    'Member ID',
    'Member Name',
    'Total Paid (₹)',
    'Payment Count',
    'Average Payment (₹)',
    'Last Payment Month',
  ];

  const rows = data.members.map((member: any) => [
    member.membershipId,
    member.memberName,
    member.totalPaid.toString(),
    member.paymentCount.toString(),
    member.averagePayment.toFixed(2),
    member.lastPayment || 'None',
  ]);

  return [
    headers.join(','),
    ...rows.map((row: string[]) => row.map(field => `"${field}"`).join(',')),
  ].join('\n');
}

function generatePaymentTrendsCSV(data: any): string {
  const headers = [
    'Month',
    'Total Amount (₹)',
    'Payment Count',
    'Average Amount (₹)',
  ];

  const rows = data.trends.map((trend: any) => [
    trend.month,
    trend.totalAmount.toString(),
    trend.count.toString(),
    trend.averageAmount.toFixed(2),
  ]);

  return [
    headers.join(','),
    ...rows.map((row: string[]) => row.map(field => `"${field}"`).join(',')),
  ].join('\n');
}

function generateExecutiveSummaryCSV(data: any): string {
  const summaryHeaders = ['Metric', 'Value'];
  const summaryRows = [
    ['Total Collection', `₹${data.summary.totalCollection.toLocaleString()}`],
    ['Total Installments', data.summary.totalInstallments.toString()],
    ['Average Payment', `₹${data.summary.averagePayment.toFixed(2)}`],
    ['Total Members', data.summary.totalMembers.toString()],
  ];

  const memberHeaders = ['Rank', 'Member ID', 'Member Name', 'Total Paid (₹)', 'Payment Count'];
  const memberRows = data.topMembers.map((member: any, index: number) => [
    (index + 1).toString(),
    member.membershipId,
    member.memberName,
    member.totalPaid.toString(),
    member.paymentCount.toString(),
  ]);

  return [
    'EXECUTIVE SUMMARY',
    '',
    summaryHeaders.join(','),
    ...summaryRows.map((row: string[]) => row.map(field => `"${field}"`).join(',')),
    '',
    'TOP MEMBERS',
    '',
    memberHeaders.join(','),
    ...memberRows.map((row: string[]) => row.map(field => `"${field}"`).join(',')),
  ].join('\n');
}

function generateDetailedTransactionsCSV(data: any): string {
  const headers = [
    'Transaction ID',
    'Member ID',
    'Member Name',
    'Member Email',
    'Month',
    'Amount (₹)',
    'Payment Date',
    'Created Date',
  ];

  const rows = data.transactions.map((transaction: any) => [
    transaction.id,
    transaction.membershipId,
    transaction.memberName,
    transaction.memberEmail,
    transaction.month,
    transaction.amount.toString(),
    new Date(transaction.paymentDate).toLocaleDateString(),
    new Date(transaction.createdAt).toLocaleDateString(),
  ]);

  return [
    headers.join(','),
    ...rows.map((row: string[]) => row.map(field => `"${field}"`).join(',')),
  ].join('\n');
}

function calculateGrowthRate(monthlyTrends: any[]): number {
  if (monthlyTrends.length < 2) return 0;
  
  const firstMonth = monthlyTrends[0]._sum.amount || 0;
  const lastMonth = monthlyTrends[monthlyTrends.length - 1]._sum.amount || 0;
  
  if (firstMonth === 0) return 0;
  return ((lastMonth - firstMonth) / firstMonth) * 100;
}

function analyzeSeasonality(monthlyTrends: any[]): string {
  // Simple seasonality analysis
  const monthlyAverages = monthlyTrends.reduce((acc: any, trend) => {
    const month = parseInt(trend.month.split('-')[1]);
    if (!acc[month]) acc[month] = [];
    acc[month].push(trend._sum.amount || 0);
    return acc;
  }, {});

  let peakMonth = 1;
  let peakAverage = 0;

  Object.entries(monthlyAverages).forEach(([month, amounts]: [string, any]) => {
    const average = amounts.reduce((sum: number, amount: number) => sum + amount, 0) / amounts.length;
    if (average > peakAverage) {
      peakAverage = average;
      peakMonth = parseInt(month);
    }
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `Peak collection month: ${monthNames[peakMonth - 1]}`;
}