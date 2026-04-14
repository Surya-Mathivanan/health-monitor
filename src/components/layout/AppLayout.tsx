import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { ToastProvider } from '@/components/ui/Toast';
import { MobileSidebar } from './MobileSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        {/* Sidebar (desktop) */}
        <Sidebar />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-0">
          <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
            {children}
          </main>
        </div>

        {/* Bottom nav (mobile) */}
        <BottomNav />

        {/* Mobile Sidebar (Drawer) */}
        <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </ToastProvider>
  );
}
