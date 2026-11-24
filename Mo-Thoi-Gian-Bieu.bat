@echo off
setlocal
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"
set "URL=http://127.0.0.1:58123/index.html"

echo Starting Thoi Gian Bieu Tanas...

powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:58123/api/health' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 goto :open_browser

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 58123 -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

where node >nul 2>nul
if %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -WindowStyle Hidden -WorkingDirectory $env:APP_DIR -FilePath 'node' -ArgumentList 'server.js'"
  goto :wait_and_open
)

python --version >nul 2>nul
if %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -WindowStyle Hidden -WorkingDirectory $env:APP_DIR -FilePath 'python' -ArgumentList '-m','http.server','58123','--bind','127.0.0.1'"
  goto :wait_and_open
)

start "" "%~dp0index.html"
exit /b 0

:wait_and_open
powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:58123/index.html' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; Start-Sleep -Milliseconds 150 }; exit 1"
if %errorlevel% neq 0 (
  start "" "%~dp0index.html"
  exit /b 0
)

:open_browser
start "" "%URL%"
exit /b 0
