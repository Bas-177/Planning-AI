# Planning Industrie AI

Een complete planningsapplicatie voor industriële projectplanning met orderbeheer, medewerkerplanning, OCR functionaliteit en intelligente planning.

## 🚀 Snel Starten

### 1. Installeer Dependencies
```bash
pip install -r requirements.txt
```

**Belangrijk:** Als je OCR functionaliteit wilt gebruiken (screenshot/PDF/Word upload):
- Installeer Tesseract OCR: Zie `INSTALL_PYTESSERACT.md`
- Installeer Python packages: `pip install pytesseract python-docx PyPDF2`

### 2. Start de Server
```bash
python run.py
```

Of gebruik de batch file (Windows):
```bash
QUICK_START.bat
```

### 3. Open in Browser
Ga naar: **http://localhost:8000**

## 📁 Project Structuur

```
Planning Industrie AI gestuurd/
├── app/                    # Python applicatie
│   ├── main.py            # FastAPI server & routes
│   ├── models.py          # Pydantic data modellen
│   ├── database.py        # Excel database handler
│   └── ai_suggestions.py  # AI suggestie engine
├── templates/              # HTML templates
│   ├── orders.html        # Order beheer
│   ├── planning_week.html # Week planning view
│   ├── projectplanning.html # Project planning (Gantt)
│   ├── medewerkers.html   # Medewerker beheer
│   └── data.html          # Standaard data (doorlooptijden)
├── static/                 # Frontend assets
│   ├── js/                # JavaScript modules
│   │   ├── orders.js      # Order functionaliteit
│   │   ├── planning-week.js # Week planning logica
│   │   ├── projectplanning.js # Project planning logica
│   │   └── planning-auto.js # Automatische planning
│   └── css/               # Styling
├── data/                   # Data bestanden (Excel)
│   ├── orders.xlsx        # Order database
│   ├── medewerkers.xlsx   # Medewerker database
│   ├── order_assignments.xlsx # Toewijzingen
│   └── week_planning.xlsx # Week planning
└── run.py                 # Start script
```

## 🎯 Belangrijkste Functionaliteiten

