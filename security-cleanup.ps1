################################################################################
# SECURITY CLEANUP SCRIPT
# Created: January 6, 2026
# Purpose: Remove sensitive files from workspace and git history
################################################################################

Write-Host "`n🔒 SECURITY CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Ensure we're in the correct directory
$projectRoot = "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
Set-Location $projectRoot

################################################################################
# STEP 1: CREATE BACKUP OF .ENV FILES
################################################################################
Write-Host "`n📦 STEP 1: Creating backup of .env files..." -ForegroundColor Yellow

$backupDir = ".\SECURE_BACKUP_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$envFiles = Get-ChildItem -Filter ".env*" -File | Where-Object { $_.Name -ne ".env.example" }
Write-Host "   Found $($envFiles.Count) .env files to backup" -ForegroundColor White

foreach ($file in $envFiles) {
    Copy-Item $file.FullName -Destination "$backupDir\$($file.Name)" -Force
    Write-Host "   ✓ Backed up: $($file.Name)" -ForegroundColor Green
}

Write-Host "   ✅ Backup created at: $backupDir" -ForegroundColor Green

################################################################################
# STEP 2: CREATE BACKUP OF CERTIFICATE FILES
################################################################################
Write-Host "`n📦 STEP 2: Creating backup of certificate files..." -ForegroundColor Yellow

$certFiles = Get-ChildItem -Include "*.pem", "*.crt", "*.key" -File
Write-Host "   Found $($certFiles.Count) certificate files to backup" -ForegroundColor White

foreach ($file in $certFiles) {
    Copy-Item $file.FullName -Destination "$backupDir\$($file.Name)" -Force
    Write-Host "   ✓ Backed up: $($file.Name)" -ForegroundColor Green
}

Write-Host "   ✅ Certificates backed up" -ForegroundColor Green

################################################################################
# STEP 3: REMOVE .ENV FILES FROM WORKSPACE
################################################################################
Write-Host "`n🗑️  STEP 3: Removing .env files from workspace..." -ForegroundColor Yellow

foreach ($file in $envFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "   ✓ Deleted: $($file.Name)" -ForegroundColor Green
}

Write-Host "   ✅ All .env files removed (except .env.example)" -ForegroundColor Green

################################################################################
# STEP 4: REMOVE CERTIFICATE FILES FROM WORKSPACE
################################################################################
Write-Host "`n🗑️  STEP 4: Removing certificate files from workspace..." -ForegroundColor Yellow

foreach ($file in $certFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "   ✓ Deleted: $($file.Name)" -ForegroundColor Green
}

Write-Host "   ✅ All certificate files removed" -ForegroundColor Green

################################################################################
# STEP 5: CLEAN GIT HISTORY
################################################################################
Write-Host "`n🧹 STEP 5: Cleaning .env.development from git history..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor White

# Check if git-filter-repo is available
$filterRepoAvailable = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if ($filterRepoAvailable) {
    # Use git-filter-repo (faster and safer)
    Write-Host "   Using git-filter-repo..." -ForegroundColor Cyan
    git filter-repo --path .env.development --invert-paths --force
}
else {
    # Fallback to filter-branch
    Write-Host "   Using git filter-branch..." -ForegroundColor Cyan
    Write-Host "   (Install git-filter-repo for faster cleanup: pip install git-filter-repo)" -ForegroundColor Gray
    
    git filter-branch --force --index-filter `
        "git rm --cached --ignore-unmatch .env.development" `
        --prune-empty --tag-name-filter cat -- --all
}

Write-Host "   ✅ Git history cleaned" -ForegroundColor Green

################################################################################
# STEP 6: GARBAGE COLLECT
################################################################################
Write-Host "`n🗑️  STEP 6: Running git garbage collection..." -ForegroundColor Yellow

git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "   ✅ Git repository optimized" -ForegroundColor Green

################################################################################
# STEP 7: VERIFY CLEANUP
################################################################################
Write-Host "`n✅ STEP 7: Verifying cleanup..." -ForegroundColor Yellow

$remainingEnvFiles = Get-ChildItem -Filter ".env*" -File | Where-Object { $_.Name -ne ".env.example" }
$remainingCertFiles = Get-ChildItem -Include "*.pem", "*.crt", "*.key" -File

Write-Host "   .env files remaining: $($remainingEnvFiles.Count)" -ForegroundColor $(if ($remainingEnvFiles.Count -eq 0) { "Green" } else { "Red" })
Write-Host "   Certificate files remaining: $($remainingCertFiles.Count)" -ForegroundColor $(if ($remainingCertFiles.Count -eq 0) { "Green" } else { "Red" })

################################################################################
# COMPLETION SUMMARY
################################################################################
Write-Host "`n" -NoNewline
Write-Host "🎉 CLEANUP COMPLETE!" -ForegroundColor Green -BackgroundColor Black
Write-Host "=" * 70 -ForegroundColor Green

Write-Host "`n📋 NEXT STEPS (CRITICAL):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. FORCE PUSH TO REMOTE (removes history from GitHub):" -ForegroundColor White
Write-Host "   git push origin --force --all" -ForegroundColor Cyan
Write-Host "   git push origin --force --tags" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. ROTATE ALL EXPOSED API KEYS:" -ForegroundColor White
Write-Host "   ✓ Supabase API keys (anon, service_role)" -ForegroundColor Gray
Write-Host "   ✓ Calendly API token" -ForegroundColor Gray
Write-Host "   ✓ Dappier API key" -ForegroundColor Gray
Write-Host "   ✓ Stripe API keys (publishable, secret)" -ForegroundColor Gray
Write-Host "   ✓ PayPal client ID and secret" -ForegroundColor Gray
Write-Host "   ✓ Cloudflare API tokens" -ForegroundColor Gray
Write-Host "   ✓ GitHub tokens" -ForegroundColor Gray
Write-Host ""
Write-Host "3. SET UP ENVIRONMENT VARIABLES:" -ForegroundColor White
Write-Host "   • Use Azure Key Vault, AWS Secrets Manager, or 1Password" -ForegroundColor Gray
Write-Host "   • Never commit .env files again" -ForegroundColor Gray
Write-Host "   • Use .env.example as template only" -ForegroundColor Gray
Write-Host ""
Write-Host "4. YOUR BACKUP LOCATION:" -ForegroundColor White
Write-Host "   $backupDir" -ForegroundColor Cyan
Write-Host "   (Store this in a secure location, then delete from workspace)" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  WARNING: Your team members must re-clone the repository!" -ForegroundColor Red
Write-Host "   (git history rewrite requires fresh clone)" -ForegroundColor Red
Write-Host ""
