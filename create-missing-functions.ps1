
Write-Host "Creating missing Edge Functions..." -ForegroundColor Green

# Create call-analytics
$callAnalyticsDir = "supabase/functions/call-analytics"
if (-not (Test-Path $callAnalyticsDir)) {
    New-Item -ItemType Directory -Path $callAnalyticsDir -Force | Out-Null
}

$callAnalyticsCode = @'
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
'@

$callAnalyticsCode | Out-File -FilePath "$callAnalyticsDir/index.ts" -Encoding utf8
Write-Host "✓ Created call-analytics function" -ForegroundColor Green

# Create auth-test
$authTestDir = "supabase/functions/auth-test"
if (-not (Test-Path $authTestDir)) {
    New-Item -ItemType Directory -Path $authTestDir -Force | Out-Null
}

$authTestCode = @'
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ authenticated: false, error: 'No auth header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error } = await supabaseClient.auth.getUser()

    if (error || !user) {
      return new Response(JSON.stringify({ authenticated: false, error: error?.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    return new Response(JSON.stringify({
      authenticated: true,
      user: { id: user.id, email: user.email },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
'@

$authTestCode | Out-File -FilePath "$authTestDir/index.ts" -Encoding utf8
Write-Host "✓ Created auth-test function" -ForegroundColor Green

Write-Host ""
Write-Host "Done! Now run:" -ForegroundColor Yellow
Write-Host "  git add supabase/functions/" -ForegroundColor Cyan
Write-Host "  git commit -m 'Add missing Edge Functions'" -ForegroundColor Cyan
Write-Host "  git push" -ForegroundColor Cyan
