import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_REGEX = /^[6-9]\d{9}$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { agent_id, rating, comment, reviewer_name, reviewer_mobile } = body;

    // Validate agent_id
    if (!agent_id || !UUID_REGEX.test(agent_id)) {
      return new Response(JSON.stringify({ error: 'Invalid agent_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate rating
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate comment
    if (!comment || typeof comment !== 'string' || comment.trim().length < 10 || comment.trim().length > 500) {
      return new Response(JSON.stringify({ error: 'Comment must be 10-500 characters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate reviewer name
    if (!reviewer_name || typeof reviewer_name !== 'string' || reviewer_name.trim().length < 2 || reviewer_name.trim().length > 100) {
      return new Response(JSON.stringify({ error: 'Name must be 2-100 characters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate mobile
    if (!reviewer_mobile || !PHONE_REGEX.test(reviewer_mobile.trim())) {
      return new Response(JSON.stringify({ error: 'Invalid mobile number' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Rate-limit: max 3 reviews per mobile+agent
    const { data: existingReviews } = await supabase
      .from('review_verification_data')
      .select('id, review_id')
      .eq('reviewer_mobile', reviewer_mobile.trim());

    if (existingReviews && existingReviews.length > 0) {
      // Check how many of those are for this agent
      const reviewIds = existingReviews.map(r => r.review_id);
      const { count } = await supabase
        .from('agent_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent_id)
        .in('id', reviewIds);

      if ((count ?? 0) >= 3) {
        return new Response(JSON.stringify({ error: 'Maximum 3 reviews per agent allowed' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert review using agent_id as user_id placeholder (service role bypasses RLS)
    const { data: reviewData, error: reviewError } = await supabase
      .from('agent_reviews')
      .insert({
        agent_id,
        user_id: agent_id, // placeholder for guest reviews
        rating,
        comment: comment.trim(),
        is_approved: false,
      })
      .select('id')
      .single();

    if (reviewError) throw reviewError;

    // Store PII in verification table
    const { error: piiError } = await supabase
      .from('review_verification_data')
      .insert({
        review_id: reviewData.id,
        reviewer_name: reviewer_name.trim(),
        reviewer_mobile: reviewer_mobile.trim(),
      });

    if (piiError) {
      console.log('Failed to store verification data:', piiError);
    }

    return new Response(JSON.stringify({ ok: true, review_id: reviewData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Guest review submission failed:', error);
    return new Response(JSON.stringify({ error: 'Review submission failed. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
