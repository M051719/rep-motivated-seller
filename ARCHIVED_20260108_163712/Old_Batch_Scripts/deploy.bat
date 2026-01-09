@echo off
echo Simple Edge Function Deployment
echo ==============================

set PROJECT_REF=ltxqodqlexvojqqxquew
set FUNCTIONS_DIR=supabase\functions

echo.
echo Available Edge Functions:
dir /b /ad "%FUNCTIONS_DIR%"

echo.
set /p FUNCTION_NAME=Enter function name to deploy: 

if not exist "%FUNCTIONS_DIR%\%FUNCTION_NAME%" (
  echo Function %FUNCTION_NAME% not found!
  pause
  exit /b 1
)

echo.
echo Deploying %FUNCTION_NAME%...
echo.

cd "%FUNCTIONS_DIR%\%FUNCTION_NAME%"
echo Function code:
type index.ts

echo.
echo Function %FUNCTION_NAME% is ready for manual deployment.
echo.
echo To test the function, use:
echo curl -X POST "https://%PROJECT_REF%.supabase.co/functions/v1/%FUNCTION_NAME%" -H "Content-Type: application/json" -d "{\"action\":\"test\"}"
echo.
pause