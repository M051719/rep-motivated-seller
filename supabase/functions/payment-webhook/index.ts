import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: string
  data: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the payload
    const payload: WebhookPayload = await req.json()
    
    console.log('Payment webhook received:', payload.type)

    // Handle different webhook events
    switch (payload.type) {
      case 'payment.succeeded':
        await handlePaymentSuccess(supabaseClient, payload.data)
        break
      
      case 'payment.failed':
        await handlePaymentFailure(supabaseClient, payload.data)
        break
        
      case 'subscription.created':
        await handleSubscriptionCreated(supabaseClient, payload.data)
        break
        
      default:
        console.log(`Unhandled webhook event: ${payload.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    )
  }
})

async function handlePaymentSuccess(supabase: any, data: any) {
  console.log('Processing successful payment:', data.id)
  
  // Update payment record in database
  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'completed',
      processed_at: new Date().toISOString(),
      payment_id: data.id
    })
    .eq('transaction_id', data.metadata?.transaction_id)
    
  if (error) {
    console.error('Failed to update payment:', error)
    throw error
  }
  
  console.log('Payment updated successfully')
}

async function handlePaymentFailure(supabase: any, data: any) {
  console.log('Processing failed payment:', data.id)
  
  // Update payment record in database
  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'failed',
      processed_at: new Date().toISOString(),
      error_message: data.failure_reason,
      payment_id: data.id
    })
    .eq('transaction_id', data.metadata?.transaction_id)
    
  if (error) {
    console.error('Failed to update payment:', error)
    throw error
  }
  
  console.log('Payment failure recorded')
}

async function handleSubscriptionCreated(supabase: any, data: any) {
  console.log('Processing new subscription:', data.id)
  
  // Create subscription record
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      subscription_id: data.id,
      user_id: data.metadata?.user_id,
      status: data.status,
      current_period_start: new Date(data.current_period_start * 1000).toISOString(),
      current_period_end: new Date(data.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString()
    })
    
  if (error) {
    console.error('Failed to create subscription:', error)
    throw error
  }
  
  console.log('Subscription created successfully')
}