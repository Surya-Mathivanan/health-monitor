-- LifeCare Wellness - 006_copartner_invitations.sql
-- Run this ENTIRE block in Supabase SQL Editor

-- ─── 1. Fix role constraint to allow co_partner ───────────────────────────────
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'staff', 'co_partner'));

-- ─── 2. Index for fast partner client lookups ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);

-- ─── 3. Co-Partner Invitations table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.co_partner_invitations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inviter_id, invitee_email)
);

ALTER TABLE public.co_partner_invitations ENABLE ROW LEVEL SECURITY;

-- Inviters see their sent invitations
DROP POLICY IF EXISTS "inv_select_inviter" ON public.co_partner_invitations;
CREATE POLICY "inv_select_inviter" ON public.co_partner_invitations
  FOR SELECT USING (inviter_id = auth.uid());

-- Invitees see invitations sent to their email
DROP POLICY IF EXISTS "inv_select_invitee" ON public.co_partner_invitations;
CREATE POLICY "inv_select_invitee" ON public.co_partner_invitations
  FOR SELECT USING (
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

-- Any authenticated user can send invitations
DROP POLICY IF EXISTS "inv_insert" ON public.co_partner_invitations;
CREATE POLICY "inv_insert" ON public.co_partner_invitations
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

-- Invitees can respond to invitations
DROP POLICY IF EXISTS "inv_update" ON public.co_partner_invitations;
CREATE POLICY "inv_update" ON public.co_partner_invitations
  FOR UPDATE USING (
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM public.users WHERE id = auth.uid())
  );

-- Inviters can delete/cancel invitations
DROP POLICY IF EXISTS "inv_delete" ON public.co_partner_invitations;
CREATE POLICY "inv_delete" ON public.co_partner_invitations
  FOR DELETE USING (inviter_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_invitations_inviter ON public.co_partner_invitations(inviter_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_email   ON public.co_partner_invitations(invitee_email, status);

-- ─── 4. SECURITY DEFINER: Register a brand-new co-partner ────────────────────
-- Called after supabase.auth.signUp() to bypass RLS and insert the new user row
CREATE OR REPLACE FUNCTION public.register_new_co_partner(
  p_user_id      UUID,
  p_email        TEXT,
  p_display_name TEXT,
  p_inviter_id   UUID
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (p_user_id, p_email, p_display_name, 'co_partner')
  ON CONFLICT (id) DO UPDATE
    SET role = 'co_partner',
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email;

  INSERT INTO public.co_partner_invitations (inviter_id, invitee_email, invitee_id, status)
  VALUES (p_inviter_id, p_email, p_user_id, 'accepted')
  ON CONFLICT (inviter_id, invitee_email) DO UPDATE
    SET invitee_id = EXCLUDED.invitee_id,
        status = 'accepted',
        updated_at = NOW();
END;
$$;

-- ─── 5. SECURITY DEFINER: Accept an invitation ────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_co_partner_invitation(
  p_invitation_id UUID
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM public.users WHERE id = auth.uid();
  UPDATE public.co_partner_invitations
  SET status = 'accepted', invitee_id = auth.uid(), updated_at = NOW()
  WHERE id = p_invitation_id
    AND invitee_email = v_email
    AND status = 'pending';
END;
$$;

-- ─── 6. SECURITY DEFINER: Decline an invitation ──────────────────────────────
CREATE OR REPLACE FUNCTION public.decline_co_partner_invitation(
  p_invitation_id UUID
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM public.users WHERE id = auth.uid();
  UPDATE public.co_partner_invitations
  SET status = 'declined', updated_at = NOW()
  WHERE id = p_invitation_id
    AND invitee_email = v_email
    AND status = 'pending';
END;
$$;
