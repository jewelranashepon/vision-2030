"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

      toast.success(editingInstallment ? 'Installment updated successfully' : 'Installment added successfully');
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
    if (!confirm('Are you sure you want to delete this installment?')) return;

    try {
      const response = await fetch(`/api/admin/installments/${installment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete installment');

      toast.success('Installment deleted successfully');
      fetchMemberDetails();
    } catch (error) {
      toast.error('Failed to delete installment');
    }
  };

  const resetForm = () => {
    setFormData({ month: '', amount: '' });
    setEditingInstallment(null);
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate months from 2 years ago to 1 year in the future
    for (let i = -24; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthStr = `${year}-${month}`;
      const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value: monthStr, label: displayStr });
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
    if (selectedYear === 'all') return true;
    return installment.month.startsWith(selectedYear);
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Member not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <Icons.chevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.user.name}</h1>
            <p className="text-gray-600 mt-1">Member ID: {member.membershipId}</p>
          </div>
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
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Icons.plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingInstallment ? 'Edit Installment' : 'Add New Installment'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => setFormData({ ...formData, month: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateMonthOptions().map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />}
                    {editingInstallment ? 'Update' : 'Add'} Installment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Member Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-lg font-semibold">{member.user.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Membership ID</Label>
                <p className="text-lg font-semibold">{member.membershipId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg">{member.user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge variant={member.active ? "default" : "secondary"}>
                  {member.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                <p className="text-lg">{format(new Date(member.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Total Payments</Label>
                <p className="text-lg font-semibold">{member._count.installments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Paid (All Time)</p>
                <p className="text-2xl font-bold text-green-600">₹{member.totalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Payment</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{member._count.installments > 0 ? (member.totalPaid / member._count.installments).toFixed(0) : 0}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Last Payment</p>
                <p className="text-lg font-semibold text-purple-600">
                  {member.installments.length > 0 
                    ? (() => {
                        try {
                          const [year, month] = member.installments[0].month.split('-');
                          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                          return format(date, 'MMM yyyy');
                        } catch (error) {
                          return member.installments[0].month;
                        }
                      })()
                    : 'None'
                  }
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Payment Frequency</p>
                <p className="text-lg font-semibold text-orange-600">
                  {member._count.installments > 0 ? 'Regular' : 'No Payments'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtered Year Stats */}
      {selectedYear !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">{selectedYear} Total</p>
              <p className="text-xl font-bold text-green-600">₹{yearlyStats.total.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">Payments</p>
              <p className="text-xl font-bold text-blue-600">{yearlyStats.count}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-xl font-bold text-purple-600">₹{yearlyStats.average.toFixed(0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">Highest</p>
              <p className="text-xl font-bold text-orange-600">₹{yearlyStats.highest.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">Lowest</p>
              <p className="text-xl font-bold text-red-600">₹{yearlyStats.lowest.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Trend {selectedYear !== 'all' ? `- ${selectedYear}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayMonth" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Installments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment History {selectedYear !== 'all' ? `- ${selectedYear}` : ''}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredInstallments.length} payments)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Actions</TableHead>
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(installment)}
                        >
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(installment)}
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredInstallments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No payments found {selectedYear !== 'all' ? `for ${selectedYear}` : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}