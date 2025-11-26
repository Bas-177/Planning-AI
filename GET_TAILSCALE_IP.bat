@echo off
REM Script om Tailscale IP-adres op te halen
echo ============================================================
echo Planning Industrie AI - Tailscale IP Adres
echo ============================================================
echo.

REM Check of Tailscale is geïnstalleerd
where tailscale >nul 2>&1
if %errorLevel% neq 0 (
    echo TAILSCALE NIET GEVONDEN!
    echo.
    echo Volg deze stappen:
    echo 1. Download Tailscale van: https://tailscale.com/download
    echo 2. Installeer Tailscale
    echo 3. Log in op Tailscale
    echo.
    echo Zie INSTALL_TAILSCALE.md voor installatie instructies.
    pause
    exit /b 1
)

echo Controleren van Tailscale status...
echo.

REM Haal Tailscale IP op
tailscale ip -4 2>nul
if %errorLevel% neq 0 (
    echo.
    echo FOUT: Tailscale lijkt niet actief te zijn.
    echo.
    echo Zorg dat:
    echo 1. Tailscale is geïnstalleerd
    echo 2. Je bent ingelogd op Tailscale
    echo 3. Tailscale app draait (check systeem tray)
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo JE TAILSCALE IP-ADRES
echo ============================================================
echo.

REM Haal IP op en toon
for /f "tokens=*" %%a in ('tailscale ip -4 2^>nul') do (
    set TAILSCALE_IP=%%a
    echo Je Tailscale IP-adres: !TAILSCALE_IP!
    echo.
    echo ============================================================
    echo TOEGANG TOT PLANNING APPLICATIE
    echo ============================================================
    echo.
    echo Deel deze URL met je teamleden (die Tailscale hebben):
    echo.
    echo   http://!TAILSCALE_IP!:8000
    echo.
    echo Of specifiek voor planning:
    echo   http://!TAILSCALE_IP!:8000/planning/week
    echo.
    echo ============================================================
    echo.
)

REM Check of server draait
netstat -ano | findstr :8000 >nul 2>&1
if %errorLevel% neq 0 (
    echo WAARSCHUWING: Server draait niet op poort 8000!
    echo.
    echo Start de server eerst met: python run.py
    echo.
) else (
    echo Server draait! De applicatie is toegankelijk via bovenstaande URL.
    echo.
)

pause

