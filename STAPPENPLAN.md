# STAPPENPLAN: Interactieve Planningsmodule

## 📋 OVERZICHT VAN HET PROJECT

**Doel:** Een interactieve planningsmodule maken met Python + HTML die:
- Orderdata kan invoeren en beheren
- Planningsoverzicht toont met status updates
- Meldingen en suggesties geeft
- Zoekfunctionaliteit heeft
- Zelflerend systeem heeft

---

## 🎯 FASE 1: PROJECTSTRUCTUUR OPZETTEN

### Stap 1.1: Mappenstructuur aanmaken
```
Planning Industrie AI gestuurd/
├── app/                    # Hoofdapplicatie
│   ├── __init__.py
│   ├── main.py            # FastAPI applicatie
│   ├── models.py          # Data modellen
│   ├── database.py        # Excel database handler
│   └── ai_suggestions.py  # Zelflerend systeem
├── templates/              # HTML templates
│   ├── index.html         # Hoofdpagina
│   ├── orders.html        # Order overzicht
│   └── planning.html      # Planning dashboard
├── static/                 # CSS, JS, images
│   ├── css/
│   └── js/
├── data/                   # Data bestanden
│   ├── orders.xlsx        # Order database (backup van origineel)
│   └── standards.xlsx     # Standaard doorlooptijden
├── requirements.txt       # Python dependencies
├── README.md              # Documentatie
└── run.py                 # Start script
```

### Stap 1.2: Git repository initialiseren
```bash
git init
git add .
git commit -m "Initial project setup"
```

---

## 🗄️ FASE 2: DATABASE & DATASTRUCTUUR

### Stap 2.1: Excel bestand analyseren en structureren
- **Huidige situatie:** Data verspreid over 24 tabbladen
- **Nieuwe structuur:**
  - **Orders tabblad:** Alle orderdata in één gestructureerde tabel
  - **Standards tabblad:** Standaard doorlooptijden en klantspecifieke eisen
  - **History tabblad:** Geschiedenis voor zelflerend systeem

### Stap 2.2: Data model definiëren
**Order velden:**
- Ordernummer (uniek)
- Klant
- Korte omschrijving
- Klantreferentie
- Conservering
- Conserveringsdatum
- Leverdatum
- Uren voorbereiding
- Uren samenstellen
- Uren aflassen
- Status checkboxes:
  - Materiaal besteld (boolean)
  - Materiaal binnen (boolean)
  - Productie gereed (boolean)
  - Project gereed (boolean)
- Datum aangemaakt
- Laatste update

### Stap 2.3: Python database handler maken
- Functies om Excel te lezen/schrijven
- Validatie van data
- Backup functionaliteit

---

## 🖥️ FASE 3: BACKEND (FastAPI)

### Stap 3.1: FastAPI applicatie opzetten
**Endpoints:**
- `GET /` - Hoofdpagina
- `GET /api/orders` - Alle orders ophalen
- `GET /api/orders/{id}` - Specifieke order ophalen
- `POST /api/orders` - Nieuwe order aanmaken
- `PUT /api/orders/{id}` - Order updaten
- `DELETE /api/orders/{id}` - Order verwijderen
- `GET /api/search?q={query}` - Zoeken in orders
- `GET /api/suggestions/{order_id}` - AI suggesties voor order
- `GET /api/planning` - Planningsoverzicht
- `GET /api/standards` - Standaard doorlooptijden ophalen
- `POST /api/standards` - Standaard doorlooptijd toevoegen/updaten

### Stap 3.2: Data validatie
- Pydantic modellen voor order validatie
- Datum validatie
- Unieke ordernummer check

---

## 🎨 FASE 4: FRONTEND (HTML/CSS/JavaScript)

### Stap 4.1: HTML templates maken
**index.html:**
- Navigatie menu
- Zoekbalk (bovenaan)
- Quick stats (aantal orders, deadlines, etc.)

**orders.html:**
- Order invoerformulier
- Order overzichtstabel
- Filter opties (status, klant, datum)
- Status checkboxes

**planning.html:**
- Gantt-achtige planning weergave
- Kalender view
- Status kolommen
- Drag & drop functionaliteit (optioneel)

