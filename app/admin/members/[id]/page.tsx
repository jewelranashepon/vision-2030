// "use client";

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Icons } from '@/components/icons';
// import { toast } from 'sonner';
// import { format } from 'date-fns';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// interface Member {
//   id: string;
//   membershipId: string;
//   active: boolean;
//   createdAt: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     createdAt: string;
//   };
//   installments: Array<{
//     id: string;
//     month: string;
//     amount: number;
//     paymentDate: string;
//   }>;
//   _count: {
//     installments: number;
//   };
//   totalPaid: number;
// }

// interface InstallmentForm {
//   month: string;
//   amount: string;
// }

// export default function MemberDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const memberId = params.id as string;
  
//   const [member, setMember] = useState<Member | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [editingInstallment, setEditingInstallment] = useState<any>(null);
//   const [selectedYear, setSelectedYear] = useState('all');
//   const [formData, setFormData] = useState<InstallmentForm>({
//     month: '',
//     amount: '',
//   });

//   useEffect(() => {
//     if (memberId) {
//       fetchMemberDetails();
//     }
//   }, [memberId]);

//   const fetchMemberDetails = async () => {
//     try {
//       const response = await fetch(`/api/admin/members/${memberId}/details`);
//       if (!response.ok) throw new Error('Failed to fetch member details');
//       const data = await response.json();
//       setMember(data);
//     } catch (error) {
//       console.error('Failed to fetch member details:', error);
//       toast.error('Failed to load member details');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const url = editingInstallment 
//         ? `/api/admin/installments/${editingInstallment.id}` 
//         : '/api/admin/installments';
//       const method = editingInstallment ? 'PUT' : 'POST';
      
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           memberId: member?.id,
//           ...formData,
//           amount: parseFloat(formData.amount),
//         }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || 'Failed to save installment');
//       }

//       toast.success(editingInstallment ? 'Installment updated successfully' : 'Installment added successfully');
//       setIsDialogOpen(false);
//       resetForm();
//       fetchMemberDetails();
//     } catch (error: any) {
//       toast.error(error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleEdit = (installment: any) => {
//     setEditingInstallment(installment);
//     setFormData({
//       month: installment.month,
//       amount: installment.amount.toString(),
//     });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (installment: any) => {
//     if (!confirm('Are you sure you want to delete this installment?')) return;

//     try {
//       const response = await fetch(`/api/admin/installments/${installment.id}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) throw new Error('Failed to delete installment');

//       toast.success('Installment deleted successfully');
//       fetchMemberDetails();
//     } catch (error) {
//       toast.error('Failed to delete installment');
//     }
//   };

//   const resetForm = () => {
//     setFormData({ month: '', amount: '' });
//     setEditingInstallment(null);
//   };

//   const generateMonthOptions = () => {
//     const months = [];
//     const currentDate = new Date();
    
//     // Generate months from 2 years ago to 1 year in the future
//     for (let i = -24; i <= 12; i++) {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
//       const year = date.getFullYear();
//       const month = (date.getMonth() + 1).toString().padStart(2, '0');
//       const monthStr = `${year}-${month}`;
//       const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
//       months.push({ value: monthStr, label: displayStr });
//     }
    
//     return months;
//   };

//   const generateYearOptions = () => {
//     if (!member) return [];
    
//     const years = new Set<string>();
//     member.installments.forEach(inst => {
//       const year = inst.month.split('-')[0];
//       years.add(year);
//     });
    
//     return Array.from(years).sort().reverse();
//   };

//   const filteredInstallments = member?.installments.filter(installment => {
//     if (selectedYear === 'all') return true;
//     return installment.month.startsWith(selectedYear);
//   }) || [];

//   const chartData = filteredInstallments.map(inst => ({
//     month: inst.month,
//     amount: inst.amount,
//     displayMonth: (() => {
//       try {
//         const [year, month] = inst.month.split('-');
//         const date = new Date(parseInt(year), parseInt(month) - 1, 1);
//         return format(date, 'MMM yyyy');
//       } catch (error) {
//         return inst.month;
//       }
//     })(),
//   })).sort((a, b) => a.month.localeCompare(b.month));

//   const yearlyStats = {
//     total: filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0),
//     count: filteredInstallments.length,
//     average: filteredInstallments.length > 0 ? filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0) / filteredInstallments.length : 0,
//     highest: filteredInstallments.length > 0 ? Math.max(...filteredInstallments.map(inst => inst.amount)) : 0,
//     lowest: filteredInstallments.length > 0 ? Math.min(...filteredInstallments.map(inst => inst.amount)) : 0,
//   };

