import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients',   label: 'Clients',   icon: Users },
  { to: '/reminders', label: 'Reminders', icon: Bell },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/90 backdrop-blur-lg border-t border-slate-700/50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200',
              isActive
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
