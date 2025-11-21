@echo off
REM Script om Dutch language data te downloaden en te installeren
echo ========================================
echo DUTCH LANGUAGE DATA INSTALLATIE
echo ========================================
echo.

REM Check of Tesseract geinstalleerd is
if not exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    echo FOUT: Tesseract is niet gevonden in de standaard locatie!
    echo Installeer eerst Tesseract van: https://github.com/UB-Mannheim/tesseract/wiki
    pause
    exit /b 1
)

echo Tesseract gevonden!
echo.

REM Check of Dutch al geinstalleerd is
if exist "C:\Program Files\Tesseract-OCR\tessdata\nld.traineddata" (
    echo Dutch language data is al geinstalleerd!
    tesseract --list-langs
    pause
    exit /b 0
)

echo Dutch language data niet gevonden.
echo.
echo Dit script download Dutch language data en installeert het.
echo.
pause

REM Download Dutch language data
echo Downloaden Dutch language data...
echo Dit kan even duren...
echo.

REM Probeer PowerShell download
powershell -NoProfile -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata' -OutFile '%TEMP%\nld.traineddata' -UseBasicParsing -ErrorAction Stop; Write-Host 'Download geslaagd!' } catch { Write-Host 'Download mislukt, probeer handmatig'; exit 1 }"

if not exist "%TEMP%\nld.traineddata" (
    echo.
    echo FOUT: Automatische download mislukt!
    echo.
    echo HANDMATIGE INSTALLATIE:
    echo 1. Open je browser
    echo 2. Ga naar: https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata
    echo 3. Rechtsklik op de pagina en kies "Save as..." of "Opslaan als..."
    echo 4. Sla op als: nld.traineddata (zorg dat het .traineddata extensie heeft)
    echo 5. Kopieer het bestand naar: C:\Program Files\Tesseract-OCR\tessdata\
    echo.
    echo Druk op een toets om verder te gaan (na het kopieren)...
    pause >nul
)

echo Download voltooid!
echo.

REM Kopieer naar Tesseract map (vereist admin rechten)
echo Kopieeren naar Tesseract map...
echo (Dit vereist administrator rechten)
echo.

REM Probeer te kopieren
copy "%TEMP%\nld.traineddata" "C:\Program Files\Tesseract-OCR\tessdata\" >nul 2>&1

if errorlevel 1 (
    echo FOUT: Kopieren mislukt (waarschijnlijk geen admin rechten)!
    echo.
    echo HANDMATIGE INSTALLATIE:
    echo 1. Kopieer dit bestand: %TEMP%\nld.traineddata
    echo 2. Ga naar: C:\Program Files\Tesseract-OCR\tessdata\
    echo 3. Plak het bestand daar (vereist admin rechten)
    echo.
    echo Of: Herstart dit script als Administrator
    echo.
    pause
    exit /b 1
)

echo Dutch language data geinstalleerd!
echo.

REM Verifieer
echo Geinstalleerde talen:
tesseract --list-langs

echo.
echo ========================================
echo INSTALLATIE VOLTOOID!
echo ========================================
echo.
pause

