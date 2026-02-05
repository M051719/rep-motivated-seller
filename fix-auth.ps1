# Authentication Quick Fix Script
# Run this to add missing environment variables and restart the dev server

Write-Host "🔧 Fixing Authentication Issues..." -ForegroundColor Cyan
Write-Host ""

# 1. Add Turnstile key to .env.development if missing
Write-Host "1️⃣ Checking Turnstile configuration..." -ForegroundColor Yellow

$envDevPath = ".env.development"
$turnstileKey = "VITE_TURNSTILE_SITE_KEY=0x4AAAAAABmGr2hpgZPwEYdH"

# Check if Turnstile key exists
$hasTurnstile = Get-Content $envDevPath | Select-String "VITE_TURNSTILE_SITE_KEY"

if (-not $hasTurnstile) {
    Write-Host "   ➕ Adding Turnstile key to .env.development" -ForegroundColor Green
    Add-Content -Path $envDevPath -Value "`n# Cloudflare Turnstile (for email/password login captcha)"
    Add-Content -Path $envDevPath -Value $turnstileKey
}
else {
    Write-Host "   ✅ Turnstile key already present" -ForegroundColor Green
}

# 2. Verify Supabase variables in .env.development
Write-Host ""
Write-Host "2️⃣ Verifying Supabase configuration..." -ForegroundColor Yellow

$supabaseUrl = Get-Content $envDevPath | Select-String "SUPABASE_URL=" | Select-Object -First 1
$hasVitePrefix = Get-Content $envDevPath | Select-String "VITE_SUPABASE_URL"

if (-not $hasVitePrefix) {
    Write-Host "   ➕ Adding VITE_ prefixed Supabase variables" -ForegroundColor Green

    # Extract existing values
    $url = (Get-Content $envDevPath | Select-String "SUPABASE_URL=" | Select-Object -First 1) -replace "SUPABASE_URL=", ""
    $key = (Get-Content $envDevPath | Select-String "SUPABASE_ANON_KEY=" | Select-Object -First 1) -replace "SUPABASE_ANON_KEY=", ""

    Add-Content -Path $envDevPath -Value "`n# Vite-compatible Supabase variables"
    Add-Content -Path $envDevPath -Value "VITE_SUPABASE_URL=$url"
    Add-Content -Path $envDevPath -Value "VITE_SUPABASE_ANON_KEY=$key"
}
else {
    Write-Host "   ✅ VITE_SUPABASE variables already present" -ForegroundColor Green
}

# 3. Show current configuration
Write-Host ""
Write-Host "3️⃣ Current Configuration:" -ForegroundColor Yellow
Write-Host ""

$config = Get-Content $envDevPath | Select-String "VITE_SUPABASE_URL|VITE_TURNSTILE"
foreach ($line in $config) {
    if ($line -match "VITE_SUPABASE_URL=(.+)") {
        Write-Host "   📡 Supabase URL: " -NoNewline -ForegroundColor Cyan
        Write-Host $matches[1] -ForegroundColor White
    }
    if ($line -match "VITE_TURNSTILE_SITE_KEY=(.+)") {
        Write-Host "   🔒 Turnstile Key: " -NoNewline -ForegroundColor Cyan
        Write-Host $matches[1] -ForegroundColor White
    }
}

# 4. Check if dev server is running
Write-Host ""
Write-Host "4️⃣ Checking dev server status..." -ForegroundColor Yellow

$viteProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*vite*"
}

if ($viteProcess) {
    Write-Host "   ⚠️  Dev server is currently running" -ForegroundColor Yellow
    Write-Host "   ℹ️  You need to restart it to load new environment variables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   To restart:" -ForegroundColor White
    Write-Host "   1. Press Ctrl+C in the terminal running 'npm run dev'" -ForegroundColor White
    Write-Host "   2. Run: npm run dev" -ForegroundColor White
}
else {
    Write-Host "   ℹ️  No dev server detected" -ForegroundColor Cyan
    Write-Host "   ℹ️  Start it with: npm run dev" -ForegroundColor Cyan
}

# 5. Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Environment fixes applied!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart dev server (if running): Ctrl+C then 'npm run dev'" -ForegroundColor White
Write-Host "   2. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host "   3. Open browser console (F12)" -ForegroundColor White
Write-Host "   4. Test authentication:" -ForegroundColor White
Write-Host "      • Email/password: Navigate to /auth" -ForegroundColor White
Write-Host "      • GitHub OAuth: Click 'Sign in with GitHub'" -ForegroundColor White
Write-Host "   5. Check knowledge base: Navigate to /knowledge-base" -ForegroundColor White
Write-Host ""
Write-Host "📄 For detailed debugging info, see: AUTH_DEBUGGING_REPORT.md" -ForegroundColor Cyan
Write-Host ""

# 6. Offer to start dev server
Write-Host "Would you like to start the dev server now? (Y/N)" -ForegroundColor Yellow -NoNewline
Write-Host " " -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting dev server..." -ForegroundColor Green
    Write-Host ""
    npm run dev
}
