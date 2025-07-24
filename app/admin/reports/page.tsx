// "use client";

// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Icons } from '@/components/icons';
// import { toast } from 'sonner';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
// import { format } from 'date-fns';

// interface ReportData {
//   monthlyCollection: Array<{
//     month: string;
//     amount: number;
//     count: number;
//   }>;
//   memberWiseReport: Array<{
//     membershipId: string;
//     memberName: string;
//     totalPaid: number;
//     paymentCount: number;
//     lastPayment: string | null;
//     averagePayment: number;
//   }>;
//   yearlyComparison: Array<{
//     year: string;
//     amount: number;
//   }>;
//   paymentDistribution: Array<{
//     range: string;
//     count: number;
//     percentage: number;
//   }>;
//   summary: {
//     totalCollection: number;
//     totalMembers: number;
//     activeMembers: number;
//     averageMonthlyCollection: number;
//     highestPayment: number;
//     lowestPayment: number;
//   };
// }

// const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//     },
//   },
// };

// const cardVariants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//     },
//   },
// };

// export default function ReportsPage() {
//   const [reportData, setReportData] = useState<ReportData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedYear, setSelectedYear] = useState('all');
//   const [selectedMonth, setSelectedMonth] = useState('all');
//   const [startMonth, setStartMonth] = useState('');
//   const [endMonth, setEndMonth] = useState('');
//   const [reportType, setReportType] = useState('overview');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [activeFilters, setActiveFilters] = useState<string[]>([]);

//   useEffect(() => {
//     fetchReportData();
//   }, [selectedYear, selectedMonth, startMonth, endMonth]);

//   useEffect(() => {
//     updateActiveFilters();
//   }, [selectedYear, selectedMonth, startMonth, endMonth]);

//   const updateActiveFilters = () => {
//     const filters: string[] = [];
    
//     if (startMonth && endMonth) {
//       filters.push(`📅 ${startMonth} to ${endMonth}`);
//     } else {
//       if (selectedYear !== 'all') {
//         filters.push(`📅 Year: ${selectedYear}`);
//       }
//       if (selectedMonth !== 'all') {
//         const monthName = new Date(2024, parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'long' });
//         filters.push(`📅 Month: ${monthName}`);
//       }
//     }
    
//     setActiveFilters(filters);
//   };

//   const fetchReportData = async () => {
//     try {
//       const params = new URLSearchParams();
      
//       if (startMonth && endMonth) {
//         params.append('startMonth', startMonth);
//         params.append('endMonth', endMonth);
//       } else {
//         if (selectedYear !== 'all') params.append('year', selectedYear);
//         if (selectedMonth !== 'all') params.append('month', selectedMonth);
//       }
      
//       const response = await fetch(`/api/admin/reports?${params.toString()}`);
//       if (!response.ok) throw new Error('Failed to fetch report data');
//       const data = await response.json();
//       setReportData(data);
//     } catch (error) {
//       console.error('Failed to fetch report data:', error);
//       toast.error('Failed to load report data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const downloadReport = async (format: 'csv', reportTypeParam: string) => {
//     setIsDownloading(true);
//     try {
//       const params = new URLSearchParams();
//       params.append('format', format);
//       params.append('reportType', reportTypeParam);
      
//       if (startMonth && endMonth) {
//         params.append('startMonth', startMonth);
//         params.append('endMonth', endMonth);
//       } else {
//         if (selectedYear !== 'all') params.append('year', selectedYear);
//         if (selectedMonth !== 'all') params.append('month', selectedMonth);
//       }
      
//       const response = await fetch(`/api/admin/reports/download?${params.toString()}`);
//       if (!response.ok) throw new Error('Failed to generate report');
      
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
      
//       const filterSuffix = startMonth && endMonth 
//         ? `${startMonth}-to-${endMonth}`
//         : `${selectedYear !== 'all' ? selectedYear : 'all-time'}-${selectedMonth !== 'all' ? selectedMonth : 'all-months'}`;
      
