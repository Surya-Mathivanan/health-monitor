import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Reminder, ReminderStatus, AddReminderForm } from '@/types';

export function useReminders(status?: ReminderStatus | 'all') {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['reminders', status],
    queryFn: async () => {
      let q = supabase
        .from('reminders')
        .select('*, client:clients(id, full_name)')
        .order('due_at');

      if (status && status !== 'all') q = q.eq('status', status);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Reminder[];
    },
    enabled: !!user,
  });
}

export function useCompleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['reminders-due-today'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useAddReminder() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: AddReminderForm) => {
      const { error } = await supabase
        .from('reminders')
        .insert({
          ...form,
          assigned_to: user!.id,
          status: 'pending'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['reminders-due-today'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

/** Subscribe to realtime reminder changes */
export function useRealtimeReminders(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('reminders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, onUpdate)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [onUpdate]);
}
