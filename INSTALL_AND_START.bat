@echo off
echo ========================================
echo Planning Industrie AI - Installatie
echo ========================================
echo.
cd /d "%~dp0"
echo Huidige directory: %CD%
echo.
echo Stap 1: Installing Python packages...
pip install python-multipart fastapi uvicorn pandas openpyxl scikit-learn jinja2 Pillow
echo.
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Package installatie mislukt!
    echo Zorg dat Python en pip geïnstalleerd zijn.
    pause
    exit /b 1
)
echo.
echo Stap 2: Starting server...
echo.
python run.py
pause

