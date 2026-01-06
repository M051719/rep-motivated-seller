# Apply Supabase Migrations using psql
# This script applies pending migrations using psql with SSL

$projectRef = "ltxqodqlexvojqqxquew"
$dbHost = "db.$projectRef.supabase.co"
$port = 5432
$database = "postgres"
$user = "postgres"

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
}
catch {
    Write-Host "ERROR: psql not found. Please install PostgreSQL client tools."
    Write-Host "Download from: https://www.postgresql.org/download/windows/"
    exit 1
}

# Read the database password from environment
$envFiles = @(".env.local", ".env", ".env.development")
$dbPassword = $null

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        if ($content -match 'SUPABASE_DB_PASSWORD=([^\r\n]+)') {
            $dbPassword = $matches[1].Trim()
            Write-Host "Found DB password in $envFile"
            break
        }
        if ($content -match 'DB_PASSWORD=([^\r\n]+)') {
            $dbPassword = $matches[1].Trim()
            Write-Host "Found DB password in $envFile"
            break
        }
    }
}

if (-not $dbPassword) {
    Write-Host "ERROR: Database password not found in environment files"
    Write-Host "Please add SUPABASE_DB_PASSWORD to .env.development or .env file"
    Write-Host ""
    Write-Host "Get it from: https://supabase.com/dashboard/project/$projectRef/settings/database"
    Write-Host ""
    $dbPassword = Read-Host "Or enter the database password now" -AsSecureString
    $dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
}

# Set password environment variable for psql
$env:PGPASSWORD = $dbPassword

# Get pending migrations
$migrationsPath = "supabase\migrations"
$migrations = Get-ChildItem $migrationsPath -Filter "*.sql" | Where-Object { 
    $_.Name -notlike "*.skip*" -and 
    $_.Name -notlike "*.bak*" -and
    $_.Name -match '^\d{14}_.*\.sql$'
} | Sort-Object Name

Write-Host ""
Write-Host "Found $($migrations.Count) migrations to apply:"
foreach ($migration in $migrations) {
    Write-Host "  - $($migration.Name)"
}

Write-Host ""
$confirm = Read-Host "Apply these migrations? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Aborted"
    exit 0
}

# Apply each migration
$successCount = 0
$failCount = 0

foreach ($migration in $migrations) {
    Write-Host ""
    Write-Host "Applying $($migration.Name)..." -ForegroundColor Cyan
    
    $result = psql "postgresql://${user}:${dbPassword}@${dbHost}:${port}/${database}?sslmode=require" -f $migration.FullName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Success" -ForegroundColor Green
        $successCount++
    }
    else {
        Write-Host "✗ Failed" -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
        $failCount++
    }
}

# Clear password
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "================================"
Write-Host "Migration Summary:"
Write-Host "  Successful: $successCount"
Write-Host "  Failed: $failCount"
Write-Host "================================"
