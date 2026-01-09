# Cloudflare Redirect Loop Fix Guide

This guide will help you resolve the "too many redirects" error when using Cloudflare with your website.

## Common Causes of Redirect Loops with Cloudflare

1. **SSL/TLS Mode Mismatch**
2. **Conflicting Page Rules**
3. **Always Use HTTPS Setting**
4. **Nginx Configuration Issues**
5. **Browser Cache Problems**

## Step-by-Step Fix

### 1. Check Cloudflare SSL/TLS Settings

1. Log in to your Cloudflare dashboard
2. Select your domain (repmotivatedseller.shoprealestatespace.org)
3. Go to **SSL/TLS** > **Overview**
4. Set encryption mode to **Full** or **Full (strict)**
   - Use **Full** if your origin doesn't have a valid SSL certificate
   - Use **Full (strict)** if your origin has a valid SSL certificate

### 2. Review Cloudflare Page Rules

1. Go to **Rules** > **Page Rules**
2. Check for any rules that might cause redirect loops:
   - Multiple rules redirecting to/from the same URL
   - Rules with "Always Use HTTPS" and other redirect settings
   - Rules with "Forwarding URL" settings

### 3. Check "Always Use HTTPS" Setting

1. Go to **SSL/TLS** > **Edge Certificates**
2. Make sure **Always Use HTTPS** is enabled
   - This setting should be ON, but make sure it's not conflicting with other rules

### 4. Update Nginx Configuration

1. Make sure your Nginx configuration uses the correct SSL certificate (not CSR file)
2. Ensure there's no conflict between Nginx and Cloudflare redirects
3. Run the `restart-nginx.bat` script to apply changes

### 5. Clear Caches

1. **Cloudflare Cache**:
   - Go to **Caching** > **Configuration**
   - Click **Purge Everything**

2. **Browser Cache**:
   - Open Chrome settings
   - Go to Privacy and Security > Clear browsing data
   - Select "Cookies and other site data" and "Cached images and files"
   - Click "Clear data"

### 6. Test with Diagnostic Tools

1. Run `cloudflare-redirect-test.bat` script
2. Access the test pages:
   - https://repmotivatedseller.shoprealestatespace.org/cloudflare-test.html
   - https://repmotivatedseller.shoprealestatespace.org/connection-test.html

### 7. Temporarily Bypass Cloudflare

If you're still having issues, temporarily bypass Cloudflare:

1. Go to Cloudflare Dashboard > DNS
2. Find the A record for your domain
3. Click the orange cloud icon to turn it gray (DNS only mode)
4. Test your site directly (this bypasses Cloudflare)

### 8. Check for Hard-Coded Redirects

1. Review your application code for any hard-coded redirects
2. Check for meta refresh tags in your HTML
3. Look for JavaScript redirects

## Quick Fix Checklist

- [ ] Set Cloudflare SSL/TLS mode to Full or Full (strict)
- [ ] Remove conflicting Page Rules
- [ ] Ensure "Always Use HTTPS" is properly configured
- [ ] Update Nginx SSL certificate configuration
- [ ] Purge Cloudflare cache
- [ ] Clear browser cache and cookies
- [ ] Test with diagnostic tools
- [ ] Temporarily bypass Cloudflare if needed

If you're still experiencing issues after following these steps, contact Cloudflare support for further assistance.