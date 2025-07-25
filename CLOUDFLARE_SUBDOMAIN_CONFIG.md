# Cloudflare Configuration for RepMotivatedSeller

This guide provides the optimal Cloudflare settings for your RepMotivatedSeller domains and subdomains to prevent redirect loops and ensure proper caching.

## Domain Setup

Based on your current setup, you have the following domains proxied through Cloudflare:
- repmotivatedseller.shoprealestatespace.org (main site)
- www.repmotivatedseller.shoprealestatespace.org
- admin.repmotivatedseller.shoprealestatespace.org
- api.repmotivatedseller.shoprealestatespace.org
- www.repmotivatedseller.org.shoprealestatespace.org

## SSL/TLS Settings

1. Go to **SSL/TLS** > **Overview**
2. Set encryption mode to **Full (strict)**
3. Go to **SSL/TLS** > **Edge Certificates**
4. Ensure **Always Use HTTPS** is enabled
5. Set **Minimum TLS Version** to TLS 1.2

## Page Rules (Priority Order)

Create the following Page Rules in this exact order:

### 1. Admin Subdomain (No Caching)

- URL pattern: `admin.repmotivatedseller.shoprealestatespace.org/*`
- Settings:
  - Cache Level: Bypass
  - Security Level: High
  - Browser Cache TTL: 30 minutes

### 2. API Subdomain (No Caching)

- URL pattern: `api.repmotivatedseller.shoprealestatespace.org/*`
- Settings:
  - Cache Level: Bypass
  - Browser Cache TTL: 30 minutes

### 3. Static Assets (Cache Everything)

- URL pattern: `*repmotivatedseller.shoprealestatespace.org/*.js*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 week
  - Browser Cache TTL: 1 week

### 4. Static Assets (Cache Everything)

- URL pattern: `*repmotivatedseller.shoprealestatespace.org/*.css*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 week
  - Browser Cache TTL: 1 week

### 5. Static Assets (Cache Everything)

- URL pattern: `*repmotivatedseller.shoprealestatespace.org/*.jpg*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 week
  - Browser Cache TTL: 1 week

### 6. Static Assets (Cache Everything)

- URL pattern: `*repmotivatedseller.shoprealestatespace.org/*.png*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 week
  - Browser Cache TTL: 1 week

### 7. HTML Files (Standard Caching)

- URL pattern: `*repmotivatedseller.shoprealestatespace.org/*.html*`
- Settings:
  - Cache Level: Standard
  - Edge Cache TTL: 2 hours
  - Browser Cache TTL: 1 hour

### 8. Main Domain (Standard Caching)

- URL pattern: `repmotivatedseller.shoprealestatespace.org/*`
- Settings:
  - Always Use HTTPS
  - Cache Level: Standard
  - Browser Cache TTL: 4 hours

## Caching Configuration

1. Go to **Caching** > **Configuration**
2. Set **Browser Cache TTL** to 4 hours
3. Disable **Always Online**
4. Set **Crawler Hints** to On

## Firewall Rules

Create a firewall rule to protect your admin area:

- Name: Protect Admin Area
- Expression: `(http.host eq "admin.repmotivatedseller.shoprealestatespace.org" and not ip.src in {YOUR_OFFICE_IP_1 YOUR_OFFICE_IP_2})`
- Action: Challenge

## After Making Changes

1. Go to **Caching** > **Configuration**
2. Click **Purge Everything**
3. Test your site in an incognito window

## Troubleshooting

If you still experience redirect issues:

1. Temporarily enable **Development Mode** in Caching > Configuration
2. Check your Nginx configuration for any redirect loops
3. Use the cloudflare-test.html page to diagnose issues

Remember: Never use "Cache Everything" for HTML pages or the main domain - this is what causes redirect loops.