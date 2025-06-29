"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [reportType, setReportType] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startMonth: '',
    endMonth: '',
  });

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

  const downloadReport = async (format: 'csv', reportType: string) => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('reportType', reportType);
      
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (dateRange.startMonth) params.append('startMonth', dateRange.startMonth);
      if (dateRange.endMonth) params.append('endMonth', dateRange.endMonth);
      
      const response = await fetch(`/api/admin/reports/download?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const fileName = `${reportType}-report-${selectedYear !== 'all' ? selectedYear : 'all-time'}-${selectedMonth !== 'all' ? selectedMonth : 'all-months'}.${format}`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${reportType} report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePrintableReport = (reportType: string) => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = generatePrintableHTML(reportData, reportType, {
      year: selectedYear,
      month: selectedMonth,
      startMonth: dateRange.startMonth,
      endMonth: dateRange.endMonth,
    });

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
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

  const generateMonthYearOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate from October 2024 to 2 years in future
    for (let year = 2024; year <= currentDate.getFullYear() + 2; year++) {
      const startMonth = year === 2024 ? 10 : 1; // Start from October for 2024
      const endMonth = 12;
      
      for (let month = startMonth; month <= endMonth; month++) {
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        const date = new Date(year, month - 1, 1);
        const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        options.push({ value: monthStr, label: displayStr });
      }
    }
    
    return options;
  };

  const filteredMemberReport = reportData?.memberWiseReport.filter(member =>
    member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icons.barChart className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="text-center py-8">
          <p className="text-gray-500">No report data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div className="space-y-2">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            📊 Advanced Reports & Analytics
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Comprehensive membership and payment analytics with professional reporting
          </motion.p>
        </div>
      </motion.div>

      {/* Filters and Download Section */}
      <motion.div 
        className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        variants={itemVariants}
      >
        {/* Filters Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Icons.filter className="h-5 w-5 mr-2 text-blue-600" />
              </motion.div>
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Icons.calendar className="h-4 w-4 mr-1 text-blue-500" />
                  Year Filter
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-blue-400 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🗓️ All Years</SelectItem>
                    {generateYearOptions().map((year) => (
                      <SelectItem key={year} value={year}>
                        📅 {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Icons.calendar className="h-4 w-4 mr-1 text-green-500" />
                  Month Filter
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📆 All Months</SelectItem>
                    {generateMonthOptions().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        🗓️ {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200">
              <Label className="text-sm font-medium text-gray-700 flex items-center">
                <Icons.calendar className="h-4 w-4 mr-1 text-purple-500" />
                Custom Date Range
              </Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">📅 Start Month</Label>
                  <Select value={dateRange.startMonth} onValueChange={(value) => setDateRange({...dateRange, startMonth: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select start month" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateMonthYearOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">📅 End Month</Label>
                  <Select value={dateRange.endMonth} onValueChange={(value) => setDateRange({...dateRange, endMonth: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select end month" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateMonthYearOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200">
              <Label className="text-sm font-medium text-gray-700 flex items-center">
                <Icons.barChart className="h-4 w-4 mr-1 text-orange-500" />
                Report Type
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">📊 Overview Dashboard</SelectItem>
                  <SelectItem value="monthly">📅 Monthly Analysis</SelectItem>
                  <SelectItem value="yearly">📈 Yearly Comparison</SelectItem>
                  <SelectItem value="members">👥 Member Analysis</SelectItem>
                  <SelectItem value="trends">📈 Payment Trends</SelectItem>
                  <SelectItem value="distribution">🥧 Payment Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Download Options Card */}
        <Card className="xl:col-span-2 shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              >
                <Icons.download className="h-5 w-5 mr-2 text-green-600" />
              </motion.div>
              📥 Download & Print Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Quick Download Buttons */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Icons.trendingUp className="h-4 w-4 mr-1 text-blue-500" />
                  ⚡ Quick Downloads
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => generatePrintableReport('monthly-installments')}
                      disabled={isDownloading}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Icons.fileText className="h-4 w-4 mr-2" />
                      📄 Monthly PDF
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => downloadReport('csv', 'monthly-installments')}
                      disabled={isDownloading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isDownloading ? (
                        <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Icons.download className="h-4 w-4 mr-2" />
                      )}
                      📊 Monthly CSV
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => generatePrintableReport('yearly-summary')}
                      disabled={isDownloading}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Icons.fileText className="h-4 w-4 mr-2" />
                      📈 Yearly PDF
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => downloadReport('csv', 'yearly-summary')}
                      disabled={isDownloading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isDownloading ? (
                        <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Icons.download className="h-4 w-4 mr-2" />
                      )}
                      📊 Yearly CSV
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Advanced Download Options */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Icons.activity className="h-4 w-4 mr-1 text-purple-500" />
                  🎯 Advanced Reports
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[
                    { type: 'member-wise', label: 'Member-wise Report', icon: Icons.users, color: 'from-blue-500 to-blue-600', emoji: '👥' },
                    { type: 'payment-trends', label: 'Payment Trends', icon: Icons.trendingUp, color: 'from-green-500 to-green-600', emoji: '📈' },
                    { type: 'executive-summary', label: 'Executive Summary', icon: Icons.pieChart, color: 'from-purple-500 to-purple-600', emoji: '📋' },
                    { type: 'detailed-transactions', label: 'Detailed Transactions', icon: Icons.fileText, color: 'from-orange-500 to-orange-600', emoji: '📄' },
                  ].map((report) => (
                    <div key={report.type} className="flex items-center space-x-2">
                      <motion.div 
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Button
                          onClick={() => generatePrintableReport(report.type)}
                          disabled={isDownloading}
                          className={`w-full justify-start bg-gradient-to-r ${report.color} text-white border-0 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                          <report.icon className="h-4 w-4 mr-2" />
                          {report.emoji} {report.label} PDF
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          onClick={() => downloadReport('csv', report.type)}
                          disabled={isDownloading}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                        >
                          📊 CSV
                        </Button>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {[
          {
            title: 'Total Collection',
            value: `₹${reportData.summary.totalCollection.toLocaleString()}`,
            icon: Icons.dollarSign,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100',
            change: '+12.5%',
            emoji: '💰',
          },
          {
            title: 'Active Members',
            value: reportData.summary.activeMembers,
            icon: Icons.users,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            change: '+8.3%',
            emoji: '👥',
          },
          {
            title: 'Avg Monthly',
            value: `₹${reportData.summary.averageMonthlyCollection.toLocaleString()}`,
            icon: Icons.trendingUp,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            change: '+15.7%',
            emoji: '📈',
          },
          {
            title: 'Highest Payment',
            value: `₹${reportData.summary.highestPayment.toLocaleString()}`,
            icon: Icons.activity,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            change: '+5.2%',
            emoji: '🏆',
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden"
          >
            <Card className={`shadow-xl border-0 bg-gradient-to-br ${card.bgGradient} hover:shadow-2xl transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      {card.emoji} {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-green-600">{card.change}</span>
                      <span className="text-xs text-gray-500">vs last period</span>
                    </div>
                  </div>
                  <motion.div
                    className={`p-3 bg-gradient-to-r ${card.gradient} rounded-full shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <card.icon className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Dynamic Report Content */}
      {reportType === 'overview' && (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Icons.trendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  📈 Monthly Collection Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.monthlyCollection}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                      <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Icons.pieChart className="h-5 w-5 mr-2 text-purple-600" />
                  🥧 Payment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
          </motion.div>
        </motion.div>
      )}

      {reportType === 'monthly' && (
        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <Icons.calendar className="h-5 w-5 mr-2 text-green-600" />
                📅 Monthly Collection Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.monthlyCollection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">📅 Month</TableHead>
                      <TableHead className="font-semibold text-gray-700">💰 Total Amount</TableHead>
                      <TableHead className="font-semibold text-gray-700">📊 Payment Count</TableHead>
                      <TableHead className="font-semibold text-gray-700">📈 Average Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.monthlyCollection.map((month, index) => (
                      <motion.tr
                        key={month.month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-blue-50/50 transition-colors duration-200"
                      >
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {format(new Date(month.month + '-01'), 'MMM yyyy')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 text-lg">
                          ₹{month.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{month.count}</TableCell>
                        <TableCell className="font-medium text-purple-600">
                          ₹{month.count > 0 ? (month.amount / month.count).toFixed(0) : 0}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {reportType === 'members' && (
        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Icons.users className="h-5 w-5 mr-2 text-purple-600" />
                  👥 Member-wise Payment Analysis
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Icons.search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="🔍 Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">🆔 Member ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">👤 Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">💰 Total Paid</TableHead>
                      <TableHead className="font-semibold text-gray-700">📊 Payment Count</TableHead>
                      <TableHead className="font-semibold text-gray-700">📈 Average Payment</TableHead>
                      <TableHead className="font-semibold text-gray-700">📅 Last Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMemberReport.map((member, index) => (
                      <motion.tr
                        key={member.membershipId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-purple-50/50 transition-colors duration-200"
                      >
                        <TableCell className="font-medium text-purple-600">
                          {member.membershipId}
                        </TableCell>
                        <TableCell className="font-medium">{member.memberName}</TableCell>
                        <TableCell className="font-semibold text-green-600 text-lg">
                          ₹{member.totalPaid.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{member.paymentCount}</TableCell>
                        <TableCell className="font-medium text-blue-600">
                          ₹{member.averagePayment.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {member.lastPayment ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {format(new Date(member.lastPayment + '-01'), 'MMM yyyy')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No payments</Badge>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

function generatePrintableHTML(reportData: ReportData, reportType: string, filters: any): string {
  const currentDate = new Date().toLocaleDateString();
  const reportTitle = getReportTitle(reportType);
  
  let tableContent = '';
  
  switch (reportType) {
    case 'monthly-installments':
      tableContent = generateMonthlyInstallmentsTable(reportData);
      break;
    case 'yearly-summary':
      tableContent = generateYearlySummaryTable(reportData);
      break;
    case 'member-wise':
      tableContent = generateMemberWiseTable(reportData);
      break;
    case 'payment-trends':
      tableContent = generatePaymentTrendsTable(reportData);
      break;
    case 'executive-summary':
      tableContent = generateExecutiveSummaryTable(reportData);
      break;
    case 'detailed-transactions':
      tableContent = generateDetailedTransactionsTable(reportData);
      break;
    default:
      tableContent = generateMonthlyInstallmentsTable(reportData);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportTitle}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: #333;
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
        }
        .header h1 { 
          color: #1E40AF; 
          margin: 0;
          font-size: 28px;
        }
        .header p { 
          color: #6B7280; 
          margin: 5px 0;
          font-size: 14px;
        }
        .summary { 
          background: #F8FAFC; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 30px;
          border-left: 4px solid #10B981;
        }
        .summary h3 { 
          margin-top: 0; 
          color: #059669;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .summary-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #E5E7EB;
        }
        .summary-item strong {
          color: #1F2937;
          display: block;
          font-size: 18px;
        }
        .summary-item span {
          color: #6B7280;
          font-size: 12px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th { 
          background: #F3F4F6; 
          padding: 12px; 
          text-align: left; 
          border: 1px solid #D1D5DB;
          font-weight: 600;
          color: #374151;
        }
        td { 
          padding: 10px 12px; 
          border: 1px solid #E5E7EB;
        }
        tr:nth-child(even) { 
          background: #F9FAFB; 
        }
        tr:hover {
          background: #EBF8FF;
        }
        .amount { 
          font-weight: bold; 
          color: #059669; 
        }
        .member-id { 
          font-weight: 600; 
          color: #7C3AED; 
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          color: #6B7280; 
          font-size: 12px;
          border-top: 1px solid #E5E7EB;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 ${reportTitle}</h1>
        <p>Generated on: ${currentDate}</p>
        <p>Filters: Year: ${filters.year || 'All'}, Month: ${filters.month || 'All'}</p>
        ${filters.startMonth ? `<p>Date Range: ${filters.startMonth} to ${filters.endMonth || 'Present'}</p>` : ''}
      </div>
      
      <div class="summary">
        <h3>📈 Summary Statistics</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <strong>₹${reportData.summary.totalCollection.toLocaleString()}</strong>
            <span>Total Collection</span>
          </div>
          <div class="summary-item">
            <strong>${reportData.summary.activeMembers}</strong>
            <span>Active Members</span>
          </div>
          <div class="summary-item">
            <strong>₹${reportData.summary.averageMonthlyCollection.toLocaleString()}</strong>
            <span>Average Monthly</span>
          </div>
          <div class="summary-item">
            <strong>₹${reportData.summary.highestPayment.toLocaleString()}</strong>
            <span>Highest Payment</span>
          </div>
        </div>
      </div>
      
      ${tableContent}
      
      <div class="footer">
        <p>📋 Membership Management System - Professional Report</p>
        <p>This report contains confidential information. Please handle with care.</p>
      </div>
    </body>
    </html>
  `;
}

function generateMonthlyInstallmentsTable(reportData: ReportData): string {
  return `
    <h3>📅 Monthly Collection Details</h3>
    <table>
      <thead>
        <tr>
          <th>📅 Month</th>
          <th>💰 Total Amount</th>
          <th>📊 Payment Count</th>
          <th>📈 Average Payment</th>
        </tr>
      </thead>
      <tbody>
        ${reportData.monthlyCollection.map(month => `
          <tr>
            <td>${format(new Date(month.month + '-01'), 'MMMM yyyy')}</td>
            <td class="amount">₹${month.amount.toLocaleString()}</td>
            <td>${month.count}</td>
            <td class="amount">₹${month.count > 0 ? (month.amount / month.count).toFixed(0) : 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function generateYearlySummaryTable(reportData: ReportData): string {
  const yearlyData = reportData.yearlyComparison;
  return `
    <h3>📈 Yearly Summary</h3>
    <table>
      <thead>
        <tr>
          <th>📅 Year</th>
          <th>💰 Total Amount</th>
          <th>📊 Growth Rate</th>
        </tr>
      </thead>
      <tbody>
        ${yearlyData.map((year, index) => {
          const prevYear = index > 0 ? yearlyData[index - 1] : null;
          const growthRate = prevYear ? ((year.amount - prevYear.amount) / prevYear.amount * 100).toFixed(1) : 'N/A';
          return `
            <tr>
              <td>${year.year}</td>
              <td class="amount">₹${year.amount.toLocaleString()}</td>
              <td>${growthRate}${growthRate !== 'N/A' ? '%' : ''}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function generateMemberWiseTable(reportData: ReportData): string {
  return `
    <h3>👥 Member-wise Payment Analysis</h3>
    <table>
      <thead>
        <tr>
          <th>🆔 Member ID</th>
          <th>👤 Member Name</th>
          <th>💰 Total Paid</th>
          <th>📊 Payment Count</th>
          <th>📈 Average Payment</th>
          <th>📅 Last Payment</th>
        </tr>
      </thead>
      <tbody>
        ${reportData.memberWiseReport.map(member => `
          <tr>
            <td class="member-id">${member.membershipId}</td>
            <td>${member.memberName}</td>
            <td class="amount">₹${member.totalPaid.toLocaleString()}</td>
            <td>${member.paymentCount}</td>
            <td class="amount">₹${member.averagePayment.toLocaleString()}</td>
            <td>${member.lastPayment ? format(new Date(member.lastPayment + '-01'), 'MMM yyyy') : 'No payments'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function generatePaymentTrendsTable(reportData: ReportData): string {
  return generateMonthlyInstallmentsTable(reportData);
}

function generateExecutiveSummaryTable(reportData: ReportData): string {
  return `
    <h3>📋 Executive Summary</h3>
    <div style="margin-bottom: 30px;">
      <h4>🏆 Top 10 Contributing Members</h4>
      <table>
        <thead>
          <tr>
            <th>🏅 Rank</th>
            <th>🆔 Member ID</th>
            <th>👤 Member Name</th>
            <th>💰 Total Paid</th>
            <th>📊 Payment Count</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.memberWiseReport.slice(0, 10).map((member, index) => `
            <tr>
              <td>${index + 1}</td>
              <td class="member-id">${member.membershipId}</td>
              <td>${member.memberName}</td>
              <td class="amount">₹${member.totalPaid.toLocaleString()}</td>
              <td>${member.paymentCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateDetailedTransactionsTable(reportData: ReportData): string {
  return generateMonthlyInstallmentsTable(reportData);
}

function getReportTitle(reportType: string): string {
  const titles: { [key: string]: string } = {
    'monthly-installments': 'Monthly Installments Report',
    'yearly-summary': 'Yearly Summary Report',
    'member-wise': 'Member-wise Payment Report',
    'payment-trends': 'Payment Trends Analysis',
    'executive-summary': 'Executive Summary Report',
    'detailed-transactions': 'Detailed Transactions Report',
  };
  return titles[reportType] || 'Membership Report';
}