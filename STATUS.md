# Project Status

## ✅ Wat werkt al

1. **Orders Beheer**
   - ✅ CRUD operaties (Create, Read, Update, Delete)
   - ✅ OCR functionaliteit (Screenshot/PDF/Word upload)
   - ✅ Order kopiëren functie
   - ✅ Status tracking met checkboxes
   - ✅ Alle fases (Voorbereiding, Samenstellen, Aflassen, Conservering, Montage)
   - ✅ Materiaal beheer

2. **Planning Functionaliteit**
   - ✅ Automatische assignment generatie (`planning-auto.js`)
   - ✅ Week/2 Weken/Maand weergave
   - ✅ Dynamische rijhoogte op basis van aantal projecten
   - ✅ Weekend kleuren (Za/Zo)
   - ✅ Projectdetails modal bij klik op balk
   - ✅ Navigation (vorige/volgende week)

3. **Projectplanning**
   - ✅ Gantt-stijl overzicht
   - ✅ Chronologische sortering
   - ✅ Productie, Conservering, Montage balken
   - ✅ Milestones voor datums

4. **Medewerkers Beheer**
   - ✅ CRUD voor medewerkers
   - ✅ Standaard uren per dag
   - ✅ Actief/inactief status

5. **Data Beheer**
   - ✅ Standaard doorlooptijden per conservering type

6. **GitHub**
   - ✅ Repository verbonden en gepusht

## ⚠️ Bekende Problemen / Work in Progress

### 1. Planning toont niet alle projecten
**Probleem**: De planning toont nog niet alle projecten die zijn aangemaakt.

**Oorzaak**: 
- Automatische assignment generatie wordt uitgevoerd, maar projecten zonder assignments worden niet altijd correct weergegeven.
- Projecten zonder start_datum/eind_datum worden gefilterd.

**Status**: 
- ✅ Automatische assignment generatie is geïmplementeerd (`planning-auto.js`)
- ✅ Fallback logica toegevoegd om projecten zonder assignments te tonen
- ⏳ **Moet getest worden** of dit nu correct werkt

**Test stappen**:
1. Maak meerdere orders aan met verschillende leverdatums
2. Ga naar Planning pagina
3. Controleer of alle projecten zichtbaar zijn
4. Als niet: check console voor foutmeldingen

### 2. Niet alle werkzaamheden zichtbaar
**Probleem**: Voorbereiding, Samenstellen, Aflassen en Montage zijn niet allemaal zichtbaar in de planning.

**Status**:
- ✅ Fallback logica toegevoegd om uren uit order object te gebruiken
- ✅ Automatische assignment generatie voor alle bewerkingen
- ⏳ **Moet getest worden**

**Test stappen**:
1. Maak een order met:
   - Voorbereiding: 4 uren
   - Samenstellen: 8 uren
   - Aflassen: 6 uren
   - Montage: 8 uren
2. Ga naar Planning
3. Controleer of alle 4 werkzaamheden zichtbaar zijn

### 3. Productieplanning toont geen productie
**Probleem**: In de projectplanning is de productie balk niet zichtbaar voor alle projecten.

**Status**:
- ✅ Productie balk wordt nu getoond als `samenstellenUren > 0` of `aflassenUren > 0`
- ✅ Fallback naar order uren toegevoegd
- ⏳ **Moet getest worden**

**Test stappen**:
1. Ga naar "Projectplanning" tab
2. Controleer of alle projecten met productie een productie balk hebben

### 4. Foutmelding bij order aanmaken (maar order wordt wel aangemaakt)
**Status**: ✅ **GEFIXT** - JSON parse error opgelost door datetime serialisatie

### 5. Uren wijzigen in week planning moet direct zichtbaar zijn
**Status**: ⏳ Nog te implementeren - vereist real-time updates

### 6. Vrije dagen functionaliteit
**Status**: ⏳ Nog te implementeren

## 🔧 Technische Details

### Automatische Assignment Generatie
De functie `generateAutomaticAssignments()` in `static/js/planning-auto.js` wordt automatisch aangeroepen bij het laden van de planning pagina. Deze functie:

1. Haalt alle orders op met leverdatum of productie uren
2. Genereert assignments voor:
   - Voorbereiding (als `uren_voorbereiding > 0`)
   - Samenstellen (als `uren_samenstellen > 0`)
   - Aflassen (als `uren_aflassen > 0`)
   - Montage (als `heeft_montage === true`)

3. Kiest de medewerker met minste bestaande assignments voor die bewerking

4. Voegt assignments toe zonder start_datum/eind_datum (wordt later berekend)

### Project Weergave in Planning
In `static/js/planning-week.js`:

1. Projecten worden eerst opgehaald uit assignments
2. Als er geen assignments zijn, worden projecten gegenereerd uit order uren (regel 480-525)
3. Projecten worden gefilterd op basis van zichtbare weken (regel 548-571)
4. Fallback datums worden berekend als ze ontbreken (regel 573-596)

### Productieplanning
In `static/js/projectplanning.js`:

1. Productie balk wordt getoond als `samenstellenUren > 0` of `aflassenUren > 0`
2. Fallback naar order uren als geen assignments bestaan
3. Productie start = vroegste van samenstellen/aflassen start
4. Productie eind = laatste van samenstellen/aflassen eind

## 📝 Test Checklist

Voor een volledige test van de planning:

- [ ] Maak 3-5 orders aan met verschillende leverdatums
- [ ] Vul verschillende uren in voor:
  - [ ] Voorbereiding
  - [ ] Samenstellen
  - [ ] Aflassen
  - [ ] Montage
- [ ] Ga naar "Planning" tab
- [ ] Controleer:
  - [ ] Zijn alle orders zichtbaar?
  - [ ] Zijn alle werkzaamheden zichtbaar?
  - [ ] Zijn de projectbalken op de juiste dagen?
  - [ ] Werkt navigation (vorige/volgende week)?
  - [ ] Werkt weergave aanpassen (Week/2 Weken/Maand)?
- [ ] Ga naar "Projectplanning" tab
- [ ] Controleer:
  - [ ] Zijn alle projecten zichtbaar?
  - [ ] Hebben alle projecten met productie een productie balk?
  - [ ] Zijn de datums leesbaar?
  - [ ] Is de volgorde chronologisch?

## 🚀 Volgende Stappen

1. **Test de planning functionaliteit** zoals hierboven beschreven
2. **Rapporteer eventuele problemen** met:
   - Welke orders/projecten niet zichtbaar zijn
   - Console errors (F12 > Console)
   - Screenshots van wat je verwacht vs wat je ziet
3. **Als alles werkt**: Focus op nieuwe features (vrije dagen, real-time updates, etc.)

## 📞 Debugging Tips

Als projecten niet zichtbaar zijn:

1. **Open Browser Console** (F12 > Console)
2. **Check voor errors**
3. **Check assignments**: 
   ```javascript
   // In browser console:
   fetch('/api/order-assignments').then(r => r.json()).then(console.log)
   ```
4. **Check orders**:
   ```javascript
   // In browser console:
   fetch('/api/orders').then(r => r.json()).then(console.log)
   ```
5. **Check medewerkers**:
   ```javascript
   // In browser console:
   fetch('/api/medewerkers').then(r => r.json()).then(console.log)
   ```

## 📚 Gerelateerde Bestanden

- `static/js/planning-week.js` - Persoonsplanning logica
- `static/js/projectplanning.js` - Projectplanning logica
- `static/js/planning-auto.js` - Automatische assignment generatie
- `app/database.py` - Database operaties
- `app/main.py` - API endpoints

