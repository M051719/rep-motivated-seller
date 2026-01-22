# ===================================================================
# Security Verification Script
# ===================================================================
# Scans codebase for:
# - Hardcoded passwords and credentials
# - Exposed API keys and tokens
# - Service role keys in frontend code
# - Unencrypted .env files in git
# ===================================================================

Write-Host "🔒 Security Verification Scan" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Initialize results
$issuesFound = 0
$criticalIssues = @()

# Test 1: Check for hardcoded passwords
Write-Host "1️⃣ Scanning for Hardcoded Passwords..." -ForegroundColor Yellow

$passwordPatterns = @(
    "password\s*[:=]\s*['\"][^'\"]{3,}['\"]",
    "pwd\s*[:=]\s*['\"][^'\"]{3,}['\"]",
    "passwd\s*[:=]\s*['\"][^'\"]{3,}['\"]"
)

foreach ($pattern in $passwordPatterns) {
    $matches = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
        Select-String -Pattern $pattern -CaseSensitive
    
    if ($matches) {
        Write-Host "  ⚠️  Potential hardcoded passwords found:" -ForegroundColor Yellow
        foreach ($match in $matches) {
            Write-Host "    - $($match.Path):$($match.LineNumber)" -ForegroundColor Red
            $issuesFound++
            $criticalIssues += "Hardcoded password at $($match.Path):$($match.LineNumber)"
        }
    }
}

if ($issuesFound -eq 0) {
    Write-Host "  ✅ No hardcoded passwords detected" -ForegroundColor Green
}

Write-Host ""

# Test 2: Check for API keys in source code
Write-Host "2️⃣ Scanning for Hardcoded API Keys..." -ForegroundColor Yellow

$apiKeyPatterns = @(
    "api[_-]?key\s*[:=]\s*['\"][^'\"]{10,}['\"]",
    "apikey\s*[:=]\s*['\"][^'\"]{10,}['\"]",
    "secret[_-]?key\s*[:=]\s*['\"][^'\"]{10,}['\"]"
)

$beforeCount = $issuesFound
foreach ($pattern in $apiKeyPatterns) {
    $matches = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
        Select-String -Pattern $pattern -CaseSensitive
    
    if ($matches) {
        foreach ($match in $matches) {
            # Skip if it's using environment variables
            if ($match.Line -notmatch "import\.meta\.env\." -and $match.Line -notmatch "process\.env\.") {
                Write-Host "  ⚠️  Potential hardcoded API key at $($match.Path):$($match.LineNumber)" -ForegroundColor Red
                $issuesFound++
                $criticalIssues += "Hardcoded API key at $($match.Path):$($match.LineNumber)"
            }
        }
    }
}

if ($issuesFound -eq $beforeCount) {
    Write-Host "  ✅ No hardcoded API keys detected" -ForegroundColor Green
}

Write-Host ""

# Test 3: Check for service role keys in frontend
Write-Host "3️⃣ Scanning for Service Role Keys in Frontend..." -ForegroundColor Yellow

$serviceRolePattern = "service[_-]?role"
$srcMatches = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
    Select-String -Pattern $serviceRolePattern -CaseSensitive

$beforeCount = $issuesFound
if ($srcMatches) {
    foreach ($match in $srcMatches) {
        # Skip comments and type definitions
        if ($match.Line -notmatch "^\s*//" -and $match.Line -notmatch "^\s*\*") {
            Write-Host "  ⚠️  Service role reference in frontend at $($match.Path):$($match.LineNumber)" -ForegroundColor Red
            $issuesFound++
            $criticalIssues += "Service role key in frontend at $($match.Path):$($match.LineNumber)"
        }
    }
}

if ($issuesFound -eq $beforeCount) {
    Write-Host "  ✅ No service role keys in frontend code" -ForegroundColor Green
}

Write-Host ""

# Test 4: Check for .env files in git
Write-Host "4️⃣ Checking for .env Files in Git..." -ForegroundColor Yellow

$gitTracked = git ls-files | Select-String -Pattern "^\.env$|^\.env\.local$|^\.env\.production$"

if ($gitTracked) {
    foreach ($file in $gitTracked) {
        Write-Host "  ❌ CRITICAL: $file is tracked by git!" -ForegroundColor Red
        $issuesFound++
        $criticalIssues += "$file is tracked in git"
    }
} else {
    Write-Host "  ✅ No sensitive .env files tracked in git" -ForegroundColor Green
}

Write-Host ""

# Test 5: Check for insecure files
Write-Host "5️⃣ Checking for Known Insecure Files..." -ForegroundColor Yellow

$insecureFiles = @(
    "src/utils/auth.js",
    "src/lib/supabase.js",
    "src/lib/supabase-env.js"
)

$beforeCount = $issuesFound
foreach ($file in $insecureFiles) {
    if (Test-Path $file) {
        Write-Host "  ❌ CRITICAL: $file still exists!" -ForegroundColor Red
        $issuesFound++
        $criticalIssues += "$file contains hardcoded credentials"
    }
}

if ($issuesFound -eq $beforeCount) {
    Write-Host "  ✅ All known insecure files removed" -ForegroundColor Green
}

Write-Host ""

# Test 6: Check for JWT tokens
Write-Host "6️⃣ Scanning for Hardcoded JWT Tokens..." -ForegroundColor Yellow

$jwtPattern = "eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*"
$jwtMatches = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
    Select-String -Pattern $jwtPattern

$beforeCount = $issuesFound
if ($jwtMatches) {
    foreach ($match in $jwtMatches) {
        Write-Host "  ⚠️  Potential JWT token at $($match.Path):$($match.LineNumber)" -ForegroundColor Red
        $issuesFound++
        $criticalIssues += "JWT token at $($match.Path):$($match.LineNumber)"
    }
}

if ($issuesFound -eq $beforeCount) {
    Write-Host "  ✅ No hardcoded JWT tokens detected" -ForegroundColor Green
}

Write-Host ""

# Test 7: Verify .gitignore
Write-Host "7️⃣ Verifying .gitignore Configuration..." -ForegroundColor Yellow

if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    
    $requiredPatterns = @(".env", ".env.local", ".env.production", "*.key", "*.pem")
    $missingPatterns = @()
    
    foreach ($pattern in $requiredPatterns) {
        if ($gitignore -notmatch [regex]::Escape($pattern)) {
            $missingPatterns += $pattern
        }
    }
    
    if ($missingPatterns.Count -gt 0) {
        Write-Host "  ⚠️  Missing patterns in .gitignore:" -ForegroundColor Yellow
        foreach ($pattern in $missingPatterns) {
            Write-Host "    - $pattern" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✅ .gitignore properly configured" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ .gitignore file not found!" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 Security Scan Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if ($issuesFound -eq 0) {
    Write-Host "✅ No security issues detected!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your codebase appears secure. Good job! 🎉" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Found $issuesFound security issue(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Critical Issues:" -ForegroundColor Red
    foreach ($issue in $criticalIssues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "⚠️  Action Required:" -ForegroundColor Yellow
    Write-Host "  1. Remove all hardcoded credentials" -ForegroundColor White
    Write-Host "  2. Move sensitive data to .env files" -ForegroundColor White
    Write-Host "  3. Ensure .env files are in .gitignore" -ForegroundColor White
    Write-Host "  4. Rotate any exposed API keys" -ForegroundColor White
    Write-Host "  5. Review git history for leaked secrets" -ForegroundColor White
    Write-Host ""
    exit 1
}
