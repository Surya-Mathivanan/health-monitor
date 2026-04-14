import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatRelative, formatDateTime } from '@/lib/utils';
import type { Notification, Reminder } from '@/types';

export function NotificationBell() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
  });

  // Fetch today's reminders (due today)
  const { data: todayReminders = [] } = useQuery({
    queryKey: ['today-reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      const { data } = await supabase
        .from('reminders')
        .select('*, client:clients(id, full_name)')
        .eq('assigned_to', user.id)
        .eq('status', 'pending')
        .gte('due_at', startOfDay)
        .lt('due_at', endOfDay)
        .order('due_at', { ascending: true });
      return (data ?? []) as Reminder[];
    },
    enabled: !!user,
  });

  const unread = notifications.filter(n => !n.is_read).length;
  const allItems = [
    ...notifications.map(n => ({ type: 'notification' as const, data: n })),
    ...todayReminders.map(r => ({ type: 'reminder' as const, data: r })),
  ].sort((a, b) => {
    const aDate = a.type === 'notification' ? a.data.created_at : a.data.created_at;
    const bDate = b.type === 'notification' ? b.data.created_at : b.data.created_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
        title="Notifications & Reminders"
      >
        <Bell className="w-4 h-4" />
        {(unread > 0 || todayReminders.length > 0) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 glass-card shadow-glass z-50 animate-scale-in max-h-[500px] flex flex-col rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50 bg-slate-800/30">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications & Reminders</h3>
              <p className="text-xs text-slate-400 mt-1">Stay updated with your tasks</p>
            </div>
            {unread > 0 && (
              <button
                onClick={() => { markAllRead.mutate(); }}
                className="text-xs px-2 py-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded transition-colors"
              >
                Mark read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {allItems.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-slate-500 text-sm">No notifications or reminders</p>
              </div>
            ) : (
              allItems.map((item, idx) => (
                <div
                  key={`${item.type}-${item.data.id}`}
                  className={`px-4 py-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors ${
                    item.type === 'notification' && !item.data.is_read ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {item.type === 'notification' ? (
                      <>
                        {!item.data.is_read && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        )}
                        {item.data.is_read && (
                          <CheckCircle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className={!item.data.is_read ? '' : 'ml-2'}>
                          <p className="text-sm text-slate-200 font-medium">{item.data.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.data.body}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{formatRelative(item.data.created_at)}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-200 font-medium">{item.data.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Client: {(item.data.client as any)?.full_name || 'Unknown'}
                          </p>
                          {item.data.notes && (
                            <p className="text-xs text-slate-400 mt-1">{item.data.notes}</p>
                          )}
                          <p className="text-[10px] text-amber-600/60 mt-1">
                            Due: {formatDateTime(item.data.due_at)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
