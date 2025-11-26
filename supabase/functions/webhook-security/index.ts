import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS helper (inlined for Windows compatibility)
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, twilio-signature',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }
}

// Security validation helper
function validateWebhookSignature(signature: string, body: string, secret: string): boolean {
  if (!signature || !body || !secret) {
    return false
  }
  
  try {
    // Simple signature validation (implement proper HMAC for production)
    const expectedSignature = `sha256=${secret}`
    return signature.includes(expectedSignature.substring(0, 20)) // Partial match for demo
  } catch (error) {
    console.error('Signature validation error:', error)
    return false
  }
}

// Rate limiting helper (simple implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 900000): boolean {
  const now = Date.now()
  const key = ip
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (entry.count >= limit) {
    return false
  }
  
  entry.count++
  return true
}

// Main handler
serve(async (req) => {
  const url = new URL(req.url)
  const path = url.pathname
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }
  
  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Health check endpoint (no auth required)
    if (path.endsWith('/health')) {
      return new Response(
        JSON.stringify({ 
          ok: true, 
          service: 'webhook-security',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }),
        { 
          headers: { 
            ...corsHeaders(), 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Rate limiting for non-health endpoints
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later'
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders(), 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Validate webhook endpoint
    if (path.endsWith('/validate')) {
      const signature = req.headers.get('stripe-signature') || req.headers.get('twilio-signature') || ''
      const body = await req.text()
      const secret = Deno.env.get('WEBHOOK_SECRET') || 'default-secret'
      
      const isValid = validateWebhookSignature(signature, body, secret)
      
      return new Response(
        JSON.stringify({ 
          valid: isValid,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders(), 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Default response
    return new Response(
      JSON.stringify({
        message: 'Webhook Security API',
        endpoints: [
          'GET /health - Health check',
          'POST /validate - Validate webhook signature'
        ],
        version: '1.0.0'
      }),
      { 
        headers: { 
          ...corsHeaders(), 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('Webhook Security Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders(), 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})