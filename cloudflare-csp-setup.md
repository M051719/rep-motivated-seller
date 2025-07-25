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

If you prefer using the API, you can use this curl command:

```bash
curl -X PUT "https://api.cloudflare.com/client/v4/zones/157eb99a0e69547a4d7d77ec08d35d24/settings/security_header" \
  -H "X-Auth-Email: melvin@sofiesentrepreneurialgroup.org" \
  -H "X-Auth-Key: 7b8246e2cb13f6a24e2e7b8d4ddb4305.access" \
  -H "Content-Type: application/json" \
  -d '{
    "value": {
      "content-security-policy": {
        "value": "default-src '\''self'\'' https: data: '\''unsafe-inline'\'' '\''unsafe-eval'\''; connect-src '\''self'\'' https: wss:; font-src '\''self'\'' https: data:; img-src '\''self'\'' https: data:; script-src '\''self'\'' https: '\''unsafe-inline'\'' '\''unsafe-eval'\''; style-src '\''self'\'' https: '\''unsafe-inline'\''",
        "enabled": true
      }
    }
  }'
```

### 6. Troubleshooting
- If CSP header is not showing up, try purging the Cloudflare cache
- If you see CSP errors in the browser console, adjust your policy as needed
- If you need to temporarily disable CSP, return to the Security Headers section and toggle it off