import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bell, LogOut, Heart,
  Settings, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthProvider';
import { getInitials } from '@/lib/utils';
// import { DoctorProfileCard } from '@/features/profile/DoctorProfileCard';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients',   label: 'Clients',   icon: Users },
  { to: '/reminders', label: 'Reminders', icon: Bell },
];

const adminItems = [
  { to: '/admin', label: 'Admin', icon: Shield },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 bg-slate-900/80 backdrop-blur-lg border-r border-slate-700/50 transition-all duration-300 z-20',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-slate-700/50', collapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl brand-gradient-bg flex items-center justify-center flex-shrink-0 shadow-brand">
          <Heart className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-tight">LifeCare</p>
            <p className="text-[10px] text-slate-400 leading-tight">Wellness</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(isActive ? 'nav-link-active' : 'nav-link', collapsed && 'justify-center px-2')
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {profile?.role === 'admin' && (
          <>
            <div className={cn('mt-3 mb-1 px-4 text-[10px] uppercase tracking-widest text-slate-600 font-semibold', collapsed && 'hidden')}>
              Admin
            </div>
            {adminItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(isActive ? 'nav-link-active' : 'nav-link', collapsed && 'justify-center px-2')
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Doctor Profile Card */}
      {/* {!collapsed && (
        <div className="px-3 py-4 border-t border-slate-700/50">
          <DoctorProfileCard />
        </div>
      )} */}

      {/* User + collapse */}
      <div className="p-3 border-t border-slate-700/50 flex flex-col gap-2">
        {!collapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full brand-gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(profile.display_name || 'User')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile.display_name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{profile.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn('nav-link text-red-400 hover:text-red-300 hover:bg-red-400/10', collapsed && 'justify-center px-2')}
          title="Sign out"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn('nav-link', collapsed && 'justify-center px-2')}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
