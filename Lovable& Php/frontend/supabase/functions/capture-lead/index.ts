import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      agent_id, name, email, phone, location, product_interest, contact_method,
      service_type, insurance_type, insurance_company, complaint_type, sub_product,
    } = body;

    if (!agent_id || !UUID_REGEX.test(agent_id)) {
      return new Response(JSON.stringify({ error: 'Invalid agent_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid name' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
      return new Response(JSON.stringify({ error: 'Invalid phone' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (email && (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.trim().length > 255)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!contact_method || !['call', 'whatsapp'].includes(contact_method)) {
      return new Response(JSON.stringify({ error: 'Invalid contact_method' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Rate-limit: max 5 leads per phone+agent in 24h
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent_id)
      .eq('phone', phone.trim())
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (countError) throw countError;

    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'rate_limited' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Smart dedup: if same phone+agent within 1 hour, merge contact method instead of creating duplicate
    const { data: recentLead } = await supabase
      .from('leads')
      .select('id, notes')
      .eq('agent_id', agent_id)
      .eq('phone', phone.trim())
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentLead) {
      // Merge: append new contact method to existing lead notes if not already present
      const existingNotes = recentLead.notes || '';
      const newMethodTag = `Contact via ${contact_method}`;
      if (!existingNotes.includes(newMethodTag)) {
        const updatedNotes = existingNotes ? `${existingNotes} | ${newMethodTag}` : newMethodTag;
        await supabase.from('leads').update({ notes: updatedNotes }).eq('id', recentLead.id);
      }
      return new Response(JSON.stringify({ ok: true, merged: true, reason: 'contact_method_merged' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for returning visitor (any historical lead with same phone+agent, no time limit)
    const { data: historicalLead } = await supabase
      .from('leads')
      .select('created_at')
      .eq('agent_id', agent_id)
      .eq('phone', phone.trim())
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    // Build structured notes with filter context
    const filterParts: string[] = [];
    filterParts.push(`Contact via ${contact_method}`);
    if (service_type && service_type !== 'all') filterParts.push(`Service: ${service_type}`);
    if (insurance_type && insurance_type !== 'all') filterParts.push(`Insurance: ${insurance_type}`);
    if (sub_product && sub_product !== 'all') filterParts.push(`Product: ${sub_product}`);
    if (insurance_company && insurance_company !== 'all') filterParts.push(`Company: ${insurance_company}`);
    if (complaint_type && complaint_type !== 'all') filterParts.push(`Complaint: ${complaint_type}`);

    // Tag returning visitors
    if (historicalLead) {
      const firstDate = new Date(historicalLead.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      filterParts.push(`🔄 Returning visitor (first contact: ${firstDate})`);
    }

    // Insert lead
    const { error: insertError } = await supabase.from('leads').insert({
      agent_id,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone.trim(),
      location: location?.trim() || null,
      product_interest: product_interest?.trim() || null,
      status: 'new',
      notes: filterParts.join(' | '),
    });

    if (insertError) throw insertError;

    // ── In-App Notification ──
    const purposeParts: string[] = [];
    if (service_type && service_type !== 'all') purposeParts.push(service_type);
    if (insurance_type && insurance_type !== 'all') purposeParts.push(insurance_type);
    const purposeStr = purposeParts.length > 0 ? ` for ${purposeParts.join(' - ')}` : '';
    const returningTag = historicalLead ? ' (returning visitor)' : '';

    await supabase.from('agent_notifications').insert({
      agent_id,
      type: 'lead',
      title: `New lead from ${name.trim()}${returningTag}`,
      message: `${name.trim()} contacted you via ${contact_method}${purposeStr}. Phone: ${phone.trim()}`,
      metadata: {
        lead_name: name.trim(),
        lead_phone: phone.trim(),
        lead_email: email?.trim() || null,
        contact_method,
        service_type: service_type || null,
        insurance_type: insurance_type || null,
        is_returning: !!historicalLead,
      },
    });

    // ── Email Notification (if agent has email) ──
    try {
      const { data: agentProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', agent_id)
        .single();

      if (agentProfile?.email) {
        await supabase.rpc('enqueue_email', {
          p_queue_name: 'transactional_emails',
          p_message_id: `lead-notify-${agent_id}-${Date.now()}`,
          p_template_name: 'lead-notification',
          p_recipient_email: agentProfile.email,
          p_subject: `🔔 New Lead: ${escHtml(name.trim())} contacted you`,
          p_html_body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a1a2e;">New Lead Received!${escHtml(returningTag)}</h2>
              <p>Hi ${escHtml(agentProfile.full_name || 'Agent')},</p>
              <p>You have a new lead on PadosiAgent:</p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Name:</strong> ${escHtml(name.trim())}</p>
                <p style="margin: 4px 0;"><strong>Phone:</strong> ${escHtml(phone.trim())}</p>
                ${email ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${escHtml(email.trim())}</p>` : ''}
                <p style="margin: 4px 0;"><strong>Contact Method:</strong> ${escHtml(contact_method)}</p>
                ${purposeStr ? `<p style="margin: 4px 0;"><strong>Purpose:</strong> ${escHtml(purposeStr)}</p>` : ''}
              </div>
              <p>Log in to your dashboard to follow up.</p>
            </div>
          `,
          p_metadata: JSON.stringify({ agent_id, lead_name: name.trim() }),
        });
      }
    } catch (emailErr) {
      console.log('Email notification skipped:', emailErr);
    }

    // ── WhatsApp Notification via Twilio (if configured) ──
    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY');
      
      if (LOVABLE_API_KEY && TWILIO_API_KEY) {
        const { data: agentData } = await supabase
          .from('profiles')
          .select('whatsapp_number, phone')
          .eq('id', agent_id)
          .single();

        const agentWhatsapp = agentData?.whatsapp_number || agentData?.phone;
        if (agentWhatsapp) {
          const cleanNumber = agentWhatsapp.replace(/[^0-9+]/g, '');
          const toNumber = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`;

          const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';
          await fetch(`${GATEWAY_URL}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'X-Connection-Api-Key': TWILIO_API_KEY,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: `whatsapp:${toNumber}`,
              From: 'whatsapp:+14155238886',
              Body: `🔔 New Lead on PadosiAgent!${returningTag}\n\nName: ${name.trim()}\nPhone: ${phone.trim()}\nMethod: ${contact_method}${purposeStr}\n\nLog in to your dashboard to follow up.`,
            }),
          });
        }
      }
    } catch (waErr) {
      console.log('WhatsApp notification skipped:', waErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Lead capture failed:', error);
    return new Response(JSON.stringify({ error: 'Lead capture failed. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
