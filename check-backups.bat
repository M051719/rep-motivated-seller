@echo off
echo RepMotivatedSeller Backup Check
echo ============================
echo.

:: Get current date
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "today=%YYYY%%MM%%DD%"

:: Check for recent backups
echo Checking for recent backups...
set "foundRecent=false"

:: List backup directories
dir /b /ad backups > temp_backups.txt

:: Check each backup directory
for /f "tokens=*" %%d in (temp_backups.txt) do (
    echo Checking backup: %%d
    if "%%d:~0,8%" == "%today%" (
        echo Found backup from today: %%d
        set "foundRecent=true"
    )
)

del temp_backups.txt

if "%foundRecent%" == "true" (
    echo.
    echo ✓ Recent backup found! Your files are backed up.
) else (
    echo.
    echo ⚠ WARNING: No backup from today found!
    echo.
    echo Would you like to create a backup now? (Y/N)
    set /p createBackup=
    
    if /i "%createBackup%" == "Y" (
        echo.
        echo Running backup script...
        call backup-and-deploy.bat
    ) else (
        echo.
        echo No backup created. Please remember to back up your files regularly.
    )
)

pause
