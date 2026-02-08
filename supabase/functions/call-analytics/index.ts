import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { action, callId } = await req.json()

    if (action === 'dashboard') {
      const { data: calls, error } = await supabaseClient
        .from('ai_calls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const totalCalls = calls?.length || 0
      const completedCalls = calls?.filter(c => c.call_status === 'completed').length || 0
      const transferredCalls = calls?.filter(c => c.transferred_to_human).length || 0

      const analytics = {
        overview: {
          totalCalls,
          completedCalls,
          transferredCalls,
          todayCalls: 0,
          urgentCalls: 0,
          avgDuration: 0,
          transferRate: totalCalls > 0 ? Math.round((transferredCalls / totalCalls) * 100) : 0,
        },
        aiPerformance: { fulfillmentRate: 0, topIntents: [], avgConfidence: 0 },
        handoffAnalysis: { totalHandoffs: transferredCalls, avgResolutionTime: 0, commonReasons: [] },
        recentCalls: calls?.slice(0, 10) || [],
      }

      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'call-details' && callId) {
      const { data: call } = await supabaseClient.from('ai_calls').select('*').eq('call_sid', callId).single()
      return new Response(JSON.stringify({ call }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Invalid action')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
