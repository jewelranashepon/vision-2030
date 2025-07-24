"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface TopMember {
  membershipId: string;
  totalPaid: number;
  paymentCount: number;
  user: {
    name: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function TopMembers() {
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopMembers();
  }, []);

  const fetchTopMembers = async () => {
    try {
      const response = await fetch('/api/admin/top-members');
      const data = await response.json();
      setTopMembers(data);
    } catch (error) {
      console.error('Failed to fetch top members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    const badges = [
      { icon: '🥇', color: 'from-yellow-400 to-yellow-500', text: 'text-yellow-800' },
      { icon: '🥈', color: 'from-gray-400 to-gray-500', text: 'text-gray-800' },
      { icon: '🥉', color: 'from-orange-400 to-orange-500', text: 'text-orange-800' },
    ];
    
    if (index < 3) {
      return badges[index];
    }
    
    return { icon: `#${index + 1}`, color: 'from-blue-400 to-blue-500', text: 'text-blue-800' };
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.users className="h-5 w-5 mr-2 text-purple-600" />
            Top Contributing Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Icons.users className="h-5 w-5 mr-2 text-purple-600" />
              Top Contributing Members
            </CardTitle>
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
              <Icons.eye className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {topMembers.map((member, index) => {
              const rankBadge = getRankBadge(index);
              
              return (
                <motion.div
                  key={member.membershipId}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="relative"
                >
                  <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-indigo-50 hover:border-purple-200 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                    {/* Rank Badge */}
                    <div className="absolute -top-3 -right-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${rankBadge.color} flex items-center justify-center text-sm font-bold ${rankBadge.text} shadow-lg`}>
                        {rankBadge.icon}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Avatar className="w-12 h-12 border-2 border-purple-200">
                          <AvatarFallback className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold text-lg">
                            {member.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {member.user.name}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          {member.membershipId}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Total Paid</span>
                            <motion.span 
                              className="text-sm font-bold text-green-600"
                              whileHover={{ scale: 1.1 }}
                            >
                              ৳{member.totalPaid.toLocaleString()}
                            </motion.span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Payments</span>
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              {member.paymentCount}
                            </Badge>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((member.totalPaid / 50000) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {topMembers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icons.users className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No members found</p>
              <p className="text-gray-400 text-sm mt-1">Members will appear here once they make payments</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}