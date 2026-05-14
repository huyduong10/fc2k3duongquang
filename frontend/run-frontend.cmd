@echo off
set "NODEJS_DIR=C:\Program Files\nodejs"
if exist "%NODEJS_DIR%\npm.cmd" (
  set "PATH=%NODEJS_DIR%;%PATH%"
  call "%NODEJS_DIR%\npm.cmd" run dev
  exit /b %errorlevel%
)

echo Node.js npm.cmd was not found in "%NODEJS_DIR%".
echo Install Node.js or update this script with the correct path.
exit /b 1