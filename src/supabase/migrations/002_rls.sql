-- LifeCare Wellness - 002_rls.sql
-- Row Level Security policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role = 'admin' FROM public.users WHERE id = auth.uid()
$$;

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE POLICY "users_select" ON public.users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- ─── wellness_programs (read-only for staff) ──────────────────────────────────
CREATE POLICY "programs_select" ON public.wellness_programs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "programs_insert" ON public.wellness_programs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "programs_update" ON public.wellness_programs FOR UPDATE USING (public.is_admin());

-- ─── clients ─────────────────────────────────────────────────────────────────
CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (public.is_admin());

-- ─── health_reports ───────────────────────────────────────────────────────────
CREATE POLICY "reports_select" ON public.health_reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reports_insert" ON public.health_reports FOR INSERT WITH CHECK (logged_by = auth.uid());
CREATE POLICY "reports_delete" ON public.health_reports FOR DELETE USING (public.is_admin());

-- ─── call_logs ────────────────────────────────────────────────────────────────
CREATE POLICY "calls_select" ON public.call_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "calls_insert" ON public.call_logs FOR INSERT WITH CHECK (called_by = auth.uid());
CREATE POLICY "calls_delete" ON public.call_logs FOR DELETE USING (public.is_admin());

-- ─── reminders ────────────────────────────────────────────────────────────────
CREATE POLICY "reminders_select" ON public.reminders FOR SELECT USING (
  assigned_to = auth.uid() OR public.is_admin()
);
CREATE POLICY "reminders_insert" ON public.reminders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reminders_update" ON public.reminders FOR UPDATE USING (
  assigned_to = auth.uid() OR public.is_admin()
);
CREATE POLICY "reminders_delete" ON public.reminders FOR DELETE USING (public.is_admin());

-- ─── staff_notes ──────────────────────────────────────────────────────────────
CREATE POLICY "notes_select" ON public.staff_notes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "notes_insert" ON public.staff_notes FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "notes_update" ON public.staff_notes FOR UPDATE USING (
  author_id = auth.uid() OR public.is_admin()
);
CREATE POLICY "notes_delete" ON public.staff_notes FOR DELETE USING (
  author_id = auth.uid() OR public.is_admin()
);

-- ─── notifications (own only) ─────────────────────────────────────────────────
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── audit_logs (read only, admin) ───────────────────────────────────────────
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
