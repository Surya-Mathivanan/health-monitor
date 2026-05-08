import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import type { UserProfile, Client } from '@/types';

export interface CoPartner extends UserProfile {
  client_count: number;
  invitation_id: string;
}

export interface CoPartnerInvitation {
  id: string;
  inviter_id: string;
  inviter?: Pick<UserProfile, 'id' | 'display_name' | 'email'>;
  invitee_email: string;
  invitee_id?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}


// ─── Accepted co-partners of the current user ────────────────────────────────
export function useCoPartners() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['co-partners', user?.id],
    queryFn: async () => {
      const { data: invitations, error } = await supabase
        .from('co_partner_invitations')
        .select('id, invitee_id, invitee_email')
        .eq('inviter_id', user!.id)
        .eq('status', 'accepted');

      if (error) throw error;
      if (!invitations?.length) return [] as CoPartner[];

      const partnerIds = invitations.map(i => i.invitee_id).filter(Boolean);

      const { data: profiles, error: pErr } = await supabase
        .from('users')
        .select('*')
        .in('id', partnerIds);

      if (pErr) throw pErr;

      const { data: clients } = await supabase
        .from('clients')
        .select('created_by')
        .in('created_by', partnerIds);

      const countMap: Record<string, number> = {};
      for (const c of clients ?? []) {
        countMap[c.created_by] = (countMap[c.created_by] ?? 0) + 1;
      }

      return invitations.map(inv => {
        const profile = profiles?.find(p => p.id === inv.invitee_id);
        return {
          ...(profile ?? { id: inv.invitee_id, email: inv.invitee_email, display_name: inv.invitee_email }),
          invitation_id: inv.id,
          client_count: countMap[inv.invitee_id] ?? 0,
        };
      }) as CoPartner[];
    },
    enabled: !!user,
  });
}

// ─── Pending invitations sent by the current user ────────────────────────────
export function useSentPendingInvitations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['co-partners-pending', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('co_partner_invitations')
        .select('*')
        .eq('inviter_id', user!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CoPartnerInvitation[];
    },
    enabled: !!user,
  });
}

// ─── Pending invitations received by the current user ────────────────────────
export function useReceivedInvitations() {
  const { user, profile } = useAuth();
  return useQuery({
    queryKey: ['co-partners-received', user?.id],
    queryFn: async () => {
      if (!profile?.email) return [];
      const { data, error } = await supabase
        .from('co_partner_invitations')
        .select('*, inviter:inviter_id(id, email, display_name)')
        .eq('invitee_email', profile.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CoPartnerInvitation[];
    },
    enabled: !!user && !!profile?.email,
    refetchInterval: 30_000,
  });
}

// ─── Fetch clients belonging to a specific co-partner ────────────────────────
export function useCoPartnerClients(partnerId: string) {
  return useQuery({
    queryKey: ['co-partner-clients', partnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*, assigned_program:wellness_programs(id, name)')
        .eq('created_by', partnerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Client[];
    },
    enabled: !!partnerId,
  });
}

// ─── Invite a co-partner (calls Edge Function) ──────────────────────────────
export function useInviteCoPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, display_name }: { email: string; display_name?: string }) => {
      const { data, error } = await supabase.functions.invoke('invite-copartner', {
        body: { email, display_name },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['co-partners-pending'] });
      qc.invalidateQueries({ queryKey: ['co-partners'] });
    },
  });
}

// ─── Accept a received invitation ────────────────────────────────────────────
export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.rpc('accept_co_partner_invitation', {
        p_invitation_id: invitationId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['co-partners-received'] });
      qc.invalidateQueries({ queryKey: ['co-partners'] });
    },
  });
}

// ─── Decline a received invitation ───────────────────────────────────────────
export function useDeclineInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.rpc('decline_co_partner_invitation', {
        p_invitation_id: invitationId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['co-partners-received'] });
    },
  });
}

// ─── Remove / cancel an accepted partner or pending invitation ────────────────
export function useRemoveCoPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('co_partner_invitations')
        .delete()
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['co-partners'] });
      qc.invalidateQueries({ queryKey: ['co-partners-pending'] });
    },
  });
}

// ─── Dashboard KPI summary ────────────────────────────────────────────────────
export function useCoPartnersSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['co-partners-summary', user?.id],
    queryFn: async () => {
      const { data: invitations } = await supabase
        .from('co_partner_invitations')
        .select('invitee_id')
        .eq('inviter_id', user!.id)
        .eq('status', 'accepted');

      const count = invitations?.length ?? 0;
      if (count === 0) return { total_partners: 0, total_partner_clients: 0 };

      const ids = invitations!.map(i => i.invitee_id).filter(Boolean);
      const { count: clientCount } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .in('created_by', ids);

      return { total_partners: count, total_partner_clients: clientCount ?? 0 };
    },
    enabled: !!user,
  });
}
