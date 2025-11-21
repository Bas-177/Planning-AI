@echo off
REM Script voor installatie van Pytesseract
REM Dit script helpt je door het installatieproces

echo ========================================
echo PYTESSERACT INSTALLATIE SCRIPT
echo ========================================
echo.

echo STAP 1: Controleer of Python geinstalleerd is...
python --version
if errorlevel 1 (
    echo FOUT: Python is niet geinstalleerd!
    echo Installeer eerst Python van https://www.python.org/
    pause
    exit /b 1
)
echo Python is geinstalleerd!
echo.

echo STAP 2: Installeer pytesseract Python package...
pip install pytesseract
if errorlevel 1 (
    echo FOUT: Installatie van pytesseract mislukt!
    pause
    exit /b 1
)
echo pytesseract is geinstalleerd!
echo.

echo STAP 3: Controleer of Tesseract OCR geinstalleerd is...
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo WAARSCHUWING: Tesseract OCR is niet gevonden!
    echo.
    echo Je moet Tesseract OCR eerst installeren:
    echo 1. Download van: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Installeer het programma
    echo 3. Voeg het toe aan PATH of configureer het pad in app/main.py
    echo.
    echo Zie INSTALL_PYTESSERACT.md voor gedetailleerde instructies.
    echo.
    pause
    exit /b 1
)

echo Tesseract OCR is geinstalleerd!
tesseract --version
echo.

echo STAP 4: Controleer Nederlandse taal data...
tesseract --list-langs | findstr /i "nld" >nul
if errorlevel 1 (
    echo.
    echo WAARSCHUWING: Nederlandse taal data niet gevonden!
    echo Je moet Tesseract herinstalleren en "Dutch" language data selecteren.
    echo.
) else (
    echo Nederlandse taal data is gevonden!
)
echo.

echo ========================================
echo INSTALLATIE VOLTOOID!
echo ========================================
echo.
echo Test de OCR functionaliteit:
echo 1. Start de server: python run.py
echo 2. Ga naar http://localhost:8000/orders
echo 3. Upload een screenshot
echo.

pause

