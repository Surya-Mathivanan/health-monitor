import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatRelative } from '@/lib/utils';
import type { Notification } from '@/types';

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);

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

  const unread = notifications.filter(n => !n.is_read).length;

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
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-card shadow-glass z-50 animate-scale-in max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-slate-800/50 last:border-0 ${!n.is_read ? 'bg-emerald-500/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />}
                    <div className={n.is_read ? 'ml-4' : ''}>
                      <p className="text-sm text-slate-200 font-medium">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{formatRelative(n.created_at)}</p>
                    </div>
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
