"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

interface DashboardStats {
  totalMembers: number;
  totalCollection: number;
  totalPending: number;
  thisMonthCollection: number;
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

const cardVariants = {
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

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalCollection: 0,
    totalPending: 0,
    thisMonthCollection: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Icons.users,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
      change: '+12%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Total Collection',
      value: `₹${stats.totalCollection.toLocaleString()}`,
      icon: Icons.dollarSign,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-700',
      change: '+8.2%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Pending Amount',
      value: `₹${stats.totalPending.toLocaleString()}`,
      icon: Icons.alertCircle,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-700',
      change: '-3.1%',
      changeColor: 'text-red-600',
    },
    {
      title: 'This Month',
      value: `₹${stats.thisMonthCollection.toLocaleString()}`,
      icon: Icons.trendingUp,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700',
      change: '+15.3%',
      changeColor: 'text-green-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse shadow-lg">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className={`
            shadow-xl border-0 bg-gradient-to-br ${card.bgGradient} 
            hover:shadow-2xl transition-all duration-300 overflow-hidden
            relative group cursor-pointer
          `}>
            {/* Animated background gradient */}
            <div className={`
              absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 
              group-hover:opacity-10 transition-opacity duration-300
            `} />
            
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-medium ${card.changeColor}`}>
                        {card.change}
                      </span>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  className={`p-3 ${card.iconBg} rounded-full`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </motion.div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <motion.div
                    className={`h-1 rounded-full bg-gradient-to-r ${card.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${65 + index * 10}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}