import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Users, Bell, LogOut, Heart } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthProvider';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { profile, signOut } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/clients',   label: 'Clients',   icon: Users },
    { to: '/reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl brand-gradient-bg flex items-center justify-center flex-shrink-0 shadow-brand">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">LifeCare</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {profile && (
          <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full brand-gradient-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              {getInitials(profile.display_name || 'User')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile.display_name}</p>
              <p className="text-[11px] text-slate-400 capitalize">{profile.role}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto mt-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(isActive ? 'nav-link-active' : 'nav-link', 'text-[15px] py-3')
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 space-y-2 pb-safe">
          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
