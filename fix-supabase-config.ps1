param(
    [string]$ProjectPath = "C:\Users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller",
    [string]$ProjectId = "ltxqodqlexvojqqxquew"
)

Write-Host "🔧 Fixing Supabase Configuration..." -ForegroundColor Yellow

$configPath = Join-Path $ProjectPath "supabase\config.toml"

# Backup existing config
if (Test-Path $configPath) {
    $backupPath = Join-Path $ProjectPath "supabase\config.toml.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $configPath $backupPath
    Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
}

# Update project_id in existing config
if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw
    $updatedContent = $content -replace 'project_id = "rep-motivated-seller"', "project_id = `"$ProjectId`""

    # Remove unsupported config sections
    $unsupportedSections = @(
        'db\.migrations\].*?(?=\[|\z)',
        'db\.network_restrictions\].*?(?=\[|\z)',
        'auth\.rate_limit\].*?(?=\[|\z)',
        'auth\.web3\.solana\].*?(?=\[|\z)',
        'auth\.third_party\.(clerk|firebase|auth0|aws_cognito)\].*?(?=\[|\z)',
        'auth\.oauth_server\].*?(?=\[|\z)'
    )

    foreach ($section in $unsupportedSections) {
        $updatedContent = $updatedContent -replace "(?ms)\[$section", ""
    }

    Set-Content -Path $configPath -Value $updatedContent -Encoding UTF8
    Write-Host "✅ Configuration updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Config file not found at: $configPath" -ForegroundColor Red
    exit 1
}

# Validate configuration
Write-Host "`n🔍 Validating configuration..." -ForegroundColor Cyan

Set-Location $ProjectPath

try {
    $result = supabase status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Configuration is valid!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Configuration may need adjustment: $result" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not validate configuration: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Configuration fix completed!" -ForegroundColor Green
Write-Host "You can now run: supabase start" -ForegroundColor Cyan
