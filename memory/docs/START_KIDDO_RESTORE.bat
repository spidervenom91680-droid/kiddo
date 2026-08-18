@echo off
REM Kiddo Auto-Restore & Restart — Double-click to run
REM This batch file restores from the 2026-08-17 snapshot and starts Kiddo

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo KIDDO AUTO-RESTORE ^& RESTART — 2026-08-17 Snapshot
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python or add it to your system PATH
    pause
    exit /b 1
)

echo Checking restore scripts...
if not exist "restore_and_restart.py" (
    echo ERROR: restore_and_restart.py not found
    echo Make sure you are in the kiddo folder
    pause
    exit /b 1
)

echo.
echo Step 1: Closing any running Kiddo instances...
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak

echo.
echo Step 2: Restoring from snapshot...
python restore_and_restart.py live

if errorlevel 1 (
    echo.
    echo ERROR: Restore failed
    pause
    exit /b 1
)

echo.
echo ============================================================
echo SUCCESS! Kiddo is being restored and started.
echo ============================================================
echo.
echo Kiddo should open in a new window shortly...
echo Give her 10-15 seconds to fully boot up.
echo.
pause
