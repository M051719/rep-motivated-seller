# API Key Rotation Assistant
# Automated helper for rotating all exposed API keys

param(
    [switch]$Interactive = $true,
    [switch]$SkipBackup = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔐 API KEY ROTATION ASSISTANT`n" -ForegroundColor Red
Write-Host "="*70 -ForegroundColor Gray
Write-Host "⚠️  CRITICAL: Your API keys were exposed in git history" -ForegroundColor Yellow
Write-Host "   HubSpot has already auto-expired their token" -ForegroundColor Yellow
Write-Host "   All 9 services must be rotated immediately" -ForegroundColor Yellow
Write-Host "="*70 -ForegroundColor Gray

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "`n❌ .env.local not found!" -ForegroundColor Red
    Write-Host "Creating .env.local from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Created .env.local" -ForegroundColor Green
    }
    else {
        Write-Host "❌ .env.example not found either!" -ForegroundColor Red
        Write-Host "Please create .env.local manually" -ForegroundColor Yellow
        exit 1
    }
}

# Backup current .env.local
if (-not $SkipBackup) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = ".env.local.backup-$timestamp"
    Copy-Item ".env.local" $backupFile
    Write-Host "`n✅ Backed up current .env.local to: $backupFile" -ForegroundColor Green
}

# Track completion
$rotationStatus = @{
    Supabase        = $false
    Calendly        = $false
    Dappier         = $false
    Stripe          = $false
    PayPal          = $false
    Cloudflare      = $false
    GitHub          = $false
    HubSpot         = $false
    GoogleAnalytics = $false
}

# Helper function to update .env.local
function Update-EnvVariable {
    param(
        [string]$VarName,
        [string]$NewValue
    )
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "$VarName=.*") {
        # Update existing variable
        $envContent = $envContent -replace "$VarName=.*", "$VarName=$NewValue"
    }
    else {
        # Add new variable
        $envContent += "`n$VarName=$NewValue"
    }
    
    Set-Content ".env.local" $envContent -NoNewline
}

