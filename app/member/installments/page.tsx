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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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
    return Array.from(years).sort().reverse();
  };

  const filteredInstallments = installments.filter(installment =>
    installment.month.startsWith(selectedYear)
  );

  const yearlyTotal = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const yearlyCount = filteredInstallments.length;
  const yearlyAverage = yearlyCount > 0 ? yearlyTotal / yearlyCount : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Installments</h1>
          <p className="text-gray-600 mt-1">View your payment history and details</p>
        </div>
        
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateYearOptions().map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Paid (All Time)</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{stats.totalPaid.toLocaleString()}
                  </p>
                </div>
                <Icons.dollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.paymentCount}
                  </p>
                </div>
                <Icons.creditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Payment</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{stats.averagePayment.toLocaleString()}
                  </p>
                </div>
                <Icons.trendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Payment</p>
                  <p className="text-2xl font-bold text-orange-600">
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
                </div>
                <Icons.calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Yearly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{selectedYear} Total</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{yearlyTotal.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{selectedYear} Payments</p>
              <p className="text-2xl font-bold text-blue-600">
                {yearlyCount}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{selectedYear} Average</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{yearlyAverage.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {(() => {
                          try {
                            const [year, month] = installment.month.split('-');
                            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                            return format(date, 'MMMM yyyy');
                          } catch (error) {
                            return installment.month;
                          }
                        })()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ₹{installment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          return format(new Date(installment.paymentDate), 'MMM dd, yyyy');
                        } catch (error) {
                          return 'Invalid Date';
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        Paid
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredInstallments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments found for {selectedYear}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}