#!/usr/bin/env pwsh
# Project Cleanup Script - Consolidates old files and directories

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🧹 Project Cleanup & Consolidation Tool            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveRoot = ".\ARCHIVED_$timestamp"

# Define cleanup categories
$cleanupPlan = @{
    "Massive Unused Directories"  = @(
        "expo-user-management"                       # 242 MB - React Native/Expo (not relevant)
        "welcome-to-docker"                          # 0.68 MB - Docker tutorial files
    )
    
    "Old Backup Directories"      = @(
        "backups\20250720_*"
        "backups\20250727_*"
        "backups\scripts_*"
        "pre_upgrade_backups"
    )
    
    "Old Configuration Files"     = @(
        "etc"                    # nginx configs for old setup
        "netlify.toml"          # Not using Netlify
        "nginx.conf.txt"
        "manual-nginx-config.md"
    )
    
    "Duplicate/Old Documentation" = @(
        # Deployment guides (keep latest, archive old)
        "CLOUDFLARE_CACHE_REDIRECT_FIX.md"
        "CLOUDFLARE_REDIRECT_FIX.md"
        "CLOUDFLARE_SUBDOMAIN_CONFIG.md"
        "CLOUDFLARE_SUCCESS_REPORT.md"
        "CSP_FIX_GUIDE.md"
        "DEPLOYMENT-STATUS-REPORT.md"
        "DEPLOYMENT_SUCCESS_REPORT.md"
        "FINAL_DEPLOYMENT_STATUS.md"
        "REDIRECT_TROUBLESHOOTING.md"
        "cloudflare-csp-setup.md"
        
        # Old migration docs
        "SMS_MIGRATION_FIX_SUMMARY.md"
        "SMS_MIGRATION_FINAL_FIX.md"
        "APPLY_SMS_MIGRATION.md"
        "MIGRATION_FIX_SUMMARY.md"
        
        # Superseded deployment guides
        "DEPLOYMENT_SUCCESS_REPORT.md"
        "SMS_DEPLOYMENT_SUCCESS.md"
        "SMS_MONITORING_DEPLOYMENT_COMPLETE.md"
    )
    
    "Old Batch Scripts"           = @(
        "auth-test.bat"
        "backup-and-deploy.bat"
        "build-and-deploy-react.bat"
        "deploy.bat"
        "deploy-all.bat"
        "download-function.bat"
        "fix-and-deploy.bat"
        "login-test.bat"
        "login.bat"
        "open-html.bat"
        "quick-deploy.bat"
        "run-test.bat"
        "simple-login.bat"
        "simple-test.bat"
        "start-dev-server.bat"
        "test-admin-dashboard.bat"
        "test-admin.bat"
        "test-form-submission.bat"
        "test-one.bat"
        "test.bat"
        "view-admin-dashboard.bat"
    )
    
    "Old HTML Test Files"         = @(
        "admin-dashboard-client.html"
        "admin-dashboard.html"
        "cloudflare-config-guide.html"
        "cloudflare-test.html"
        "complete-solution.html"
        "connection-test.html"
        "csp-test.html"
        "markdown-viewer.html"
        "minimal-test.html"
        "production-ready.html"
        "property-submission-form.html"
        "simple-test.html"
        "sitemap-visual.html"
        "supabase-test.html"
        "view-site-with-supabase.html"
        "view-site.html"
    )
}

