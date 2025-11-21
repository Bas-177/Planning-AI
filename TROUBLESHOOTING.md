# Troubleshooting - Planning Industrie AI

## Server starten

1. **Via command line:**
   ```bash
   python run.py
   ```

2. **Via batch bestand (Windows):**
   Dubbelklik op `START_SERVER.bat`

3. **Controleer of de server draait:**
   Open browser: `http://localhost:8000`

## Veelvoorkomende problemen

### 1. ERR_CONNECTION_REFUSED
**Probleem:** Server draait niet
**Oplossing:** 
- Start de server met `python run.py`
- Controleer of poort 8000 niet al in gebruik is
- Check firewall instellingen

### 2. Pagina laadt niet / JavaScript errors
**Probleem:** Code errors in JavaScript
**Oplossing:**
- Open browser developer tools (F12)
- Check Console tab voor errors
- Controleer Network tab of alle bestanden laden

### 3. Planning pagina toont geen data
**Probleem:** Geen medewerkers of orders in database
**Oplossing:**
- Ga naar `/medewerkers` en voeg medewerkers toe
- Ga naar `/orders` en voeg orders toe
- Controleer of medewerkers "actief" zijn

### 4. Week planning toont geen dagen
**Probleem:** JavaScript error in planning-week.js
**Oplossing:**
- Check browser console voor errors
- Zorg dat je naar `/planning/week` gaat (niet `/planning`)
- Controleer of alle CSS bestanden laden

### 5. Database errors
**Probleem:** Excel bestanden kunnen niet gelezen worden
**Oplossing:**
- Check of Excel bestanden niet open zijn in Excel
- Controleer rechten op `data/` folder
- Check of pandas en openpyxl geïnstalleerd zijn: `pip install -r requirements.txt`

## Beschikbare pagina's

- Home: `http://localhost:8000/`
- Orders: `http://localhost:8000/orders`
- Planning (Kanban): `http://localhost:8000/planning`
- Week Planning (7 dagen): `http://localhost:8000/planning/week`
- Medewerkers: `http://localhost:8000/medewerkers`
- Agenda: `http://localhost:8000/agenda`

## API Endpoints

- Alle orders: `http://localhost:8000/api/orders`
- Medewerkers: `http://localhost:8000/api/medewerkers`
- Week planning: `http://localhost:8000/api/week-planning?week_nummer=1&jaar=2025`
- OCR screenshot: `POST http://localhost:8000/api/ocr/screenshot`

## Debug tips

1. **Browser Console openen:** F12 → Console tab
2. **Network requests checken:** F12 → Network tab
3. **Server logs bekijken:** Check terminal waar server draait
4. **Python errors:** Check terminal output voor stack traces

## Contact

Voor problemen, check de browser console en server logs voor specifieke error messages.

