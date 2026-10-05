@echo off
cd /d "%~dp0"
where python >nul 2>&1
if %errorlevel%==0 (
  python abrir.py
  goto :eof
)
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 abrir.py
  goto :eof
)
echo No hay Python 3. Abriendo index.html directo.
start "" "%~dp0index.html"
