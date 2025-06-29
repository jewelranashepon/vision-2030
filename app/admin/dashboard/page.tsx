import { StatsCards } from '@/components/admin/stats-cards';
import { PaymentChart } from '@/components/admin/payment-chart';
import { RecentPayments } from '@/components/admin/recent-payments';
import { TopMembers } from '@/components/admin/top-members';

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, Admin
        </div>
      </div>
      
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentChart />
        <RecentPayments />
      </div>
      
      <TopMembers />
    </div>
  );
}