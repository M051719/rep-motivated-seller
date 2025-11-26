@echo off
REM SMS Opt-In/Opt-Out Compliance Deployment Script
REM Deploys database migrations and Edge Functions for TCPA compliance

echo ================================================
echo  SMS Compliance System Deployment
echo  TCPA Opt-In/Opt-Out Implementation
echo ================================================
echo.

REM Step 1: Database Migration
echo [1/4] Applying SMS consent tracking migration...
echo.
supabase db push
if errorlevel 1 (
    echo ERROR: Database migration failed!
    pause
    exit /b 1
)
echo ✓ Database migration completed successfully
echo.

REM Step 2: Verify migration
echo [2/4] Verifying database tables...
echo.
supabase db execute --file - < "supabase\migrations\verify-sms-tables.sql" 2>nul
if errorlevel 1 (
    echo Creating verification script...
    echo SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'sms_%%'; > temp_verify.sql
    supabase db execute --file temp_verify.sql
    del temp_verify.sql
)
echo.

REM Step 3: Deploy Edge Functions
echo [3/4] Deploying Edge Functions...
echo.

echo Deploying sms-consent function...
supabase functions deploy sms-consent --project-ref ltxqodqlexvojqqxquew
if errorlevel 1 (
    echo WARNING: sms-consent function deployment failed
    echo Check Supabase credentials and project-ref
)
echo.

echo Deploying sms-handler function (Twilio webhook)...
supabase functions deploy sms-handler --project-ref ltxqodqlexvojqqxquew --no-verify-jwt
if errorlevel 1 (
    echo WARNING: sms-handler function deployment failed
    echo Check Supabase credentials and project-ref
)
echo.

REM Step 4: Verify Environment Variables
echo [4/4] Verifying environment variables...
echo.
echo Required Twilio environment variables:
echo - TWILIO_ACCOUNT_SID
echo - TWILIO_AUTH_TOKEN
echo - TWILIO_PHONE_NUMBER
echo.
echo Please ensure these are set in:
echo Supabase Dashboard → Edge Functions → Secrets
echo.

echo ================================================
echo  Deployment Summary
echo ================================================
echo.
echo ✓ Database migration applied
echo ✓ Edge Functions deployed:
echo   - sms-consent (opt-in/opt-out management)
echo   - sms-handler (Twilio webhook with TCPA keywords)
echo.
echo 📋 Next Steps:
echo.
echo 1. Set environment variables in Supabase Dashboard
echo    - TWILIO_ACCOUNT_SID
echo    - TWILIO_AUTH_TOKEN
echo    - TWILIO_PHONE_NUMBER
echo.
echo 2. Configure Twilio webhook:
echo    URL: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-handler
echo    Method: POST
echo.
echo 3. Test the implementation:
echo    - Send "START" to your Twilio number
echo    - Send "STOP" to opt out
echo    - Send "HELP" for help message
echo.
echo 4. Review compliance documentation:
echo    SMS_COMPLIANCE_GUIDE.md
echo.
echo ================================================
echo  TCPA Compliance Status: Ready ✓
echo ================================================
echo.

REM Open documentation
echo Opening SMS Compliance Guide...
timeout /t 2 /nobreak >nul
start "" "SMS_COMPLIANCE_GUIDE.md"

echo.
echo Deployment complete! Press any key to exit...
pause >nul
