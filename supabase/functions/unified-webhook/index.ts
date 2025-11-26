import { serve } from "https://deno.land/std@0.200.0/http/server.ts"

const webhookHandlers = {
  'stripe': handleStripeWebhook,
  'paypal': handlePayPalWebhook,  
  'hubspot': handleHubSpotWebhook,
  'calendly': handleCalendlyWebhook
}

serve(async (req) => {
  const { headers } = req
  const provider = headers.get('x-webhook-provider')
  
  if (provider && webhookHandlers[provider]) {
    return await webhookHandlers[provider](req)
  }
  
  return new Response('Provider not supported', { status: 400 })
})