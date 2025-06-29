import { MemberSidebar } from '@/components/member/sidebar';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <MemberSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}