//   if (isLoading) {
//     return (
//       <div className="p-6">
//         <div className="flex items-center justify-center h-64">
//           <Icons.spinner className="h-8 w-8 animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   if (!member) {
//     return (
//       <div className="p-6">
//         <div className="text-center py-8">
//           <p className="text-gray-500">Member not found</p>
//           <Button onClick={() => router.back()} className="mt-4">
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="outline"
//             onClick={() => router.back()}
//           >
//             <Icons.chevronLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">{member.user.name}</h1>
//             <p className="text-gray-600 mt-1">Member ID: {member.membershipId}</p>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <Select value={selectedYear} onValueChange={setSelectedYear}>
//             <SelectTrigger className="w-32">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Years</SelectItem>
//               {generateYearOptions().map((year) => (
//                 <SelectItem key={year} value={year}>
//                   {year}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
          
//           <Dialog open={isDialogOpen} onOpenChange={(open) => {
//             setIsDialogOpen(open);
//             if (!open) resetForm();
//           }}>
//             <DialogTrigger asChild>
//               <Button>
//                 <Icons.plus className="h-4 w-4 mr-2" />
//                 Add Payment
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingInstallment ? 'Edit Installment' : 'Add New Installment'}
//                 </DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="month">Month</Label>
//                   <Select
//                     value={formData.month}
//                     onValueChange={(value) => setFormData({ ...formData, month: value })}
//                     required
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select month" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {generateMonthOptions().map((month) => (
//                         <SelectItem key={month.value} value={month.value}>
//                           {month.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label htmlFor="amount">Amount (₹)</Label>
//                   <Input
//                     id="amount"
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={formData.amount}
//                     onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                     required
//                   />
//                 </div>
                
