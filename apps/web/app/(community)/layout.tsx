import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNav />
        <main className="mx-auto w-full max-w-3xl flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
