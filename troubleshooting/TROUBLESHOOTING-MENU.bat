@echo off
:menu
cls
echo ========================================
echo TROUBLESHOOTING MENU
echo RepMotivatedSeller - Diagnostic Tools
echo ========================================
echo.
echo Select troubleshooting option:
echo.
echo 1. Complete System Diagnostic
echo 2. Nginx Issues
echo 3. SSL Certificate Issues
echo 4. Supabase Functions Issues
echo 5. Twilio Integration Issues
echo 6. Cloudflare Issues
echo 7. Port Conflicts
echo 8. Authentication Issues
echo 9. View All Logs
echo 0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto diagnostic
if "%choice%"=="2" goto nginx
if "%choice%"=="3" goto ssl
if "%choice%"=="4" goto supabase
if "%choice%"=="5" goto twilio
if "%choice%"=="6" goto cloudflare
if "%choice%"=="7" goto ports
if "%choice%"=="8" goto auth
if "%choice%"=="9" goto logs
if "%choice%"=="0" goto exit
goto menu

:diagnostic
echo Running complete system diagnostic...
call SYSTEM-DIAGNOSTIC.bat
pause
goto menu

:nginx
echo Nginx troubleshooting options:
echo 1. Check Nginx status
echo 2. Fix Nginx configuration
echo 3. Restart Nginx
echo 4. Check Nginx permissions
set /p nginx_choice="Enter choice: "
if "%nginx_choice%"=="1" call NGINX-DIAGNOSTIC.bat
if "%nginx_choice%"=="2" call ..\scripts\fix-nginx-complete.bat
if "%nginx_choice%"=="3" call ..\scripts\restart-nginx.bat
if "%nginx_choice%"=="4" call ..\scripts\check-nginx-permissions.bat
pause
goto menu

:ssl
echo SSL troubleshooting options:
echo 1. Check SSL certificates
echo 2. Fix SSL configuration
echo 3. Test SSL connection
set /p ssl_choice="Enter choice: "
if "%ssl_choice%"=="1" call SSL-DIAGNOSTIC.bat
if "%ssl_choice%"=="2" call ..\scripts\fix-ssl-paths.bat
if "%ssl_choice%"=="3" call ..\scripts\test-ssl.bat
pause
goto menu

:supabase
echo Supabase troubleshooting options:
echo 1. Test all functions
echo 2. Check function logs
echo 3. Redeploy functions
set /p sb_choice="Enter choice: "
if "%sb_choice%"=="1" call SUPABASE-DIAGNOSTIC.bat
if "%sb_choice%"=="2" call ..\scripts\test-functions.bat
if "%sb_choice%"=="3" call ..\scripts\deploy-all-functions.bat
pause
goto menu

:twilio
echo Twilio troubleshooting options:
echo 1. Test Twilio connection
echo 2. Check webhook URLs
echo 3. Reset Twilio credentials
set /p tw_choice="Enter choice: "
if "%tw_choice%"=="1" call TWILIO-DIAGNOSTIC.bat
if "%tw_choice%"=="2" call ..\scripts\test-all-endpoints.bat
if "%tw_choice%"=="3" call ..\TWILIO_LIVE_CREDENTIALS.bat
pause
goto menu

:cloudflare
echo Cloudflare troubleshooting options:
echo 1. Test Cloudflare connection
echo 2. Check SSL/TLS settings
echo 3. Clear Cloudflare cache
set /p cf_choice="Enter choice: "
if "%cf_choice%"=="1" call CLOUDFLARE-DIAGNOSTIC.bat
if "%cf_choice%"=="2" call ..\scripts\test-cloudflare.bat
if "%cf_choice%"=="3" call ..\scripts\fix-cloudflare-cache.bat
pause
goto menu

:ports
echo Checking port conflicts...
call PORT-DIAGNOSTIC.bat
pause
goto menu

:auth
echo Authentication troubleshooting...
call AUTH-DIAGNOSTIC.bat
pause
goto menu

:logs
echo Viewing system logs...
call VIEW-LOGS.bat
pause
goto menu

:exit
echo Exiting troubleshooting menu...
exit /b 0
