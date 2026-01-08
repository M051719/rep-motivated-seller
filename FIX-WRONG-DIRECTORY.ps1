# ==============================================================================
# FIX WRONG DIRECTORY - Move files from mcp-api-gateway to rep-motivated-seller
# ==============================================================================
# Created: January 8, 2026
# Purpose: Fix AI mistake of creating files in wrong directory
# ==============================================================================

$ErrorActionPreference = "Stop"

# Define paths
$wrongDir = "c:\Users\monte\Documents\cert api token keys ids\GITHUB FOLDER\GitHub\mcp-api-gateway"
$correctDir = "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "FIXING WRONG DIRECTORY PLACEMENT" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WRONG DIR: $wrongDir" -ForegroundColor Red
Write-Host "CORRECT DIR: $correctDir" -ForegroundColor Green
Write-Host ""

# Verify directories exist
if (-not (Test-Path $wrongDir)) {
    Write-Host "ERROR: Wrong directory does not exist!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $correctDir)) {
    Write-Host "ERROR: Correct directory does not exist!" -ForegroundColor Red
    exit 1
}

# Define what to copy
$itemsToMove = @(
    @{Source = "migrations"; Dest = "supabase/migrations"; Type = "Merge" },
    @{Source = "seeds"; Dest = "supabase/seeds"; Type = "Merge" },
    @{Source = "scripts"; Dest = "scripts"; Type = "Merge" },
    @{Source = "docs"; Dest = "docs"; Type = "Merge" },
    @{Source = "src"; Dest = "src"; Type = "Selective" },
    @{Source = "components"; Dest = "src/components"; Type = "Selective" }
)

# Create log
$logFile = Join-Path $correctDir "MIGRATION-LOG-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
"Migration started: $(Get-Date)" | Out-File $logFile

Write-Host "Step 1: Analyzing files to move..." -ForegroundColor Yellow
Write-Host ""

$totalFiles = 0
$movedFiles = 0
$skippedFiles = 0

foreach ($item in $itemsToMove) {
    $sourcePath = Join-Path $wrongDir $item.Source
    $destPath = Join-Path $correctDir $item.Dest
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "  [SKIP] $($item.Source) - does not exist in wrong directory" -ForegroundColor DarkGray
        continue
    }
    
    Write-Host "  [FOUND] $($item.Source) -> $($item.Dest)" -ForegroundColor Cyan
    
    # Ensure destination directory exists
    if (-not (Test-Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        Write-Host "    Created directory: $destPath" -ForegroundColor Green
    }
    
    # Get all files in source
    $files = Get-ChildItem -Path $sourcePath -Recurse -File
    $totalFiles += $files.Count
    
    Write-Host "    Found $($files.Count) files" -ForegroundColor White
    
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($sourcePath.Length + 1)
        $targetFile = Join-Path $destPath $relativePath
        $targetDir = Split-Path $targetFile -Parent
        
        # Create target directory if needed
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        
        # Check if file already exists
        if (Test-Path $targetFile) {
            $sourceHash = (Get-FileHash $file.FullName -Algorithm SHA256).Hash
            $targetHash = (Get-FileHash $targetFile -Algorithm SHA256).Hash
            
            if ($sourceHash -eq $targetHash) {
                Write-Host "      [SKIP] $relativePath - identical file exists" -ForegroundColor DarkGray
                $skippedFiles++
                "SKIPPED (identical): $relativePath" | Out-File $logFile -Append
            }
            else {
                # Create backup of existing file
                $backupFile = "$targetFile.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                Copy-Item $targetFile $backupFile
                Write-Host "      [BACKUP] $relativePath -> .backup" -ForegroundColor Yellow
                
                # Copy new file
                Copy-Item $file.FullName $targetFile -Force
                Write-Host "      [OVERWRITE] $relativePath" -ForegroundColor Magenta
                $movedFiles++
                "OVERWROTE (backed up): $relativePath" | Out-File $logFile -Append
            }
        }
        else {
            # Copy new file
            Copy-Item $file.FullName $targetFile -Force
            Write-Host "      [COPY] $relativePath" -ForegroundColor Green
            $movedFiles++
            "COPIED: $relativePath" | Out-File $logFile -Append
        }
    }
    
    Write-Host ""
}

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "MIGRATION COMPLETE" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files analyzed: $totalFiles" -ForegroundColor White
Write-Host "Files moved/copied: $movedFiles" -ForegroundColor Green
Write-Host "Files skipped: $skippedFiles" -ForegroundColor Yellow
Write-Host ""
Write-Host "Log file: $logFile" -ForegroundColor Cyan
Write-Host ""

# Now check migrations in correct directory
Write-Host "Step 2: Verifying migrations in correct directory..." -ForegroundColor Yellow
$migrationsDir = Join-Path $correctDir "supabase\migrations"
if (Test-Path $migrationsDir) {
    $migrations = Get-ChildItem $migrationsDir -Filter "*.sql" | Sort-Object Name
    Write-Host "Found $($migrations.Count) migration files:" -ForegroundColor Green
    foreach ($mig in $migrations) {
        Write-Host "  ✓ $($mig.Name)" -ForegroundColor Green
    }
}
else {
    Write-Host "WARNING: No migrations directory found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Next actions required:" -ForegroundColor Yellow
Write-Host "  1. Review migration log: $logFile" -ForegroundColor White
Write-Host "  2. Verify all files are in correct locations" -ForegroundColor White
Write-Host "  3. Run: supabase db reset (to apply migrations)" -ForegroundColor White
Write-Host "  4. Delete wrong directory after verification: $wrongDir" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
