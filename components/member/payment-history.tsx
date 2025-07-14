"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { 
  CreditCard, 
  Calendar, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  CircleDollarSign,
  History,
  Clock
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  month: string;
  amount: number;
  paymentDate: string;
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/member/payments');
      const data = await response.json();
      setPayments(data);
      // Calculate total paid amount
      const total = data.reduce((sum: number, payment: PaymentRecord) => sum + payment.amount, 0);
      setTotalPaid(total);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700">
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 mr-2" />
            <span>Payment History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-blue-100 rounded-full w-32"></div>
                  <div className="h-3 bg-blue-100 rounded-full w-48"></div>
                </div>
                <div className="h-8 bg-blue-100 rounded-full w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 mr-2" />
            <span>Payment History</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            {payments.length} {payments.length === 1 ? 'Payment' : 'Payments'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
       
        {/* Payment List */}
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="text-center py-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
              <AlertCircle className="h-10 w-10 mx-auto text-amber-500" />
              <p className="mt-3 text-amber-800 font-medium">No payment records found</p>
              <p className="text-sm text-amber-600 mt-1">Your payment history will appear here</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div 
                key={payment.id} 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.month}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-base font-semibold bg-gradient-to-r from-green-100 to-green-50 border-green-200 text-green-800 hover:bg-green-100/80 px-4 py-2"
                >
                  ৳{payment.amount.toLocaleString()}
                </Badge>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar (optional) */}
        {payments.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Payment Completion</span>
              <span className="font-medium text-blue-600">
                {((payments.length / 12) * 100).toFixed(0)}% of year
              </span>
            </div>
            <Progress 
              value={(payments.length / 12) * 100} 
              className="h-2.5 bg-blue-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-600" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}