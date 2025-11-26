import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-cert-id, paypal-auth-algo, paypal-transmission-sig, paypal-transmission-time',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

console.log("🚀 PayPal webhook function started")

serve(async (req) => {
  console.log(`📥 Received ${req.method} request`)

  if (req.method === 'OPTIONS') {
    console.log("✅ Handling CORS preflight")
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log("❌ Method not allowed:", req.method)
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false }
      }
    )

    console.log("✅ Supabase client initialized")

    const body = await req.text()
    console.log("📄 Request body received, length:", body.length)

    let event
    try {
      event = JSON.parse(body)
      console.log("🎯 PayPal event type:", event.event_type)
      console.log("📋 Event ID:", event.id)
    } catch (error) {
      console.error("❌ JSON parse error:", error)
      throw new Error('Invalid JSON payload')
    }

    // Process PayPal events
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log("💰 Processing completed payment capture")
        await handlePaymentCompleted(supabaseClient, event.resource)
        break
        
      case 'PAYMENT.CAPTURE.DENIED':
        console.log("❌ Processing denied payment capture")
        await handlePaymentDenied(supabaseClient, event.resource)
        break
        
      case 'BILLING.SUBSCRIPTION.CREATED':
        console.log("🔄 Processing subscription creation")
        await handleSubscriptionCreated(supabaseClient, event.resource)
        break
        
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log("🔄 Processing subscription activation")
        await handleSubscriptionActivated(supabaseClient, event.resource)
        break
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log("🔄 Processing subscription cancellation")
        await handleSubscriptionCancelled(supabaseClient, event.resource)
        break
        
      default:
        console.log(`⚠️ Unhandled PayPal event: ${event.event_type}`)
    }

    console.log("✅ PayPal webhook processed successfully")
    return new Response(
      JSON.stringify({ received: true, eventType: event.event_type }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ PayPal webhook processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function handlePaymentCompleted(supabase: any, resource: any) {
  console.log("💳 Handling completed PayPal payment:", resource.id)
  
  try {
    const { error } = await supabase
      .from('paypal_transactions')
      .insert({
        paypal_capture_id: resource.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        status: 'completed',
        payer_email: resource.payer?.email_address || null,
        processed_at: new Date().toISOString()
      })

    if (error) {
      console.error('💾 Error saving PayPal payment:', error)
      throw error
    }

    console.log('✅ PayPal payment saved successfully')
  } catch (error) {
    console.error('❌ PayPal payment handling error:', error)
    throw error
  }
}

async function handlePaymentDenied(supabase: any, resource: any) {
  console.log("❌ Handling denied PayPal payment:", resource.id)
  
  try {
    const { error } = await supabase
      .from('paypal_transactions')
      .insert({
        paypal_capture_id: resource.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        status: 'denied',
        processed_at: new Date().toISOString()
      })

    if (error) {
      console.error('💾 Error saving denied PayPal payment:', error)
      throw error
    }

    console.log('✅ PayPal payment denial logged')
  } catch (error) {
    console.error('❌ PayPal payment denial handling error:', error)
    throw error
  }
}

async function handleSubscriptionCreated(supabase: any, resource: any) {
  console.log("🔄 Handling PayPal subscription creation:", resource.id)
  
  try {
    const { error } = await supabase
      .from('paypal_subscriptions')
      .insert({
        paypal_subscription_id: resource.id,
        status: resource.status,
        plan_id: resource.plan_id,
        subscriber_email: resource.subscriber?.email_address || null,
        start_time: resource.start_time,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('💾 Error creating PayPal subscription:', error)
      throw error
    }

    console.log('✅ PayPal subscription created')
  } catch (error) {
    console.error('❌ PayPal subscription creation handling error:', error)
    throw error
  }
}

async function handleSubscriptionActivated(supabase: any, resource: any) {
  console.log("🔄 Handling PayPal subscription activation:", resource.id)
  
  try {
    const { error } = await supabase
      .from('paypal_subscriptions')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', resource.id)

    if (error) {
      console.error('💾 Error activating PayPal subscription:', error)
      throw error
    }

    console.log('✅ PayPal subscription activated')
  } catch (error) {
    console.error('❌ PayPal subscription activation handling error:', error)
    throw error
  }
}

async function handleSubscriptionCancelled(supabase: any, resource: any) {
  console.log("🔄 Handling PayPal subscription cancellation:", resource.id)
  
  try {
    const { error } = await supabase
      .from('paypal_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', resource.id)

    if (error) {
      console.error('💾 Error cancelling PayPal subscription:', error)
      throw error
    }

    console.log('✅ PayPal subscription cancelled')
  } catch (error) {
    console.error('❌ PayPal subscription cancellation handling error:', error)
    throw error
  }
}

console.log("🎯 PayPal webhook function ready")
