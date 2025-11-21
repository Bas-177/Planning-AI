@echo off
REM Script om OCR setup automatisch te fixen
echo ========================================
echo OCR SETUP FIXEN
echo ========================================
echo.

echo STAP 1: Installeer pytesseract...
pip install pytesseract
if errorlevel 1 (
    echo FOUT: Installatie mislukt!
    pause
    exit /b 1
)
echo.

echo STAP 2: Test installatie...
python CHECK_OCR_SETUP.py
echo.

echo STAP 3: Als Tesseract ontbreekt, download van:
echo https://github.com/UB-Mannheim/tesseract/wiki
echo.
echo Installeer Tesseract en selecteer Dutch language data.
echo.
pause

