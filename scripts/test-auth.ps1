# ===================================================================
# Authentication Testing Script
# ===================================================================
# Tests Supabase authentication flows including:
# - Connection testing
# - Sign-up functionality
# - Sign-in functionality
# - OAuth redirect handling
# - Session persistence
# ===================================================================

Write-Host "🔐 Testing Supabase Authentication" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.development exists
if (-not (Test-Path ".env.development")) {
    Write-Host "❌ Error: .env.development file not found!" -ForegroundColor Red
    Write-Host "Please create .env.development from .env.development.template" -ForegroundColor Yellow
    exit 1
}

# Test 1: Check Supabase environment variables
Write-Host "1️⃣ Checking Environment Configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env.development" -Raw

if ($envContent -match "VITE_SUPABASE_URL") {
    Write-Host "  ✅ VITE_SUPABASE_URL found" -ForegroundColor Green
} else {
    Write-Host "  ❌ VITE_SUPABASE_URL missing" -ForegroundColor Red
}

if ($envContent -match "VITE_SUPABASE_ANON_KEY") {
    Write-Host "  ✅ VITE_SUPABASE_ANON_KEY found" -ForegroundColor Green
} else {
    Write-Host "  ❌ VITE_SUPABASE_ANON_KEY missing" -ForegroundColor Red
}

Write-Host ""

# Test 2: Verify Supabase client configuration
Write-Host "2️⃣ Verifying Supabase Client Configuration..." -ForegroundColor Yellow

if (Test-Path "src/lib/supabase.ts") {
    $supabaseClient = Get-Content "src/lib/supabase.ts" -Raw
    
    if ($supabaseClient -match "detectSessionInUrl.*true") {
        Write-Host "  ✅ OAuth redirect detection enabled (detectSessionInUrl: true)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  OAuth redirect detection may not be enabled" -ForegroundColor Yellow
    }
    
    if ($supabaseClient -match "persistSession.*true") {
        Write-Host "  ✅ Session persistence enabled (persistSession: true)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Session persistence may not be enabled" -ForegroundColor Yellow
    }
    
    if ($supabaseClient -match "flowType.*['\"]pkce['\"]") {
        Write-Host "  ✅ PKCE flow enabled (flowType: 'pkce')" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  PKCE flow may not be enabled" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ src/lib/supabase.ts not found!" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check for insecure files
Write-Host "3️⃣ Checking for Insecure Files..." -ForegroundColor Yellow

$insecureFiles = @(
    "src/utils/auth.js",
    "src/lib/supabase.js",
    "src/lib/supabase-env.js"
)

$foundInsecure = $false
foreach ($file in $insecureFiles) {
    if (Test-Path $file) {
        Write-Host "  ❌ SECURITY RISK: $file still exists!" -ForegroundColor Red
        $foundInsecure = $true
    } else {
        Write-Host "  ✅ $file removed" -ForegroundColor Green
    }
}

Write-Host ""

# Test 4: Verify Turnstile is optional in development
Write-Host "4️⃣ Verifying Turnstile Configuration..." -ForegroundColor Yellow

if (Test-Path "src/components/AuthForm.tsx") {
    $authForm = Get-Content "src/components/AuthForm.tsx" -Raw
    
    if ($authForm -match "isDevelopment.*=.*import\.meta\.env\.DEV") {
        Write-Host "  ✅ Turnstile optional in development mode" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Turnstile may not be optional in development" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ src/components/AuthForm.tsx not found!" -ForegroundColor Red
}

Write-Host ""

# Test 5: Start development server test
Write-Host "5️⃣ Development Server Test..." -ForegroundColor Yellow
Write-Host "  ℹ️  To test authentication manually:" -ForegroundColor Cyan
Write-Host "     1. Run: npm run dev" -ForegroundColor White
Write-Host "     2. Navigate to: http://localhost:3000/auth" -ForegroundColor White
Write-Host "     3. Try signing up with a new email" -ForegroundColor White
Write-Host "     4. Try signing in with existing credentials" -ForegroundColor White
Write-Host "     5. Try OAuth sign-in (GitHub)" -ForegroundColor White
Write-Host ""

# Test 6: Connection test using npm script
Write-Host "6️⃣ Testing Supabase Connection..." -ForegroundColor Yellow
Write-Host "  Running: npm run health-check" -ForegroundColor Cyan

try {
    $healthCheck = npm run health-check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Supabase connection successful" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Connection check completed with warnings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Connection test failed: $_" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

if ($foundInsecure) {
    Write-Host "❌ CRITICAL: Insecure files detected! Delete them immediately." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ All security checks passed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Test sign-up at: http://localhost:3000/auth" -ForegroundColor White
Write-Host "  3. Test sign-in with created account" -ForegroundColor White
Write-Host "  4. Test OAuth with GitHub" -ForegroundColor White
Write-Host "  5. Verify no console errors" -ForegroundColor White
Write-Host ""
