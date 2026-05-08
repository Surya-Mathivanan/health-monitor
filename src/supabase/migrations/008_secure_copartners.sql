-- LifeCare Wellness - 008_secure_copartners.sql
-- 1. Drop the vulnerable RPC
DROP FUNCTION IF EXISTS public.register_new_co_partner(uuid, text, text, uuid);

-- 2. Restrict who can send invitations
DROP POLICY IF EXISTS "inv_insert" ON public.co_partner_invitations;
CREATE POLICY "inv_insert" ON public.co_partner_invitations
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() AND 
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'staff')
  );

-- 3. Secure Accept RPC
CREATE OR REPLACE FUNCTION public.accept_co_partner_invitation(p_invitation_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
  v_email TEXT;
BEGIN
  -- Securely get the email from the auth JWT
  v_email := current_setting('request.jwt.claims', true)::json->>'email';
  
  UPDATE public.co_partner_invitations
  SET status = 'accepted', invitee_id = auth.uid(), updated_at = NOW()
  WHERE id = p_invitation_id
    AND invitee_email = v_email
    AND status = 'pending';
END;
$$;

-- 4. Secure Decline RPC
CREATE OR REPLACE FUNCTION public.decline_co_partner_invitation(p_invitation_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
  v_email TEXT;
BEGIN
  -- Securely get the email from the auth JWT
  v_email := current_setting('request.jwt.claims', true)::json->>'email';
  
  UPDATE public.co_partner_invitations
  SET status = 'declined', updated_at = NOW()
  WHERE id = p_invitation_id
    AND invitee_email = v_email
    AND status = 'pending';
END;
$$;
