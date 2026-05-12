import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// IP-based rate limiter (resets on cold starts)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { agent_id, view_type } = await req.json();

    if (!agent_id || !UUID_REGEX.test(agent_id)) {
      return new Response(JSON.stringify({ error: 'Invalid agent_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validTypes = ['page_view', 'card_view', 'profile_click'];
    if (!validTypes.includes(view_type)) {
      return new Response(JSON.stringify({ error: 'Invalid view_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date().toISOString().split('T')[0];

    const columnMap: Record<string, string> = {
      page_view: 'page_views',
      card_view: 'card_views',
      profile_click: 'profile_clicks',
    };
    const column = columnMap[view_type];

    const { error } = await supabase.rpc('increment_analytics', {
      p_agent_id: agent_id,
      p_date: today,
      p_column: column,
    });

    if (error) {
      // Fallback: manual upsert
      const { data: existing } = await supabase
        .from('agent_analytics')
        .select('id, ' + column)
        .eq('agent_id', agent_id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        const existingRow = existing as any;
        const currentVal = existingRow[column] || 0;
        await supabase
          .from('agent_analytics')
          .update({ [column]: currentVal + 1 })
          .eq('id', existingRow.id);
      } else {
        await supabase
          .from('agent_analytics')
          .insert({
            agent_id,
            date: today,
            [column]: 1,
            page_views: column === 'page_views' ? 1 : 0,
            profile_clicks: column === 'profile_clicks' ? 1 : 0,
            contact_requests: 0,
          });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('track-view error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