//                 <div className="flex justify-end space-x-2 pt-4">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={isSubmitting}>
//                     {isSubmitting && <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />}
//                     {editingInstallment ? 'Update' : 'Add'} Installment
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Member Information */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Member Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label className="text-sm font-medium text-gray-500">Full Name</Label>
//                 <p className="text-lg font-semibold">{member.user.name}</p>
//               </div>
//               <div>
//                 <Label className="text-sm font-medium text-gray-500">Membership ID</Label>
//                 <p className="text-lg font-semibold">{member.membershipId}</p>
//               </div>
//               <div>
//                 <Label className="text-sm font-medium text-gray-500">Email</Label>
//                 <p className="text-lg">{member.user.email}</p>
//               </div>
//               <div>
//                 <Label className="text-sm font-medium text-gray-500">Status</Label>
//                 <Badge variant={member.active ? "default" : "secondary"}>
//                   {member.active ? 'Active' : 'Inactive'}
//                 </Badge>
//               </div>
//               <div>
//                 <Label className="text-sm font-medium text-gray-500">Member Since</Label>
//                 <p className="text-lg">{format(new Date(member.createdAt), 'MMM dd, yyyy')}</p>
//               </div>
//               <div>
//                 <Label className="text-sm font-medium text-gray-500">Total Payments</Label>
//                 <p className="text-lg font-semibold">{member._count.installments}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Payment Summary</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="text-center p-4 bg-green-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Total Paid (All Time)</p>
//                 <p className="text-2xl font-bold text-green-600">₹{member.totalPaid.toLocaleString()}</p>
//               </div>
//               <div className="text-center p-4 bg-blue-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Average Payment</p>
//                 <p className="text-2xl font-bold text-blue-600">
//                   ₹{member._count.installments > 0 ? (member.totalPaid / member._count.installments).toFixed(0) : 0}
//                 </p>
//               </div>
//               <div className="text-center p-4 bg-purple-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Last Payment</p>
//                 <p className="text-lg font-semibold text-purple-600">
//                   {member.installments.length > 0 
//                     ? (() => {
//                         try {
//                           const [year, month] = member.installments[0].month.split('-');
//                           const date = new Date(parseInt(year), parseInt(month) - 1, 1);
//                           return format(date, 'MMM yyyy');
//                         } catch (error) {
//                           return member.installments[0].month;
//                         }
//                       })()
//                     : 'None'
//                   }
//                 </p>
//               </div>
//               <div className="text-center p-4 bg-orange-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Payment Frequency</p>
//                 <p className="text-lg font-semibold text-orange-600">
//                   {member._count.installments > 0 ? 'Regular' : 'No Payments'}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filtered Year Stats */}
//       {selectedYear !== 'all' && (
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <Card>
//             <CardContent className="p-4 text-center">
//               <p className="text-sm text-gray-600">{selectedYear} Total</p>
//               <p className="text-xl font-bold text-green-600">₹{yearlyStats.total.toLocaleString()}</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4 text-center">
//               <p className="text-sm text-gray-600">Payments</p>
//               <p className="text-xl font-bold text-blue-600">{yearlyStats.count}</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4 text-center">
//               <p className="text-sm text-gray-600">Average</p>
//               <p className="text-xl font-bold text-purple-600">₹{yearlyStats.average.toFixed(0)}</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4 text-center">
//               <p className="text-sm text-gray-600">Highest</p>
//               <p className="text-xl font-bold text-orange-600">₹{yearlyStats.highest.toLocaleString()}</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4 text-center">
//               <p className="text-sm text-gray-600">Lowest</p>
//               <p className="text-xl font-bold text-red-600">₹{yearlyStats.lowest.toLocaleString()}</p>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Payment Chart */}
//       {chartData.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Payment Trend {selectedYear !== 'all' ? `- ${selectedYear}` : ''}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-80">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="displayMonth" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
//                   <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Installments Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>
//             Payment History {selectedYear !== 'all' ? `- ${selectedYear}` : ''}
//             <span className="ml-2 text-sm font-normal text-gray-500">
//               ({filteredInstallments.length} payments)
//             </span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Month</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Payment Date</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredInstallments
//                   .sort((a, b) => b.month.localeCompare(a.month))
//                   .map((installment) => (
//                   <TableRow key={installment.id}>
//                     <TableCell>
//                       <Badge variant="outline">
//                         {(() => {
//                           try {
//                             const [year, month] = installment.month.split('-');
//                             const date = new Date(parseInt(year), parseInt(month) - 1, 1);
//                             return format(date, 'MMMM yyyy');
//                           } catch (error) {
//                             return installment.month;
//                           }
//                         })()}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="font-semibold text-green-600">
//                       ₹{installment.amount.toLocaleString()}
//                     </TableCell>
//                     <TableCell>
//                       {(() => {
//                         try {
//                           return format(new Date(installment.paymentDate), 'MMM dd, yyyy');
//                         } catch (error) {
//                           return 'Invalid Date';
//                         }
//                       })()}
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center space-x-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleEdit(installment)}
//                         >
//                           <Icons.edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleDelete(installment)}
//                         >
//                           <Icons.trash className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
          
//           {filteredInstallments.length === 0 && (
//             <div className="text-center py-8">
//               <p className="text-gray-500">
//                 No payments found {selectedYear !== 'all' ? `for ${selectedYear}` : ''}
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }












































"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface Member {
  id: string;
  membershipId: string;
  active: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  installments: Array<{
    id: string;
    month: string;
    amount: number;
    paymentDate: string;
  }>;
  _count: {
    installments: number;
  };
  totalPaid: number;
}

