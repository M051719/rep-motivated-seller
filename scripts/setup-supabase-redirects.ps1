# ===================================================================
# Supabase Redirect URL Configuration Guide
# ===================================================================
# This script provides instructions for configuring OAuth redirect URLs
# in the Supabase dashboard for proper authentication flow.
# ===================================================================

Write-Host "🔧 Supabase OAuth Redirect Configuration" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Dashboard Access
Write-Host "📍 Step 1: Access Supabase Dashboard" -ForegroundColor Yellow
Write-Host "  1. Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "  2. Sign in to your account" -ForegroundColor White
Write-Host "  3. Select your project: rep-motivated-seller" -ForegroundColor White
Write-Host ""

# Step 2: Navigate to Auth Settings
Write-Host "⚙️  Step 2: Navigate to Authentication Settings" -ForegroundColor Yellow
Write-Host "  1. Click on 'Authentication' in the left sidebar" -ForegroundColor White
Write-Host "  2. Go to 'URL Configuration' tab" -ForegroundColor White
Write-Host ""

# Step 3: Configure Site URL
Write-Host "🌐 Step 3: Configure Site URL" -ForegroundColor Yellow
Write-Host "  Set the Site URL to your application's base URL:" -ForegroundColor White
Write-Host ""
Write-Host "  Development:" -ForegroundColor Cyan
Write-Host "    http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "  Production:" -ForegroundColor Cyan
Write-Host "    https://repmotivatedseller.shoprealestatespace.org" -ForegroundColor Green
Write-Host ""

# Step 4: Configure Redirect URLs
Write-Host "🔀 Step 4: Configure Redirect URLs" -ForegroundColor Yellow
Write-Host "  Add these URLs to 'Redirect URLs' (one per line):" -ForegroundColor White
Write-Host ""
Write-Host "  Development URLs:" -ForegroundColor Cyan
Write-Host "    http://localhost:3000/auth/callback" -ForegroundColor Green
Write-Host "    http://localhost:3000/**" -ForegroundColor Green
Write-Host ""
Write-Host "  Production URLs:" -ForegroundColor Cyan
Write-Host "    https://repmotivatedseller.shoprealestatespace.org/auth/callback" -ForegroundColor Green
Write-Host "    https://repmotivatedseller.shoprealestatespace.org/**" -ForegroundColor Green
Write-Host ""

# Step 5: OAuth Provider Configuration
Write-Host "🔐 Step 5: Enable OAuth Providers" -ForegroundColor Yellow
Write-Host "  1. Go to 'Providers' section in Authentication settings" -ForegroundColor White
Write-Host "  2. Enable GitHub provider:" -ForegroundColor White
Write-Host "     - Toggle 'GitHub' to ON" -ForegroundColor White
Write-Host "     - Enter GitHub OAuth credentials:" -ForegroundColor White
Write-Host "       * Client ID (from GitHub OAuth app)" -ForegroundColor Gray
Write-Host "       * Client Secret (from GitHub OAuth app)" -ForegroundColor Gray
Write-Host "  3. Configure redirect URL in GitHub:" -ForegroundColor White
Write-Host "     - Go to: https://github.com/settings/developers" -ForegroundColor Gray
Write-Host "     - Select your OAuth app" -ForegroundColor Gray
Write-Host "     - Set 'Authorization callback URL' to:" -ForegroundColor Gray
Write-Host "       https://ltxqodqlexvojqqxquew.supabase.co/auth/v1/callback" -ForegroundColor Green
Write-Host ""

# Step 6: PKCE Settings
Write-Host "🔒 Step 6: Verify PKCE Flow Settings" -ForegroundColor Yellow
Write-Host "  1. In 'Authentication' settings, find 'Auth Flow Configuration'" -ForegroundColor White
Write-Host "  2. Ensure 'PKCE' flow is enabled (should be default)" -ForegroundColor White
Write-Host "  3. Session timeout: 900 seconds (15 minutes) - recommended" -ForegroundColor White
Write-Host ""

# Step 7: Email Auth Settings
Write-Host "📧 Step 7: Email Authentication Settings" -ForegroundColor Yellow
Write-Host "  1. Enable 'Email' provider in Providers section" -ForegroundColor White
Write-Host "  2. Configure email templates (optional):" -ForegroundColor White
Write-Host "     - Confirmation email template" -ForegroundColor Gray
Write-Host "     - Reset password template" -ForegroundColor Gray
Write-Host "     - Magic link template" -ForegroundColor Gray
Write-Host "  3. Email rate limiting: Enable to prevent abuse" -ForegroundColor White
Write-Host ""

