@echo off
echo Test Deployed Edge Functions
echo ==========================

set PROJECT_REF=ltxqodqlexvojqqxquew
set ANON_KEY=sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg

echo.
echo Available Edge Functions:
echo 1. admin-dashboard
echo 2. schedule-property-followup
echo 3. send-notification-email
echo 4. test-secrets
echo 5. Custom function name
echo.

set /p CHOICE=Select function to test (1-5): 

if "%CHOICE%"=="1" (
  set FUNCTION_NAME=admin-dashboard
  set TEST_PAYLOAD={\"action\":\"summary\"}
) else if "%CHOICE%"=="2" (
  set FUNCTION_NAME=schedule-property-followup
  set TEST_PAYLOAD={\"submissionId\":1,\"scheduleType\":\"standard\"}
) else if "%CHOICE%"=="3" (
  set FUNCTION_NAME=send-notification-email
  set TEST_PAYLOAD={\"type\":\"test\"}
) else if "%CHOICE%"=="4" (
  set FUNCTION_NAME=test-secrets
  set TEST_PAYLOAD={}
) else if "%CHOICE%"=="5" (
  set /p FUNCTION_NAME=Enter function name: 
  set TEST_PAYLOAD={\"action\":\"test\"}
) else (
  echo Invalid choice. Exiting.
  pause
  exit /b 1
)

echo.
echo Testing function %FUNCTION_NAME%...
echo Using payload: %TEST_PAYLOAD%
echo.

curl -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/%FUNCTION_NAME%" ^
  -H "Authorization: Bearer %ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "%TEST_PAYLOAD%"

echo.
echo.
echo Function test complete.
echo.
pause