import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        {/* Sidebar (desktop) */}
        <Sidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
            {children}
          </main>
        </div>

        {/* Bottom nav (mobile) */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