interface InstallmentForm {
  month: string;
  amount: string;
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

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<InstallmentForm>({
    month: '',
    amount: '',
  });

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(`/api/admin/members/${memberId}/details`);
      if (!response.ok) throw new Error('Failed to fetch member details');
      const data = await response.json();
      setMember(data);
    } catch (error) {
      console.error('Failed to fetch member details:', error);
      toast.error('Failed to load member details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingInstallment 
        ? `/api/admin/installments/${editingInstallment.id}` 
        : '/api/admin/installments';
      const method = editingInstallment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member?.id,
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save installment');
      }

      toast.success(editingInstallment ? 'Payment updated successfully! 🎉' : 'Payment added successfully! 💰');
      setIsDialogOpen(false);
      resetForm();
      fetchMemberDetails();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (installment: any) => {
    setEditingInstallment(installment);
    setFormData({
      month: installment.month,
      amount: installment.amount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (installment: any) => {
    if (!confirm('⚠️ Are you sure you want to delete this payment? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/installments/${installment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete installment');

      toast.success('Payment deleted successfully! 🗑️');
      fetchMemberDetails();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  const resetForm = () => {
    setFormData({ month: '', amount: '' });
    setEditingInstallment(null);
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate from October 2024 to 2 years in future
    for (let year = 2024; year <= currentDate.getFullYear() + 2; year++) {
      const startMonth = year === 2024 ? 10 : 1; // Start from October for 2024
      const endMonth = 12;
      
      for (let month = startMonth; month <= endMonth; month++) {
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        const date = new Date(year, month - 1, 1);
        const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        months.push({ value: monthStr, label: displayStr });
      }
    }
    
    return months;
  };

  const generateYearOptions = () => {
    if (!member) return [];
    
    const years = new Set<string>();
    member.installments.forEach(inst => {
      const year = inst.month.split('-')[0];
      years.add(year);
    });
    
    return Array.from(years).sort().reverse();
  };

  const filteredInstallments = member?.installments.filter(installment => {
    const matchesYear = selectedYear === 'all' || installment.month.startsWith(selectedYear);
    const matchesSearch = installment.month.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  }) || [];

  const chartData = filteredInstallments.map(inst => ({
    month: inst.month,
    amount: inst.amount,
    displayMonth: (() => {
      try {
        const [year, month] = inst.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, 'MMM yyyy');
      } catch (error) {
        return inst.month;
      }
    })(),
  })).sort((a, b) => a.month.localeCompare(b.month));

  const yearlyStats = {
    total: filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0),
    count: filteredInstallments.length,
    average: filteredInstallments.length > 0 ? filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0) / filteredInstallments.length : 0,
    highest: filteredInstallments.length > 0 ? Math.max(...filteredInstallments.map(inst => inst.amount)) : 0,
    lowest: filteredInstallments.length > 0 ? Math.min(...filteredInstallments.map(inst => inst.amount)) : 0,
  };

  const membershipProgress = member ? Math.min((member.totalPaid / 100000) * 100, 100) : 0;
  const membershipDuration = member ? Math.floor(
    (new Date().getTime() - new Date(member.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  const paymentDistribution = member ? [
    { name: 'Below ₹3K', value: member.installments.filter(i => i.amount < 3000).length, color: '#EF4444' },
    { name: '₹3K - ₹5K', value: member.installments.filter(i => i.amount >= 3000 && i.amount < 5000).length, color: '#F59E0B' },
    { name: '₹5K - ₹7K', value: member.installments.filter(i => i.amount >= 5000 && i.amount < 7000).length, color: '#10B981' },
    { name: 'Above ₹7K', value: member.installments.filter(i => i.amount >= 7000).length, color: '#3B82F6' },
  ].filter(item => item.value > 0) : [];

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
              <Icons.users className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Icons.alertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Member Not Found</h2>
          <p className="text-gray-600 mb-6">The requested member could not be found in the system.</p>
          <Button onClick={() => router.back()} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Icons.chevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
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
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white hover:border-blue-300 transition-all duration-300"
            >
              <Icons.chevronLeft className="h-4 w-4 mr-2" />
              Back to Members
            </Button>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="w-16 h-16 border-4 border-blue-200 shadow-lg">
                <AvatarFallback className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-xl font-bold">
                  {member.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div>
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                👤 {member.user.name}
              </motion.h1>
              <motion.div 
                className="flex items-center space-x-3 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  🆔 {member.membershipId}
                </Badge>
                <Badge variant={member.active ? "default" : "secondary"} className={member.active ? "bg-green-100 text-green-700" : ""}>
                  {member.active ? '✅ Active' : '❌ Inactive'}
                </Badge>
                <span className="text-sm text-gray-500">
                  📅 Member for {membershipDuration} days
                </span>
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">📊 Overview</SelectItem>
              <SelectItem value="analytics">📈 Analytics</SelectItem>
              <SelectItem value="payments">💰 Payments</SelectItem>
              <SelectItem value="profile">👤 Profile</SelectItem>
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500">
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
          
          {/* Add Payment Button */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Icons.plus className="h-4 w-4 mr-2" />
                  💰 Add Payment
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md animate-in zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  {editingInstallment ? '✏️ Edit Payment' : '💰 Add New Payment'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-sm font-medium text-gray-700 flex items-center">
                    <Icons.calendar className="h-4 w-4 mr-1 text-blue-500" />
                    📅 Month
                  </Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => setFormData({ ...formData, month: value })}
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {generateMonthOptions().map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700 flex items-center">
                    <Icons.dollarSign className="h-4 w-4 mr-1 text-green-500" />
                    💰 Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isSubmitting && <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />}
                    {editingInstallment ? '✏️ Update' : '💰 Add'} Payment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
            >
              {[
                {
                  title: 'Total Paid',
                  value: `₹${member.totalPaid.toLocaleString()}`,
                  icon: Icons.dollarSign,
                  gradient: 'from-green-500 to-emerald-600',
                  bgGradient: 'from-green-50 to-emerald-100',
                  change: '+12.5%',
                  emoji: '💰',
                },
                {
                  title: 'Total Payments',
                  value: member._count.installments,
                  icon: Icons.creditCard,
                  gradient: 'from-blue-500 to-blue-600',
                  bgGradient: 'from-blue-50 to-blue-100',
                  change: '+8.3%',
                  emoji: '📊',
                },
                {
                  title: 'Average Payment',
                  value: `₹${member._count.installments > 0 ? (member.totalPaid / member._count.installments).toFixed(0) : 0}`,
                  icon: Icons.trendingUp,
                  gradient: 'from-purple-500 to-purple-600',
                  bgGradient: 'from-purple-50 to-purple-100',
                  change: '+15.7%',
                  emoji: '📈',
                },
                {
                  title: 'Last Payment',
                  value: member.installments.length > 0 ? (() => {
                    try {
                      const [year, month] = member.installments[0].month.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                      return format(date, 'MMM yyyy');
                    } catch (error) {
                      return member.installments[0].month;
                    }
                  })() : 'None',
                  icon: Icons.calendar,
                  gradient: 'from-orange-500 to-orange-600',
                  bgGradient: 'from-orange-50 to-orange-100',
                  change: '+5.2%',
                  emoji: '📅',
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

            {/* Member Profile Card */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Icons.users className="h-6 w-6 mr-3 text-blue-600" />
                    👤 Member Profile & Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Avatar className="w-24 h-24 mx-auto border-4 border-blue-200 shadow-lg">
                            <AvatarFallback className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-2xl font-bold">
                              {member.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mt-4">{member.user.name}</h3>
                        <p className="text-gray-600">{member.user.email}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-sm font-medium text-blue-700 flex items-center">
                            <Icons.creditCard className="h-4 w-4 mr-1" />
                            🆔 Membership ID
                          </div>
                          <div className="text-lg font-bold text-blue-800">{member.membershipId}</div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                          <div className="text-sm font-medium text-green-700 flex items-center">
                            <Icons.calendar className="h-4 w-4 mr-1" />
                            📅 Member Since
                          </div>
                          <div className="text-lg font-bold text-green-800">
                            {format(new Date(member.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {membershipDuration} days ago
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Icons.trendingUp className="h-5 w-5 mr-2 text-purple-600" />
                            📈 Membership Progress
                          </h4>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {membershipProgress.toFixed(1)}% Complete
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress to ₹1,00,000 milestone</span>
                            <span className="font-semibold">₹{member.totalPaid.toLocaleString()} / ₹1,00,000</span>
                          </div>
                          <Progress value={membershipProgress} className="h-4" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                            <div className="text-sm font-medium text-green-700 flex items-center justify-center">
                              <Icons.dollarSign className="h-4 w-4 mr-1" />
                              💰 Average Payment
                            </div>
                            <div className="text-xl font-bold text-green-800">
                              ₹{member._count.installments > 0 ? (member.totalPaid / member._count.installments).toFixed(0) : 0}
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <div className="text-sm font-medium text-blue-700 flex items-center justify-center">
                              <Icons.trendingUp className="h-4 w-4 mr-1" />
                              📊 Remaining
                            </div>
                            <div className="text-xl font-bold text-blue-800">
                              ₹{Math.max(0, 100000 - member.totalPaid).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {selectedView === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Filtered Year Stats */}
            {selectedYear !== 'all' && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
                variants={containerVariants}
              >
                {[
                  { title: `${selectedYear} Total`, value: `₹${yearlyStats.total.toLocaleString()}`, color: 'green', emoji: '💰' },
                  { title: 'Payments', value: yearlyStats.count, color: 'blue', emoji: '📊' },
                  { title: 'Average', value: `₹${yearlyStats.average.toFixed(0)}`, color: 'purple', emoji: '📈' },
                  { title: 'Highest', value: `₹${yearlyStats.highest.toLocaleString()}`, color: 'orange', emoji: '🏆' },
                  { title: 'Lowest', value: `₹${yearlyStats.lowest.toLocaleString()}`, color: 'red', emoji: '📉' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border-${stat.color}-200 hover:shadow-lg transition-all duration-300`}>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-600 flex items-center justify-center">
                          {stat.emoji} {stat.title}
                        </p>
                        <p className={`text-xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Trend Chart */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <Icons.trendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      📈 Payment Trend {selectedYear !== 'all' ? `- ${selectedYear}` : ''}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="displayMonth" stroke="#6B7280" fontSize={12} />
                          <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                          <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                          <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fill="url(#colorAmount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Distribution */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <Icons.pieChart className="h-5 w-5 mr-2 text-purple-600" />
                      🥧 Payment Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {paymentDistribution.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {paymentDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center">
                        <div className="text-center">
                          <Icons.pieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No payment data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {selectedView === 'payments' && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Payments Table */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Icons.creditCard className="h-6 w-6 mr-3 text-green-600" />
                    💰 Payment History {selectedYear !== 'all' ? `- ${selectedYear}` : ''}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredInstallments.length} payments)
                    </span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Icons.search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="🔍 Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="font-semibold text-gray-700">📅 Month</TableHead>
                        <TableHead className="font-semibold text-gray-700">💰 Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700">📅 Payment Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">⚡ Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInstallments
                        .sort((a, b) => b.month.localeCompare(a.month))
                        .map((installment, index) => (
                        <motion.tr
                          key={installment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-green-50/50 transition-colors duration-200"
                        >
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
                          <TableCell className="font-semibold text-green-600 text-lg">
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
                            <div className="flex items-center space-x-2">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(installment)}
                                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                                >
                                  <Icons.edit className="h-4 w-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(installment)}
                                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                                >
                                  <Icons.trash className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredInstallments.length === 0 && (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Icons.creditCard className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No payments found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {selectedYear !== 'all' ? `No payments found for ${selectedYear}` : 'No payments recorded yet'}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedView === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Detailed Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <Icons.users className="h-5 w-5 mr-2 text-blue-600" />
                      👤 Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="text-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Avatar className="w-24 h-24 mx-auto border-4 border-blue-200 shadow-lg">
                          <AvatarFallback className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-2xl font-bold">
                            {member.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mt-4">{member.user.name}</h3>
                      <p className="text-gray-600 text-lg">{member.user.email}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">🆔 Member ID</div>
                          <div className="text-lg font-bold text-blue-800">{member.membershipId}</div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                          <div className="text-sm font-medium text-green-700">📊 Status</div>
                          <Badge variant={member.active ? "default" : "secondary"} className={member.active ? "bg-green-100 text-green-700" : ""}>
                            {member.active ? '✅ Active' : '❌ Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-sm font-medium text-purple-700">📅 Registration Date</div>
                        <div className="text-lg font-bold text-purple-800">
                          {format(new Date(member.createdAt), 'MMMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-purple-600 mt-1">
                          Member for {membershipDuration} days
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-sm font-medium text-orange-700">👤 User Account</div>
                        <div className="text-lg font-bold text-orange-800">
                          Created {format(new Date(member.user.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-orange-600 mt-1">
                          User ID: {member.user.id}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <Icons.dollarSign className="h-5 w-5 mr-2 text-green-600" />
                      💰 Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-700">💰 Total Paid</div>
                          <div className="text-3xl font-bold text-green-800">₹{member.totalPaid.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">📊 Total Payments</div>
                          <div className="text-2xl font-bold text-blue-800">{member._count.installments}</div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                          <div className="text-sm font-medium text-purple-700">📈 Average</div>
                          <div className="text-2xl font-bold text-purple-800">
                            ₹{member._count.installments > 0 ? (member.totalPaid / member._count.installments).toFixed(0) : 0}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-sm font-medium text-orange-700">📅 Last Payment</div>
                        <div className="text-lg font-bold text-orange-800">
                          {member.installments.length > 0 ? (() => {
                            try {
                              const [year, month] = member.installments[0].month.split('-');
                              const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                              return format(date, 'MMMM yyyy');
                            } catch (error) {
                              return member.installments[0].month;
                            }
                          })() : 'No payments yet'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">🎯 Progress to ₹1,00,000</span>
                        <span className="text-sm font-semibold text-purple-600">{membershipProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={membershipProgress} className="h-3" />
                      <div className="text-center text-sm text-gray-600">
                        ₹{Math.max(0, 100000 - member.totalPaid).toLocaleString()} remaining
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}