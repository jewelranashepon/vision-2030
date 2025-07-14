"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, Bar, 
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  AlertCircle,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Loader2
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ChartData {
  month: string;
  amount: number;
  previousYear?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function PaymentChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/member/chart-data');
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        const chartData = await response.json();
        setData(chartData);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const formatTaka = (value: number) => {
    return `৳${value.toLocaleString('bn-BD')}`;
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700">
          <CardTitle className="text-white flex items-center">
            <BarChartIcon className="h-5 w-5 mr-2" />
            <span>Payment Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-blue-800 font-medium">Loading payment data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <CardTitle className="text-white flex items-center">
          <BarChartIcon className="h-5 w-5 mr-2" />
          <span>Payment Analytics</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-blue-50/50">
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChartIcon className="h-4 w-4" /> Bar
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" /> Line
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-2">
              <AreaChartIcon className="h-4 w-4" /> Area
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Pie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-4">
            <div className="h-80">
              {data.length === 0 ? (
                <NoDataPlaceholder />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                    <YAxis tickFormatter={(value) => formatTaka(value)} />
                    <Tooltip 
                      formatter={(value) => [formatTaka(Number(value)), 'Amount']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar 
                      dataKey="amount" 
                      name="Payment Amount"
                      fill="url(#colorAmount)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          <TabsContent value="line" className="mt-4">
            <div className="h-80">
              {data.length === 0 ? (
                <NoDataPlaceholder />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                    <YAxis tickFormatter={(value) => formatTaka(value)} />
                    <Tooltip 
                      formatter={(value) => [formatTaka(Number(value)), 'Amount']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2 }}
                      name="Payment Amount"
                    />
                    {data[0]?.previousYear && (
                      <Line 
                        type="monotone" 
                        dataKey="previousYear" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, stroke: '#4ade80', strokeWidth: 2 }}
                        name="Previous Year"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          <TabsContent value="area" className="mt-4">
            <div className="h-80">
              {data.length === 0 ? (
                <NoDataPlaceholder />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      {data[0]?.previousYear && (
                        <linearGradient id="colorPreviousYear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                        </linearGradient>
                      )}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                    <YAxis tickFormatter={(value) => formatTaka(value)} />
                    <Tooltip 
                      formatter={(value) => [formatTaka(Number(value)), 'Amount']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      fill="url(#colorArea)" 
                      strokeWidth={2}
                      name="Current Year"
                    />
                    {data[0]?.previousYear && (
                      <Area 
                        type="monotone" 
                        dataKey="previousYear" 
                        stroke="#82ca9d" 
                        fill="url(#colorPreviousYear)" 
                        strokeWidth={2}
                        name="Previous Year"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pie" className="mt-4">
            <div className="h-80">
              {data.length === 0 ? (
                <NoDataPlaceholder />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="month"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatTaka(Number(value))}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function NoDataPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
      <AlertCircle className="h-10 w-10 text-amber-500" />
      <p className="mt-3 text-amber-800 font-medium">No payment data available</p>
      <p className="text-sm text-amber-600 mt-1">Your payment chart will appear here</p>
    </div>
  );
}