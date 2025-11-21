@echo off
REM Script om Windows Firewall regel toe te voegen voor Planning Industrie AI
REM Dit script moet als Administrator worden uitgevoerd!

echo ============================================================
echo Planning Industrie AI - Firewall Configuratie
echo ============================================================
echo.
echo Dit script voegt een firewall regel toe om poort 8000 toe te staan.
echo Dit is nodig zodat andere apparaten op je netwerk de applicatie kunnen gebruiken.
echo.
echo WARNING: Dit script moet als Administrator worden uitgevoerd!
echo.

REM Check of script als Administrator draait
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Dit script moet als Administrator worden uitgevoerd!
    echo.
    echo Rechtsklik op dit bestand en kies "Als Administrator uitvoeren"
    pause
    exit /b 1
)

echo Toevoegen van firewall regel...
echo.

REM Verwijder bestaande regel eerst (als die bestaat)
netsh advfirewall firewall delete rule name="Planning Industrie AI" >nul 2>&1

REM Voeg nieuwe regel toe
netsh advfirewall firewall add rule name="Planning Industrie AI" dir=in action=allow protocol=TCP localport=8000

if %errorLevel% equ 0 (
    echo.
    echo ============================================================
    echo SUCCES! Firewall regel toegevoegd.
    echo ============================================================
    echo.
    echo Poort 8000 is nu open voor binnenkomende verbindingen.
    echo Andere apparaten op je netwerk kunnen nu de applicatie gebruiken.
    echo.
    echo Start de server met: python run.py
    echo.
) else (
    echo.
    echo ============================================================
    echo FOUT! Kon firewall regel niet toevoegen.
    echo ============================================================
    echo.
    echo Probeer handmatig via Windows Firewall instellingen.
    echo Zie NETWERK_TOEGANG.md voor instructies.
    echo.
)

pause

