import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DEMO_ACCOUNTS: Record<string, { email: string; password: string; name: string; role: string }> = {
  user: { email: 'demo.user@padosiagent.com', password: 'demo123456', name: 'Demo User', role: 'user' },
  agent: { email: 'demo.agent@padosiagent.com', password: 'demo123456', name: 'Demo Agent', role: 'agent' },
  distributor: { email: 'demo.distributor@padosiagent.com', password: 'demo123456', name: 'Demo Distributor', role: 'distributor' },
  admin: { email: 'demo.admin@padosiagent.com', password: 'admin@demo2024', name: 'Demo Admin', role: 'admin' },
};

// Simple in-memory rate limiter (resets on cold starts, but sufficient for basic protection)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('cf-connecting-ip') 
    || 'unknown';

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type } = await req.json();

    if (!type || !DEMO_ACCOUNTS[type]) {
      return new Response(JSON.stringify({ error: 'Invalid demo account type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const demo = DEMO_ACCOUNTS[type];
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Try to sign in first
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: demo.email,
      password: demo.password,
    });

    if (!signInError && signInData.session) {
      return new Response(JSON.stringify({ session: signInData.session }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create account if it doesn't exist
    if (signInError?.message?.includes('Invalid login credentials')) {
      // For admin, we need special handling since handle_new_user blocks admin self-assignment
      const userRole = demo.role === 'admin' ? 'user' : demo.role;
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: { full_name: demo.name, role: userRole },
      });

      if (createError) throw createError;

      // If admin, replace the default 'user' role with 'admin'
      if (demo.role === 'admin' && newUser?.user) {
        // Remove the 'user' role that the trigger created
        await supabase.from('user_roles')
          .delete()
          .eq('user_id', newUser.user.id)
          .eq('role', 'user');
        // Insert admin role
        await supabase.from('user_roles').insert({
          user_id: newUser.user.id,
          role: 'admin',
        });
      }

      // Sign in with the newly created account
      const { data: newSignIn, error: newSignInError } = await anonClient.auth.signInWithPassword({
        email: demo.email,
        password: demo.password,
      });

      if (newSignInError) throw newSignInError;

      return new Response(JSON.stringify({ session: newSignIn.session, created: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw signInError;
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Demo login failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
