param(
    [string]$ProjectPath = "C:\Users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller",
    [string]$ProjectRef = "ltxqodqlexvojqqxquew"
)

Write-Host "🔧 Fixing Supabase Pooler Connection..." -ForegroundColor Yellow

$supabaseDir = Join-Path $ProjectPath "supabase"
$tempDir = Join-Path $supabaseDir ".temp"

# Ensure .temp directory exists
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force
}

# Create correct pooler URL with SSL
$poolerUrl = "postgresql://postgres.${ProjectRef}:PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
$poolerUrlFile = Join-Path $tempDir "pooler-url"

Set-Content -Path $poolerUrlFile -Value $poolerUrl -Encoding UTF8
Write-Host "✅ Pooler URL updated with SSL requirement" -ForegroundColor Green

# Create SSL configuration
$sslConfigPath = Join-Path $tempDir "ssl-config"
$sslConfig = @"
sslmode=require
sslrootcert=
sslcert=
sslkey=
"@

Set-Content -Path $sslConfigPath -Value $sslConfig -Encoding UTF8
Write-Host "✅ SSL configuration created" -ForegroundColor Green