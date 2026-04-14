import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import { startOfWeek, startOfMonth, endOfDay, format } from 'date-fns';
import type { DashboardKPIs, Reminder, AuditLog } from '@/types';

export function useDashboardKPIs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async (): Promise<DashboardKPIs> => {
      const weekStart = startOfWeek(new Date()).toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();
      const todayStart = format(new Date(), 'yyyy-MM-dd') + 'T00:00:00.000Z';

      const [clients, calls, followUps, reports] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('call_logs').select('id', { count: 'exact', head: true }).gte('called_at', weekStart),
        supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('due_at', todayStart).lte('due_at', todayEnd),
        supabase.from('health_reports').select('id', { count: 'exact', head: true }).gte('recorded_at', monthStart),
      ]);

      return {
        total_active_clients: clients.count ?? 0,
        calls_this_week: calls.count ?? 0,
        follow_ups_due_today: followUps.count ?? 0,
        reports_this_month: reports.count ?? 0,
      };
    },
    enabled: !!user,
  });
}

export function useWeeklyCallData() {
  return useQuery({
    queryKey: ['weekly-calls-chart'],
    queryFn: async () => {
      const weekStart = startOfWeek(new Date()).toISOString();
      const { data } = await supabase
        .from('call_logs')
        .select('called_at, outcome')
        .gte('called_at', weekStart)
        .order('called_at');
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = Array(7).fill(0).map((_, i) => ({ day: days[i], calls: 0 }));
      (data ?? []).forEach(c => {
        counts[new Date(c.called_at).getDay()].calls += 1;
      });
      return counts;
    },
  });
}

export function useDueTodayReminders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['reminders-due-today'],
    queryFn: async () => {
      const todayStart = format(new Date(), 'yyyy-MM-dd') + 'T00:00:00.000Z';
      const todayEnd = endOfDay(new Date()).toISOString();
      const { data } = await supabase
        .from('reminders')
        .select('*, client:clients(id, full_name)')
        .eq('status', 'pending')
        .gte('due_at', todayStart)
        .lte('due_at', todayEnd)
        .order('due_at');
      return (data ?? []) as Reminder[];
    },
    enabled: !!user,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*, actor:users(id, display_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      return (data ?? []) as AuditLog[];
    },
  });
}
