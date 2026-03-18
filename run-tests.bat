@echo off
chcp 65001 >nul
echo === Game Hub - הרצת בדיקות ===
echo.
echo [1/3] Vitest...
call npm test -- --run
if %errorlevel% neq 0 (
  echo Vitest נכשל!
  pause
  exit /b 1
)
echo.
echo [2/3] Build...
call npm run build
if %errorlevel% neq 0 (
  echo Build נכשל!
  pause
  exit /b 1
)
echo.
echo [3/3] Playwright E2E...
call npm run test:e2e
if %errorlevel% neq 0 (
  echo Playwright נכשל!
  pause
  exit /b 1
)
echo.
echo === כל הבדיקות עברו בהצלחה ===
pause
