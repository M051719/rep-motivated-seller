#!/usr/bin/env pwsh
# Cleanup Preview - Shows what will be removed without actually removing

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "              🔍 Cleanup Preview (Dry Run)                      " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$toClean = @{
    "🗄️  Large Unused Directories (535+ MB)" = @(
        "repmotivatedsellershoprealestatespaceorg"
        "expo-user-management"
        "welcome-to-docker"
    )
    "📦 Old Backup Directories" = @(
        "backups\*20250720*"
        "backups\*20250727*"
        "pre_upgrade_backups"
    )
    "🔧 Old Configuration" = @(
        "etc"
        "netlify.toml"
        "nginx.conf.txt"
    )
    "📄 Duplicate Documentation (~25 files)" = @(
        "*CLOUDFLARE*FIX*.md"
        "*DEPLOYMENT*REPORT*.md"
        "*MIGRATION*FIX*.md"
    )
    "⚙️  Old Batch Scripts (~30 files)" = @(
        "*-test.bat"
        "*deploy*.bat"
        "login*.bat"
        "view-*.bat"
    )
    "🌐 Old HTML Test Files (~15 files)" = @(
        "*-test.html"
        "admin-*.html"
        "view-*.html"
    )
}

$totalSize = 0
$totalFiles = 0

foreach ($category in $toClean.Keys) {
    Write-Host $category -ForegroundColor Yellow
    $items = @()
    
    foreach ($pattern in $toClean[$category]) {
        $found = Get-ChildItem $pattern -ErrorAction SilentlyContinue -Recurse:$false
        if ($found) {
            $items += $found
        }
    }
    
    if ($items.Count -gt 0) {
        foreach ($item in $items) {
            $size = if ($item.PSIsContainer) {
                (Get-ChildItem $item.FullName -Recurse -File -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum).Sum / 1MB
            } else {
                $item.Length / 1MB
            }
            
            $sizeStr = if ($size -gt 1) { "{0:N1} MB" -f $size } else { "{0:N0} KB" -f ($size * 1024) }
            $totalSize += $size
            $totalFiles++
            
            Write-Host ("  ├─ {0,-50} {1,10}" -f $item.Name, $sizeStr) -ForegroundColor Gray
        }
    } else {
        Write-Host "  └─ No items found" -ForegroundColor DarkGray
    }
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ("  📊 Total Items: {0}" -f $totalFiles) -ForegroundColor White
Write-Host ("  💾 Total Size: {0:N1} MB" -f $totalSize) -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "✅ Files/folders that will be KEPT:" -ForegroundColor Green
$keep = @(
    "README.md, package.json, GITHUB_ACTIONS_SETUP.md"
    "CREDIT_REPAIR_*.md, FEATURE_ROADMAP.md"
    "src/, supabase/, node_modules/, .git/, .github/"
    "scan-secrets.ps1, cleanup-project.ps1"
)
$keep | ForEach-Object { Write-Host "  • $_" -ForegroundColor White }

Write-Host "`n🚀 Ready to proceed?" -ForegroundColor Yellow
Write-Host "  Run: .\cleanup-project.ps1" -ForegroundColor Cyan
Write-Host ""
