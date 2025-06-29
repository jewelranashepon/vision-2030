"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface Member {
  id: string;
  membershipId: string;
  active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    installments: number;
  };
  totalPaid: number;
}

interface NewMemberForm {
  name: string;
  email: string;
  membershipId: string;
  password: string;
}

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

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<NewMemberForm>({
    name: '',
    email: '',
    membershipId: '',
    password: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members');
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingMember ? `/api/admin/members/${editingMember.id}` : '/api/admin/members';
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save member');
      }

      toast.success(editingMember ? 'Member updated successfully' : 'Member created successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchMembers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.user.name,
      email: member.user.email,
      membershipId: member.membershipId,
      password: '', // Don't pre-fill password for security
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      const response = await fetch(`/api/admin/members/${member.id}/toggle-status`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to update member status');

      toast.success(`Member ${member.active ? 'deactivated' : 'activated'} successfully`);
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update member status');
    }
  };

  const handleViewDetails = (member: Member) => {
    router.push(`/admin/members/${member.id}`);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', membershipId: '', password: '' });
    setEditingMember(null);
  };

  const filteredMembers = members.filter(member =>
    member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.active).length,
    totalPaid: members.reduce((sum, m) => sum + m.totalPaid, 0),
    averagePayment: members.length > 0 ? members.reduce((sum, m) => sum + m.totalPaid, 0) / members.length : 0,
  };

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
            Members Management
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Manage all members and their membership details with ease
          </motion.p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Icons.userPlus className="h-4 w-4 mr-2" />
                Add New Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md animate-in zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  {editingMember ? 'Edit Member' : 'Add New Member'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="membershipId" className="text-sm font-medium text-gray-700">Membership ID</Label>
                  <Input
                    id="membershipId"
                    value={formData.membershipId}
                    onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter membership ID"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {editingMember ? 'New Password (leave blank to keep current)' : 'Password'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter password"
                    required={!editingMember}
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
                    {editingMember ? 'Update' : 'Create'} Member
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {[
          {
            title: 'Total Members',
            value: stats.totalMembers,
            icon: Icons.users,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            change: '+12%',
          },
          {
            title: 'Active Members',
            value: stats.activeMembers,
            icon: Icons.checkCircle,
            gradient: 'from-green-500 to-green-600',
            bgGradient: 'from-green-50 to-green-100',
            change: '+8%',
          },
          {
            title: 'Total Collection',
            value: `₹${stats.totalPaid.toLocaleString()}`,
            icon: Icons.dollarSign,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            change: '+15%',
          },
          {
            title: 'Average Payment',
            value: `₹${stats.averagePayment.toFixed(0)}`,
            icon: Icons.trendingUp,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            change: '+5%',
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
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-green-600">{card.change}</span>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                  </div>
                  <motion.div
                    className={`p-3 bg-gradient-to-r ${card.gradient} rounded-full`}
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

      {/* Members Table */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-800">
                All Members ({filteredMembers.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Icons.search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Member</TableHead>
                    <TableHead className="font-semibold text-gray-700">Membership ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Payments</TableHead>
                    <TableHead className="font-semibold text-gray-700">Total Paid</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member, index) => (
                    <motion.tr
                      key={member.id}
                      className="cursor-pointer hover:bg-blue-50/50 transition-colors duration-200"
                      onClick={() => handleViewDetails(member)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Avatar className="border-2 border-blue-200">
                              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold">
                                {member.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <div>
                            <div className="font-medium text-gray-900">{member.user.name}</div>
                            <div className="text-sm text-gray-500">Member since 2024</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {member.membershipId}
                      </TableCell>
                      <TableCell className="text-gray-600">{member.user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.active ? "default" : "secondary"}
                          className={member.active ? "bg-green-100 text-green-700 border-green-200" : ""}
                        >
                          {member.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{member._count.installments}</TableCell>
                      <TableCell className="font-semibold text-green-600 text-lg">
                        ₹{member.totalPaid.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(member)}
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                            >
                              <Icons.eye className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(member)}
                              className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-all duration-200"
                            >
                              <Icons.edit className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(member)}
                              className={member.active 
                                ? "hover:bg-red-50 hover:border-red-300 hover:text-red-600" 
                                : "hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                              }
                            >
                              {member.active ? (
                                <Icons.x className="h-4 w-4" />
                              ) : (
                                <Icons.checkCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredMembers.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Icons.users className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No members found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}