//       const fileName = `${reportTypeParam}-${filterSuffix}.${format}`;
//       a.download = fileName;
      
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
      
//       toast.success(`📥 Report downloaded as ${format.toUpperCase()}`);
//     } catch (error) {
//       toast.error('❌ Failed to download report');
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const clearFilters = () => {
//     setSelectedYear('all');
//     setSelectedMonth('all');
//     setStartMonth('');
//     setEndMonth('');
//     setSearchTerm('');
//   };

//   const generateYearOptions = () => {
//     if (!reportData) return [];
//     const years = new Set<string>();
//     reportData.monthlyCollection.forEach(item => {
//       years.add(item.month.split('-')[0]);
//     });
//     return Array.from(years).sort().reverse();
//   };

//   const generateMonthOptions = () => {
//     const months = [];
//     for (let i = 1; i <= 12; i++) {
//       const monthStr = i.toString().padStart(2, '0');
//       const date = new Date(2024, i - 1, 1);
//       const displayStr = date.toLocaleDateString('en-US', { month: 'long' });
//       months.push({ value: monthStr, label: displayStr });
//     }
//     return months;
//   };

//   const generateDateRangeOptions = () => {
//     if (!reportData) return [];
//     const months = new Set<string>();
//     reportData.monthlyCollection.forEach(item => {
//       months.add(item.month);
//     });
//     return Array.from(months).sort().map(month => ({
//       value: month,
//       label: (() => {
//         try {
//           const [year, monthNum] = month.split('-');
//           const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
//           return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
//         } catch (error) {
//           return month;
//         }
//       })(),
//     }));
//   };

//   const filteredMemberReport = reportData?.memberWiseReport.filter(member =>
//     member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   if (isLoading) {
//     return (
//       <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
//         <div className="flex items-center justify-center h-64">
//           <motion.div
//             className="relative"
//             animate={{ rotate: 360 }}
//             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//           >
//             <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <Icons.barChart className="h-6 w-6 text-blue-600 animate-pulse" />
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (!reportData) {
//     return (
//       <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
//         <div className="text-center py-8">
//           <p className="text-gray-500">No report data available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen"
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       {/* Header Section */}
//       <motion.div 
//         className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
//         variants={itemVariants}
//       >
//         <div className="space-y-2">
//           <motion.h1 
//             className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, delay: 0.3 }}
//           >
//             📊 Reports & Analytics
//           </motion.h1>
//           <motion.p 
//             className="text-gray-600 text-lg"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, delay: 0.4 }}
//           >
//             📈 Comprehensive membership and payment analytics with advanced reporting
//           </motion.p>
//         </div>
//       </motion.div>

//       {/* Advanced Filters Section */}
//       <motion.div variants={itemVariants}>
//         <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//           <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
//             <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//               <Icons.filter className="h-5 w-5 mr-2 text-blue-600" />
//               🎯 Advanced Filters & Controls
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
//               {/* Report Type */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">📋 Report Type</label>
//                 <Select value={reportType} onValueChange={setReportType}>
//                   <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="overview">📊 Overview Dashboard</SelectItem>
//                     <SelectItem value="monthly">📅 Monthly Analysis</SelectItem>
//                     <SelectItem value="yearly">📈 Yearly Comparison</SelectItem>
//                     <SelectItem value="members">👥 Member Analysis</SelectItem>
//                     <SelectItem value="trends">📈 Payment Trends</SelectItem>
//                     <SelectItem value="distribution">🥧 Payment Distribution</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Year Filter */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">📅 Year</label>
//                 <Select 
//                   value={selectedYear} 
//                   onValueChange={(value) => {
//                     setSelectedYear(value);
//                     if (value !== 'all') {
//                       setStartMonth('');
//                       setEndMonth('');
//                     }
//                   }}
//                 >
//                   <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">🗓️ All Years</SelectItem>
//                     {generateYearOptions().map((year) => (
//                       <SelectItem key={year} value={year}>
//                         📅 {year}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Month Filter */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">📅 Month</label>
//                 <Select 
//                   value={selectedMonth} 
//                   onValueChange={(value) => {
//                     setSelectedMonth(value);
//                     if (value !== 'all') {
//                       setStartMonth('');
//                       setEndMonth('');
//                     }
//                   }}
//                 >
//                   <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">🗓️ All Months</SelectItem>
//                     {generateMonthOptions().map((month) => (
//                       <SelectItem key={month.value} value={month.value}>
//                         📅 {month.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Start Month for Date Range */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">📅 Start Month</label>
//                 <Select 
//                   value={startMonth} 
//                   onValueChange={(value) => {
//                     setStartMonth(value);
//                     if (value) {
//                       setSelectedYear('all');
//                       setSelectedMonth('all');
//                     }
//                   }}
//                 >
//                   <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
//                     <SelectValue placeholder="Select start month" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="none">🚫 None</SelectItem>
//                     {generateDateRangeOptions().map((month) => (
//                       <SelectItem key={month.value} value={month.value}>
//                         {month.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* End Month for Date Range */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700">📅 End Month</label>
//                 <Select 
//                   value={endMonth} 
//                   onValueChange={(value) => {
//                     setEndMonth(value);
//                     if (value) {
//                       setSelectedYear('all');
//                       setSelectedMonth('all');
//                     }
//                   }}
//                 >
//                   <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
//                     <SelectValue placeholder="Select end month" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="none">🚫 None</SelectItem>
//                     {generateDateRangeOptions().map((month) => (
//                       <SelectItem key={month.value} value={month.value}>
//                         {month.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex space-x-2">
//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                   <Button
//                     onClick={clearFilters}
//                     variant="outline"
//                     className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
//                   >
//                     <Icons.x className="h-4 w-4 mr-1" />
//                     🧹 Clear
//                   </Button>
//                 </motion.div>
//               </div>
//             </div>

//             {/* Active Filters Display */}
//             {activeFilters.length > 0 && (
//               <motion.div 
//                 className="mt-4 flex flex-wrap gap-2"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <span className="text-sm font-medium text-gray-600">🏷️ Active Filters:</span>
//                 {activeFilters.map((filter, index) => (
//                   <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
//                     {filter}
//                   </Badge>
//                 ))}
//               </motion.div>
//             )}
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Summary Cards */}
//       <motion.div 
//         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
//         variants={containerVariants}
//       >
//         {[
//           {
//             title: 'Total Collection',
//             value: `৳${reportData.summary.totalCollection.toLocaleString()}`,
//             icon: Icons.dollarSign,
//             gradient: 'from-green-500 to-emerald-600',
//             bgGradient: 'from-green-50 to-emerald-100',
//             change: '+12.5%',
//             emoji: '💰',
//           },
//           {
//             title: 'Active Members',
//             value: reportData.summary.activeMembers,
//             icon: Icons.users,
//             gradient: 'from-blue-500 to-blue-600',
//             bgGradient: 'from-blue-50 to-blue-100',
//             change: '+8.3%',
//             emoji: '👥',
//           },
//           {
//             title: 'Avg Monthly',
//             value: `৳${reportData.summary.averageMonthlyCollection.toLocaleString()}`,
//             icon: Icons.trendingUp,
//             gradient: 'from-purple-500 to-purple-600',
//             bgGradient: 'from-purple-50 to-purple-100',
//             change: '+15.7%',
//             emoji: '📈',
//           },
//           {
//             title: 'Highest Payment',
//             value: `৳${reportData.summary.highestPayment.toLocaleString()}`,
//             icon: Icons.activity,
//             gradient: 'from-orange-500 to-orange-600',
//             bgGradient: 'from-orange-50 to-orange-100',
//             change: '+5.2%',
//             emoji: '🏆',
//           },
//         ].map((card, index) => (
//           <motion.div
//             key={index}
//             variants={cardVariants}
//             whileHover={{ scale: 1.05, y: -5 }}
//             className="relative overflow-hidden"
//           >
//             <Card className={`shadow-xl border-0 bg-gradient-to-br ${card.bgGradient} hover:shadow-2xl transition-all duration-300`}>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-2">
//                     <p className="text-sm font-medium text-gray-600 flex items-center">
//                       {card.emoji} {card.title}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-800">{card.value}</p>
//                     <div className="flex items-center space-x-1">
//                       <span className="text-xs font-medium text-green-600">{card.change}</span>
//                       <span className="text-xs text-gray-500">vs last period</span>
//                     </div>
//                   </div>
//                   <motion.div
//                     className={`p-3 bg-gradient-to-r ${card.gradient} rounded-full shadow-lg`}
//                     whileHover={{ rotate: 360 }}
//                     transition={{ duration: 0.6 }}
//                   >
//                     <card.icon className="h-6 w-6 text-white" />
//                   </motion.div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Download Section */}
//       <motion.div variants={itemVariants}>
//         <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//           <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
//             <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//               <Icons.download className="h-5 w-5 mr-2 text-green-600" />
//               📥 Download Reports
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 { type: 'monthly-installments', title: '📅 Monthly Installments', desc: 'Detailed monthly payment records' },
//                 { type: 'yearly-summary', title: '📊 Yearly Summary', desc: 'Annual collection summaries' },
//                 { type: 'member-wise', title: '👥 Member-wise Report', desc: 'Individual member payment analysis' },
//                 { type: 'payment-trends', title: '📈 Payment Trends', desc: 'Payment patterns and growth analysis' },
//                 { type: 'executive-summary', title: '📋 Executive Summary', desc: 'High-level overview for management' },
//                 { type: 'detailed-transactions', title: '💳 Detailed Transactions', desc: 'Complete transaction history' },
//               ].map((report, index) => (
//                 <motion.div
//                   key={report.type}
//                   whileHover={{ scale: 1.02, y: -2 }}
//                   className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-300"
//                 >
//                   <h3 className="font-semibold text-gray-800 mb-2">{report.title}</h3>
//                   <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
//                   <motion.div
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <Button
//                       onClick={() => downloadReport('csv', report.type)}
//                       disabled={isDownloading}
//                       className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
//                     >
//                       {isDownloading ? (
//                         <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
//                       ) : (
//                         <Icons.download className="h-4 w-4 mr-2" />
//                       )}
//                       📥 Download CSV
//                     </Button>
//                   </motion.div>
//                 </motion.div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Dynamic Report Content */}
//       <AnimatePresence mode="wait">
//         {reportType === 'overview' && (
//           <motion.div 
//             key="overview"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             className="grid grid-cols-1 lg:grid-cols-2 gap-8"
//           >
//             <motion.div variants={itemVariants}>
//               <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//                 <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
//                   <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                     <Icons.trendingUp className="h-5 w-5 mr-2 text-blue-600" />
//                     📈 Monthly Collection Trend
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div className="h-80">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={reportData.monthlyCollection}>
//                         <defs>
//                           <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
//                             <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                         <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
//                         <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`} />
//                         <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
//                         <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fill="url(#colorAmount)" />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
            
//             <motion.div variants={itemVariants}>
//               <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//                 <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
//                   <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                     <Icons.pieChart className="h-5 w-5 mr-2 text-purple-600" />
//                     🥧 Payment Distribution
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div className="h-80">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={reportData.paymentDistribution}
//                           cx="50%"
//                           cy="50%"
//                           labelLine={false}
//                           label={({ range, percentage }) => `${range} (${percentage}%)`}
//                           outerRadius={80}
//                           fill="#8884d8"
//                           dataKey="count"
//                         >
//                           {reportData.paymentDistribution.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </motion.div>
//         )}

//         {reportType === 'monthly' && (
//           <motion.div 
//             key="monthly"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
//                 <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                   <Icons.calendar className="h-5 w-5 mr-2 text-green-600" />
//                   📅 Monthly Collection Analysis
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="h-96 mb-6">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={reportData.monthlyCollection}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                       <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
//                       <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`} />
//                       <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
//                       <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow className="bg-gray-50/50">
//                         <TableHead className="font-semibold text-gray-700">📅 Month</TableHead>
//                         <TableHead className="font-semibold text-gray-700">💰 Total Amount</TableHead>
//                         <TableHead className="font-semibold text-gray-700">📊 Payment Count</TableHead>
//                         <TableHead className="font-semibold text-gray-700">📈 Average Payment</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {reportData.monthlyCollection.map((month, index) => (
//                         <motion.tr
//                           key={month.month}
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           className="hover:bg-blue-50/50 transition-colors duration-200"
//                         >
//                           <TableCell>
//                             <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//                               {format(new Date(month.month + '-01'), 'MMM yyyy')}
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="font-semibold text-green-600 text-lg">
//                             ৳{month.amount.toLocaleString()}
//                           </TableCell>
//                           <TableCell className="font-medium">{month.count}</TableCell>
//                           <TableCell className="font-medium text-purple-600">
//                             ৳{month.count > 0 ? (month.amount / month.count).toFixed(0) : 0}
//                           </TableCell>
//                         </motion.tr>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}

//         {reportType === 'yearly' && (
//           <motion.div 
//             key="yearly"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
//                 <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                   <Icons.barChart className="h-5 w-5 mr-2 text-orange-600" />
//                   📊 Yearly Comparison Analysis
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={reportData.yearlyComparison}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                       <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
//                       <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 100000).toFixed(1)}L`} />
//                       <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
//                       <Bar dataKey="amount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}

//         {reportType === 'members' && (
//           <motion.div 
//             key="members"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                     <Icons.users className="h-5 w-5 mr-2 text-purple-600" />
//                     👥 Member-wise Payment Analysis
//                   </CardTitle>
//                   <div className="flex items-center space-x-2">
//                     <Icons.search className="h-4 w-4 text-gray-400" />
//                     <Input
//                       placeholder="🔍 Search members..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-64 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
//                     />
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow className="bg-gray-50/50">
//                         <TableHead className="font-semibold text-gray-700">🆔 Member ID</TableHead>
//                         <TableHead className="font-semibold text-gray-700">👤 Name</TableHead>
//                         <TableHead className="font-semibold text-gray-700">💰 Total Paid</TableHead>
//                         <TableHead className="font-semibold text-gray-700">📊 Payment Count</TableHead>
//                         <TableHead className="font-semibold text-gray-700">📈 Average Payment</TableHead>
//                         <TableHead className="font-semibold text-gray-700">📅 Last Payment</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {filteredMemberReport.map((member, index) => (
//                         <motion.tr
//                           key={member.membershipId}
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{ delay: index * 0.05 }}
//                           className="hover:bg-purple-50/50 transition-colors duration-200"
//                         >
//                           <TableCell className="font-medium text-purple-600">
//                             {member.membershipId}
//                           </TableCell>
//                           <TableCell className="font-medium">{member.memberName}</TableCell>
//                           <TableCell className="font-semibold text-green-600 text-lg">
//                             ৳{member.totalPaid.toLocaleString()}
//                           </TableCell>
//                           <TableCell className="font-medium">{member.paymentCount}</TableCell>
//                           <TableCell className="font-medium text-blue-600">
//                             ৳{member.averagePayment.toLocaleString()}
//                           </TableCell>
//                           <TableCell>
//                             {member.lastPayment ? (
//                               <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//                                 {format(new Date(member.lastPayment + '-01'), 'MMM yyyy')}
//                               </Badge>
//                             ) : (
//                               <Badge variant="secondary">No payments</Badge>
//                             )}
//                           </TableCell>
//                         </motion.tr>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}

