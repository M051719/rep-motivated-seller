@echo off
echo ========================================
echo MASTER PRODUCTION DEPLOYMENT
echo RepMotivatedSeller - Complete Live Deployment
echo ========================================
echo.

echo Starting complete production deployment...
echo This will deploy everything needed for live production.
echo.
pause

echo [STEP 1/8] Setting up environment...
call scripts\set-windows-env.bat
if %errorlevel% neq 0 (
    echo Environment setup failed!
    pause
    exit /b 1
)

echo [STEP 2/8] Installing and configuring Nginx...
call scripts\install-nginx-windows.bat
if %errorlevel% neq 0 (
    echo Nginx installation failed!
    pause
    exit /b 1
)

echo [STEP 3/8] Setting up SSL certificates...
call scripts\windows-ssl-setup.bat
if %errorlevel% neq 0 (
    echo SSL setup failed!
    pause
    exit /b 1
)

echo [STEP 4/8] Setting Twilio live credentials...
call TWILIO_LIVE_CREDENTIALS.bat
if %errorlevel% neq 0 (
    echo Twilio credentials setup failed!
    pause
    exit /b 1
)

echo [STEP 5/8] Setting all Supabase secrets...
call scripts\set-all-secrets.bat
if %errorlevel% neq 0 (
    echo Supabase secrets setup failed!
    pause
    exit /b 1
)

echo [STEP 6/8] Deploying all Edge Functions...
call scripts\deploy-all-with-sms.bat
if %errorlevel% neq 0 (
    echo Edge Functions deployment failed!
    pause
    exit /b 1
)

echo [STEP 7/8] Building and deploying frontend with legal pages...
call scripts\deploy-with-legal.bat
if %errorlevel% neq 0 (
    echo Frontend deployment failed!
    pause
    exit /b 1
)

echo [STEP 8/8] Final production verification...
call scripts\test-all-endpoints.bat
call scripts\test-ssl.bat

echo.
echo ========================================
echo MASTER PRODUCTION DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your RepMotivatedSeller platform is now LIVE:
echo.
echo Main Site: https://repmotivatedseller.shoprealestatespace.org
echo Admin Dashboard: https://repmotivatedseller.shoprealestatespace.org/admin-dashboard.html
echo.
echo Legal Pages:
echo - Privacy Policy: https://repmotivatedseller.shoprealestatespace.org/privacy-policy.html
echo - Cookies Policy: https://repmotivatedseller.shoprealestatespace.org/cookies-policy.html
echo - Terms & Conditions: https://repmotivatedseller.shoprealestatespace.org/terms-conditions.html
echo - Disclaimer: https://repmotivatedseller.shoprealestatespace.org/disclaimer.html
echo - Refund Policy: https://repmotivatedseller.shoprealestatespace.org/return-refund-policy.html
echo.
echo Edge Functions:
echo - Admin Dashboard: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard
echo - SMS Handler: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-handler
echo - AI Voice Handler: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler
echo - Email Notifications: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/send-notification-email
echo.
echo Next Steps:
echo 1. Configure Twilio webhooks in Twilio Console
echo 2. Test form submissions and notifications
echo 3. Monitor Supabase function logs
echo 4. Set up monitoring and backups
echo.
echo Your foreclosure assistance platform is ready to help homeowners!
echo.
pause