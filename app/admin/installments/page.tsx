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

  const generateFilterMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate months from 2 years ago to current month
    for (let i = -24; i <= 0; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthStr = `${year}-${month}`;
      const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value: monthStr, label: displayStr });
    }
    
    return months.reverse(); // Show most recent first
  };

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = 
      installment.member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.member.membershipId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = selectedMonth === 'all' || installment.month === selectedMonth;
    
    return matchesSearch && matchesMonth;
  });

  const totalAmount = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Installments Management</h1>
          <p className="text-gray-600 mt-1">Manage monthly installment payments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Icons.plus className="h-4 w-4 mr-2" />
              Add Installment
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
                <Label htmlFor="member">Member</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) => setFormData({ ...formData, memberId: value })}
                  required
                >
                  <SelectTrigger>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredInstallments.length}
            </div>
            <p className="text-sm text-gray-600">Total Installments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ₹{totalAmount.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ₹{filteredInstallments.length > 0 ? (totalAmount / filteredInstallments.length).toFixed(0) : 0}
            </div>
            <p className="text-sm text-gray-600">Average Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(filteredInstallments.map(i => i.member.membershipId)).size}
            </div>
            <p className="text-sm text-gray-600">Unique Members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Installments</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icons.search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell className="font-medium">
                      {installment.member.membershipId}
                    </TableCell>
                    <TableCell>{installment.member.user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
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
              <p className="text-gray-500">No installments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}