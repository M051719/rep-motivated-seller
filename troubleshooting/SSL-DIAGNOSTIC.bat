@echo off
echo ========================================
echo SSL DIAGNOSTIC
echo ========================================
echo.

echo Checking SSL certificate files...
if exist "C:\nginx\conf\ssl\*.crt" (
    echo ✅ SSL certificate found
    dir "C:\nginx\conf\ssl\*.crt"
) else (
    echo ❌ SSL certificate not found
    echo Check: C:\nginx\conf\ssl\ directory
)
echo.

if exist "C:\nginx\conf\ssl\*.key" (
    echo ✅ SSL private key found
    dir "C:\nginx\conf\ssl\*.key"
) else (
    echo ❌ SSL private key not found
    echo Run: scripts\copy-ssl-files.bat
)
echo.

echo Checking SSL configuration in Nginx...
if exist "C:\nginx\conf\nginx.conf" (
    findstr /i "ssl" "C:\nginx\conf\nginx.conf"
    if %errorlevel% equ 0 (
        echo ✅ SSL configuration found in nginx.conf
    ) else (
        echo ❌ SSL configuration missing
        echo Run: scripts\add-ssl-to-nginx.bat
    )
) else (
    echo ❌ Nginx config not found
)
echo.

echo Testing SSL connection...
echo Testing HTTPS connection to site...
curl -k -s -o nul -w "HTTP Status: %%{http_code}\nSSL Verify: %%{ssl_verify_result}\n" https://repmotivatedseller.shoprealestatespace.org
echo.

echo Checking SSL certificate validity...
echo | openssl s_client -connect repmotivatedseller.shoprealestatespace.org:443 -servername repmotivatedseller.shoprealestatespace.org 2>nul | openssl x509 -noout -dates 2>nul
if %errorlevel% equ 0 (
    echo ✅ SSL certificate is valid
) else (
    echo ❌ SSL certificate validation failed
    echo Check certificate installation
)
echo.

echo Checking Cloudflare SSL settings...
echo Note: Check Cloudflare dashboard for SSL/TLS settings
echo Recommended: Full (strict) SSL mode
echo.

echo ========================================
echo SSL DIAGNOSTIC COMPLETE
echo ========================================
