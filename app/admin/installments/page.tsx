"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Member {
  id: string;
  membershipId: string;
  user: {
    name: string;
  };
}

interface Installment {
  id: string;
  month: string;
  amount: number;
  paymentDate: string;
  member: {
    membershipId: string;
    user: {
      name: string;
    };
  };
}

interface InstallmentForm {
  memberId: string;
  month: string;
  amount: string;
}

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [formData, setFormData] = useState<InstallmentForm>({
    memberId: '',
    month: '',
    amount: '',
  });

  useEffect(() => {
    fetchInstallments();
    fetchMembers();
  }, []);

  const fetchInstallments = async () => {
    try {
      const response = await fetch('/api/admin/installments');
      if (!response.ok) throw new Error('Failed to fetch installments');
      const data = await response.json();
      setInstallments(data);
    } catch (error) {
      console.error('Failed to fetch installments:', error);
      toast.error('Failed to load installments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data.filter((member: any) => member.active));
    } catch (error) {
      console.error('Failed to fetch members:', error);
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
      fetchInstallments();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (installment: Installment) => {
    const member = members.find(m => m.membershipId === installment.member.membershipId);
    setEditingInstallment(installment);
    setFormData({
      memberId: member?.id || '',
      month: installment.month,
      amount: installment.amount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (installment: Installment) => {
    if (!confirm('Are you sure you want to delete this installment?')) return;

    try {
      const response = await fetch(`/api/admin/installments/${installment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete installment');

      toast.success('Installment deleted successfully');
      fetchInstallments();
    } catch (error) {
      toast.error('Failed to delete installment');
    }
  };

  const resetForm = () => {
    setFormData({ memberId: '', month: '', amount: '' });
    setEditingInstallment(null);
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Start from October 2024 and go forward
    const startDate = new Date(2024, 9, 1); // October 2024 (month is 0-indexed)
    
    for (let i = 0; i <= 36; i++) { // 3 years forward from October 2024
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthStr = `${year}-${month}`;
      const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value: monthStr, label: displayStr });
    }
    
    return months;
  };

  const generateFilterMonthOptions = () => {
    const months = new Set<string>();
    installments.forEach(inst => {
      months.add(inst.month);
    });
    
    return Array.from(months).sort().map(month => {
      try {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        return { value: month, label: displayStr };
      } catch (error) {
        return { value: month, label: month };
      }
    });
  };

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = 
      installment.member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.member.membershipId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = selectedMonth === 'all' || installment.month === selectedMonth;
    const matchesMember = selectedMember === 'all' || installment.member.membershipId === selectedMember;
    
    return matchesSearch && matchesMonth && matchesMember;
  });

  const totalAmount = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const uniqueMembers = new Set(filteredInstallments.map(i => i.member.membershipId)).size;
  const averageAmount = filteredInstallments.length > 0 ? totalAmount / filteredInstallments.length : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icons.creditCard className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in-50 duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Installments Management
          </h1>
          <p className="text-gray-600 text-lg">Manage monthly installment payments with ease</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Icons.plus className="h-4 w-4 mr-2" />
              Add Installment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md animate-in zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800">
                {editingInstallment ? 'Edit Installment' : 'Add New Installment'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="member" className="text-sm font-medium text-gray-700">Member</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) => setFormData({ ...formData, memberId: value })}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.membershipId} - {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="month" className="text-sm font-medium text-gray-700">Month</Label>
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
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (৳)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting && <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />}
                  {editingInstallment ? 'Update' : 'Add'} Installment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-200">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Installments</p>
                <p className="text-3xl font-bold text-blue-700">{filteredInstallments.length}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Icons.creditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Amount</p>
                <p className="text-3xl font-bold text-green-700">৳{totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <Icons.dollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Average Amount</p>
                <p className="text-3xl font-bold text-purple-700">৳{averageAmount.toFixed(0)}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Icons.trendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Unique Members</p>
                <p className="text-3xl font-bold text-orange-700">{uniqueMembers}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Icons.users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-700 delay-400">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="text-2xl font-bold text-gray-800">All Installments</CardTitle>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Month Filter */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {generateFilterMonthOptions().map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Member Filter */}
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.membershipId}>
                      {member.membershipId} - {member.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-700">Member ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Member Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Month</TableHead>
                  <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Payment Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map((installment, index) => (
                  <TableRow 
                    key={installment.id} 
                    className="hover:bg-blue-50/50 transition-colors duration-200 animate-in fade-in-50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium text-blue-600">
                      {installment.member.membershipId}
                    </TableCell>
                    <TableCell className="font-medium">{installment.member.user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
                    <TableCell className="font-semibold text-green-600 text-lg">
                      ৳{installment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-600">
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
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                        >
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(installment)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
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
            <div className="text-center py-12 animate-in fade-in-50 duration-500">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icons.creditCard className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No installments found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}