import { Bell, Sun, Moon, Heart, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useDarkMode } from '@/hooks/useDarkMode';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { getInitials } from '@/lib/utils';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, signOut } = useAuth();
  const { dark, toggle } = useDarkMode();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3
                        bg-slate-900/70 backdrop-blur-lg border-b border-slate-700/50 lg:px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 rounded-lg brand-gradient-bg flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-sm">LifeCare</span>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications (Available on both Desktop and Mobile) */}
        <NotificationBell />

        {/* Desktop only: Dark mode + Avatar */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggle}
            id="dark-mode-toggle"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={signOut}
            className="p-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {profile && (
            <div className="w-8 h-8 rounded-full brand-gradient-bg flex items-center justify-center text-white text-xs font-bold cursor-default ml-1">
              {getInitials(profile.display_name || 'U')}
            </div>
          )}
        </div>

        {/* Mobile only: Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
