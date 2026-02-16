@echo off
echo ========================================
echo NGINX DIAGNOSTIC
echo ========================================
echo.

echo Checking Nginx installation...
if exist "C:\nginx\nginx.exe" (
    echo ✅ Nginx executable found
) else (
    echo ❌ Nginx executable not found
    echo Run: scripts\install-nginx-windows.bat
)
echo.

echo Checking Nginx configuration...
if exist "C:\nginx\conf\nginx.conf" (
    echo ✅ Nginx config found
    echo Testing configuration...
    cd /d C:\nginx
    nginx.exe -t
) else (
    echo ❌ Nginx config not found
    echo Run: scripts\configure-nginx-for-project.bat
)
echo.

echo Checking Nginx process...
tasklist | findstr nginx.exe
if %errorlevel% equ 0 (
    echo ✅ Nginx is running
) else (
    echo ❌ Nginx is not running
    echo Run: scripts\start-nginx.bat
)
echo.

echo Checking port 80...
netstat -an | findstr ":80 " | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Port 80 is listening
) else (
    echo ❌ Port 80 not listening
    echo Check: scripts\check-port-conflicts.bat
)
echo.

echo Checking port 443...
netstat -an | findstr ":443 " | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Port 443 is listening
) else (
    echo ❌ Port 443 not listening
    echo Check SSL configuration
)
echo.

echo Checking web root...
if exist "C:\nginx\html\repmotivatedseller\index.html" (
    echo ✅ Web files found
) else (
    echo ❌ Web files missing
    echo Run: scripts\deploy-with-legal.bat
)
echo.

echo Checking Nginx logs...
if exist "C:\nginx\logs\error.log" (
    echo Recent errors:
    powershell "Get-Content 'C:\nginx\logs\error.log' -Tail 5"
) else (
    echo No error log found
)
echo.

echo ========================================
echo NGINX DIAGNOSTIC COMPLETE
echo ========================================
