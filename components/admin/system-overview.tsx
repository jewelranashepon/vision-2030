"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface SystemStats {
  totalMembers: number;
  activeMembers: number;
  thisMonthCollection: number;
  lastMonthCollection: number;
  totalCollection: number;
  averagePayment: number;
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function SystemOverview() {
  const [stats, setStats] = useState<SystemStats>({
    totalMembers: 0,
    activeMembers: 0,
    thisMonthCollection: 0,
    lastMonthCollection: 0,
    totalCollection: 0,
    averagePayment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/system-overview');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const membershipProgress = stats.totalMembers > 0 ? (stats.activeMembers / stats.totalMembers) * 100 : 0;
  const collectionGrowth = stats.lastMonthCollection > 0 
    ? ((stats.thisMonthCollection - stats.lastMonthCollection) / stats.lastMonthCollection) * 100 
    : 0;

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-32">
            <Icons.spinner className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
          <Icons.activity className="h-6 w-6 mr-3 text-blue-600" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Membership Overview */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Membership Status</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {membershipProgress.toFixed(1)}% Active
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Members</span>
                <span className="font-semibold">{stats.activeMembers} / {stats.totalMembers}</span>
              </div>
              <Progress value={membershipProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
                <div className="text-2xl font-bold text-green-800 mt-1">
                  {stats.activeMembers}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icons.users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Total</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.totalMembers}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Overview */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Financial Performance</h3>
              <Badge 
                variant={collectionGrowth >= 0 ? "default" : "secondary"}
                className={collectionGrowth >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
              >
                {collectionGrowth >= 0 ? '+' : ''}{collectionGrowth.toFixed(1)}% vs Last Month
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-700">This Month</div>
                    <div className="text-2xl font-bold text-blue-800">
                      ₹{stats.thisMonthCollection.toLocaleString()}
                    </div>
                  </div>
                  <Icons.trendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-sm font-medium text-purple-700">Total Collection</div>
                  <div className="text-lg font-bold text-purple-800">
                    ₹{(stats.totalCollection / 100000).toFixed(1)}L
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-sm font-medium text-orange-700">Avg Payment</div>
                  <div className="text-lg font-bold text-orange-800">
                    ₹{stats.averagePayment.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Performance Indicators */}
        <motion.div 
          className="mt-8 pt-6 border-t border-gray-200"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Icons.trendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">System Health</div>
              <div className="text-lg font-bold text-green-600">Excellent</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <Icons.activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Payment Rate</div>
              <div className="text-lg font-bold text-blue-600">
                {membershipProgress.toFixed(0)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Icons.dollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">Growth Rate</div>
              <div className="text-lg font-bold text-purple-600">
                {collectionGrowth >= 0 ? '+' : ''}{collectionGrowth.toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}