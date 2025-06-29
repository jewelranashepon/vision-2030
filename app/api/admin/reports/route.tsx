// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getSession } from '@/lib/auth';

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getSession(request);
    
//     if (!session || session.role !== 'ADMIN') {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const year = searchParams.get('year');
//     const month = searchParams.get('month');

//     // Build where clause for filtering
//     const whereClause: any = {};
//     if (year && year !== 'all') {
//       whereClause.month = { startsWith: year };
//     }
//     if (month && month !== 'all') {
//       if (whereClause.month) {
//         // If year is also specified, combine them
//         whereClause.month = { startsWith: `${year || new Date().getFullYear()}-${month}` };
//       } else {
//         // If only month is specified, get all years for that month
//         whereClause.month = { endsWith: `-${month}` };
//       }
//     }

//     // Monthly collection data
//     const monthlyCollection = await prisma.installment.groupBy({
//       by: ['month'],
//       _sum: {
//         amount: true,
//       },
//       _count: {
//         id: true,
//       },
//       where: whereClause,
//       orderBy: {
//         month: 'asc',
//       },
//     });

//     const monthlyData = monthlyCollection.map(item => ({
//       month: item.month,
//       amount: item._sum.amount || 0,
//       count: item._count.id,
//     }));

//     // Member-wise report
//     const members = await prisma.member.findMany({
//       include: {
//         user: {
//           select: {
//             name: true,
//           },
//         },
//         installments: {
//           where: whereClause,
//           select: {
//             amount: true,
//             month: true,
//           },
//         },
//       },
//       where: {
//         active: true,
//       },
//     });

//     const memberWiseReport = members.map(member => {
//       const totalPaid = member.installments.reduce((sum, inst) => sum + inst.amount, 0);
//       const paymentCount = member.installments.length;
//       const lastPayment = member.installments.length > 0 
//         ? member.installments.sort((a, b) => b.month.localeCompare(a.month))[0].month
//         : null;
      
//       return {
//         membershipId: member.membershipId,
//         memberName: member.user.name,
//         totalPaid,
//         paymentCount,
//         lastPayment,
//         averagePayment: paymentCount > 0 ? totalPaid / paymentCount : 0,
//       };
//     }).sort((a, b) => b.totalPaid - a.totalPaid);

//     // Yearly comparison (only if not filtering by specific year)
//     let yearlyComparison = [];
//     if (!year || year === 'all') {
//       const yearlyData = await prisma.installment.groupBy({
//         by: ['month'],
//         _sum: {
//           amount: true,
//         },
//       });

//       const yearlyDataMap = yearlyData.reduce((acc: any, item) => {
//         const itemYear = item.month.split('-')[0];
//         if (!acc[itemYear]) {
//           acc[itemYear] = 0;
//         }
//         acc[itemYear] += item._sum.amount || 0;
//         return acc;
//       }, {});

//       yearlyComparison = Object.entries(yearlyDataMap).map(([year, amount]) => ({
//         year,
//         amount: amount as number,
//       })).sort((a, b) => a.year.localeCompare(b.year));
//     }

//     // Payment distribution
//     const allInstallments = await prisma.installment.findMany({
//       where: whereClause,
//       select: {
//         amount: true,
//       },
//     });

//     const paymentRanges = [
//       { range: '₹0 - ₹2,000', min: 0, max: 2000 },
//       { range: '₹2,001 - ₹5,000', min: 2001, max: 5000 },
//       { range: '₹5,001 - ₹10,000', min: 5001, max: 10000 },
//       { range: '₹10,001+', min: 10001, max: Infinity },
//     ];

//     const paymentDistribution = paymentRanges.map(range => {
//       const count = allInstallments.filter(inst => 
//         inst.amount >= range.min && inst.amount <= range.max
//       ).length;
      
//       return {
//         range: range.range,
//         count,
//         percentage: allInstallments.length > 0 ? Math.round((count / allInstallments.length) * 100) : 0,
//       };
//     });

//     // Summary statistics
//     const totalCollection = allInstallments.reduce((sum, inst) => sum + inst.amount, 0);
//     const totalMembers = members.length;
//     const activeMembers = members.filter(m => m.installments.length > 0).length;
//     const averageMonthlyCollection = monthlyData.length > 0 
//       ? monthlyData.reduce((sum, month) => sum + month.amount, 0) / monthlyData.length
//       : 0;
//     const amounts = allInstallments.map(inst => inst.amount);
//     const highestPayment = amounts.length > 0 ? Math.max(...amounts) : 0;
//     const lowestPayment = amounts.length > 0 ? Math.min(...amounts) : 0;

