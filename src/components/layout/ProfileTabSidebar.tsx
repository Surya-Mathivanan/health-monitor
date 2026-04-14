import { useState } from 'react';
import { X, Activity, FileText, Phone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'report' | 'history' | 'calls' | 'notes';

const tabs = [
  { id: 'report' as Tab, label: 'Latest Report', icon: Activity },
  { id: 'history' as Tab, label: 'Health History', icon: FileText },
  { id: 'calls' as Tab, label: 'Call Logs', icon: Phone },
  { id: 'notes' as Tab, label: 'Staff Notes', icon: MessageSquare },
];

interface ProfileTabSidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function ProfileTabSidebar({ open, onClose, activeTab, onTabChange }: ProfileTabSidebarProps) {
  const handleTabClick = (tab: Tab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-slate-900/95 backdrop-blur-lg border-r border-slate-700/50 z-50 lg:hidden transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="font-semibold text-white">Tabs</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab list */}
        <nav className="p-3 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                activeTab === id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
