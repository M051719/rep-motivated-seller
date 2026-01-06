@echo off
echo ===============================================
echo Applying Blog Images Storage Migration
echo ===============================================
echo.

cd /d "%~dp0"

echo Applying storage bucket migration...
supabase db execute --file "supabase/migrations/20260105000000_create_blog_images_storage.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================================
    echo SUCCESS: Blog Images Storage Setup Complete!
    echo ===============================================
    echo.
    echo Storage buckets created:
    echo   - blog-images ^(5MB limit^)
    echo   - avatars ^(2MB limit^)
    echo.
    echo Features enabled:
    echo   - Direct image uploads in blog editor
    echo   - Drag-and-drop featured image uploads
    echo   - Public access to uploaded images
    echo   - Automatic file validation
    echo.
    echo Next steps:
    echo   1. Test image upload in blog editor
    echo   2. Verify images appear in Supabase Storage dashboard
    echo   3. Check public URLs are accessible
    echo.
) else (
    echo.
    echo ===============================================
    echo ERROR: Migration failed
    echo ===============================================
    echo Please check the error messages above.
    echo.
)

pause
