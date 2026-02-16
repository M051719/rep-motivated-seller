## Step-by-Step Guide to Enable CSP on Cloudflare

### 1. Log in to Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/login
2. Enter your email and password
3. Click "Log in"

### 2. Select Your Domain
1. From the dashboard, click on your domain: `repmotivatedseller.shoprealestatespace.org`

### 3. Navigate to Security Headers
1. Click on "SSL/TLS" in the left sidebar
2. Select the "Edge Certificates" tab
3. Scroll down to "Security Headers" section

### 4. Configure Content Security Policy
1. Click "Configure" next to "Content Security Policy (CSP)"
2. Select "Custom" from the dropdown
3. Enter the following CSP policy:
   ```
   default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';
   connect-src 'self' https: wss:;
   font-src 'self' https: data:;
   img-src 'self' https: data:;
   script-src 'self' https: 'unsafe-inline' 'unsafe-eval';
   style-src 'self' https: 'unsafe-inline';
   ```
4. Click "Save"

### 5. Verify CSP Implementation
1. Wait 5-10 minutes for changes to propagate
2. Visit your website: https://www.repmotivatedseller.shoprealestatespace.org
3. Right-click and select "Inspect" or press F12
4. Go to the "Network" tab
5. Refresh the page
6. Click on any HTML document in the list
7. Look for "content-security-policy" in the response headers

### Alternative Method: Using Cloudflare API


If you prefer using the API, use the Cloudflare Rulesets API to set a custom Content-Security-Policy header. Example:

1. Save this JSON as `ruleset.json`:
```json
{
  "rules": [
    {
      "action": "set_http_response_header",
      "expression": "http.request.uri.path matches \".*\"",
      "action_parameters": {
        "headers": [
          {
            "name": "Content-Security-Policy",
            "operation": "set",
            "value": "default-src 'self'; script-src 'self' https://js.stripe.com https://m.stripe.network 'nonce-<DEV_NONCE>'; style-src 'self' https://fonts.googleapis.com https://api.mapbox.com https://assets.calendly.com https://m.stripe.network 'nonce-<DEV_NONCE>' 'unsafe-hashes'; img-src 'self' data: https://*.stripe.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://js.stripe.com https://m.stripe.network ws://localhost:5173 http://localhost:5173; frame-src 'self' https://js.stripe.com https://m.stripe.network https://calendly.com; media-src 'self' data:; base-uri 'self'; form-action 'self';"
          }
        ]
      },
      "description": "Set CSP header for all responses",
      "enabled": true
    }
  ]
}
```

2. Apply the ruleset with (must be a single line, no backslashes):
```sh
export CF_API_EMAIL="your-cloudflare-email@example.com"
export CF_API_KEY="your-cloudflare-api-key"
curl -X PUT "https://api.cloudflare.com/client/v4/zones/157eb99a0e69547a4d7d77ec08d35d24/rulesets/phases/http_response_headers/entrypoint" \
  -H "X-Auth-Email: $CF_API_EMAIL" \
  -H "X-Auth-Key: $CF_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @ruleset.json

> **Security Reminder:**
> - Never commit or share your Cloudflare API key or email in documentation or source code.
> - Use environment variables or a secrets manager to keep credentials safe.
> - Ensure your ruleset.json contains the latest CSP as designed for Stripe, Supabase, and your integrations.

> **Security Warning:** Never commit or share your Cloudflare API key or email in documentation or source code. Use environment variables or a secrets manager to keep credentials safe.
```

> **Warning:**
> Do **not** use the `/settings/security_header` endpoint for Content-Security-Policy. It does **not** support custom CSP and will always return an error. Only use the `/rulesets/phases/http_response_headers/entrypoint` endpoint as shown above.

### 6. Troubleshooting
- If CSP header is not showing up, try purging the Cloudflare cache
- If you see CSP errors in the browser console, adjust your policy as needed
- If you need to temporarily disable CSP, return to the Security Headers section and toggle it off
