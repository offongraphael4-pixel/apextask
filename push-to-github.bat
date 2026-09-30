@echo off
cd /d "%~dp0"
echo ========================================================
echo Pushing ApexTask to GitHub: offongraphael4-pixel/apextask
echo ========================================================
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Pushed to GitHub successfully!
    echo Visit your repository: https://github.com/offongraphael4-pixel/apextask
) else (
    echo [FAILED] Push failed. If prompted, please enter your GitHub Personal Access Token.
)
echo.
pause
