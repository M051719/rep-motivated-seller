import { serve } from "@std/http"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CRITICAL_FUNCTIONS = [
  'foreclosure-submission',
  'payment-webhook',
  'notification-dispatcher',
  'admin-dashboard',
  'security-monitor'
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const healthResults = []

    for (const functionName of CRITICAL_FUNCTIONS) {
      try {
        const startTime = Date.now()
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          }
        })
        const responseTime = Date.now() - startTime

        healthResults.push({
          function: functionName,
          status: response.status < 500 ? 'healthy' : 'unhealthy',
          responseTime,
          statusCode: response.status
        })
      } catch (error) {
        healthResults.push({
          function: functionName,
          status: 'error',
          error: error.message,
          responseTime: null,
          statusCode: null
        })
      }
    }

    const healthySystems = healthResults.filter(r => r.status === 'healthy').length
    const overallHealth = healthySystems / CRITICAL_FUNCTIONS.length

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        overallHealth: Math.round(overallHealth * 100),
        totalFunctions: CRITICAL_FUNCTIONS.length,
        healthyFunctions: healthySystems,
        results: healthResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})