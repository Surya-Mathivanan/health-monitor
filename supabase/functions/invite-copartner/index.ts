// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    
    // 1. Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // 2. Initialize normal client to verify the caller
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    })

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // Verify caller role
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfile?.role !== 'admin' && callerProfile?.role !== 'staff') {
      throw new Error('Forbidden: Only admin or staff can invite co-partners.')
    }

    const { email, display_name } = await req.json()
    if (!email) throw new Error('Email is required')

    // 3. Check if target user exists in auth
    // Note: We use Admin API for this. If we get a user, they exist.
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError
    
    const existingUser = users.find(u => u.email === email)

    let targetUserId = existingUser?.id

    if (!existingUser) {
      // 4. Invite user if they don't exist
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { display_name }
      })
      if (inviteError) throw inviteError
      targetUserId = inviteData.user.id
      
      // Optionally insert into public.users if your AuthCallback doesn't handle pending invites
      await supabaseAdmin.from('users').upsert({
        id: targetUserId,
        email: email,
        display_name: display_name,
        role: 'co_partner'
      })
    }

    // 5. Create the co_partner_invitation row
    const { error: inviteInsertError } = await supabaseAdmin
      .from('co_partner_invitations')
      .insert({
        inviter_id: user.id,
        invitee_email: email,
        invitee_id: targetUserId,
        status: existingUser ? 'pending' : 'accepted' // Auto-accept if they were just invited
      })

    // If there was a conflict (already invited), just ignore or handle it
    if (inviteInsertError && inviteInsertError.code !== '23505') {
      throw inviteInsertError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation processed successfully.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
