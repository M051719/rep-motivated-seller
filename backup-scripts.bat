@echo off
echo Creating backup of scripts and functions...

set "BACKUP_DIR=backups\scripts_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
mkdir "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%\scripts"
mkdir "%BACKUP_DIR%\supabase"
mkdir "%BACKUP_DIR%\supabase\functions"

echo Backing up scripts...
copy "*.bat" "%BACKUP_DIR%\scripts\"
copy "*.html" "%BACKUP_DIR%\"

echo Backing up functions...
xcopy "supabase\functions" "%BACKUP_DIR%\supabase\functions\" /E /I

echo Backup complete at %BACKUP_DIR%
echo.
pause