# EENVOUDIG STAPPENPLAN: Pytesseract Installatie (vanaf het begin)

## ✅ STAP 1: Je hebt al gedaan - Tesseract gedownload!
Goed! Je hebt de installer van [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki) gedownload.

---

## 📥 STAP 2: Installeer Tesseract (ALS JE DIT NOG NIET GEDAAN HEBT)

### 2.1. Open de Installer
1. Zoek het bestand: `tesseract-ocr-w64-setup-5.5.0.20241111.exe` (of vergelijkbaar)
2. **Rechtsklik** erop → **"Als administrator uitvoeren"**
3. Klik "Yes" als Windows vraagt om toestemming

### 2.2. Volg de Installatie Wizard
1. Klik **"Next"**
2. Accepteer de licentie → Klik **"I Agree"**
3. Kies installatie locatie → **Laat staan zoals het is** (`C:\Program Files\Tesseract-OCR`)
4. Klik **"Next"**

### 2.3. BELANGRIJK: Selecteer Language Data
1. Scroll naar beneden in de lijst
2. Zoek **"Additional language data (best)"** - deze moet aangevinkt zijn
3. Klik erop om uit te klappen
4. Scroll in de uitklapbare lijst naar **"Dutch"** of **"nld"**
5. **Vink "Dutch" aan** ✅
6. Klik **"Next"**
7. Klik **"Install"**
8. Wacht tot installatie klaar is (kan een paar minuten duren)
9. Klik **"Finish"**

> **Als Dutch niet zichtbaar is:** Ga door naar Stap 2.4 om het later toe te voegen.

---

## 🔍 STAP 3: Controleer of Tesseract Werkt

### 3.1. Open PowerShell (als Administrator)
1. Druk op **Windows toets + X**
2. Kies **"Windows PowerShell (Admin)"** of **"Terminal (Admin)"**
3. Klik "Yes" als Windows vraagt om toestemming

### 3.2. Test Tesseract
Typ dit commando en druk Enter:
```powershell
tesseract --version
```

**Verwachte output:**
```
tesseract 5.5.0
 leptonica-1.84.2
  libgif 5.2.2 : libjpeg 8d (libjpeg-turbo 3.0.2) : libpng 1.6.43 : libtiff 4.6.0 : zlib 1.3.1 : libwebp 1.4.0 : libopenjp2 2.5.3
```

**Als je een foutmelding krijgt** zoals "tesseract is not recognized":
- Tesseract staat niet in je PATH
- Ga naar **STAP 4** om het handmatig te configureren

### 3.3. Controleer Geïnstalleerde Talen
Typ dit commando:
```powershell
tesseract --list-langs
```

**Verwachte output:**
```
List of available languages (2):
eng
nld
```

**Als je alleen "eng" ziet:**
- Dutch is niet geïnstalleerd
- Ga naar **STAP 4.5** om Dutch toe te voegen

---

## 📝 STAP 4: Voeg Tesseract toe aan PATH (OPTIONEEL maar aanbevolen)

Dit zorgt ervoor dat je `tesseract` overal kunt gebruiken zonder het volledige pad te typen.

### 4.1. Vind je Tesseract Installatiepad
Standaard is dit: `C:\Program Files\Tesseract-OCR`

**Check of dit bestaat:**
```powershell
Test-Path "C:\Program Files\Tesseract-OCR\tesseract.exe"
```

Als dit `True` teruggeeft, is dit je pad.

### 4.2. Voeg toe aan PATH
1. Druk op **Windows toets + R**
2. Typ: `sysdm.cpl` en druk Enter
3. Ga naar tabblad **"Geavanceerd"**
4. Klik **"Omgevingsvariabelen"**
5. Onder **"Systeemvariabelen"** (niet gebruikersvariabelen!), zoek **"Path"**
6. Klik op **"Path"** → Klik **"Bewerken"**
7. Klik **"Nieuw"**
8. Typ exact: `C:\Program Files\Tesseract-OCR`
9. Klik **"OK"** op alle vensters
10. **Sluit alle PowerShell/Command Prompt vensters**
11. **Open een nieuwe PowerShell** om te testen

### 4.3. Test Opnieuw
```powershell
tesseract --version
```

Nu zou dit moeten werken!

---

## 🇳🇱 STAP 4.5: Installeer Dutch Language Data (ALS HET ONTBREEKT)

### Optie A: Via de Installer Opnieuw
1. Download de installer opnieuw
2. Installeer Tesseract (zie STAP 2)
3. **Zorg dat "Dutch" aangevinkt is** bij Additional language data

### Optie B: Handmatig Downloaden
1. Download Dutch language data:
   - Ga naar: https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata
   - Of gebruik directe link: https://github.com/tesseract-ocr/tessdata/blob/main/nld.traineddata
   - Klik rechts op "Raw" → "Save as" → Sla op als `nld.traineddata`

