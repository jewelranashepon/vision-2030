import { MemberStats } from '@/components/member/member-stats';
import { PaymentHistory } from '@/components/member/payment-history';
import { PaymentChart } from '@/components/member/payment-chart';

export default function MemberDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome to your member portal
        </div>
      </div>
      
      <MemberStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentChart />
        <PaymentHistory />
      </div>
    </div>
  );
}