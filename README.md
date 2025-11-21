# Planning Industrie AI Module

Interactieve planningsmodule met Python + HTML voor orderbeheer en planning.

## 🚀 Snel Starten

### 1. Installeer dependencies
```bash
pip install -r requirements.txt
```

### 2. Start de server
```bash
python run.py
```

### 3. Open in browser
Ga naar: http://localhost:8000

## 📁 Project Structuur

```
Planning Industrie AI gestuurd/
├── app/                    # Python applicatie
│   ├── main.py            # FastAPI server
│   ├── models.py          # Data modellen
│   ├── database.py        # Excel database handler
│   └── ai_suggestions.py  # AI suggestie engine
├── templates/              # HTML templates
├── static/                 # CSS en JavaScript
├── data/                   # Data bestanden (Excel)
└── run.py                 # Start script
```

## 🎯 Functionaliteiten

- ✅ Order CRUD (Create, Read, Update, Delete)
- ✅ Zoekfunctionaliteit
- ✅ Status tracking (checkboxes)
- ✅ Planningsoverzicht
- ✅ Meldingen systeem
- ✅ AI suggesties (zelflerend)
- ✅ Standaard doorlooptijden beheer

## 📝 API Endpoints

### Orders
- `GET /api/orders` - Alle orders
- `GET /api/orders/{id}` - Specifieke order
- `POST /api/orders` - Nieuwe order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Verwijder order

### Zoeken
- `GET /api/search?q={query}` - Zoek in orders

### Planning
- `GET /api/planning` - Planningsoverzicht
- `GET /api/notifications` - Meldingen
- `GET /api/suggestions/{id}` - AI suggesties

### Standards
- `GET /api/standards` - Standaard doorlooptijden
- `POST /api/standards` - Voeg standaard toe

## 🔧 Technologie

- **Backend:** FastAPI (Python)
- **Frontend:** HTML, CSS, JavaScript
- **Database:** Excel (openpyxl)
- **AI:** scikit-learn voor suggesties

## 📖 Documentatie

Zie `STAPPENPLAN.md` voor gedetailleerd implementatieplan.

## 🔄 Volgende Stappen

1. HTML templates uitbreiden (orders.html, planning.html)
2. Excel data migreren van origineel bestand
3. AI suggesties verbeteren met historische data
4. Meldingen systeem uitbreiden
5. Mobile responsive maken

## 📞 Support

Voor vragen of problemen, check de documentatie of maak een issue aan.