### Stap 4.2: JavaScript functionaliteit
- API calls naar FastAPI backend
- Real-time updates
- Zoekfunctionaliteit
- Form validatie
- Meldingen/pop-ups

### Stap 4.3: CSS styling
- Modern, professioneel design
- Responsive (werkt op mobiel)
- Kleurcodering voor status

---

## 🤖 FASE 5: ZELFlerend SYSTEEM

### Stap 5.1: Data verzameling
- Log alle statuswijzigingen
- Sla doorlooptijden op per order type
- Track vertragingen en oorzaken

### Stap 5.2: Machine Learning model
- Gebruik scikit-learn voor:
  - Voorspelling doorlooptijd
  - Risico analyse (kans op vertraging)
  - Resource planning suggesties

### Stap 5.3: Suggestie engine
- Analyseer historische data
- Geef suggesties voor:
  - Realistische leverdatum
  - Benodigde uren
  - Risico op vertraging
  - Beste startdatum

---

## 🔔 FASE 6: MELDINGEN & POP-UPS

### Stap 6.1: Melding systeem
**Types meldingen:**
- Deadline nadert (3 dagen voor leverdatum)
- Deadline overschreden
- Materiaal nog niet besteld maar productie start binnenkort
- Onrealistische planning (te weinig tijd)
- Suggesties voor betere planning

### Stap 6.2: Implementatie
- Backend: Check functie die regelmatig draait
- Frontend: Pop-ups of notificaties
- Optie: Email notificaties (later)

---

## 🔍 FASE 7: ZOEKFUNCTIE

### Stap 7.1: Zoekalgoritme
- Zoek in alle velden:
  - Ordernummer
  - Klant naam
  - Omschrijving
  - Klantreferentie
- Fuzzy search (vind ook bij typefouten)
- Filter combinaties

### Stap 7.2: UI implementatie
- Zoekbalk bovenaan elke pagina
- Real-time zoekresultaten
- Highlight matches
- Snelkoppelingen naar gevonden orders

---

## 📊 FASE 8: PLANNINGSOVERZICHT

### Stap 8.1: Dashboard
- Overzicht alle orders per status
- Kalender weergave
- Resource planning (uren per medewerker)
- Gantt chart (optioneel)

### Stap 8.2: Status updates
- Checkboxes direct in overzicht
- Drag & drop tussen statussen
- Bulk updates

---

## 🧪 FASE 9: TESTEN

### Stap 9.1: Functionaliteit testen
- Order CRUD operaties
- Zoekfunctionaliteit
- Status updates
- Meldingen

### Stap 9.2: Data migratie
- Bestaande Excel data importeren
- Validatie van geïmporteerde data
- Backup van origineel bestand

---

## 🚀 FASE 10: DEPLOYMENT

### Stap 10.1: Lokaal draaien
- FastAPI server starten
- Browser openen naar localhost
- Testen met echte data

### Stap 10.2: Productie (later optie)
- Docker container
- Cloud deployment (Azure, AWS, etc.)
- Of: Lokale server met toegang via netwerk

---

## 📝 TECHNISCHE DETAILS

### Python Packages gebruikt:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pandas` - Data manipulatie
- `openpyxl` - Excel lezen/schrijven
- `scikit-learn` - Machine learning
- `jinja2` - HTML templating

### Best practices:
- Code structureren in modules
- Error handling
- Logging
- Data validatie
- Backup strategie

---

## ⏱️ GESCHATTE TIJD

- Fase 1-2: 2-3 uur (structuur + database)
- Fase 3: 4-5 uur (backend)
- Fase 4: 5-6 uur (frontend)
- Fase 5: 3-4 uur (AI systeem)
- Fase 6-7: 2-3 uur (meldingen + zoeken)
- Fase 8: 3-4 uur (planningsoverzicht)
- Fase 9-10: 2-3 uur (testen + deployment)

**Totaal: ~25-30 uur werk**

---

## 🎯 VOLGENDE STAPPEN

1. ✅ Pakketten geïnstalleerd
2. ⏭️ Projectstructuur aanmaken
3. ⏭️ Database handler schrijven
4. ⏭️ FastAPI basis opzetten
5. ⏭️ HTML templates maken
6. ⏭️ Functionaliteit stap voor stap toevoegen

