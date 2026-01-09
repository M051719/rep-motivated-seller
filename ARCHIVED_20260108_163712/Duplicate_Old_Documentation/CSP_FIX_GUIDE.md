# Content Security Policy (CSP) Fix Guide

This guide explains how to fix the Content Security Policy issues on your website.

## The Problem

Your website is showing the following error:
```
No content security policy
```

This indicates that your site doesn't have a proper Content Security Policy configured, which can lead to:
1. Security vulnerabilities
2. Browser warnings
3. Certain features not working correctly

## The Solution

### 1. Add CSP Headers in Nginx

Run the `fix-csp-issues.bat` script to add the following CSP header to your Nginx configuration:

```
Content-Security-Policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; 
                         connect-src 'self' https: wss:; 
                         font-src 'self' https: data:; 
                         img-src 'self' https: data:; 
                         script-src 'self' https: 'unsafe-inline' 'unsafe-eval'; 
                         style-src 'self' https: 'unsafe-inline';
```

This policy allows:
- Loading resources from your own domain and HTTPS sources
- Inline scripts and styles (needed for your application)
- WebSocket connections (needed for Supabase realtime)
- Data URIs for images and fonts

### 2. Configure CSP in Cloudflare

1. Go to Cloudflare Dashboard > SSL/TLS > Edge Certificates
2. Scroll down to "Security Headers"
3. Enable "Content Security Policy (CSP)"
4. Use the same policy as above

### 3. Test Your CSP

1. Deploy the test page using `deploy-test-page.bat`
2. Access the CSP test page at:
   - https://repmotivatedseller.shoprealestatespace.org/csp-test.html
   - or http://localhost/csp-test.html
3. Verify that resources load correctly and no CSP errors appear

## Understanding CSP Directives

- **default-src**: Fallback for other resource types
- **connect-src**: Controls where JavaScript can connect (fetch, XHR, WebSockets)
- **font-src**: Controls where fonts can be loaded from
- **img-src**: Controls where images can be loaded from
- **script-src**: Controls where scripts can be loaded from
- **style-src**: Controls where stylesheets can be loaded from

## Common Values

- **'self'**: Allow resources from the same origin
- **'unsafe-inline'**: Allow inline scripts and styles
- **'unsafe-eval'**: Allow dynamic code evaluation (eval, new Function)
- **data:**: Allow data: URIs
- **https:**: Allow any HTTPS URL

## Troubleshooting

If you're still experiencing issues after implementing the CSP:

1. Check browser console for specific CSP violation errors
2. Temporarily use a more permissive policy for testing
3. Add specific domains that are being blocked
4. Use the CSP test page to diagnose which resources are failing

Remember: A good CSP balances security with functionality. Start with a permissive policy and tighten it over time.