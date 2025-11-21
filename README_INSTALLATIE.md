# Planning Industrie AI - Installatie Instructies

## Vereisten

- Python 3.8 of hoger
- pip (Python package manager)

## Installatie

### Stap 1: Installeer alle benodigde packages

Open een terminal/command prompt in deze folder en voer uit:

```bash
pip install -r requirements.txt
```

OF dubbelklik op: `INSTALL_DEPENDENCIES.bat`

### Stap 2: Start de server

**Optie A: Via batch bestand**
- Dubbelklik op: `INSTALL_AND_START.bat` (installeert alles en start server)
- OF dubbelklik op: `START_SERVER.bat` (start alleen server)

**Optie B: Via command line**
```bash
python run.py
```

### Stap 3: Open de applicatie

Open je browser en ga naar: **http://localhost:8000**

## Problemen oplossen

### Fout: "python-multipart is not installed"

**Oplossing:**
```bash
pip install python-multipart
```

### Fout: "ERR_CONNECTION_REFUSED"

**Oplossing:**
- Check of de server draait (zie terminal/command prompt)
- Check of poort 8000 niet al in gebruik is
- Start de server opnieuw

### Fout: "Module not found"

**Oplossing:**
```bash
pip install -r requirements.txt
```

### Fout: "Permission denied" of "Access denied"

**Oplossing:**
- Run als Administrator (Windows: rechtsklik → "Als administrator uitvoeren")
- OF gebruik: `pip install --user -r requirements.txt`

## Beschikbare pagina's

Na het starten van de server:

- **Home:** http://localhost:8000/
- **Orders:** http://localhost:8000/orders
- **Planning (Kanban):** http://localhost:8000/planning
- **Week Planning (7 dagen):** http://localhost:8000/planning/week
- **Medewerkers:** http://localhost:8000/medewerkers
- **Agenda:** http://localhost:8000/agenda

## Belangrijke bestanden

- `run.py` - Start script voor de server
- `requirements.txt` - Lijst van benodigde Python packages
- `app/main.py` - Hoofdapplicatie (FastAPI)
- `app/database.py` - Database handler (Excel bestanden)
- `data/` - Folder met Excel database bestanden

## Ondersteuning

Voor problemen, check:
1. Browser console (F12 → Console tab) voor JavaScript errors
2. Terminal/command prompt voor Python errors
3. `TROUBLESHOOTING.md` voor veelvoorkomende problemen

