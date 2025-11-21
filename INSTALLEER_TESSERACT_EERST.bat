@echo off
REM BELANGRIJK: Dit script controleert of Tesseract geinstalleerd is
echo ========================================
echo TESSERACT INSTALLATIE CHECK
echo ========================================
echo.

REM Check of Tesseract bestaat
if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    echo [OK] Tesseract gevonden!
    "C:\Program Files\Tesseract-OCR\tesseract.exe" --version
    goto :check_langs
)

if exist "C:\Program Files (x86)\Tesseract-OCR\tesseract.exe" (
    echo [OK] Tesseract gevonden op alternatieve locatie!
    "C:\Program Files (x86)\Tesseract-OCR\tesseract.exe" --version
    goto :check_langs
)

echo ========================================
echo [FOUT] TESSERACT NIET GEVONDEN!
echo ========================================
echo.
echo Tesseract OCR is NIET geinstalleerd!
echo.
echo OPLOSSING:
echo 1. Download Tesseract van:
echo    https://github.com/UB-Mannheim/tesseract/wiki
echo.
echo 2. Download dit bestand:
echo    tesseract-ocr-w64-setup-5.5.0.20241111.exe (64-bit)
echo.
echo 3. Dubbelklik op het bestand om te installeren
echo.
echo 4. Tijdens installatie:
echo    - Klik "Next" door de wizard
echo    - Accepteer licentie
echo    - Laat standaard locatie staan: C:\Program Files\Tesseract-OCR
echo    - Klik "Install"
echo    - Wacht tot installatie klaar is
echo.
echo 5. NA installatie, run dit script opnieuw:
echo    .\INSTALLEER_TESSERACT_EERST.bat
echo.
pause
exit /b 1

:check_langs
echo.
echo ========================================
echo CHECK GEINSTALLEERDE TALEN
echo ========================================
echo.

if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    set TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
) else (
    set TESSERACT_PATH=C:\Program Files (x86)\Tesseract-OCR\tesseract.exe
)

"%TESSERACT_PATH%" --list-langs | findstr /i "nld" >nul
if errorlevel 1 (
    echo [FOUT] Dutch (nld) NIET geinstalleerd!
    echo.
    echo OPLOSSING:
    echo 1. Download Dutch language data:
    echo    https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata
    echo.
    echo 2. Kopieer naar tessdata map:
    if exist "C:\Program Files\Tesseract-OCR\tessdata\" (
        echo    C:\Program Files\Tesseract-OCR\tessdata\
    ) else (
        echo    C:\Program Files (x86)\Tesseract-OCR\tessdata\
    )
    echo.
    echo 3. Run: .\INSTALLEER_DUTCH.bat
    echo.
) else (
    echo [OK] Dutch (nld) is geinstalleerd!
)

echo.
pause

