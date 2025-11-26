@echo off
echo ================================================
echo SMS Monitoring System - Migration Instructions
echo ================================================
echo.
echo 1. Opening Supabase SQL Editor in your browser...
start https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/editor/sql
echo.
echo 2. Opening migration file in notepad...
start notepad "supabase\migrations\20251119100000_sms_monitoring_system.sql"
echo.
echo ================================================
echo 3. MANUAL APPLICATION INSTRUCTIONS:
echo ================================================
echo.
echo In the migration file (Notepad):
echo   - Press Ctrl+A to select all
echo   - Press Ctrl+C to copy
echo.
echo In the Supabase SQL Editor (Browser):
echo   - Click "New Query" button
echo   - Press Ctrl+V to paste the SQL
echo   - Click "Run" button
echo   - Wait for "Success" message
echo.
echo ================================================
echo 4. VERIFICATION:
echo ================================================
echo.
echo After running, verify these tables exist:
echo   - sms_conversations
echo   - sms_alert_rules
echo   - sms_alert_history
echo   - sms_quick_replies
echo.
echo Then navigate to: http://localhost:3000/admin/sms
echo.
pause