### ✅ Orders Beheer
- **CRUD operaties** (Create, Read, Update, Delete)
- **OCR functionaliteit**: Upload screenshots/PDF/Word en automatisch gegevens uitlezen
  - Ordernummer (P##-####)
  - Klant naam
  - Omschrijving
  - Klantreferentie
  - Leverdatum
- **Order kopiëren** functie voor vergelijkbare orders
- **Status tracking** met checkboxes
- **Fase beheer**:
  - Voorbereiding (met parallel optie)
  - Productie (Samenstellen, Aflassen)
  - Conservering (meerdere types)
  - Montage
- **Materiaal beheer**: Bestelde materialen, leverdatum materiaal, opmerkingen

### ✅ Planning Functionaliteit
- **Persoonsplanning**: Weekoverzicht per medewerker
  - 7 dagen per week (Ma-Zo)
  - Dynamische rijhoogte op basis van aantal projecten
  - Projectbalken met dagen zichtbaar
  - Weekend kleuren (Za/Zo)
  - Weergave opties: Week, 2 Weken, Maand
- **Projectplanning**: Gantt-stijl overzicht
  - Alle projecten chronologisch gesorteerd
  - Productie, Conservering, Montage balken
  - Milestones voor conserveringsdatum en leverdatum
- **Automatische planning**: 
  - Alle projecten met leverdatum worden automatisch gepland
  - Assignments worden automatisch gegenereerd
  - Datums worden automatisch berekend op basis van:
    - Leverdatum
    - Conserveringsdatum
    - Materiaalbeschikbaarheid
    - Logische volgorde (7 stappen)

### ✅ Medewerkers Beheer
- CRUD voor medewerkers
- Standaard uren per dag (Ma t/m Zo)
- Uren per week berekening
- Actief/inactief status

### ✅ Intelligente Planning Logica
De planning volgt een strikte 7-stap logica:
1. **Materiaal binnen?** - Check materiaalbeschikbaarheid
2. **Voorbereiding** - Kan parallel lopen met productie (optie)
3. **Samenstellen** - Start na voorbereiding (of direct bij parallel)
4. **Aflassen** - Start gelijk met samenstellen, kan langer duren
5. **Conservering** - Start na productie (alleen als aangevinkt + datum + doorlooptijd)
6. **Montage** - Start na conservering (of productie)
7. **Uitlevering** - Leverdatum (milestone)

**Weekend regels:**
- Geen planning op zondag (altijd)
- Zaterdag alleen als medewerker uren heeft ingevuld

### ✅ Data Beheer
- Standaard doorlooptijden per conservering type
- Herbruikbare instellingen

## 📝 API Endpoints

### Orders
- `GET /api/orders` - Alle orders ophalen
- `GET /api/orders/{ordernummer}` - Specifieke order
- `POST /api/orders` - Nieuwe order aanmaken
- `PUT /api/orders/{ordernummer}` - Order bijwerken
- `DELETE /api/orders/{ordernummer}` - Order verwijderen

### Order Assignments
- `GET /api/order-assignments` - Alle toewijzingen
- `POST /api/order-assignments` - Toewijzing toevoegen
- `DELETE /api/order-assignments/{ordernummer}/{medewerker}/{bewerking}` - Verwijderen

### Planning
- `GET /api/planning` - Planningsoverzicht (Kanban)
- `GET /api/planning/week` - Week planning
- `POST /api/week-planning` - Week planning instellen

### Medewerkers
- `GET /api/medewerkers` - Alle medewerkers
- `POST /api/medewerkers` - Medewerker toevoegen
- `PUT /api/medewerkers/{naam}` - Bijwerken
- `DELETE /api/medewerkers/{naam}` - Verwijderen

### OCR
- `POST /api/ocr/screenshot` - Upload screenshot/PDF/Word voor OCR

### Data
- `GET /api/standards` - Standaard doorlooptijden
- `POST /api/standards` - Voeg standaard toe

## 🔧 Technologie Stack

- **Backend**: FastAPI (Python 3.8+)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Database**: Excel bestanden (openpyxl, pandas)
- **OCR**: Tesseract OCR (pytesseract)
- **Document Processing**: python-docx, PyPDF2
- **AI**: scikit-learn voor suggesties (optioneel)

## 📋 Vereisten

### Python Packages
- FastAPI
- Uvicorn
- Pandas
- Openpyxl
- Pydantic
- python-multipart
- pytesseract (optioneel - voor OCR)
- python-docx (optioneel - voor Word processing)
- PyPDF2 (optioneel - voor PDF processing)

### Externe Software (optioneel)
- **Tesseract OCR**: Voor screenshot/PDF/Word OCR
  - Download: https://github.com/UB-Mannheim/tesseract/wiki
  - Installeer met Nederlandse taaldata

## 🐛 Bekende Issues / Work in Progress

1. ✅ JSON parse error bij order aanmaken - **GEFIXT** (datetime serialisatie)
2. ⏳ Planning toont nog niet alle projecten - Automatische assignment generatie werkt, maar moet getest worden
3. ⏳ Alle werkzaamheden moeten zichtbaar zijn in planning - Fallback naar order uren toegevoegd
4. ⏳ Productieplanning toont geen productie - Moet nog getest worden
5. ⏳ Uren wijzigen in week planning moet direct zichtbaar zijn
6. ⏳ Vrije dagen functionaliteit met uren invullen - Nog te implementeren

## 🚀 Vervolgstappen

1. Test alle functionaliteit grondig
2. Automatische assignment generatie verfijnen
3. Vrije dagen functionaliteit implementeren
4. Drag & drop planning implementeren
5. Conflict detectie verbeteren
6. Mobile responsive optimaliseren

## 📞 Support

Voor vragen of problemen:
1. Check de documentatie bestanden (`*.md`)
2. Bekijk troubleshooting guides
3. Maak een issue aan op GitHub

## 📝 Licentie

Dit project is ontwikkeld voor intern gebruik.

## 🔄 GitHub

Repository: https://github.com/Bas-177/Planning-AI.git

### GitHub Commands

**Wijzigingen pushen:**
```bash
git add .
git commit -m "Beschrijving van wijzigingen"
git push
```

**Wijzigingen ophalen:**
```bash
git pull
```

**Status bekijken:**
```bash
git status
```
