-- LifeCare Wellness - 001_schema.sql
-- Run this first in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users (mirrors Supabase Auth) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Wellness Programs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wellness_programs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  target_metrics JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Clients ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           TEXT NOT NULL,
  mobile              TEXT NOT NULL,
  age                 INTEGER NOT NULL CHECK (age BETWEEN 1 AND 120),
  gender              TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height_cm           NUMERIC(5,1) NOT NULL,
  weight_kg           NUMERIC(5,1) NOT NULL,
  assigned_program_id UUID REFERENCES public.wellness_programs(id) ON DELETE SET NULL,
  created_by          UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Health Reports ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.health_reports (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id            UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  recorded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  body_fat_pct         NUMERIC(5,2) NOT NULL,
  visceral_fat         NUMERIC(4,1) NOT NULL,
  bmi                  NUMERIC(4,1) NOT NULL,
  resting_bmr          INTEGER NOT NULL,
  body_age             INTEGER NOT NULL,
  skeletal_muscle_mass NUMERIC(5,2) NOT NULL,
  bmi_status           TEXT NOT NULL DEFAULT 'normal'
    CHECK (bmi_status IN ('underweight','normal','overweight','obese')),
  visceral_flag        TEXT NOT NULL DEFAULT 'normal'
    CHECK (visceral_flag IN ('normal','high','very_high')),
  logged_by            UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Call Logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.call_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  called_by         UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  called_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds  INTEGER,
  outcome           TEXT NOT NULL CHECK (outcome IN ('connected','missed','voicemail')),
  discussion_notes  TEXT,
  follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reminders ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reminders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_to    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  due_at         TIMESTAMPTZ NOT NULL,
  title          TEXT NOT NULL,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','snoozed')),
  linked_call_id UUID REFERENCES public.call_logs(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Staff Notes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  content    TEXT NOT NULL,
  is_pinned  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  type       TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('follow_up','system')),
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Audit Logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action         TEXT NOT NULL,
  table_name     TEXT NOT NULL,
  record_id      UUID,
  changed_fields JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_program ON public.clients(assigned_program_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_client ON public.health_reports(client_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_client ON public.call_logs(client_id, called_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status, due_at);
CREATE INDEX IF NOT EXISTS idx_reminders_assigned ON public.reminders(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_notes_client ON public.staff_notes(client_id, is_pinned DESC, created_at DESC);
