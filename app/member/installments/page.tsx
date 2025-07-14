"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';

interface Installment {
  id: string;
  month: string;
  amount: number;
  paymentDate: string;
}

interface MemberStats {
  totalPaid: number;
  paymentCount: number;
  averagePayment: number;
  lastPayment: string | null;
}

export default function MemberInstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    fetchInstallments();
    fetchStats();
  }, []);

  const fetchInstallments = async () => {
    try {
      const response = await fetch('/api/member/payments');
      if (!response.ok) throw new Error('Failed to fetch installments');
      const data = await response.json();
      setInstallments(data);
    } catch (error) {
      console.error('Failed to fetch installments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/member/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const generateYearOptions = () => {
    const years = new Set<string>();
    installments.forEach(installment => {
      const year = installment.month.split('-')[0];
      years.add(year);
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  };

  const filteredInstallments = selectedYear === 'all' 
    ? installments 
    : installments.filter(installment => installment.month.startsWith(selectedYear));

  const yearlyTotal = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const yearlyCount = filteredInstallments.length;
  const yearlyAverage = yearlyCount > 0 ? yearlyTotal / yearlyCount : 0;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Payment History
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Track your contributions and payment details
          </p>
        </div>
        
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full md:w-40 bg-background">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {generateYearOptions().map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats - Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    ৳{stats.totalPaid.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">All Time</p>
                </div>
                <div className="p-2 md:p-3 rounded-full bg-green-100">
                  <Icons.dollarSign className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600">
                    {stats.paymentCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="p-2 md:p-3 rounded-full bg-blue-100">
                  <Icons.creditCard className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Share Amount</p>
                  <p className="text-lg md:text-2xl font-bold text-purple-600">
                    ৳{stats.averagePayment.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Per installment</p>
                </div>
                <div className="p-2 md:p-3 rounded-full bg-purple-100">
                  <Icons.trendingUp className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Last Payment</p>
                  <p className="text-lg md:text-2xl font-bold text-orange-600">
                    {stats.lastPayment ? (() => {
                      try {
                        const [year, month] = stats.lastPayment.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                        return format(date, 'MMM yyyy');
                      } catch (error) {
                        return stats.lastPayment;
                      }
                    })() : 'None'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Most recent</p>
                </div>
                <div className="p-2 md:p-3 rounded-full bg-orange-100">
                  <Icons.calendar className="h-4 w-4 md:h-6 md:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtered Stats - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 md:p-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-green-800">
                {selectedYear === 'all' ? 'All Years' : selectedYear} Total
              </p>
              <p className="text-lg md:text-2xl font-bold text-green-700">
                ৳{yearlyTotal.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {filteredInstallments.length} payments
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 md:p-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-blue-800">
                {selectedYear === 'all' ? 'All Years' : selectedYear} Payments
              </p>
              <p className="text-lg md:text-2xl font-bold text-blue-700">
                {yearlyCount}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {selectedYear === 'all' ? 'Total count' : 'This year'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 md:p-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-purple-800">
                {selectedYear === 'all' ? 'All Years' : selectedYear} Average
              </p>
              <p className="text-lg md:text-2xl font-bold text-purple-700">
                ৳{yearlyAverage.toLocaleString()}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Per installment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installments Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary to-blue-600 rounded-t-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle className="text-white text-lg md:text-xl">
              Payment Details - {selectedYear === 'all' ? 'All Years' : selectedYear}
            </CardTitle>
            <Badge variant="secondary" className="px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm">
              {filteredInstallments.length} records
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px] md:min-w-full">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 text-xs md:text-sm">Month</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs md:text-sm">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs md:text-sm">Payment Date</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs md:text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.length > 0 ? (
                  filteredInstallments
                    .sort((a, b) => b.month.localeCompare(a.month))
                    .map((installment) => (
                      <TableRow key={installment.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 md:py-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs md:text-sm">
                            {(() => {
                              try {
                                const [year, month] = installment.month.split('-');
                                const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                                return format(date, 'MMM yyyy');
                              } catch (error) {
                                return installment.month;
                              }
                            })()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-700 py-2 md:py-3 text-sm md:text-base">
                          ৳{installment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-2 md:py-3">
                          <div className="flex items-center gap-1 md:gap-2">
                            <Icons.calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                            <span className="text-xs md:text-sm">
                              {(() => {
                                try {
                                  return format(new Date(installment.paymentDate), 'PP');
                                } catch (error) {
                                  return 'Invalid Date';
                                }
                              })()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 md:py-3">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs md:text-sm">
                            <Icons.checkCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Icons.alertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm md:text-base">
                          No payments found for {selectedYear === 'all' ? 'any year' : selectedYear}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}