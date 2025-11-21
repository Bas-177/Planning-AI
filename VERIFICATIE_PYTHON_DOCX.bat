@echo off
echo ========================================
echo Verificatie python-docx installatie
echo ========================================
echo.

echo Controleren of python-docx geïnstalleerd is...
python -c "import docx; print('SUCCES: python-docx is geïnstalleerd!')"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FOUT: python-docx is niet geïnstalleerd.
    echo.
    echo Installeer met: python -m pip install python-docx
    echo OF dubbelklik op: INSTALL_PYTHON_DOCX.bat
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo python-docx is geïnstalleerd en werkt!
    echo ========================================
    echo.
    echo Je kunt nu Word documenten (.docx) uploaden.
    echo Herstart de server om te gebruiken.
    echo.
    pause
)

