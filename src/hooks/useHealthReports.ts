import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import type { HealthReport, HealthReportForm } from '@/types';

export function useHealthReports(clientId: string) {
  return useQuery({
    queryKey: ['health-reports', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('client_id', clientId)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as HealthReport[];
    },
    enabled: !!clientId,
  });
}

export function useLatestHealthReport(clientId: string) {
  return useQuery({
    queryKey: ['health-report-latest', clientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('health_reports')
        .select('*')
        .eq('client_id', clientId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      return data as HealthReport | null;
    },
    enabled: !!clientId,
  });
}

export function useLogHealthReport() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, form }: { clientId: string; form: HealthReportForm }) => {
      const { data, error } = await supabase
        .from('health_reports')
        .insert({ ...form, client_id: clientId, logged_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as HealthReport;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['health-reports', vars.clientId] });
      qc.invalidateQueries({ queryKey: ['health-report-latest', vars.clientId] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}
