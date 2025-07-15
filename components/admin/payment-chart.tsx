"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Icons } from '@/components/icons';

interface ChartData {
  month: string;
  amount: number;
  displayMonth: string;
}

export function PaymentChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/admin/chart-data');
      const chartData = await response.json();
      
      // Format data for better display
      const formattedData = chartData.map((item: any) => ({
        ...item,
        displayMonth: (() => {
          try {
            const [year, month] = item.month.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          } catch (error) {
            return item.month;
          }
        })(),
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.trendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Payment Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Icons.spinner className="h-8 w-8 text-blue-600" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const averageAmount = data.length > 0 ? totalAmount / data.length : 0;
  const trend = data.length >= 2 ? 
    ((data[data.length - 1].amount - data[data.length - 2].amount) / data[data.length - 2].amount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Icons.trendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Payment Trends
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-gray-500">Total</div>
                <div className="font-semibold text-blue-600">৳{totalAmount.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Average</div>
                <div className="font-semibold text-green-600">৳{averageAmount.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Trend</div>
                <div className={`font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div
            className="h-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="displayMonth" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorAmount)"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}