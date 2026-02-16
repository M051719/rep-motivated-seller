@echo off
echo RepMotivatedSeller Backup and Deploy Script
echo =========================================
echo.

:: Create timestamp for backup folder
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
set "backupDir=backups\%timestamp%"

echo Creating backup in %backupDir%...
if not exist "backups" mkdir backups
if not exist "%backupDir%" mkdir "%backupDir%"

:: Backup Supabase functions
echo Backing up Supabase functions...
if not exist "%backupDir%\supabase\functions" mkdir "%backupDir%\supabase\functions"
xcopy /E /I /Y "supabase\functions" "%backupDir%\supabase\functions"

:: Backup Nginx configuration
echo Backing up Nginx configuration...
if not exist "%backupDir%\etc\nginx\conf.d" mkdir "%backupDir%\etc\nginx\conf.d"
xcopy /E /I /Y "etc\nginx\conf.d" "%backupDir%\etc\nginx\conf.d"

:: Backup HTML files
echo Backing up HTML files...
if not exist "%backupDir%\html" mkdir "%backupDir%\html"
copy "*.html" "%backupDir%\html" > nul 2>&1

echo Backup completed successfully!
echo.

:: Deploy to Nginx
echo Deploying files to Nginx...
if not exist "C:\nginx\html\repmotivatedseller" (
    echo Creating Nginx directory...
    mkdir "C:\nginx\html\repmotivatedseller"
)

:: Copy HTML files
echo Copying HTML files...
copy "*.html" "C:\nginx\html\repmotivatedseller\" > nul 2>&1

:: Copy Nginx configuration
echo Updating Nginx configuration...
if exist "etc\nginx\conf.d\repmotivatedseller-windows.conf" (
    copy "etc\nginx\conf.d\repmotivatedseller-windows.conf" "C:\nginx\conf\conf.d\" > nul 2>&1
)

:: Test and reload Nginx
echo Testing Nginx configuration...
cd C:\nginx
nginx -t
if %ERRORLEVEL% EQU 0 (
    echo Reloading Nginx...
    nginx -s reload
    echo Nginx reloaded successfully.
) else (
    echo Nginx configuration test failed. Please check the errors above.
)

:: Deploy Supabase functions
echo.
echo Do you want to deploy Supabase Edge Functions? (Y/N)
set /p deployFunctions=

if /i "%deployFunctions%"=="Y" (
    echo Deploying Supabase Edge Functions...
    call scripts\deploy-all-functions.bat
) else (
    echo Skipping Supabase Edge Function deployment.
)

:: Purge Cloudflare cache
echo.
echo IMPORTANT: Remember to purge your Cloudflare cache!
echo 1. Go to Cloudflare Dashboard
echo 2. Select repmotivatedseller.shoprealestatespace.org
echo 3. Go to Caching > Configuration
echo 4. Click "Purge Everything"
echo.

echo Deployment completed!
echo.
echo Testing site access...
start https://repmotivatedseller.shoprealestatespace.org/cloudflare-test.html

pause
