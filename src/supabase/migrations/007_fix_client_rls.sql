-- LifeCare Wellness - 007_fix_client_rls.sql
-- Fixes data isolation: co-partners only see their own clients.
-- Supervisors (inviters) can see their co-partners' clients.
-- Run this ENTIRE block in Supabase SQL Editor.

-- ─── Fix: clients visibility ──────────────────────────────────────────────────
-- Old policy: any logged-in user sees ALL clients (too broad)
-- New policy:
--   • Own clients (created_by = you)
--   • Clients of your accepted co-partners (supervisor view)
--   • Admins see everything

DROP POLICY IF EXISTS "clients_select" ON public.clients;

CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (
  public.is_admin()
  OR created_by = auth.uid()
  OR created_by IN (
    SELECT invitee_id
    FROM public.co_partner_invitations
    WHERE inviter_id = auth.uid()
      AND status = 'accepted'
      AND invitee_id IS NOT NULL
  )
);

-- ─── Fix: health_reports visibility ──────────────────────────────────────────
-- Only see reports for clients you own or supervise

DROP POLICY IF EXISTS "reports_select" ON public.health_reports;

CREATE POLICY "reports_select" ON public.health_reports FOR SELECT USING (
  public.is_admin()
  OR client_id IN (
    SELECT id FROM public.clients
    WHERE created_by = auth.uid()
       OR created_by IN (
         SELECT invitee_id FROM public.co_partner_invitations
         WHERE inviter_id = auth.uid() AND status = 'accepted' AND invitee_id IS NOT NULL
       )
  )
);

-- ─── Fix: call_logs visibility ────────────────────────────────────────────────

DROP POLICY IF EXISTS "calls_select" ON public.call_logs;

CREATE POLICY "calls_select" ON public.call_logs FOR SELECT USING (
  public.is_admin()
  OR called_by = auth.uid()
  OR client_id IN (
    SELECT id FROM public.clients
    WHERE created_by = auth.uid()
       OR created_by IN (
         SELECT invitee_id FROM public.co_partner_invitations
         WHERE inviter_id = auth.uid() AND status = 'accepted' AND invitee_id IS NOT NULL
       )
  )
);

-- ─── Fix: staff_notes visibility ─────────────────────────────────────────────

DROP POLICY IF EXISTS "notes_select" ON public.staff_notes;

CREATE POLICY "notes_select" ON public.staff_notes FOR SELECT USING (
  public.is_admin()
  OR author_id = auth.uid()
  OR client_id IN (
    SELECT id FROM public.clients
    WHERE created_by = auth.uid()
       OR created_by IN (
         SELECT invitee_id FROM public.co_partner_invitations
         WHERE inviter_id = auth.uid() AND status = 'accepted' AND invitee_id IS NOT NULL
       )
  )
);

-- ─── Fix: reminders visibility ───────────────────────────────────────────────
-- Already scoped, but open to supervisor view as well

DROP POLICY IF EXISTS "reminders_select" ON public.reminders;

CREATE POLICY "reminders_select" ON public.reminders FOR SELECT USING (
  public.is_admin()
  OR assigned_to = auth.uid()
  OR client_id IN (
    SELECT id FROM public.clients
    WHERE created_by = auth.uid()
       OR created_by IN (
         SELECT invitee_id FROM public.co_partner_invitations
         WHERE inviter_id = auth.uid() AND status = 'accepted' AND invitee_id IS NOT NULL
       )
  )
);

-- Done. Data is now fully isolated per user/co-partner relationship.
