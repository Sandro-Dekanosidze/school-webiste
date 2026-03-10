@echo off
TITLE School Management System - Launcher
echo Opening School Management System...

:: Open Frontend
start "" "%~dp0frontend\index.html"

:: Run Backend in a separate window
echo Starting Backend Server in a new window...
start "SchoolOS-Backend" cmd /c "start_backend.bat"

echo.
echo Launch sequence complete.
echo If the web page says 'Backend is not running', 
echo please check the black window labeled 'SchoolOS-Backend'.
echo.
timeout /t 5
exit
