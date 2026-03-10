@echo off
TITLE School Management System - Backend Server
echo [1/3] Navigating to backend directory...
cd /d "%~dp0backend"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not find 'backend' folder!
    pause
    exit
)

echo [2/3] Version Check:
node -v

echo [3/3] Starting server.js...
:: Using 'call' to ensure execution continues or errors are caught
node server.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [CRITICAL ERROR] Server crashed or failed to start!
    echo.
    echo Please check if:
    echo 1. Another server is already using Port 3000.
    echo 2. You have permission to run Node in this folder.
    echo.
    pause
)
echo.
echo Server has stopped.
pause
