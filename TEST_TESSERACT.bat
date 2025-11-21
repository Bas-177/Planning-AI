@echo off
REM Script om Tesseract installatie te testen
echo ========================================
echo TESSERACT INSTALLATIE TEST
echo ========================================
echo.

echo STAP 1: Test Tesseract versie...
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo [X] Tesseract is NIET geinstalleerd of niet in PATH!
    echo.
    echo Oplossingen:
    echo 1. Installeer Tesseract van: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Voeg Tesseract toe aan PATH (zie STAPPENPLAN_PYTESSERACT_EENVOUDIG.md)
    echo 3. Of configureer pad handmatig in app/main.py
    echo.
) else (
    echo [OK] Tesseract is geinstalleerd!
    echo.
    tesseract --version
    echo.
)

echo STAP 2: Test geinstalleerde talen...
tesseract --list-langs >nul 2>&1
if errorlevel 1 (
    echo [X] Kan talen niet ophalen!
) else (
    echo [OK] Geinstalleerde talen:
    tesseract --list-langs
    echo.
    tesseract --list-langs | findstr /i "nld" >nul
    if errorlevel 1 (
        echo [X] Dutch (nld) is NIET geinstalleerd!
        echo.
        echo Oplossing: Run INSTALLEER_DUTCH.bat of zie STAPPENPLAN_PYTESSERACT_EENVOUDIG.md
        echo.
    ) else (
        echo [OK] Dutch (nld) is geinstalleerd!
        echo.
    )
)

echo STAP 3: Test Python pytesseract...
python -c "import pytesseract; print('[OK] Pytesseract is geinstalleerd!')" 2>nul
if errorlevel 1 (
    echo [X] Pytesseract is NIET geinstalleerd!
    echo.
    echo Oplossing: pip install pytesseract
    echo.
) else (
    python -c "import pytesseract; print('Versie:', pytesseract.__version__)"
    echo.
)

echo STAP 4: Test Tesseract pad configuratie...
python -c "import pytesseract; pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'; print('[OK] Pad configuratie werkt!')" 2>nul
if errorlevel 1 (
    echo [X] Pad configuratie werkt NIET!
    echo.
    echo Oplossing: Pas pad aan in app/main.py (zie STAPPENPLAN_PYTESSERACT_EENVOUDIG.md STAP 6)
    echo.
) else (
    echo [OK] Pad configuratie werkt!
    echo.
)

echo ========================================
echo TEST VOLTOOID
echo ========================================
echo.
pause

