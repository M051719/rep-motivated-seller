@echo off
echo Testing admin-dashboard function...

set PROJECT_REF=ltxqodqlexvojqqxquew
set SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk3NTc1MCwiZXhwIjoyMDA1NTUxNzUwfQ.Rl_0RZCnxQHvGFzQVxXdYgHWtgdTxj-Ot-uf-XnEkwE

echo.
echo 1. Get summary data
echo 2. Get recent submissions
echo 3. Get upcoming followups
echo 4. Get performance metrics
echo.
set /p CHOICE=Select action (1-4): 

if "%CHOICE%"=="1" (
  set ACTION=summary
) else if "%CHOICE%"=="2" (
  set ACTION=recent_submissions
) else if "%CHOICE%"=="3" (
  set ACTION=upcoming_followups
) else if "%CHOICE%"=="4" (
  set ACTION=performance_metrics
) else (
  echo Invalid choice
  pause
  exit /b 1
)

echo.
echo Testing with action: %ACTION%
echo.

curl -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/admin-dashboard" ^
  -H "Authorization: Bearer %SERVICE_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"%ACTION%\"}"

echo.
echo.
pause