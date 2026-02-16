@echo off
echo ========================================
echo QUICK FIX - Common Issues
echo ========================================
echo.

echo This script will attempt to fix common issues automatically.
echo.
pause

echo [1/6] Stopping conflicting processes...
call ..\scripts\stop-port80-processes.bat
echo.

echo [2/6] Restarting Nginx...
call ..\scripts\restart-nginx.bat
echo.

echo [3/6] Fixing SSL configuration...
call ..\scripts\fix-ssl-paths.bat
echo.

echo [4/6] Testing Supabase functions...
call ..\scripts\test-all-endpoints.bat
echo.

echo [5/6] Clearing Cloudflare cache...
call ..\scripts\fix-cloudflare-cache.bat
echo.

echo [6/6] Final verification...
echo Testing site accessibility...
curl -s -o nul -w "Site Status: %%{http_code}\n" https://repmotivatedseller.shoprealestatespace.org
echo.

echo ========================================
echo QUICK FIX COMPLETE
echo ========================================
echo.
echo If issues persist, run TROUBLESHOOTING-MENU.bat for detailed diagnostics.
pause
