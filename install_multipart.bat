@echo off
echo ========================================
echo python-multipart Installatie Script
echo ========================================
echo.

cd /d "%~dp0"

echo Stap 1: Controleren welke Python versie gebruikt wordt...
python --version
echo.

echo Stap 2: Bepalen Python executable pad...
python -c "import sys; print('Python pad:', sys.executable)"
echo.

echo Stap 3: Controleren of python-multipart al geïnstalleerd is...
python -c "import multipart; print('python-multipart is al geïnstalleerd!')" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo python-multipart is al geïnstalleerd!
    goto :test
)

echo python-multipart niet gevonden. Installeren...
echo.

echo Stap 4: Installeren via python -m pip...
python -m pip install python-multipart
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Installatie succesvol via python -m pip!
    goto :test
)

echo.
echo Methode 1 faalde, proberen via pip direct...
pip install python-multipart
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Installatie succesvol via pip!
    goto :test
)

echo.
echo Methode 2 faalde, proberen met --user flag...
python -m pip install --user python-multipart
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Installatie succesvol met --user flag!
    goto :test
)

echo.
echo ERROR: Installatie mislukt via alle methoden!
echo.
echo Probeer handmatig:
echo   1. Open Command Prompt als Administrator
echo   2. Typ: python -m pip install python-multipart
echo.
pause
exit /b 1

:test
echo.
echo Stap 5: Verifiëren installatie...
python -c "import multipart; print('SUCCES: python-multipart kan worden geïmporteerd!')"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: python-multipart is geïnstalleerd maar kan niet worden geïmporteerd
    echo Dit kan betekenen dat:
    echo   - Je meerdere Python installaties hebt
    echo   - De server moet worden herstart
    echo   - Je een virtual environment moet activeren
) else (
    echo.
    echo ========================================
    echo Installatie succesvol!
    echo ========================================
    echo.
    echo Je kunt nu de server starten met: python run.py
    echo.
)

pause

