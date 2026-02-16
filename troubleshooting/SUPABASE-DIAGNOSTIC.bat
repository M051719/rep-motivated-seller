@echo off
echo ========================================
echo SUPABASE DIAGNOSTIC
echo ========================================
echo.

echo Testing Supabase connection...
curl -s -o nul -w "Supabase API: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co
echo.

echo Testing Edge Functions...
echo.
echo [1/7] Testing admin-dashboard...
curl -s -o nul -w "admin-dashboard: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard
echo.

echo [2/7] Testing auth-test...
curl -s -o nul -w "auth-test: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/auth-test
echo.

echo [3/7] Testing send-notification-email...
curl -s -o nul -w "send-notification-email: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/send-notification-email
echo.

echo [4/7] Testing schedule-follow-ups...
curl -s -o nul -w "schedule-follow-ups: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/schedule-follow-ups
echo.

echo [5/7] Testing ai-voice-handler...
curl -s -o nul -w "ai-voice-handler: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler
echo.

echo [6/7] Testing call-analytics...
curl -s -o nul -w "call-analytics: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/call-analytics
echo.

echo [7/7] Testing sms-handler...
curl -s -o nul -w "sms-handler: %%{http_code}\n" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-handler
echo.

echo Checking Supabase secrets...
echo Note: Run 'supabase secrets list --project-ref ltxqodqlexvojqqxquew' to verify secrets
echo.

echo Common issues and solutions:
echo - 404 errors: Function not deployed or wrong URL
echo - 500 errors: Check function logs in Supabase dashboard
echo - CORS errors: Check function CORS headers
echo - Auth errors: Verify JWT tokens and permissions
echo.

echo To view function logs:
echo 1. Go to https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/functions
echo 2. Click on function name
echo 3. View logs tab
echo.

echo ========================================
echo SUPABASE DIAGNOSTIC COMPLETE
echo ========================================
