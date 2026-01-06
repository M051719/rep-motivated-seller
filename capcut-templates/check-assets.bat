@echo off
echo.
echo ========================================
echo   CAPCUT ASSETS VERIFICATION
echo   RepMotivatedSeller Project
echo ========================================
echo.

cd /d "%~dp0assets"

echo CHECKING ASSETS...
echo.

echo [1/6] LOGOS:
dir /b logos\*.png 2>nul | find /c /v "" > temp.txt
set /p logocount=<temp.txt
echo   Found: %logocount% logo files
if %logocount% GEQ 3 (
    echo   Status: OK [checkmark]
    dir /b logos\*.png 2>nul
) else (
    echo   Status: INCOMPLETE - Need 3 logos
)
echo.

echo [2/6] BACKGROUNDS:
dir /b backgrounds\*.png 2>nul | find /c /v "" > temp.txt
set /p bgcount=<temp.txt
echo   Found: %bgcount% background files
if %bgcount% GEQ 5 (
    echo   Status: OK [checkmark]
) else (
    echo   Status: INCOMPLETE - Need 5 backgrounds
    echo   Missing: %missing% backgrounds
)
if exist backgrounds\*.png (
    dir /b backgrounds\*.png 2>nul
)
echo.

echo [3/6] FONTS:
dir /b fonts\*.ttf 2>nul | find /c /v "" > temp.txt
set /p fontcount=<temp.txt
echo   Found: %fontcount% font files
if %fontcount% GEQ 8 (
    echo   Status: OK [checkmark]
) else (
    echo   Status: INCOMPLETE - Need 8-10 fonts
)
if exist fonts\*.ttf (
    dir /b fonts\*.ttf 2>nul
)
echo.

echo [4/6] MUSIC:
dir /b music\*.mp3 2>nul | find /c /v "" > temp.txt
set /p musiccount=<temp.txt
echo   Found: %musiccount% music files
if %musiccount% GEQ 2 (
    echo   Status: OK [checkmark]
) else (
    echo   Status: INCOMPLETE - Need 2-3 music tracks
)
if exist music\*.mp3 (
    dir /b music\*.mp3 2>nul
)
echo.

echo [5/6] ICONS (Optional):
dir /b icons\*.png 2>nul | find /c /v "" > temp.txt
set /p iconcount=<temp.txt
echo   Found: %iconcount% icon files
if %iconcount% GEQ 8 (
    echo   Status: OK [checkmark]
) else (
    echo   Status: Optional - Can create later
)
echo.

echo [6/6] CAPCUT INSTALLATION:
where capcut.exe >nul 2>&1
if %errorlevel% EQU 0 (
    echo   Status: CapCut installed [checkmark]
) else (
    echo   Status: Please install CapCut Desktop
    echo   Download: https://www.capcut.com/
)
echo.

echo ========================================
echo   SUMMARY
echo ========================================
echo   Logos:       %logocount%/3
echo   Backgrounds: %bgcount%/5
echo   Fonts:       %fontcount%/8
echo   Music:       %musiccount%/2
echo   Icons:       %iconcount%/8 (optional)
echo ========================================
echo.

del temp.txt 2>nul

set /a total=%logocount%+%bgcount%+%fontcount%+%musiccount%
set /a required=3+5+8+2
set /a percentage=(%total%*100)/%required%

echo   PROGRESS: %percentage%%% complete
echo.

if %percentage% GEQ 100 (
    echo   [SUCCESS] You're ready to create videos!
    echo.
    echo   Next step: Open CapCut and create your first test video!
) else (
    echo   [TODO] Complete remaining assets above
    echo.
    echo   Quick reference: ASSET_CREATION_WORKFLOW.md
)
echo.

pause
