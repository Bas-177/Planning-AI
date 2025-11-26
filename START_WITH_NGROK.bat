@echo off
REM Script om Planning Industrie AI te starten met Ngrok tunnel
setlocal enabledelayedexpansion

echo ============================================================
echo Planning Industrie AI - Start met Ngrok Tunnel
echo ============================================================
echo.

REM Check of ngrok is geïnstalleerd
where ngrok >nul 2>&1
if %errorLevel% neq 0 (
    echo NGROK NIET GEVONDEN!
    echo.
    echo Volg deze stappen:
    echo 1. Download Ngrok van: https://ngrok.com/download
    echo 2. Pak uit naar een map (bijv. C:\ngrok\)
    echo 3. Voeg toe aan PATH of voeg pad hieronder toe
    echo.
    echo OF voer het pad naar ngrok in:
    set /p NGROK_PATH="Voer pad naar ngrok.exe in (bijv. C:\ngrok\ngrok.exe): "
    
    if exist "!NGROK_PATH!" (
        set NGROK=!NGROK_PATH!
    ) else (
        echo.
        echo FOUT: Ngrok niet gevonden op: !NGROK_PATH!
        echo.
        echo Zie INSTALL_NGROK.md voor installatie instructies.
        pause
        exit /b 1
    )
) else (
    set NGROK=ngrok
    echo Ngrok gevonden!
)

echo.
echo ============================================================
echo OPTIES
echo ============================================================
echo.
echo 1. Start server EN ngrok automatisch (beide in aparte vensters)
echo 2. Start alleen ngrok (server moet al draaien)
echo 3. Start alleen server (ngrok handmatig starten)
echo.
set /p OPTIE="Kies optie (1/2/3): "

if "%OPTIE%"=="1" (
    echo.
    echo ============================================================
    echo STARTEN VAN SERVER EN NGROK
    echo ============================================================
    echo.
    echo De server en ngrok worden nu gestart in aparte vensters.
    echo.
    echo WACHT: Je ziet straks een ngrok URL (bijv. https://abc123.ngrok-free.app)
    echo DEEL DEZE URL met anderen om de applicatie te openen!
    echo.
    pause
    
    REM Start server in nieuw venster
    start "Planning Industrie AI Server" cmd /k "python run.py"
    
    REM Wacht even zodat server kan starten
    timeout /t 3 /nobreak >nul
    
    REM Start ngrok in nieuw venster
    start "Ngrok Tunnel" cmd /k "%NGROK% http 8000"
    
    echo.
    echo ============================================================
    echo GESTART!
    echo ============================================================
    echo.
    echo Server wordt gestart in apart venster...
    echo Ngrok wordt gestart in apart venster...
    echo.
    echo WACHT even en check het ngrok venster voor de URL!
    echo De URL ziet eruit als: https://abc123.ngrok-free.app
    echo.
    echo Druk op een toets om dit venster te sluiten (server en ngrok blijven draaien)
    pause >nul
    
) else if "%OPTIE%"=="2" (
    echo.
    echo ============================================================
    echo STARTEN VAN NGROK
    echo ============================================================
    echo.
    echo Controleren of server draait op poort 8000...
    
    REM Check of poort 8000 in gebruik is
    netstat -ano | findstr :8000 >nul 2>&1
    if %errorLevel% neq 0 (
        echo.
        echo WAARSCHUWING: Server lijkt niet te draaien op poort 8000!
        echo Start eerst de server met: python run.py
        echo.
        pause
        exit /b 1
    )
    
    echo Server draait! Starten van ngrok...
    echo.
    echo WACHT: Je ziet straks een ngrok URL (bijv. https://abc123.ngrok-free.app)
    echo DEEL DEZE URL met anderen om de applicatie te openen!
    echo.
    pause
    
    REM Start ngrok
    %NGROK% http 8000
    
) else if "%OPTIE%"=="3" (
    echo.
    echo ============================================================
    echo STARTEN VAN SERVER
    echo ============================================================
    echo.
    echo Server wordt nu gestart.
    echo Start daarna ngrok handmatig in een aparte terminal met:
    echo   ngrok http 8000
    echo.
    pause
    
    REM Start server
    python run.py
    
) else (
    echo.
    echo Ongeldige optie. Script wordt gestopt.
    pause
    exit /b 1
)

