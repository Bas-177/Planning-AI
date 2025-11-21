# Gedetailleerde Instructies: python-multipart Installeren

## Stap 1: Bepaal welke Python versie je gebruikt

### Methode A: Via Command Prompt
1. Open **Command Prompt** (cmd) of **PowerShell**
2. Typ:
   ```cmd
   python --version
   ```
3. Noteer de versie (bijv. Python 3.11.0 of Python 3.14.0)

### Methode B: Bepaal het volledige pad naar Python
1. Open Command Prompt
2. Typ:
   ```cmd
   where python
   ```
   Dit toont het volledige pad naar Python (bijv. `C:\Users\Dell Precision\AppData\Local\Programs\Python\Python314\python.exe`)

## Stap 2: Bepaal het pad naar pip

1. In dezelfde Command Prompt, typ:
   ```cmd
   where pip
   ```
2. Noteer het pad (bijv. `C:\Users\Dell Precision\AppData\Local\Programs\Python\Python314\Scripts\pip.exe`)

## Stap 3: Controleer of python-multipart al geïnstalleerd is

Typ in Command Prompt:
```cmd
pip show python-multipart
```

**Als je een foutmelding krijgt** → python-multipart is niet geïnstalleerd
**Als je informatie ziet** → python-multipart is al geïnstalleerd, maar mogelijk in een andere omgeving

## Stap 4: Installeer python-multipart

### Optie A: Standaard installatie (meestal voldoende)
```cmd
pip install python-multipart
```

### Optie B: Met specifieke versie
```cmd
pip install python-multipart==0.0.9
```

### Optie C: Met volledig pad naar pip (als Optie A niet werkt)
1. Gebruik het pad dat je in Stap 2 hebt gevonden
2. Typ (vervang met jouw pad):
   ```cmd
   "C:\Users\Dell Precision\AppData\Local\Programs\Python\Python314\Scripts\pip.exe" install python-multipart
   ```

### Optie D: Met volledig pad naar python (als pip niet werkt)
1. Gebruik het pad dat je in Stap 1 hebt gevonden
2. Typ (vervang met jouw pad):
   ```cmd
   "C:\Users\Dell Precision\AppData\Python\Python314\python.exe" -m pip install python-multipart
   ```

### Optie E: Installatie voor huidige gebruiker (als je geen admin rechten hebt)
```cmd
pip install --user python-multipart
```

## Stap 5: Verifieer de installatie

Typ:
```cmd
pip show python-multipart
```

Je zou moeten zien:
- **Name:** python-multipart
- **Version:** 0.0.9 (of hoger)
- **Location:** Het pad waar het geïnstalleerd is

## Stap 6: Test of het werkt

Typ:
```cmd
python -c "import multipart; print('python-multipart is succesvol geïnstalleerd!')"
```

**Als je geen foutmelding ziet** → Succes!
**Als je een foutmelding ziet** → Ga naar Probleemoplossing

## Probleemoplossing

### Probleem 1: "pip is not recognized"
**Oplossing:**
1. Python is mogelijk niet in je PATH
2. Probeer `python -m pip install python-multipart` in plaats van `pip install python-multipart`

### Probleem 2: "Permission denied" of "Access denied"
**Oplossing 1:** Run Command Prompt als Administrator
1. Zoek "Command Prompt" in Start menu
2. Rechtsklik → "Als administrator uitvoeren"
3. Probeer opnieuw: `pip install python-multipart`

**Oplossing 2:** Installeer alleen voor jouw gebruiker
```cmd
pip install --user python-multipart
```

### Probleem 3: Meerdere Python installaties
**Symptoom:** python-multipart wordt geïnstalleerd, maar je app ziet het nog steeds niet

**Oplossing:**
1. Bepaal welke Python je app gebruikt:
   ```cmd
   cd "N:\12. Bas\Algemeen\2025\8. TEST AI - Divers\Planning Industrie AI gestuurd"
   python -c "import sys; print(sys.executable)"
   ```
2. Noteer het pad dat wordt getoond
3. Installeer python-multipart met dat specifieke Python:
   ```cmd
   "<PAD_NAAR_PYTHON>" -m pip install python-multipart
   ```
   Vervang `<PAD_NAAR_PYTHON>` met het pad uit stap 1

### Probleem 4: Installatie lukt, maar FastAPI ziet het nog niet
**Oplossing:** Herstart de server na installatie
1. Stop de server (Ctrl+C in terminal)
2. Start opnieuw: `python run.py`

### Probleem 5: Virtual environment
**Als je een virtual environment gebruikt:**
1. Activeer eerst de virtual environment:
   ```cmd
   venv\Scripts\activate
   ```
2. Installeer dan: `pip install python-multipart`

## Automatische Installatie Script

Als handmatige installatie problemen geeft, gebruik het script:

**Windows Batch Script:**
Maak een bestand `install_multipart.bat` met deze inhoud:
```batch
@echo off
echo Installing python-multipart...
echo.

REM Probeer verschillende methoden
python -m pip install python-multipart
if %ERRORLEVEL% NEQ 0 (
    echo Methode 1 faalde, probeer methode 2...
    pip install python-multipart
    if %ERRORLEVEL% NEQ 0 (
        echo Methode 2 faalde, probeer methode 3...
        pip install --user python-multipart
    )
)

echo.
echo Testing installatie...
python -c "import multipart; print('SUCCES: python-multipart is geïnstalleerd!')"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: python-multipart kon niet worden geïmporteerd
    echo Mogelijk moet je de server herstarten
)

pause
```

## Belangrijk: Na installatie

1. **Herstart de server** (stop met Ctrl+C en start opnieuw met `python run.py`)
2. **Test de installatie** door naar http://localhost:8000 te gaan
3. **Test OCR functionaliteit** door een order aan te maken en een screenshot te uploaden

## Verificatie Checklist

- [ ] Python versie bepaald: `python --version`
- [ ] Pip pad bepaald: `where pip` of `where python -m pip`
- [ ] python-multipart geïnstalleerd: `pip install python-multipart`
- [ ] Installatie geverifieerd: `pip show python-multipart`
- [ ] Python kan het importeren: `python -c "import multipart"`
- [ ] Server herstart na installatie
- [ ] App laadt zonder errors
- [ ] OCR endpoint werkt (optioneel)

## Hulp nodig?

Als het na deze stappen nog steeds niet werkt, verzamel deze informatie:
1. Output van `python --version`
2. Output van `pip show python-multipart` (of foutmelding)
3. Output van `python -c "import sys; print(sys.executable)"`
4. Foutmelding die je ziet bij het starten van de server

