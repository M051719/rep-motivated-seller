@echo off
echo Deploying ALL Edge Functions
echo ==========================

set PROJECT_REF=ltxqodqlexvojqqxquew
set FUNCTIONS_DIR=supabase\functions

echo.
echo Found these Edge Functions:
dir /b /ad "%FUNCTIONS_DIR%"

echo.
echo Press any key to test all functions...
pause > nul

echo.
echo Testing all functions...
echo.

for /d %%f in (%FUNCTIONS_DIR%\*) do (
  echo Testing %%~nxf...
  curl -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/%%~nxf" ^
    -H "Authorization: Bearer sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg" ^
    -H "Content-Type: application/json" ^
    -d "{\"action\":\"test\"}"
  echo.
  echo.
)

echo.
echo All functions tested.
echo.
pause