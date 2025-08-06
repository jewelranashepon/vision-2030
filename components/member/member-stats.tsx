"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

interface MemberStats {
  totalPaid: number;
  paymentCount: number;
  averagePayment: number;
  lastPayment: string | null;
}

export function MemberStats() {
  const [stats, setStats] = useState<MemberStats>({
    totalPaid: 0,
    paymentCount: 0,
    averagePayment: 0,
    lastPayment: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/member/stats');
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
      title: 'Total Paid',
      value: `৳${stats.totalPaid.toLocaleString()}`,
      icon: Icons.dollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Payments Made',
      value: stats.paymentCount,
      icon: Icons.creditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average Payment',
      value: `৳${stats.averagePayment.toLocaleString()}`,
      icon: Icons.trendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Last Payment',
      value: stats.lastPayment || 'None',
      icon: Icons.calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}