# Verification Steps
Write-Host "✅ Step 8: Verification" -ForegroundColor Yellow
Write-Host "  After configuration, test the following:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Email Sign-Up:" -ForegroundColor Cyan
Write-Host "     - Visit: http://localhost:3000/auth" -ForegroundColor White
Write-Host "     - Click 'Sign Up'" -ForegroundColor White
Write-Host "     - Enter email and password" -ForegroundColor White
Write-Host "     - Check for confirmation email" -ForegroundColor White
Write-Host ""
Write-Host "  2. Email Sign-In:" -ForegroundColor Cyan
Write-Host "     - Visit: http://localhost:3000/auth" -ForegroundColor White
Write-Host "     - Enter credentials" -ForegroundColor White
Write-Host "     - Should redirect to profile page" -ForegroundColor White
Write-Host ""
Write-Host "  3. GitHub OAuth:" -ForegroundColor Cyan
Write-Host "     - Visit: http://localhost:3000/auth" -ForegroundColor White
Write-Host "     - Click 'Sign in with GitHub'" -ForegroundColor White
Write-Host "     - Should redirect to GitHub authorization" -ForegroundColor White
Write-Host "     - After authorization, redirects back to app" -ForegroundColor White
Write-Host ""

# Troubleshooting
Write-Host "🔧 Troubleshooting Common Issues" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Issue: 'Invalid Redirect URL' error" -ForegroundColor Red
Write-Host "  Solution:" -ForegroundColor Green
Write-Host "    - Check that callback URL is in 'Redirect URLs' list" -ForegroundColor White
Write-Host "    - Ensure URL matches exactly (including protocol)" -ForegroundColor White
Write-Host "    - Try using wildcard: http://localhost:3000/**" -ForegroundColor White
Write-Host ""
Write-Host "  Issue: OAuth login redirects to wrong URL" -ForegroundColor Red
Write-Host "  Solution:" -ForegroundColor Green
Write-Host "    - Verify 'Site URL' is set correctly" -ForegroundColor White
Write-Host "    - Check that provider callback URL matches" -ForegroundColor White
Write-Host "    - Ensure code has: detectSessionInUrl: true" -ForegroundColor White
Write-Host ""
Write-Host "  Issue: Session not persisting" -ForegroundColor Red
Write-Host "  Solution:" -ForegroundColor Green
Write-Host "    - Verify: persistSession: true in supabase.ts" -ForegroundColor White
Write-Host "    - Check browser cookies are enabled" -ForegroundColor White
Write-Host "    - Clear browser cache and try again" -ForegroundColor White
Write-Host ""

# Configuration Checklist
Write-Host "📋 Configuration Checklist" -ForegroundColor Cyan
Write-Host "  ☐ Site URL configured" -ForegroundColor White
Write-Host "  ☐ Redirect URLs added (dev + prod)" -ForegroundColor White
Write-Host "  ☐ Email provider enabled" -ForegroundColor White
Write-Host "  ☐ GitHub OAuth configured (if using)" -ForegroundColor White
Write-Host "  ☐ PKCE flow enabled" -ForegroundColor White
Write-Host "  ☐ Email templates customized (optional)" -ForegroundColor White
Write-Host "  ☐ Tested email sign-up" -ForegroundColor White
Write-Host "  ☐ Tested email sign-in" -ForegroundColor White
Write-Host "  ☐ Tested OAuth flow" -ForegroundColor White
Write-Host "  ☐ Verified session persistence" -ForegroundColor White
Write-Host ""

# Quick Reference
Write-Host "📚 Quick Reference" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "    https://supabase.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "  Your Project URL:" -ForegroundColor Yellow
Write-Host "    https://ltxqodqlexvojqqxquew.supabase.co" -ForegroundColor White
Write-Host ""
Write-Host "  Auth Callback Endpoint:" -ForegroundColor Yellow
Write-Host "    https://ltxqodqlexvojqqxquew.supabase.co/auth/v1/callback" -ForegroundColor White
Write-Host ""
Write-Host "  Local Dev URL:" -ForegroundColor Yellow
Write-Host "    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  Production URL:" -ForegroundColor Yellow
Write-Host "    https://repmotivatedseller.shoprealestatespace.org" -ForegroundColor White
Write-Host ""

Write-Host "✨ Configuration guide complete!" -ForegroundColor Green
Write-Host ""
