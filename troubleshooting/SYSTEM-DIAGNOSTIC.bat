@echo off
echo ========================================
echo COMPLETE SYSTEM DIAGNOSTIC
echo ========================================
echo.

echo [1/10] Checking system environment...
call ..\scripts\check-nginx-status.bat
echo.

echo [2/10] Checking SSL certificates...
call ..\scripts\check-ssl-status.bat
echo.

echo [3/10] Checking port conflicts...
call ..\scripts\check-port-conflicts.bat
echo.

echo [4/10] Testing Supabase functions...
call ..\scripts\test-all-endpoints.bat
echo.

echo [5/10] Checking authentication...
call ..\scripts\test-auth.bat
echo.

echo [6/10] Testing SSL connection...
call ..\scripts\test-ssl.bat
echo.

echo [7/10] Checking Cloudflare status...
call ..\scripts\test-cloudflare.bat
echo.

echo [8/10] Checking firewall settings...
call ..\scripts\test-firewall.bat
echo.

echo [9/10] Verifying site accessibility...
call ..\scripts\check-site.bat
echo.

echo [10/10] Generating diagnostic report...
echo ========================================
echo DIAGNOSTIC REPORT SUMMARY
echo ========================================
echo Timestamp: %date% %time%
echo.
echo System Status:
netstat -an | findstr ":80 " | findstr "LISTENING"
netstat -an | findstr ":443 " | findstr "LISTENING"
echo.
echo Nginx Process:
tasklist | findstr nginx.exe
echo.
echo SSL Certificate Status:
if exist "C:\nginx\conf\ssl\*.crt" (
    echo SSL certificates found
) else (
    echo SSL certificates missing
)
echo.
echo Supabase Connection:
curl -s -o nul -w "%%{http_code}" https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard
echo.
echo Site Accessibility:
curl -s -o nul -w "%%{http_code}" https://repmotivatedseller.shoprealestatespace.org
echo.
echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================