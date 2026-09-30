@echo off
cd /d "%~dp0"
title ApexTask GitHub Publisher
echo ======================================================================
echo           APEXTASK - PUSH TO GITHUB REPOSITORY
echo           Target: https://github.com/offongraphael4-pixel/apextask
echo ======================================================================
echo.
echo Checking GitHub authentication...
gh auth status >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [1/3] Logging into GitHub via browser...
    echo       Your one-time code will be copied to your clipboard and shown below.
    echo.
    gh auth login --web -p https --clipboard
    echo.
) else (
    echo [1/3] Already authenticated with GitHub!
)

echo [2/3] Configuring Git credentials for GitHub...
gh auth setup-git

echo [3/3] Pushing ApexTask project to origin main...
git branch -M main
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo [SUCCESS] ApexTask website pushed to GitHub successfully!
    echo.
    echo Repository: https://github.com/offongraphael4-pixel/apextask
    echo.
    echo Live Site Setup:
    echo 1. Open: https://github.com/offongraphael4-pixel/apextask/settings/pages
    echo 2. Under 'Source', select 'GitHub Actions'
    echo 3. Your site will be live at:
    echo    https://offongraphael4-pixel.github.io/apextask/
    echo ======================================================================
) else (
    echo.
    echo [ERROR] Push encountered an issue.
)
echo.
pause
