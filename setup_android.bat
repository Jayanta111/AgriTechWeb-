@echo off
echo AgriTech Android PWA Setup
echo =========================

echo Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do set ip=%%a
set ip=%ip: =%

echo Your IP Address: %ip%
echo.

echo Checking if servers are running...
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo Frontend Server: Running
) else (
    echo Frontend Server: NOT RUNNING
    echo Please start with: cd d:\Hackthon\AgriTech-Web && npm start
    pause
    exit /b 1
)

echo.
echo Android Installation Instructions:
echo ================================
echo 1. Make sure your Android device is on the same WiFi
echo 2. Open Chrome browser on your Android device
echo 3. Go to: http://%ip%:3000
echo 4. Wait for the app to load completely
echo 5. Look for "Add to Home screen" banner
echo 6. If no banner appears:
echo    - Tap the three dots (menu) in Chrome
echo    - Select "Add to Home screen" or "Install app"
echo 7. Tap "Add" or "Install" to confirm
echo 8. Look for the AgriTech icon on your home screen
echo.

echo URL for Android: http://%ip%:3000
echo.

set /p choice="Open browser on this computer? (y/n): "
if /i "%choice%"=="y" (
    start http://%ip%:3000
    echo Browser opened. Use the URL above on your Android device.
)

echo.
echo Setup complete! Follow the Android instructions.
pause
