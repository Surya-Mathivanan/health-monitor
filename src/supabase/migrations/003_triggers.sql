-- LifeCare Wellness - 003_triggers.sql
-- Auto-compute health flags and audit trail

-- ─── Auto-compute BMI status and visceral flag ────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_health_flags()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- BMI status
  IF NEW.bmi < 18.5 THEN
    NEW.bmi_status := 'underweight';
  ELSIF NEW.bmi < 25 THEN
    NEW.bmi_status := 'normal';
  ELSIF NEW.bmi < 30 THEN
    NEW.bmi_status := 'overweight';
  ELSE
    NEW.bmi_status := 'obese';
  END IF;

  -- Visceral fat flag
  IF NEW.visceral_fat <= 9 THEN
    NEW.visceral_flag := 'normal';
  ELSIF NEW.visceral_fat <= 14 THEN
    NEW.visceral_flag := 'high';
  ELSE
    NEW.visceral_flag := 'very_high';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_health_flags ON public.health_reports;
CREATE TRIGGER trg_compute_health_flags
  BEFORE INSERT OR UPDATE ON public.health_reports
  FOR EACH ROW EXECUTE FUNCTION public.compute_health_flags();

-- ─── Auto-update updated_at on clients ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_reminders_updated_at ON public.reminders;
CREATE TRIGGER trg_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_staff_notes_updated_at ON public.staff_notes;
CREATE TRIGGER trg_staff_notes_updated_at
  BEFORE UPDATE ON public.staff_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, table_name, record_id, changed_fields)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE TG_OP WHEN 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
      ELSE to_jsonb(OLD)
    END
  );
  RETURN NULL;
END;
$$;

-- Apply audit trigger to key tables
DROP TRIGGER IF EXISTS trg_audit_clients ON public.clients;
CREATE TRIGGER trg_audit_clients  AFTER INSERT OR UPDATE OR DELETE ON public.clients  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

DROP TRIGGER IF EXISTS trg_audit_health ON public.health_reports;
CREATE TRIGGER trg_audit_health   AFTER INSERT ON public.health_reports FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

DROP TRIGGER IF EXISTS trg_audit_calls ON public.call_logs;
CREATE TRIGGER trg_audit_calls    AFTER INSERT ON public.call_logs FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

DROP TRIGGER IF EXISTS trg_audit_reminders ON public.reminders;
CREATE TRIGGER trg_audit_reminders AFTER INSERT OR UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- ─── Enable Realtime on reminders and notifications ───────────────────────────
-- Safely add tables to publication without throwing errors if they already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reminders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
