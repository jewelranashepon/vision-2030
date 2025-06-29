"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format } from 'date-fns';

interface ReportData {
  monthlyCollection: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  memberWiseReport: Array<{
    membershipId: string;
    memberName: string;
    totalPaid: number;
    paymentCount: number;
    lastPayment: string | null;
    averagePayment: number;
  }>;
  yearlyComparison: Array<{
    year: string;
    amount: number;
  }>;
  paymentDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  summary: {
    totalCollection: number;
    totalMembers: number;
    activeMembers: number;
    averageMonthlyCollection: number;
    highestPayment: number;
    lowestPayment: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [reportType, setReportType] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedMonth]);

  const fetchReportData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      
      const response = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch report data');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      
      const response = await fetch(`/api/admin/reports/download?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const fileName = `membership-report-${selectedYear !== 'all' ? selectedYear : 'all-time'}-${selectedMonth !== 'all' ? selectedMonth : 'all-months'}.${format}`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const generateYearOptions = () => {
    if (!reportData) return [];
    const years = new Set<string>();
    reportData.monthlyCollection.forEach(item => {
      years.add(item.month.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  };

  const generateMonthOptions = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const monthStr = i.toString().padStart(2, '0');
      const date = new Date(2024, i - 1, 1);
      const displayStr = date.toLocaleDateString('en-US', { month: 'long' });
      months.push({ value: monthStr, label: displayStr });
    }
    return months;
  };

  const filteredMemberReport = reportData?.memberWiseReport.filter(member =>
    member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No report data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive membership and payment analytics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
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

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {generateMonthOptions().map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="monthly">Monthly Analysis</SelectItem>
              <SelectItem value="members">Member Analysis</SelectItem>
              <SelectItem value="trends">Trends</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => downloadReport('csv')}
          >
            <Icons.download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={() => downloadReport('pdf')}
          >
            <Icons.download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Collection</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{reportData.summary.totalCollection.toLocaleString()}
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
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData.summary.activeMembers}
                </p>
              </div>
              <Icons.users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Monthly</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{reportData.summary.averageMonthlyCollection.toLocaleString()}
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
                <p className="text-sm text-gray-600">Highest Payment</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{reportData.summary.highestPayment.toLocaleString()}
                </p>
              </div>
              <Icons.activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collection Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.monthlyCollection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.paymentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {reportData.paymentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'monthly' && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.monthlyCollection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Count</TableHead>
                    <TableHead>Average Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.monthlyCollection.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell>
                        <Badge variant="outline">
                          {format(new Date(month.month + '-01'), 'MMM yyyy')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{month.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{month.count}</TableCell>
                      <TableCell>
                        ₹{month.count > 0 ? (month.amount / month.count).toFixed(0) : 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'members' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Member-wise Payment Analysis</CardTitle>
              <div className="flex items-center space-x-2">
                <Icons.search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Payment Count</TableHead>
                    <TableHead>Average Payment</TableHead>
                    <TableHead>Last Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMemberReport.map((member) => (
                    <TableRow key={member.membershipId}>
                      <TableCell className="font-medium">
                        {member.membershipId}
                      </TableCell>
                      <TableCell>{member.memberName}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{member.totalPaid.toLocaleString()}
                      </TableCell>
                      <TableCell>{member.paymentCount}</TableCell>
                      <TableCell>
                        ₹{member.averagePayment.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {member.lastPayment ? (
                          <Badge variant="outline">
                            {format(new Date(member.lastPayment + '-01'), 'MMM yyyy')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No payments</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.yearlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.paymentDistribution.map((item, index) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.range}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{item.count} members</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}