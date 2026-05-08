-- LifeCare Wellness - 005_copartners.sql
-- Run this in Supabase SQL Editor to enable the co_partner role

-- Step 1: Drop the existing role constraint and re-add it with 'co_partner' included
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'staff', 'co_partner'));

-- Step 2: Add index on clients.created_by for fast co-partner client lookups
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);

-- Step 3: Add a helper function to check if the current user is a co_partner
CREATE OR REPLACE FUNCTION public.is_co_partner()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role = 'co_partner' FROM public.users WHERE id = auth.uid()
$$;

-- Step 4: Allow admins to insert users rows on behalf of co-partners
-- (The existing insert policy only allows id = auth.uid(), which blocks admin-created accounts)
-- We handle this via signUp on the client side (the new user inserts their own row via trigger/upsert)
-- No policy change needed — signUp creates the auth user, then we upsert the public.users row as that user.

-- Done! Run this once, then use the Co-Partners UI to create accounts.
