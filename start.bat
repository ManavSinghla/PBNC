@echo off
echo ========================================================
echo   Pragati Bharati Document Intelligence Service Launcher
echo ========================================================
echo.

start cmd /k "cd /d %~dp0backend && npm start"
echo [1/2] Backend starting on http://localhost:5000 ...

start cmd /k "cd /d %~dp0frontend && npm run dev"
echo [2/2] Frontend Website starting on http://localhost:5173 ...

echo.
echo System ready! Opening browser to http://localhost:5173 ...
timeout /t 3 >nul
start http://localhost:5173
