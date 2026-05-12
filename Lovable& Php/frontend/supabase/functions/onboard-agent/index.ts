import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller is a distributor
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAnon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check distributor/admin role using the current-user role RPC
    const { data: currentRole, error: currentRoleError } = await supabaseAnon.rpc('get_current_user_role');

    if (currentRoleError) {
      return new Response(JSON.stringify({ error: 'Unable to verify account permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (currentRole !== 'distributor' && currentRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only distributors can onboard agents' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const {
      name, email, phone, location, company_name, subscription_plan,
      insurance_segments, languages, bio, years_experience,
      // Extended fields
      pan_number, office_address, specializations, serviceable_cities,
      approx_client_base, claims_processed, claims_amount, claims_settled,
      wants_portfolio_leads, portfolio_lead_amount, portfolio_lead_charging,
      wants_claims_leads, claims_lead_amount, claims_lead_charging,
      product_portfolio, career_timeline, career_highlights,
      website, linkedin, instagram, facebook, youtube, google_business_profile,
      whatsapp_number, residence_address, display_name,
    } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return new Response(JSON.stringify({ error: 'Name, email, and phone are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate phone
    const phoneClean = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      return new Response(JSON.stringify({ error: 'Invalid phone number' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const panClean = typeof pan_number === 'string' ? pan_number.toUpperCase().trim() : '';
    if (panClean && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panClean)) {
      return new Response(JSON.stringify({ error: 'Invalid PAN format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Generate a cryptographically random temporary password
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();

    // Create the agent user account using admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        phone: phoneClean,
        role: 'agent',
        subscription_plan: subscription_plan || 'starter',
      },
    });

    if (createError) {
      if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
        return new Response(JSON.stringify({ error: 'An account with this email already exists' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw createError;
    }

    const agentId = newUser.user.id;

    // Update profile with phone and optional fields
    const profileUpdate: Record<string, any> = { phone: phoneClean, full_name: name };
    if (whatsapp_number) profileUpdate.whatsapp_number = whatsapp_number;
    if (residence_address) profileUpdate.residence_address = residence_address;
    if (display_name) profileUpdate.display_name = display_name;
    await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', agentId);

    // Update agent profile with all non-sensitive details
    const agentProfileUpdate: Record<string, any> = { onboarded_by: user.id };

    const optionalFields: Record<string, any> = {
      location, company_name, insurance_segments, languages, bio, years_experience,
      office_address, specializations, serviceable_cities,
      approx_client_base, claims_processed, claims_amount, claims_settled,
      wants_portfolio_leads, portfolio_lead_amount, portfolio_lead_charging,
      wants_claims_leads, claims_lead_amount, claims_lead_charging,
      product_portfolio, career_timeline, career_highlights,
      website, linkedin, instagram, facebook, youtube, google_business_profile,
    };
    if (subscription_plan) agentProfileUpdate.subscription_plan = subscription_plan;

    for (const [key, value] of Object.entries(optionalFields)) {
      if (value !== undefined && value !== null && value !== '') {
        agentProfileUpdate[key] = value;
      }
    }

    await supabaseAdmin.from('agent_profiles').update(agentProfileUpdate).eq('id', agentId);

    // Store PAN in isolated sensitive table
    await supabaseAdmin
      .from('agent_sensitive_details')
      .upsert({ agent_id: agentId, pan_number: panClean || null }, { onConflict: 'agent_id' });

    // Create distributor-agent relationship
    await supabaseAdmin.from('distributor_agents').insert({
      distributor_id: user.id,
      agent_id: agentId,
      status: 'active',
    });

    return new Response(JSON.stringify({ 
      success: true, 
      agent_id: agentId,
      message: `Agent ${name} onboarded successfully` 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Onboard agent error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