//         {reportType === 'trends' && (
//           <motion.div 
//             key="trends"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             className="grid grid-cols-1 lg:grid-cols-2 gap-8"
//           >
//             <motion.div variants={itemVariants}>
//               <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//                 <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
//                   <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                     <Icons.trendingUp className="h-5 w-5 mr-2 text-indigo-600" />
//                     📈 Payment Trends Over Time
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div className="h-80">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <LineChart data={reportData.monthlyCollection}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                         <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
//                         <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`} />
//                         <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
//                         <Line type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
            
//             <motion.div variants={itemVariants}>
//               <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//                 <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b">
//                   <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                     <Icons.activity className="h-5 w-5 mr-2 text-pink-600" />
//                     📊 Payment Frequency Analysis
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div className="space-y-6">
//                     {reportData.paymentDistribution.map((item, index) => (
//                       <motion.div 
//                         key={item.range} 
//                         className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: index * 0.1 }}
//                         whileHover={{ scale: 1.02, x: 5 }}
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div 
//                             className="w-6 h-6 rounded-full"
//                             style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                           />
//                           <span className="text-sm font-medium text-gray-700">{item.range}</span>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-lg font-bold text-gray-800">{item.count} members</div>
//                           <div className="text-sm text-gray-500">{item.percentage}% of total</div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </motion.div>
//         )}