//     const reportData = {
//       monthlyCollection: monthlyData,
//       memberWiseReport,
//       yearlyComparison,
//       paymentDistribution,
//       summary: {
//         totalCollection,
//         totalMembers,
//         activeMembers,
//         averageMonthlyCollection,
//         highestPayment,
//         lowestPayment,
//       },
//     };

//     return NextResponse.json(reportData);
//   } catch (error) {
//     console.error('Reports API error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }












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
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const startMonth = searchParams.get('startMonth');
    const endMonth = searchParams.get('endMonth');

    // Build where clause for filtering
    const whereClause: any = {};
    
    // Handle date range filters
    if (startMonth && endMonth) {
      whereClause.month = {
        gte: startMonth,
        lte: endMonth,
      };
    } else {
      // Use individual year/month filters if no date range
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
    }

    // Monthly collection data
    const monthlyCollection = await prisma.installment.groupBy({
      by: ['month'],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: whereClause,
      orderBy: {
        month: 'asc',
      },
    });

    const monthlyData = monthlyCollection.map(item => ({
      month: item.month,
      amount: item._sum.amount || 0,
      count: item._count.id,
    }));

    // Member-wise report
    const members = await prisma.member.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        installments: {
          where: whereClause,
          select: {
            amount: true,
            month: true,
          },
        },
      },
      where: {
        active: true,
      },
    });

    const memberWiseReport = members.map(member => {
      const totalPaid = member.installments.reduce((sum, inst) => sum + inst.amount, 0);
      const paymentCount = member.installments.length;
      const lastPayment = member.installments.length > 0 
        ? member.installments.sort((a, b) => b.month.localeCompare(a.month))[0].month
        : null;
      
      return {
        membershipId: member.membershipId,
        memberName: member.user.name,
        totalPaid,
        paymentCount,
        lastPayment,
        averagePayment: paymentCount > 0 ? totalPaid / paymentCount : 0,
      };
    }).sort((a, b) => b.totalPaid - a.totalPaid);

    // Yearly comparison (only if not filtering by specific year)
    let yearlyComparison = [];
    if (!year || year === 'all') {
      const yearlyData = await prisma.installment.groupBy({
        by: ['month'],
        _sum: {
          amount: true,
        },
        where: whereClause,
      });

      const yearlyDataMap = yearlyData.reduce((acc: any, item) => {
        const itemYear = item.month.split('-')[0];
        if (!acc[itemYear]) {
          acc[itemYear] = 0;
        }
        acc[itemYear] += item._sum.amount || 0;
        return acc;
      }, {});

      yearlyComparison = Object.entries(yearlyDataMap).map(([year, amount]) => ({
        year,
        amount: amount as number,
      })).sort((a, b) => a.year.localeCompare(b.year));
    }

    // Payment distribution
    const allInstallments = await prisma.installment.findMany({
      where: whereClause,
      select: {
        amount: true,
      },
    });

    const paymentRanges = [
      { range: '₹0 - ₹2,000', min: 0, max: 2000 },
      { range: '₹2,001 - ₹5,000', min: 2001, max: 5000 },
      { range: '₹5,001 - ₹10,000', min: 5001, max: 10000 },
      { range: '₹10,001+', min: 10001, max: Infinity },
    ];

    const paymentDistribution = paymentRanges.map(range => {
      const count = allInstallments.filter(inst => 
        inst.amount >= range.min && inst.amount <= range.max
      ).length;
      
      return {
        range: range.range,
        count,
        percentage: allInstallments.length > 0 ? Math.round((count / allInstallments.length) * 100) : 0,
      };
    });

    // Summary statistics
    const totalCollection = allInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.installments.length > 0).length;
    const averageMonthlyCollection = monthlyData.length > 0 
      ? monthlyData.reduce((sum, month) => sum + month.amount, 0) / monthlyData.length
      : 0;
    const amounts = allInstallments.map(inst => inst.amount);
    const highestPayment = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestPayment = amounts.length > 0 ? Math.min(...amounts) : 0;

    const reportData = {
      monthlyCollection: monthlyData,
      memberWiseReport,
      yearlyComparison,
      paymentDistribution,
      summary: {
        totalCollection,
        totalMembers,
        activeMembers,
        averageMonthlyCollection,
        highestPayment,
        lowestPayment,
      },
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}