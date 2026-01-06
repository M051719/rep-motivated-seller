// File: supabase/functions/csp-nonce/index.ts

// No external deps. Use Web Crypto + Deno APIs.
// To enable logging, set secret LOG_NONCES=true (see notes below).

type LogRow = {
  nonce: string
  path: string
  user_agent?: string | null
  ip?: string | null
}

const encoder = new TextEncoder()

function genNonce(bytes = 16): string {
  // 128-bit nonce, base64; CSP allows base64 nonces
  const buf = crypto.getRandomValues(new Uint8Array(bytes))
  // Use standard base64 (not URL-safe) per CSP spec
  return btoa(String.fromCharCode(...buf))
}

async function logNonce(row: LogRow) {
  const enabled = (Deno.env.get('LOG_NONCES') || '').toLowerCase() === 'true'
  if (!enabled) return

  const dbUrl = Deno.env.get('SUPABASE_DB_URL')
  if (!dbUrl) {
    console.warn('LOG_NONCES enabled but SUPABASE_DB_URL is missing')
    return
  }

  // Use a simple text protocol insert via Postgres wire is not available here.
  // Instead, call a Postgres RPC via HTTP using the Supabase REST API (PostgREST) securely with SERVICE_ROLE.
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) {
    console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for logging')
    return
  }

  // Insert using PostgREST
  const resp = await fetch(`${url}/rest/v1/security_nonce_logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify([row]),
  })
  if (!resp.ok) {
    console.warn('Failed to log nonce', await resp.text())
  }
}

function buildCspHeader(nonce: string): string {
  // Adjust directives as needed for your app. This is strict and nonce-based.
  // Add frame-ancestors, connect-src, img-src, etc. per your needs.
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,          // only allow scripts with this nonce
    `style-src 'self' 'nonce-${nonce}'`,           // same for styles
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self'`,                          // add APIs/domains if needed
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
    `frame-src 'none'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`
  ].join('; ')
}

function htmlPage(nonce: string) {
  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CSP Nonce Demo</title>
  <style nonce="${nonce}">
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>CSP Nonce Demo</h1>
  <p>Your CSP nonce is injected into inline script and style tags.</p>

  <div id="app"></div>

  <script nonce="${nonce}">
    document.getElementById('app').textContent = 'Inline script executed with CSP nonce ✅';
  </script>
</body>
</html>
`.trim()
  return html
}

console.info('csp-nonce function started')

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)

  // Simple routing: GET /nonce-demo
  if (req.method === 'GET' && url.pathname === '/csp-nonce/nonce-demo') {
    const nonce = genNonce()
    const csp = buildCspHeader(nonce)

    // Optional logging in background
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip') ?? null
    const ua = req.headers.get('user-agent')
    // Use one of these:
    void logNonce({ nonce, path: url.pathname, ip, user_agent: ua })

    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': csp,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    })

    return new Response(htmlPage(nonce), { headers })
  }

  // 404 for everything else
  return new Response('Not found', { status: 404 })
})