# Helper function to prompt for input
function Get-SecureInput {
    param(
        [string]$Prompt,
        [switch]$Sensitive = $false
    )
    
    Write-Host "`n$Prompt" -ForegroundColor Cyan
    if ($Sensitive) {
        $secure = Read-Host -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
    else {
        return Read-Host
    }
}

# Service rotation functions
function Rotate-Supabase {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "1️⃣  SUPABASE ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://app.supabase.com" -ForegroundColor White
    Write-Host "   2. Navigate to: Project Settings → API" -ForegroundColor White
    Write-Host "   3. Click 'Rotate' for anon key" -ForegroundColor White
    Write-Host "   4. Click 'Rotate' for service_role key" -ForegroundColor White
    Write-Host "   5. Navigate to: Settings → Database" -ForegroundColor White
    Write-Host "   6. Click 'Reset database password'" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new Supabase keys? (y/n)"
    if ($continue -eq 'y') {
        $url = Get-SecureInput "Enter VITE_SUPABASE_URL (or press Enter to keep current)"
        $anonKey = Get-SecureInput "Enter new VITE_SUPABASE_ANON_KEY" -Sensitive
        $serviceKey = Get-SecureInput "Enter new SUPABASE_SERVICE_ROLE_KEY" -Sensitive
        
        if ($url) { Update-EnvVariable "VITE_SUPABASE_URL" $url }
        if ($anonKey) { Update-EnvVariable "VITE_SUPABASE_ANON_KEY" $anonKey }
        if ($serviceKey) { Update-EnvVariable "SUPABASE_SERVICE_ROLE_KEY" $serviceKey }
        
        Write-Host "✅ Supabase keys updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.Supabase = $true
    }
    else {
        Write-Host "⏭️  Skipped Supabase" -ForegroundColor Yellow
    }
}

function Rotate-Calendly {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "2️⃣  CALENDLY ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://calendly.com" -ForegroundColor White
    Write-Host "   2. Navigate to: Integrations → API & Webhooks" -ForegroundColor White
    Write-Host "   3. Delete old personal access token" -ForegroundColor White
    Write-Host "   4. Generate new personal access token" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new Calendly token? (y/n)"
    if ($continue -eq 'y') {
        $token = Get-SecureInput "Enter new VITE_CALENDLY_ACCESS_TOKEN" -Sensitive
        
        if ($token) { Update-EnvVariable "VITE_CALENDLY_ACCESS_TOKEN" $token }
        
        Write-Host "✅ Calendly token updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.Calendly = $true
    }
    else {
        Write-Host "⏭️  Skipped Calendly" -ForegroundColor Yellow
    }
}

function Rotate-Dappier {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "3️⃣  DAPPIER AI ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://dappier.com" -ForegroundColor White
    Write-Host "   2. Navigate to: API Keys" -ForegroundColor White
    Write-Host "   3. Revoke old API key" -ForegroundColor White
    Write-Host "   4. Generate new API key" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new Dappier key? (y/n)"
    if ($continue -eq 'y') {
        $apiKey = Get-SecureInput "Enter new VITE_DAPPIER_API_KEY" -Sensitive
        
        if ($apiKey) { Update-EnvVariable "VITE_DAPPIER_API_KEY" $apiKey }
        
        Write-Host "✅ Dappier API key updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.Dappier = $true
    }
    else {
        Write-Host "⏭️  Skipped Dappier" -ForegroundColor Yellow
    }
}

function Rotate-Stripe {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "4️⃣  STRIPE ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://dashboard.stripe.com" -ForegroundColor White
    Write-Host "   2. Navigate to: Developers → API keys" -ForegroundColor White
    Write-Host "   3. Click 'Roll key' for Publishable key" -ForegroundColor White
    Write-Host "   4. Click 'Roll key' for Secret key" -ForegroundColor White
    Write-Host "   5. Navigate to: Developers → Webhooks" -ForegroundColor White
    Write-Host "   6. Roll webhook signing secret" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new Stripe keys? (y/n)"
    if ($continue -eq 'y') {
        $pubKey = Get-SecureInput "Enter new VITE_STRIPE_PUBLISHABLE_KEY" -Sensitive
        $secretKey = Get-SecureInput "Enter new STRIPE_SECRET_KEY" -Sensitive
        $webhookSecret = Get-SecureInput "Enter new STRIPE_WEBHOOK_SECRET" -Sensitive
        
        if ($pubKey) { Update-EnvVariable "VITE_STRIPE_PUBLISHABLE_KEY" $pubKey }
        if ($secretKey) { Update-EnvVariable "STRIPE_SECRET_KEY" $secretKey }
        if ($webhookSecret) { Update-EnvVariable "STRIPE_WEBHOOK_SECRET" $webhookSecret }
        
        Write-Host "✅ Stripe keys updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.Stripe = $true
    }
    else {
        Write-Host "⏭️  Skipped Stripe" -ForegroundColor Yellow
    }
}

function Rotate-PayPal {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "5️⃣  PAYPAL ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://developer.paypal.com" -ForegroundColor White
    Write-Host "   2. Navigate to: My Apps & Credentials" -ForegroundColor White
    Write-Host "   3. Delete old REST API app" -ForegroundColor White
    Write-Host "   4. Create new REST API app" -ForegroundColor White
    Write-Host "   5. Copy Client ID and Secret" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new PayPal credentials? (y/n)"
    if ($continue -eq 'y') {
        $clientId = Get-SecureInput "Enter new VITE_PAYPAL_CLIENT_ID" -Sensitive
        $clientSecret = Get-SecureInput "Enter new PAYPAL_CLIENT_SECRET" -Sensitive
        
        if ($clientId) { Update-EnvVariable "VITE_PAYPAL_CLIENT_ID" $clientId }
        if ($clientSecret) { Update-EnvVariable "PAYPAL_CLIENT_SECRET" $clientSecret }
        
        Write-Host "✅ PayPal credentials updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.PayPal = $true
    }
    else {
        Write-Host "⏭️  Skipped PayPal" -ForegroundColor Yellow
    }
}

function Rotate-Cloudflare {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "6️⃣  CLOUDFLARE ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://dash.cloudflare.com" -ForegroundColor White
    Write-Host "   2. Navigate to: My Profile → API Tokens" -ForegroundColor White
    Write-Host "   3. Revoke old API token" -ForegroundColor White
    Write-Host "   4. Create new API token (with minimal permissions)" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new Cloudflare token? (y/n)"
    if ($continue -eq 'y') {
        $apiToken = Get-SecureInput "Enter new CLOUDFLARE_API_TOKEN" -Sensitive
        
        if ($apiToken) { Update-EnvVariable "CLOUDFLARE_API_TOKEN" $apiToken }
        
        Write-Host "✅ Cloudflare token updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.Cloudflare = $true
    }
    else {
        Write-Host "⏭️  Skipped Cloudflare" -ForegroundColor Yellow
    }
}

function Rotate-GitHub {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "7️⃣  GITHUB ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "   2. Delete old personal access tokens" -ForegroundColor White
    Write-Host "   3. Generate new fine-grained token" -ForegroundColor White
    Write-Host "   4. Set minimal required permissions" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new GitHub token? (y/n)"
    if ($continue -eq 'y') {
        $token = Get-SecureInput "Enter new GITHUB_TOKEN" -Sensitive
        
        if ($token) { Update-EnvVariable "GITHUB_TOKEN" $token }
        
        Write-Host "✅ GitHub token updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.GitHub = $true
    }
    else {
        Write-Host "⏭️  Skipped GitHub" -ForegroundColor Yellow
    }
}

function Rotate-HubSpot {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "8️⃣  HUBSPOT ROTATION" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n⚠️  TOKEN ALREADY AUTO-EXPIRED (discovered in public GitHub repo)" -ForegroundColor Red
    
    Write-Host "`n📋 Steps:" -ForegroundColor Yellow
    Write-Host "   1. Open https://app.hubspot.com" -ForegroundColor White
    Write-Host "   2. Navigate to: Settings → Integrations → Private Apps" -ForegroundColor White
    Write-Host "   3. Delete old private app (Account 243491083)" -ForegroundColor White
    Write-Host "   4. Create new private app with minimal scopes" -ForegroundColor White
    Write-Host "   5. Generate new access token" -ForegroundColor White
    
    $continue = Read-Host "`nReady to enter new HubSpot token? (y/n)"
    if ($continue -eq 'y') {
        $token = Get-SecureInput "Enter new VITE_HUBSPOT_ACCESS_TOKEN" -Sensitive
        
        if ($token) { Update-EnvVariable "VITE_HUBSPOT_ACCESS_TOKEN" $token }
        
        Write-Host "✅ HubSpot token updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.HubSpot = $true
    }
    else {
        Write-Host "⏭️  Skipped HubSpot" -ForegroundColor Yellow
    }
}

function Rotate-GoogleAnalytics {
    Write-Host "`n" -NoNewline
    Write-Host "="*70 -ForegroundColor Cyan
    Write-Host "9️⃣  GOOGLE ANALYTICS" -ForegroundColor Cyan
    Write-Host "="*70 -ForegroundColor Cyan
    
    Write-Host "`n📋 Note:" -ForegroundColor Yellow
    Write-Host "   Measurement ID typically doesn't need rotation" -ForegroundColor White
    Write-Host "   Only rotate if Measurement Protocol API key was exposed" -ForegroundColor White
    
    $continue = Read-Host "`nDo you need to update Google Analytics? (y/n)"
    if ($continue -eq 'y') {
        $measurementId = Get-SecureInput "Enter VITE_GA_MEASUREMENT_ID (or press Enter to skip)"
        
        if ($measurementId) { Update-EnvVariable "VITE_GA_MEASUREMENT_ID" $measurementId }
        
        Write-Host "✅ Google Analytics updated in .env.local" -ForegroundColor Green
        $script:rotationStatus.GoogleAnalytics = $true
    }
    else {
        Write-Host "⏭️  Skipped Google Analytics" -ForegroundColor Yellow
        $script:rotationStatus.GoogleAnalytics = $true  # Not critical
    }
}

# Main rotation flow
Write-Host "`n🚀 Starting API key rotation process...`n" -ForegroundColor Cyan

Rotate-Supabase
Rotate-Calendly
Rotate-Dappier
Rotate-Stripe
Rotate-PayPal
Rotate-Cloudflare
Rotate-GitHub
Rotate-HubSpot
Rotate-GoogleAnalytics

# Summary
Write-Host "`n" -NoNewline
Write-Host "="*70 -ForegroundColor Gray
Write-Host "`n📊 ROTATION SUMMARY`n" -ForegroundColor Cyan

$completedCount = ($rotationStatus.Values | Where-Object { $_ -eq $true }).Count
$totalCount = $rotationStatus.Count

foreach ($service in $rotationStatus.Keys | Sort-Object) {
    $status = if ($rotationStatus[$service]) { "✅" } else { "⏭️" }
    $color = if ($rotationStatus[$service]) { "Green" } else { "Yellow" }
    Write-Host "  $status $service" -ForegroundColor $color
}

Write-Host "`n" -NoNewline
Write-Host "="*70 -ForegroundColor Gray

if ($completedCount -eq $totalCount) {
    Write-Host "`n✅ ALL API KEYS ROTATED! ($completedCount/$totalCount)`n" -ForegroundColor Green
}
else {
    Write-Host "`n⚠️  PARTIAL ROTATION: $completedCount/$totalCount services updated`n" -ForegroundColor Yellow
}

# Next steps
Write-Host "📋 NEXT STEPS:`n" -ForegroundColor Yellow

if ($completedCount -gt 0) {
    Write-Host "1️⃣  Encrypt your .env.local with dotenvx:" -ForegroundColor White
    Write-Host "   npm run env:encrypt" -ForegroundColor Gray
    Write-Host "`n2️⃣  Test locally:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host "`n3️⃣  Verify each integration:" -ForegroundColor White
    Write-Host "   - Supabase auth works" -ForegroundColor Gray
    Write-Host "   - Calendly widget loads" -ForegroundColor Gray
    Write-Host "   - Dappier AI responds" -ForegroundColor Gray
    Write-Host "   - Stripe checkout works" -ForegroundColor Gray
    Write-Host "   - PayPal buttons render" -ForegroundColor Gray
    Write-Host "`n4️⃣  Commit encrypted .env files:" -ForegroundColor White
    Write-Host "   git add .env .env.production .env.staging" -ForegroundColor Gray
    Write-Host "   git commit -m 'Security: Rotate all API keys after exposure'" -ForegroundColor Gray
    Write-Host "`n5️⃣  Deploy to production:" -ForegroundColor White
    Write-Host "   npm run build:production" -ForegroundColor Gray
    Write-Host "   npm run deploy" -ForegroundColor Gray
    Write-Host "`n6️⃣  Monitor for 48 hours:" -ForegroundColor White
    Write-Host "   - Check application logs" -ForegroundColor Gray
    Write-Host "   - Verify payment processing" -ForegroundColor Gray
    Write-Host "   - Review Stripe/PayPal dashboards" -ForegroundColor Gray
}

Write-Host "`n⚠️  CRITICAL REMINDER:" -ForegroundColor Red
Write-Host "   Store your .env.keys file in a secrets manager!" -ForegroundColor Yellow
Write-Host "   Never commit .env.keys to version control!" -ForegroundColor Yellow

Write-Host "`n✅ Rotation assistant completed!`n" -ForegroundColor Green
