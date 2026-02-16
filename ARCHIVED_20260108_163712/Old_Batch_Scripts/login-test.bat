@echo off
echo Login and Test Edge Functions
echo ===========================

set PROJECT_REF=ltxqodqlexvojqqxquew
set ANON_KEY=sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg

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
echo Press any key to test functions with this token...
pause > nul

echo.
echo Testing functions with valid token...
echo.

for /d %%f in (supabase\functions\*) do (
  echo Testing %%~nxf...
  curl -s -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/%%~nxf" ^
    -H "Authorization: Bearer %TOKEN%" ^
    -H "Content-Type: application/json" ^
    -d "{\"action\":\"test\"}"
  echo.
  echo.
)

echo.
echo All functions tested.
echo.
del token.json
pause
