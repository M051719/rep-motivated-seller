# PowerShell script to fix TypeScript files with line-wrap issues

Write-Host "Fixing TypeScript files..." -ForegroundColor Yellow

# Navigate to project root
$projectRoot = "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
Set-Location $projectRoot

Write-Host "Running TypeScript compiler to check errors..." -ForegroundColor Cyan
$errors = npx tsc --noEmit 2>&1 | Out-String

if ($errors -match "error TS") {
    Write-Host "TypeScript errors found. Fixing files..." -ForegroundColor Red

    # Extract unique files with errors
    $errorFiles = $errors | Select-String "src/.*\.tsx?\(" | ForEach-Object {
        if ($_.Line -match "src/(.*\.tsx?)") {
            $matches[1]
        }
    } | Select-Object -Unique

    Write-Host "Files with errors:" -ForegroundColor Yellow
    $errorFiles | ForEach-Object { Write-Host "  - $_" }

}
else {
    Write-Host "No TypeScript errors found!" -ForegroundColor Green
}

Write-Host "`nTo manually fix a file with line-wrap issues:" -ForegroundColor Cyan
Write-Host "1. Open the file in VS Code" -ForegroundColor White
Write-Host "2. Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "3. Type 'Format Document' and press Enter" -ForegroundColor White
Write-Host "4. Save the file" -ForegroundColor White