2. Kopieer naar Tesseract map:
   - Kopieer `nld.traineddata` naar: `C:\Program Files\Tesseract-OCR\tessdata\`
   - Je hebt waarschijnlijk administrator rechten nodig

3. Test:
```powershell
tesseract --list-langs
```

Je zou nu "nld" moeten zien!

---

## 🐍 STAP 5: Installeer Pytesseract (Python Package)

### 5.1. Open PowerShell in je Project Map
1. Open PowerShell (niet als admin, tenzij nodig)
2. Navigeer naar je project:
```powershell
cd "N:\12. Bas\Algemeen\2025\8. TEST AI - Divers\Planning Industrie AI gestuurd"
```

### 5.2. Installeer Pytesseract
Typ dit commando:
```powershell
pip install pytesseract
```

**Verwachte output:**
```
Collecting pytesseract
  Downloading pytesseract-0.3.10-py3-none-any.whl (14 kB)
Installing collected packages: pytesseract
Successfully installed pytesseract-0.3.10
```

### 5.3. Test Python Import
```powershell
python -c "import pytesseract; print('Pytesseract geïnstalleerd! Versie:', pytesseract.__version__)"
```

**Verwachte output:**
```
Pytesseract geïnstalleerd! Versie: 0.3.10
```

---

## ⚙️ STAP 6: Configureer Tesseract Pad in je Code

Als Tesseract **NIET** in je PATH staat, moet je het pad handmatig configureren.

### 6.1. Open `app/main.py`
Gebruik je favoriete code editor.

### 6.2. Zoek naar de OCR Sectie
Zoek naar regel ~516 waar staat:
```python
try:
    import pytesseract
```

### 6.3. Voeg Pad Configuratie Toe
Voeg DIRECT NA de `import pytesseract` regel dit toe:

```python
try:
    import pytesseract
    
    # Configureer Tesseract pad (pas aan als je installatiepad anders is!)
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    # Extract tekst uit afbeelding
    text = pytesseract.image_to_string(img, lang='nld+eng')
```

**Belangrijk:** 
- Als je Tesseract in een andere map hebt geïnstalleerd, pas het pad aan!
- Gebruik `r'...'` (raw string) om backslashes correct te behandelen

---

## ✅ STAP 7: Test Alles!

### 7.1. Start je Server
```powershell
python run.py
```

### 7.2. Test OCR Functionaliteit
1. Ga naar: `http://localhost:8000/orders`
2. Klik **"+ Nieuw Project"**
3. Maak een screenshot van een order/invoice
4. Sleep de screenshot in het drag & drop vak OF druk **Ctrl+V** om te plakken
5. Wacht enkele seconden

### 7.3. Controleer Resultaten
Je zou moeten zien:
- ✅ **"Screenshot verwerkt"** in groen
- ✅ Onder **"Gegevens uitgelezen:"** zouden velden automatisch ingevuld moeten worden:
  - Projectnummer
  - Klant
  - Omschrijving
  - Datums
  - etc.

**Als dit werkt: GEFELICITEERD! 🎉 Pytesseract werkt!**

---

## 🔧 PROBLEMEN OPLOSSEN

### Probleem 1: "tesseract is not recognized"

**Oplossing:**
```powershell
# Check of Tesseract bestaat
Test-Path "C:\Program Files\Tesseract-OCR\tesseract.exe"

# Als True: voeg toe aan PATH (zie STAP 4)
# Als False: herinstalleer Tesseract
```

### Probleem 2: "Failed loading language 'nld'"

**Oplossing:**
- Check of Dutch geïnstalleerd is: `tesseract --list-langs`
- Zoek "nld" in de lijst
- Als ontbreekt: zie STAP 4.5

### Probleem 3: "No module named 'pytesseract'"

**Oplossing:**
```powershell
pip install pytesseract
```

### Probleem 4: Python kan Tesseract niet vinden

**Oplossing:**
- Zorg dat STAP 6 is uitgevoerd (pad configuratie)
- Controleer of het pad klopt:
```powershell
Test-Path "C:\Program Files\Tesseract-OCR\tesseract.exe"
```

### Probleem 5: OCR levert geen resultaten

**Controleer in `app/main.py`:**
- Regel ~518 moet zijn: `lang='nld+eng'` (niet alleen 'eng')
- Screenshot moet scherp en leesbaar zijn
- Probeer een duidelijk screenshot met veel tekst

---

## 📋 SNELLE CHECKLIST

Vink af als voltooid:

- [ ] Tesseract OCR geïnstalleerd (`tesseract --version` werkt)
- [ ] Dutch language data geïnstalleerd (`tesseract --list-langs` toont "nld")
- [ ] Tesseract in PATH (optioneel maar aanbevolen)
- [ ] Pytesseract Python package geïnstalleerd (`pip install pytesseract`)
- [ ] Pad geconfigureerd in `app/main.py` (als niet in PATH)
- [ ] Server getest en OCR werkt

---

## 🆘 HEB JE HULP NODIG?

Als je vastloopt bij een specifieke stap:

1. **Noteer exact welke stap**
2. **Noteer de exacte foutmelding**
3. **Noteer wat je al hebt gedaan**

Dan kan ik je specifiek helpen!

---

## 📚 HANDIGE LINKS

- **Tesseract Downloads:** [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
- **Language Data:** [https://github.com/tesseract-ocr/tessdata](https://github.com/tesseract-ocr/tessdata)
- **Direct Dutch Download:** [https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata](https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata)