# Files to KEEP (production/current)
$keepFiles = @(
    "README.md"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "vite.config.ts"
    "tailwind.config.js"
    ".gitignore"
    "QUICKSTART.md"
    
    # Current documentation
    "GITHUB_ACTIONS_SETUP.md"
    "CREDIT_REPAIR_INTEGRATION.md"
    "CREDIT_REPAIR_SUCCESS.md"
    "FEATURE_ROADMAP.md"
    "SESSION_NOTES.md"
    "PROJECT_STATUS_READY.md"
    
    # Current setup guides
    "SMS_COMPLIANCE_GUIDE.md"
    "SMS_MONITORING_SYSTEM_GUIDE.md"
    "TWILIO_TOLL_FREE_VERIFICATION.md"
    
    # Security - StackHawk
    "stackhawk.yml"
    "STACKHAWK_IMPLEMENTATION_COMPLETE.md"
    "STACKHAWK_VERIFICATION_GUIDE.md"
    "STACKHAWK_QUICKSTART.md"
    "STACKHAWK_STATUS_VERIFIED.md"
    "verify-stackhawk-implementation.ps1"
    
    # Security - Dotenvx
    "DOTENVX_SETUP_GUIDE.md"
    "DOTENVX_IMPLEMENTATION_COMPLETE.md"
    "setup-dotenvx.ps1"
    
    # Security - Snyk
    "SNYK_SETUP_COMPLETE.md"
    "SNYK_QUICK_START.md"
    
    # Security - API Key Rotation
    "API_KEY_ROTATION_CHECKLIST.md"
    "rotate-api-keys.ps1"
    
    # Security - General
    "scan-secrets.ps1"
    "security-cleanup.ps1"
    
    # Production directories
    "src"
    "supabase"
    "node_modules"
    ".git"
    ".github"
    "dist"
    "scripts"  # Keep scripts folder but can clean inside
    "docs"     # Keep docs folder (contains security docs)
)

Write-Host "📊 Cleanup Analysis:" -ForegroundColor Yellow
Write-Host "  • Large unused directories: 530+ MB" -ForegroundColor White
Write-Host "  • Old backup folders: ~50+ files" -ForegroundColor White
Write-Host "  • Duplicate documentation: ~25 files" -ForegroundColor White
Write-Host "  • Old test/batch files: ~40 files" -ForegroundColor White
Write-Host "`n💾 Estimated space recovery: ~535 MB`n" -ForegroundColor Green

$response = Read-Host "Proceed with cleanup? This will move old files to $archiveRoot (Y/N)"

if ($response -ne 'Y' -and $response -ne 'y') {
    Write-Host "`n❌ Cleanup cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🗂️  Creating archive directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $archiveRoot | Out-Null

$movedCount = 0
$errors = @()

foreach ($category in $cleanupPlan.Keys) {
    Write-Host "`n📁 Processing: $category" -ForegroundColor Yellow
    $categoryPath = Join-Path $archiveRoot $category.Replace(" ", "_").Replace("/", "_")
    New-Item -ItemType Directory -Force -Path $categoryPath | Out-Null
    
    foreach ($item in $cleanupPlan[$category]) {
        try {
            $matches = Get-Item $item -ErrorAction SilentlyContinue
            if ($matches) {
                foreach ($match in $matches) {
                    Write-Host "  Moving: $($match.Name)" -ForegroundColor Gray
                    Move-Item $match.FullName -Destination $categoryPath -Force
                    $movedCount++
                }
            }
        }
        catch {
            $errors += "Failed to move $item : $_"
        }
    }
}

# Create archive manifest
$manifest = @"
# Archive Manifest
Created: $(Get-Date)
Items Archived: $movedCount

## Categories Archived:
$($cleanupPlan.Keys | ForEach-Object { "- $_`n" })

## Recovery Instructions:
To restore any files, copy them back from this archive directory.
Files are organized by category for easy recovery.

## Safe to Delete:
After verifying production is working correctly, this entire archive
directory can be safely deleted to reclaim disk space.

"@

Set-Content -Path (Join-Path $archiveRoot "MANIFEST.md") -Value $manifest

Write-Host "`n✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "  📦 Moved $movedCount items to: $archiveRoot" -ForegroundColor White
Write-Host "  📄 Manifest created: $archiveRoot\MANIFEST.md" -ForegroundColor White

if ($errors.Count -gt 0) {
    Write-Host "`n⚠️  Errors encountered:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test your application: npm run dev" -ForegroundColor White
Write-Host "  2. Verify production build: npm run build" -ForegroundColor White
Write-Host "  3. If everything works, delete archive: Remove-Item '$archiveRoot' -Recurse" -ForegroundColor White
Write-Host "  4. Commit changes: git add . && git commit -m 'Cleanup old files'" -ForegroundColor White
Write-Host ""
