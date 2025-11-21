# Gedetailleerd Stappenplan: Installatie Pytesseract voor OCR Functionaliteit

## Overzicht
Pytesseract bestaat uit twee delen:
1. **Tesseract OCR** - Het eigenlijke OCR programma (moet op Windows geïnstalleerd worden)
2. **pytesseract** - Python package die Tesseract gebruikt

---

## STAP 1: Installeer Tesseract OCR op Windows

### Optie A: Download via Installer (Aanbevolen)

1. **Download Tesseract OCR:**
   - Ga naar: https://github.com/UB-Mannheim/tesseract/wiki
   - Of direct downloaden: https://digi.bib.uni-mannheim.de/tesseract/
   - Download de nieuwste versie (bijv. `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)

2. **Installeer Tesseract:**
   - Dubbelklik op het gedownloade `.exe` bestand
   - **Belangrijk:** Noteer het installatiepad! (standaard: `C:\Program Files\Tesseract-OCR`)
   - Tijdens installatie:
     - Klik "Next" bij de setup wizard
     - Accepteer de licentie
     - **Kies installatie locatie** (onthoud dit pad!)
     - Selecteer componenten:
       - ✅ **Additional language data (best)** - Download dit voor Nederlandse taalondersteuning
       - Kies "Dutch" in de language list
     - Klik "Install"
     - Wacht tot installatie voltooid is
     - Klik "Finish"

3. **Voeg Tesseract toe aan PATH (Optioneel maar aanbevolen):**
   - Druk op `Windows + R`
   - Typ: `sysdm.cpl` en druk Enter
   - Ga naar tabblad "Geavanceerd"
   - Klik "Omgevingsvariabelen"
   - Onder "Systeemvariabelen", zoek "Path" en klik "Bewerken"
   - Klik "Nieuw"
   - Voeg toe: `C:\Program Files\Tesseract-OCR` (of jouw installatiepad)
   - Klik "OK" op alle vensters
   - **Herstart je terminal/command prompt** na deze wijziging

### Optie B: Via Chocolatey (Als je Chocolatey hebt)

```powershell
choco install tesseract
```

---

## STAP 2: Verifieer Tesseract Installatie

1. **Open PowerShell of Command Prompt**

2. **Test Tesseract:**
   ```powershell
   tesseract --version
   ```
   
   Je zou moeten zien:
   ```
   tesseract 5.3.3
    leptonica-1.83.1
    ...
   ```

3. **Test Nederlandse taal data:**
   ```powershell
   tesseract --list-langs
   ```
   
   Je zou "nld" (Nederlands) moeten zien in de lijst.

---

## STAP 3: Installeer Pytesseract Python Package

### Optie A: Via pip (Aanbevolen)

1. **Open PowerShell of Command Prompt in je project map**

2. **Navigeer naar je project:**
   ```powershell
   cd "N:\12. Bas\Algemeen\2025\8. TEST AI - Divers\Planning Industrie AI gestuurd"
   ```

3. **Installeer pytesseract:**
   ```powershell
   pip install pytesseract
   ```

4. **Verifieer installatie:**
   ```powershell
   python -c "import pytesseract; print(pytesseract.__version__)"
   ```

### Optie B: Voeg toe aan requirements.txt

1. **Open `requirements.txt` in je project**

2. **Voeg toe:**
   ```
   pytesseract==0.3.10
   ```

3. **Installeer alle requirements:**
   ```powershell
   pip install -r requirements.txt
   ```

---

## STAP 4: Configureer Pytesseract in je Code

### Automatisch pad detectie (als Tesseract in PATH staat)

Als je Tesseract aan PATH hebt toegevoegd, hoef je niets te doen - het werkt automatisch.

### Handmatig pad configureren (als Tesseract NIET in PATH staat)

1. **Open `app/main.py`**

2. **Zoek naar de OCR sectie** (rond regel 480)

3. **Voeg toe bovenaan de OCR functie:**
   ```python
   import pytesseract
   
   # Configureer Tesseract pad (pas aan naar jouw installatiepad!)
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

   **Belangrijk:** Vervang het pad met jouw daadwerkelijke Tesseract installatiepad!

---

## STAP 5: Test de OCR Functionaliteit

1. **Start je FastAPI server:**
   ```powershell
   python run.py
   ```

2. **Ga naar Orders pagina:**
   - Open: `http://localhost:8000/orders`
   - Klik "Nieuw Project"

3. **Test OCR:**
   - Maak een screenshot van een order/invoice
   - Sleep de screenshot in het drag & drop vak OF druk Ctrl+V om te plakken
   - Wacht tot verwerking

4. **Controleer resultaten:**
   - Je zou moeten zien: "✓ Screenshot verwerkt"
   - Onder "Gegevens uitgelezen:" zouden velden automatisch ingevuld moeten worden
   - Als dit werkt, is pytesseract correct geïnstalleerd!

---

## Troubleshooting

### Probleem 1: "tesseract is not installed or it's not in your PATH"

**Oplossing:**
- Controleer of Tesseract geïnstalleerd is: `tesseract --version`
- Als niet gevonden, voeg Tesseract toe aan PATH (zie STAP 1.3)
- Of configureer het pad handmatig in code (zie STAP 4)

### Probleem 2: "Failed loading language 'nld'"

**Oplossing:**
- Herinstalleer Tesseract en selecteer "Dutch" language data
- Of download handmatig: https://github.com/tesseract-ocr/tessdata
- Kopieer `nld.traineddata` naar: `C:\Program Files\Tesseract-OCR\tessdata\`

### Probleem 3: "No module named 'pytesseract'"

**Oplossing:**
```powershell
pip install pytesseract
```

### Probleem 4: OCR levert geen resultaten

**Mogelijke oorzaken:**
- Screenshot is niet scherp genoeg
- Tekst is te klein of onduidelijk
- Verkeerde taal ingesteld (standaard is Engels, niet Nederlands)

**Controleer in code:**
```python
# In app/main.py, regel ~518
text = pytesseract.image_to_string(img, lang='nld+eng')  # Moet nld bevatten voor Nederlands
```

### Probleem 5: Permission denied errors

**Oplossing:**
- Run PowerShell als Administrator
- Of verander installatiepad naar een map waar je volledige rechten hebt

---

## Stappenplan Samenvatting

```
1. Download Tesseract OCR installer
2. Installeer Tesseract (noteer installatiepad!)
3. Voeg Tesseract toe aan PATH (optioneel maar aanbevolen)
4. Verifieer: tesseract --version
5. Installeer pytesseract: pip install pytesseract
6. Configureer pad in code (als niet in PATH)
7. Test OCR functionaliteit
```

---

## Handige Links

- **Tesseract Downloads:** https://github.com/UB-Mannheim/tesseract/wiki
- **Pytesseract Documentatie:** https://pypi.org/project/pytesseract/
- **Tesseract Documentatie:** https://tesseract-ocr.github.io/
- **Language Data:** https://github.com/tesseract-ocr/tessdata

---

## Snelle Installatie Script

Voor gebruikers die comfortabel zijn met scripts, hier is een PowerShell script:

```powershell
# Download en installeer Tesseract (vereist Chocolatey)
choco install tesseract

# Installeer pytesseract
pip install pytesseract

# Test
python -c "import pytesseract; print('Pytesseract geïnstalleerd!')"
tesseract --version
```

**Let op:** Dit script vereist Chocolatey package manager.

