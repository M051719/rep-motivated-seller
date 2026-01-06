# Apply Supabase Migrations via SQL API
# This script applies pending migrations using the Supabase SQL API

$projectRef = "ltxqodqlexvojqqxquew"
$supabaseUrl = "https://$projectRef.supabase.co"

# Read the service role key from .env files
$envFiles = @(".env.local", ".env", ".env.development")
$serviceRoleKey = $null

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        if ($content -match 'SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)') {
            $serviceRoleKey = $matches[1].Trim()
            Write-Host "Found service role key in $envFile"
            break
        }
    }
}

if (-not $serviceRoleKey) {
    Write-Host "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment files"
    Write-Host "Please add it to .env.development or .env file"
    Write-Host ""
    Write-Host "Get it from: https://supabase.com/dashboard/project/$projectRef/settings/api"
    exit 1
}

# Get pending migrations
$migrationsPath = "supabase\migrations"
$migrations = Get-ChildItem $migrationsPath -Filter "*.sql" | Where-Object { 
    $_.Name -notlike "*.skip*" -and 
    $_.Name -notlike "*.bak*" -and
    $_.Name -match '^\d{14}_.*\.sql$'
} | Sort-Object Name

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
    
    $sql = Get-Content $migration.FullName -Raw
    
    # Execute SQL via Supabase REST API
    $headers = @{
        "apikey"        = $serviceRoleKey
        "Authorization" = "Bearer $serviceRoleKey"
        "Content-Type"  = "application/json"
        "Prefer"        = "return=minimal"
    }
    
    $body = @{
        query = $sql
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "✓ Success" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try alternative approach: use PostgREST query
        try {
            Write-Host "  Trying alternative method..." -ForegroundColor Yellow
            
            # Split into individual statements
            $statements = $sql -split ';' | Where-Object { $_.Trim() -ne '' }
            
            foreach ($stmt in $statements) {
                $stmtTrimmed = $stmt.Trim()
                if ($stmtTrimmed) {
                    $body2 = @{
                        query = $stmtTrimmed + ';'
                    } | ConvertTo-Json
                    
                    $null = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body2 -ErrorAction Stop
                }
            }
            Write-Host "✓ Success (alternative method)" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "✗ Failed completely: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
            
            # Show response if available
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "  Response: $responseBody" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "================================"
Write-Host "Migration Summary:"
Write-Host "  Successful: $successCount"
Write-Host "  Failed: $failCount"
Write-Host "================================"
