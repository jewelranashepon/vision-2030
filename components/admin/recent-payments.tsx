"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';

interface RecentPayment {
  id: string;
  amount: number;
  month: string;
  paymentDate: string;
  member: {
    membershipId: string;
    user: {
      name: string;
    };
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
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function RecentPayments() {
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentPayments();
  }, []);

  const fetchRecentPayments = async () => {
    try {
      const response = await fetch('/api/admin/recent-payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch recent payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.creditCard className="h-5 w-5 mr-2 text-green-600" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Icons.creditCard className="h-5 w-5 mr-2 text-green-600" />
              Recent Payments
            </CardTitle>
            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
              <Icons.eye className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-200"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="border-2 border-green-200">
                      <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold">
                        {payment.member.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {payment.member.user.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {payment.member.membershipId}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500">
                        {(() => {
                          try {
                            return format(new Date(payment.paymentDate), 'MMM dd');
                          } catch (error) {
                            return 'Invalid Date';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-lg font-bold text-green-600"
                  >
                    ৳{payment.amount.toLocaleString()}
                  </motion.div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                    {(() => {
                      try {
                        const [year, month] = payment.month.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                        return format(date, 'MMM yyyy');
                      } catch (error) {
                        return payment.month;
                      }
                    })()}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {payments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icons.creditCard className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent payments</p>
              <p className="text-gray-400 text-sm mt-1">Payments will appear here once recorded</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}