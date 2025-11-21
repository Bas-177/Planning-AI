@echo off
REM Script om pytesseract te installeren
echo ========================================
echo INSTALLEER PYTESSERACT
echo ========================================
echo.

echo Controleer Python...
python --version
if errorlevel 1 (
    echo FOUT: Python is niet gevonden!
    pause
    exit /b 1
)
echo.

echo Installeer pytesseract...
python -m pip install pytesseract
if errorlevel 1 (
    echo.
    echo FOUT: Installatie mislukt!
    echo.
    echo Probeer handmatig:
    echo python -m pip install pytesseract
    echo.
    pause
    exit /b 1
)

echo.
echo Test installatie...
python -c "import pytesseract; print('SUCCES: pytesseract versie', pytesseract.__version__)"
if errorlevel 1 (
    echo FOUT: pytesseract werkt niet na installatie!
    pause
    exit /b 1
)

echo.
echo ========================================
echo INSTALLATIE VOLTOOID!
echo ========================================
echo.
echo pytesseract is nu geinstalleerd.
echo.
echo Volgende stap: Installeer Tesseract OCR (als dat nog niet gedaan is)
echo Zie: WAT_NU.md
echo.
pause

