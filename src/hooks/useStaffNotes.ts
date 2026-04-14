import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import type { StaffNote } from '@/types';

export function useStaffNotes(clientId: string) {
  return useQuery({
    queryKey: ['staff-notes', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_notes')
        .select('*, author:users(id, display_name, avatar_url)')
        .eq('client_id', clientId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as StaffNote[];
    },
    enabled: !!clientId,
  });
}

export function useAddNote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, content }: { clientId: string; content: string }) => {
      const { error } = await supabase.from('staff_notes').insert({
        client_id: clientId, author_id: user!.id, content, is_pinned: false,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['staff-notes', vars.clientId] }),
  });
}

export function useTogglePinNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_pinned, clientId }: { id: string; is_pinned: boolean; clientId: string }) => {
      const { error } = await supabase.from('staff_notes').update({ is_pinned, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['staff-notes', vars.clientId] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase.from('staff_notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['staff-notes', vars.clientId] }),
  });
}
