# Too Many Redirects Troubleshooting Guide

If you're experiencing a "too many redirects" error when accessing your website, follow these steps to diagnose and fix the issue:

## Quick Fixes

1. **Clear Browser Cache and Cookies**
   - This is often the first step as cached redirects can cause issues
   - In Chrome: Settings > Privacy and Security > Clear browsing data

2. **Check SSL Certificate**
   - Ensure you're using a proper `.crt` file, not a `.csr` file
   - Verify the certificate is valid and properly installed

3. **Check Redirect Rules**
   - Look for conflicting redirect rules in:
     - Nginx configuration
     - Cloudflare Page Rules
     - _redirects file

## Common Causes and Solutions

### 1. Cloudflare SSL/HTTPS Settings
- **Problem**: Incorrect SSL mode in Cloudflare
- **Solution**: Set SSL/TLS encryption mode to "Full" or "Full (strict)" in Cloudflare dashboard

### 2. Cloudflare Page Rules
- **Problem**: Conflicting page rules causing redirect loops
- **Solution**: Check for multiple rules that might redirect the same URL

### 3. SSL Certificate Issues
- **Problem**: Using CSR instead of CRT file in Nginx
- **Solution**: Update Nginx config to use the correct certificate file

### 4. Redirect Loops
- **Problem**: Multiple services trying to handle redirects
- **Solution**: Choose one place to handle redirects (either Nginx or Cloudflare)

### 5. Proxy Configuration
- **Problem**: Incorrect proxy settings for Supabase
- **Solution**: Verify proxy_pass and header settings

## Cloudflare-Specific Checks

1. **SSL/TLS Settings**
   - Go to Cloudflare Dashboard > SSL/TLS > Overview
   - Set encryption mode to "Full" or "Full (strict)"

2. **Page Rules**
   - Go to Cloudflare Dashboard > Rules > Page Rules
   - Check for conflicting redirect rules

3. **Always Use HTTPS**
   - Go to Cloudflare Dashboard > SSL/TLS > Edge Certificates
   - Ensure "Always Use HTTPS" is enabled

4. **Browser Cache TTL**
   - Go to Cloudflare Dashboard > Caching > Configuration
   - Set appropriate Browser Cache TTL

## Testing Your Fix

1. Run `restart-nginx.bat` to apply configuration changes
2. Purge cache in Cloudflare Dashboard > Caching > Purge Cache
3. Try accessing the site in an incognito/private browser window
4. Check browser developer tools (Network tab) to see the redirect chain

## Still Having Issues?

If you're still experiencing redirect issues after trying these solutions:

1. Temporarily disable Cloudflare by setting DNS to DNS only (gray cloud)
2. Temporarily disable HTTPS redirection in Nginx to isolate the problem
3. Review your application code for any hard-coded redirects

For more help, contact Cloudflare support or check the Nginx and Supabase documentation.
