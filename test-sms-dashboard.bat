@echo off
echo ================================================
echo SMS Monitoring Dashboard - Quick Test
echo ================================================
echo.
echo Starting development server...
echo.
start cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
echo.
echo ================================================
echo Opening SMS Dashboard in browser...
echo ================================================
echo.
echo URL: http://localhost:3000/admin/sms
echo.
start http://localhost:3000/admin/sms
echo.
echo ================================================
echo TESTING CHECKLIST:
echo ================================================
echo.
echo [ ] Dashboard loads successfully
echo [ ] Can see "SMS Monitoring" header
echo [ ] Conversation list appears (may be empty)
echo [ ] "Send Test" or filter controls visible
echo [ ] No console errors (press F12 to check)
echo.
echo ================================================
echo TO TEST SMS FUNCTIONALITY:
echo ================================================
echo.
echo 1. Send SMS to: (877) 806-4677
echo    Message: "Help! I'm behind on mortgage"
echo.
echo 2. Refresh dashboard or wait for real-time update
echo.
echo 3. Conversation should appear with:
echo    - Contact Type: Prospect
echo    - Category: Foreclosure Assistance
echo    - Priority: Urgent
echo.
echo 4. Click conversation to view details
echo.
echo 5. Try sending a reply using Quick Reply button
echo.
echo ================================================
pause
