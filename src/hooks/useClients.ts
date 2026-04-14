import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Client, AddClientForm } from '@/types';

export function useClients(search = '', filters: Record<string, string> = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['clients', search, filters],
    queryFn: async () => {
      let q = supabase
        .from('clients')
        .select('*, assigned_program:wellness_programs(id, name)')
        .order('created_at', { ascending: false });

      if (search) q = q.ilike('full_name', `%${search}%`);
      if (filters.status) q = q.eq('status', filters.status);
      if (filters.gender) q = q.eq('gender', filters.gender);
      if (filters.program) q = q.eq('assigned_program_id', filters.program);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Client[];
    },
    enabled: !!user,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*, assigned_program:wellness_programs(id, name, description)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });
}

export function useAddClient() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: AddClientForm) => {
      const payload: any = { ...form, created_by: user!.id, status: 'active' };
      if (!payload.assigned_program_id) {
        delete payload.assigned_program_id;
      }
      const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClientStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { error } = await supabase.from('clients').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useWellnessPrograms() {
  return useQuery({
    queryKey: ['wellness-programs'],
    queryFn: async () => {
      const { data } = await supabase.from('wellness_programs').select('*').order('name');
      return data ?? [];
    },
  });
}
