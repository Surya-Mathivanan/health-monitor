import { Bell, Sun, Moon, Heart } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useDarkMode } from '@/hooks/useDarkMode';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { getInitials } from '@/lib/utils';

export function TopBar() {
  const { profile } = useAuth();
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
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          id="dark-mode-toggle"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Avatar */}
        {profile && (
          <div className="w-8 h-8 rounded-full brand-gradient-bg flex items-center justify-center text-white text-xs font-bold cursor-default">
            {getInitials(profile.display_name || 'U')}
          </div>
        )}
      </div>
    </header>
  );
}
