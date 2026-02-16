@echo off
echo Test Single Edge Function
echo ======================

set PROJECT_REF=ltxqodqlexvojqqxquew
set ANON_KEY=sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg

echo.
echo Available Edge Functions:
dir /b /ad "supabase\functions"

echo.
set /p FUNCTION_NAME=Enter function name to test:

if not exist "supabase\functions\%FUNCTION_NAME%" (
  echo Function %FUNCTION_NAME% not found!
  pause
  exit /b 1
)

echo.
echo Enter your Supabase login credentials:
set /p EMAIL=Email:
set /p PASSWORD=Password:

echo.
echo Logging in...
echo.

curl -s -X POST "https://%PROJECT_REF%.supabase.co/auth/v1/token?grant_type=password" ^
  -H "apikey: %ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}" > token.json

echo.
echo Extracting access token...
for /f "tokens=2 delims=:," %%a in ('type token.json ^| findstr "access_token"') do (
  set TOKEN=%%a
)

set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%

echo.
echo Access token: %TOKEN:~0,10%...

echo.
echo Testing function %FUNCTION_NAME%...
echo.

curl -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/%FUNCTION_NAME%" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"test\"}"

echo.
echo.
echo Function test complete.
echo.
del token.json
pause