//         {reportType === 'distribution' && (
//           <motion.div 
//             key="distribution"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
//               <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
//                 <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
//                   <Icons.pieChart className="h-5 w-5 mr-2 text-cyan-600" />
//                   🥧 Payment Distribution Analysis
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                   <div className="h-80">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={reportData.paymentDistribution}
//                           cx="50%"
//                           cy="50%"
//                           outerRadius={100}
//                           fill="#8884d8"
//                           dataKey="count"
//                           label={({ range, percentage }) => `${percentage}%`}
//                         >
//                           {reportData.paymentDistribution.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                           ))}
//                         </Pie>
//                         <Tooltip formatter={(value, name, props) => [`${value} members`, props.payload.range]} />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
                  
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Distribution Breakdown</h3>
//                     {reportData.paymentDistribution.map((item, index) => (
//                       <motion.div 
//                         key={item.range}
//                         className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200"
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.1 }}
//                         whileHover={{ scale: 1.02 }}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-3">
//                             <div 
//                               className="w-4 h-4 rounded-full"
//                               style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                             />
//                             <span className="font-medium text-gray-700">{item.range}</span>
//                           </div>
//                           <div className="text-right">
//                             <div className="text-lg font-bold text-gray-800">{item.count}</div>
//                             <div className="text-sm text-gray-500">{item.percentage}%</div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }











