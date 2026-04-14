import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import type { CallLog, CallEndedForm, Reminder } from '@/types';

export function useCallLogs(clientId: string) {
  return useQuery({
    queryKey: ['call-logs', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*, caller:users(id, display_name)')
        .eq('client_id', clientId)
        .order('called_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CallLog[];
    },
    enabled: !!clientId,
  });
}

export function useLogCall() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, form }: { clientId: string; form: CallEndedForm }) => {
      // Insert call log
      const { data: callData, error: callErr } = await supabase
        .from('call_logs')
        .insert({
          client_id: clientId,
          called_by: user!.id,
          called_at: new Date().toISOString(),
          duration_seconds: form.duration_seconds,
          outcome: form.outcome,
          discussion_notes: form.discussion_notes,
          follow_up_required: form.follow_up_required,
        })
        .select()
        .single();
      if (callErr) throw callErr;

      // Optionally create reminder
      if (form.follow_up_required && form.follow_up_due_at) {
        const { error: remErr } = await supabase.from('reminders').insert({
          client_id: clientId,
          assigned_to: user!.id,
          due_at: form.follow_up_due_at,
          title: form.follow_up_title || 'Follow-up call',
          notes: form.follow_up_notes,
          status: 'pending',
          linked_call_id: callData.id,
        });
        if (remErr) console.error('Reminder insert failed:', remErr);
      }

      return callData as CallLog;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['call-logs', vars.clientId] });
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['reminders-due-today'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}
