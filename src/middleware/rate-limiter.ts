import { createMiddleware } from '@supabase/edge-runtime'

export const rateLimiter = createMiddleware({
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  }
})

// Usage in Edge Functions:
// supabase/functions/public-form-handler/index.ts
import { rateLimiter } from '../_shared/rate-limiter.ts'

serve(async (req) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimiter(req)
  if (rateLimitResult.blocked) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  
  // Process request...
})