"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { generatePDFReport } from '@/lib/pdf-generator';

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
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [reportType, setReportType] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedMonth, startMonth, endMonth]);

  useEffect(() => {
    updateActiveFilters();
  }, [selectedYear, selectedMonth, startMonth, endMonth]);

  const updateActiveFilters = () => {
    const filters: string[] = [];
    
    if (startMonth && endMonth) {
      filters.push(`📅 ${startMonth} to ${endMonth}`);
    } else {
      if (selectedYear !== 'all') {
        filters.push(`📅 Year: ${selectedYear}`);
      }
      if (selectedMonth !== 'all') {
        const monthName = new Date(2024, parseInt(selectedMonth) - 1, 1).toLocaleDateString('en-US', { month: 'long' });
        filters.push(`📅 Month: ${monthName}`);
      }
    }
    
    setActiveFilters(filters);
  };

  const fetchReportData = async () => {
    try {
      const params = new URLSearchParams();
      
      if (startMonth && endMonth) {
        params.append('startMonth', startMonth);
        params.append('endMonth', endMonth);
      } else {
        if (selectedYear !== 'all') params.append('year', selectedYear);
        if (selectedMonth !== 'all') params.append('month', selectedMonth);
      }
      
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

  const downloadReport = async (format: 'csv' | 'pdf', reportTypeParam: string) => {
    setIsDownloading(true);
    try {
      if (format === 'pdf') {
        if (!reportData) {
          throw new Error('No data available for PDF generation');
        }

        const filters = {
          year: selectedYear,
          month: selectedMonth,
          startMonth,
          endMonth,
        };

        await generatePDFReport(reportTypeParam, reportData, filters);
        toast.success(`📥 PDF report downloaded successfully`);
      } else {
        // CSV download (existing functionality)
        const params = new URLSearchParams();
        params.append('format', format);
        params.append('reportType', reportTypeParam);
        
        if (startMonth && endMonth) {
          params.append('startMonth', startMonth);
          params.append('endMonth', endMonth);
        } else {
          if (selectedYear !== 'all') params.append('year', selectedYear);
          if (selectedMonth !== 'all') params.append('month', selectedMonth);
        }
        
        const response = await fetch(`/api/admin/reports/download?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to generate report');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const filterSuffix = startMonth && endMonth 
          ? `${startMonth}-to-${endMonth}`
          : `${selectedYear !== 'all' ? selectedYear : 'all-time'}-${selectedMonth !== 'all' ? selectedMonth : 'all-months'}`;
        
        const fileName = `${reportTypeParam}-${filterSuffix}.${format}`;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`📥 Report downloaded as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('❌ Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const clearFilters = () => {
    setSelectedYear('all');
    setSelectedMonth('all');
    setStartMonth('');
    setEndMonth('');
    setSearchTerm('');
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

  const generateDateRangeOptions = () => {
    if (!reportData) return [];
    const months = new Set<string>();
    reportData.monthlyCollection.forEach(item => {
      months.add(item.month);
    });
    return Array.from(months).sort().map(month => ({
      value: month,
      label: (() => {
        try {
          const [year, monthNum] = month.split('-');
          const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        } catch (error) {
          return month;
        }
      })(),
    }));
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
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        variants={itemVariants}
      >
        <div className="space-y-2">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            📊 Reports & Analytics
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            📈 Comprehensive membership and payment analytics with advanced reporting
          </motion.p>
        </div>
      </motion.div>

      {/* Advanced Filters Section */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Icons.filter className="h-5 w-5 mr-2 text-blue-600" />
              🎯 Advanced Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">📋 Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">📅 Year</label>
                <Select 
                  value={selectedYear} 
                  onValueChange={(value) => {
                    setSelectedYear(value);
                    if (value !== 'all') {
                      setStartMonth('');
                      setEndMonth('');
                    }
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

              {/* Month Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">📅 Month</label>
                <Select 
                  value={selectedMonth} 
                  onValueChange={(value) => {
                    setSelectedMonth(value);
                    if (value !== 'all') {
                      setStartMonth('');
                      setEndMonth('');
                    }
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🗓️ All Months</SelectItem>
                    {generateMonthOptions().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        📅 {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Month for Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">📅 Start Month</label>
                <Select 
                  value={startMonth} 
                  onValueChange={(value) => {
                    setStartMonth(value === 'none' ? '' : value);
                    if (value && value !== 'none') {
                      setSelectedYear('all');
                      setSelectedMonth('all');
                    }
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select start month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">🚫 None</SelectItem>
                    {generateDateRangeOptions().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* End Month for Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">📅 End Month</label>
                <Select 
                  value={endMonth} 
                  onValueChange={(value) => {
                    setEndMonth(value === 'none' ? '' : value);
                    if (value && value !== 'none') {
                      setSelectedYear('all');
                      setSelectedMonth('all');
                    }
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select end month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">🚫 None</SelectItem>
                    {generateDateRangeOptions().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <Icons.x className="h-4 w-4 mr-1" />
                    🧹 Clear
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilters.length > 0 && (
              <motion.div 
                className="mt-4 flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm font-medium text-gray-600">🏷️ Active Filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    {filter}
                  </Badge>
                ))}
              </motion.div>
            )}
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
            value: `৳${reportData.summary.totalCollection.toLocaleString()}`,
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
            value: `৳${reportData.summary.averageMonthlyCollection.toLocaleString()}`,
            icon: Icons.trendingUp,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            change: '+15.7%',
            emoji: '📈',
          },
          {
            title: 'Highest Payment',
            value: `৳${reportData.summary.highestPayment.toLocaleString()}`,
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

      {/* Download Section */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Icons.download className="h-5 w-5 mr-2 text-green-600" />
              📥 Download Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: 'monthly-installments', title: '📅 Monthly Installments', desc: 'Detailed monthly payment records' },
                { type: 'yearly-summary', title: '📊 Yearly Summary', desc: 'Annual collection summaries' },
                { type: 'member-wise', title: '👥 Member-wise Report', desc: 'Individual member payment analysis' },
                { type: 'payment-trends', title: '📈 Payment Trends', desc: 'Payment patterns and growth analysis' },
                { type: 'executive-summary', title: '📋 Executive Summary', desc: 'High-level overview for management' },
                { type: 'detailed-transactions', title: '💳 Detailed Transactions', desc: 'Complete transaction history' },
              ].map((report, index) => (
                <motion.div
                  key={report.type}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
                  <div className="flex space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={() => downloadReport('csv', report.type)}
                        disabled={isDownloading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        size="sm"
                      >
                        {isDownloading ? (
                          <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Icons.download className="h-4 w-4 mr-2" />
                        )}
                        📄 CSV
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={() => downloadReport('pdf', report.type)}
                        disabled={isDownloading}
                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                        size="sm"
                      >
                        {isDownloading ? (
                          <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Icons.download className="h-4 w-4 mr-2" />
                        )}
                        📄 PDF
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dynamic Report Content */}
      <AnimatePresence mode="wait">
        {reportType === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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
                        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
                        <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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
          <motion.div 
            key="monthly"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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
                      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
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
                            ৳{month.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{month.count}</TableCell>
                          <TableCell className="font-medium text-purple-600">
                            ৳{month.count > 0 ? (month.amount / month.count).toFixed(0) : 0}
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

        {reportType === 'yearly' && (
          <motion.div 
            key="yearly"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Icons.barChart className="h-5 w-5 mr-2 text-orange-600" />
                  📊 Yearly Comparison Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.yearlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 100000).toFixed(1)}L`} />
                      <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {reportType === 'members' && (
          <motion.div 
            key="members"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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
                            ৳{member.totalPaid.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{member.paymentCount}</TableCell>
                          <TableCell className="font-medium text-blue-600">
                            ৳{member.averagePayment.toLocaleString()}
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

        {reportType === 'trends' && (
          <motion.div 
            key="trends"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <Icons.trendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                    📈 Payment Trends Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.monthlyCollection}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
                        <Line type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <Icons.activity className="h-5 w-5 mr-2 text-pink-600" />
                    📊 Payment Frequency Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {reportData.paymentDistribution.map((item, index) => (
                      <motion.div 
                        key={item.range} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.range}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">{item.count} members</div>
                          <div className="text-sm text-gray-500">{item.percentage}% of total</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {reportType === 'distribution' && (
          <motion.div 
            key="distribution"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <Icons.pieChart className="h-5 w-5 mr-2 text-cyan-600" />
                  🥧 Payment Distribution Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.paymentDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ range, percentage }) => `${percentage}%`}
                        >
                          {reportData.paymentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} members`, props.payload.range]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Distribution Breakdown</h3>
                    {reportData.paymentDistribution.map((item, index) => (
                      <motion.div 
                        key={item.range}
                        className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-gray-700">{item.range}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">{item.count}</div>
                            <div className="text-sm text-gray-500">{item.percentage}%</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}