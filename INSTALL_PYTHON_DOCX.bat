@echo off
echo ========================================
echo Installatie van python-docx
echo ========================================
echo.

echo Stap 1: Installeren van python-docx...
python -m pip install python-docx

echo.
echo Stap 2: Controleren of installatie succesvol was...
python -c "import docx; print('SUCCES: python-docx is geïnstalleerd!')"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FOUT: python-docx kon niet worden geïnstalleerd.
    echo.
    echo Mogelijke oplossingen:
    echo 1. Controleer of Python correct is geïnstalleerd
    echo 2. Probeer handmatig: pip install python-docx
    echo 3. Controleer je internetverbinding
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo Installatie voltooid!
    echo ========================================
    echo.
    echo python-docx is nu geïnstalleerd.
    echo Je kunt nu Word documenten (.docx) uploaden.
    echo.
    echo Herstart de server om de wijzigingen door te voeren.
    echo.
    pause
)

