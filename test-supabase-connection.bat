@echo off
echo ================================================
echo Supabase Connection Test
echo Project: ltxqodqlexvojqqxquew
echo ================================================
echo.

REM Your password (URL-encoded for connection strings)
SET DB_PASSWORD=Medtronic%%40007%%24

echo [1/5] Testing Direct Connection (Port 5432)...
echo.
psql "postgresql://postgres:%DB_PASSWORD%@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require" -c "SELECT 'Direct Connection: SUCCESS' as status, current_database(), current_user, version();"
if errorlevel 1 (
    echo ❌ Direct connection failed
    echo Trying alternate method...
) else (
    echo ✅ Direct connection successful!
)
echo.

echo [2/5] Testing Pooled Connection (Port 6543)...
echo.
psql "postgresql://postgres:%DB_PASSWORD%@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require" -c "SELECT 'Pooled Connection: SUCCESS' as status, current_database(), current_user;"
if errorlevel 1 (
    echo ❌ Pooled connection failed
) else (
    echo ✅ Pooled connection successful!
)
echo.

echo [3/5] Testing AWS Shared Pooler (Port 6543)...
echo.
psql "postgresql://postgres.ltxqodqlexvojqqxquew:%DB_PASSWORD%@aws-0-us-east-2.pooler.supabase.com:6543/postgres" -c "SELECT 'AWS Pooler: SUCCESS' as status, current_database(), current_user;"
if errorlevel 1 (
    echo ❌ AWS pooler connection failed
    echo Note: This might require IPv4 addon or different network
) else (
    echo ✅ AWS pooler connection successful!
)
echo.

echo [4/5] Testing Supabase Client Connection...
echo.
curl -X POST https://ltxqodqlexvojqqxquew.supabase.co/rest/v1/rpc/version ^
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM"
echo.

echo [5/5] Creating persistent connection test...
echo.
psql "postgresql://postgres:%DB_PASSWORD%@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require" -c "SELECT pg_sleep(5); SELECT 'Persistent connection maintained for 5 seconds' as status;"
echo.

echo ================================================
echo Connection Test Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Check which connection methods succeeded above
echo 2. Update your .env files with working connection string
echo 3. Start your application: npm run dev
echo 4. Check Supabase Dashboard - should show "Connected"
echo.
pause
