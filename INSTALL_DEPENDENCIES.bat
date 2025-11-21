@echo off
cd /d "%~dp0"
echo Installing required Python packages...
echo.
pip install -r requirements.txt
echo.
echo Installation complete!
echo.
pause

