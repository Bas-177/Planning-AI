@echo off
REM Script om te vinden waar Tesseract geinstalleerd is
echo ========================================
echo ZOEK TESSERACT INSTALLATIE
echo ========================================
echo.

echo Zoeken naar Tesseract...
echo.

REM Check standaard locaties
if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    echo [GEVONDEN] C:\Program Files\Tesseract-OCR\tesseract.exe
    goto :test
)

if exist "C:\Program Files (x86)\Tesseract-OCR\tesseract.exe" (
    echo [GEVONDEN] C:\Program Files (x86)\Tesseract-OCR\tesseract.exe
    goto :test
)

if exist "C:\Tesseract-OCR\tesseract.exe" (
    echo [GEVONDEN] C:\Tesseract-OCR\tesseract.exe
    goto :test
)

REM Zoek op hele C: schijf
echo Zoeken op C: schijf (kan even duren)...
for /r "C:\Program Files" %%i in (tesseract.exe) do (
    if exist "%%i" (
        echo [GEVONDEN] %%i
        goto :test
    )
)

for /r "C:\Program Files (x86)" %%i in (tesseract.exe) do (
    if exist "%%i" (
        echo [GEVONDEN] %%i
        goto :test
    )
)

echo [NIET GEVONDEN] Tesseract is niet geinstalleerd!
echo.
echo Oplossing: Installeer Tesseract van:
echo https://github.com/UB-Mannheim/tesseract/wiki
echo.
pause
exit /b 1

:test
echo.
echo Test Tesseract...
"C:\Program Files\Tesseract-OCR\tesseract.exe" --version 2>nul
if errorlevel 1 (
    echo [FOUT] Tesseract werkt niet op deze locatie
) else (
    echo [OK] Tesseract werkt!
    echo.
    echo Geinstalleerde talen:
    "C:\Program Files\Tesseract-OCR\tesseract.exe" --list-langs 2>nul
)

echo.
pause

