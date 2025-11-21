# BELANGRIJK: Tesseract is NIET geïnstalleerd!

## Het Probleem

Ik zie dat je `nld.traineddata` hebt gedownload, maar **Tesseract OCR zelf is NIET geïnstalleerd**.

Zonder Tesseract kun je geen OCR doen, ook al heb je de language data.

---

## OPLOSSING: Installeer Tesseract EERST

### Stap 1: Download Tesseract

1. **Ga naar:** https://github.com/UB-Mannheim/tesseract/wiki
2. **Download:** `tesseract-ocr-w64-setup-5.5.0.20241111.exe` (64-bit)
   - Dit is het **installatie programma** voor Tesseract

### Stap 2: Installeer Tesseract

1. **Dubbelklik** op het gedownloade `.exe` bestand
2. **Als Administrator uitvoeren** (rechtsklik → "Run as administrator")
3. Volg de wizard:
   - Klik **"Next"**
   - Accepteer licentie → Klik **"I Agree"**
   - **Belangrijk:** Laat de standaard locatie staan: `C:\Program Files\Tesseract-OCR`
   - Klik **"Next"**
   - Klik **"Install"**
   - Wacht tot installatie voltooid is (kan even duren)
   - Klik **"Finish"**

### Stap 3: Test of Tesseract Werkt

Open **PowerShell** en voer uit:

```powershell
"C:\Program Files\Tesseract-OCR\tesseract.exe" --version
```

**Je zou moeten zien:**
```
tesseract 5.5.0
 leptonica-1.84.2
 ...
```

**Als je een foutmelding krijgt:**
- Tesseract is niet correct geïnstalleerd
- Probeer opnieuw te installeren

---

## NA INSTALLATIE VAN TESSERACT

### Stap 4: Installeer Dutch Language Data

**Als je Dutch nog niet hebt geïnstalleerd:**

1. **Download Dutch language data:**
   - Ga naar: https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata
   - Rechtsklik → "Save as..." → Sla op als `nld.traineddata`

2. **Kopieer naar tessdata map:**
   - Open File Explorer **als Administrator**
   - Navigeer naar: `C:\Program Files\Tesseract-OCR\tessdata\`
   - Plak het bestand `nld.traineddata` daar

3. **Test:**
   ```powershell
   "C:\Program Files\Tesseract-OCR\tesseract.exe" --list-langs
   ```
   
   Je zou moeten zien:
   ```
   List of available languages (2):
   eng
   nld
   ```

---

## Stap 5: Installeer pytesseract (Python Package)

**Open PowerShell in je project map:**

```powershell
cd "N:\12. Bas\Algemeen\2025\8. TEST AI - Divers\Planning Industrie AI gestuurd"
pip install pytesseract
```

---

## Stap 6: Test Alles

**Voer uit:**

```powershell
python CHECK_OCR_SETUP.py
```

**Je zou moeten zien:**
```
[OK] Tesseract OCR is geinstalleerd
[OK] pytesseract Python package is geinstalleerd
[OK] Nederlands (nld) geinstalleerd
```

**Als alles OK is:**
- Herstart je server: `python run.py`
- Test de OCR functionaliteit in de web applicatie

---

## SNELLE CHECKLIST

- [ ] Tesseract OCR geïnstalleerd (`tesseract --version` werkt)
- [ ] Dutch language data geïnstalleerd (`tesseract --list-langs` toont "nld")
- [ ] pytesseract Python package geïnstalleerd (`pip install pytesseract`)
- [ ] Test script draait zonder fouten (`python CHECK_OCR_SETUP.py`)

---

## HANDIGE SCRIPTS

- **`INSTALLEER_TESSERACT_EERST.bat`** - Controleert of Tesseract geïnstalleerd is
- **`CHECK_OCR_SETUP.py`** - Test alles en toont wat ontbreekt
- **`INSTALLEER_DUTCH.bat`** - Installeert Dutch language data automatisch

---

## BELANGRIJK

**Tesseract moet EERST geïnstalleerd zijn** voordat de rest werkt!

Zonder Tesseract:
- ❌ pytesseract werkt niet
- ❌ Dutch language data werkt niet
- ❌ OCR functionaliteit werkt niet

Met Tesseract:
- ✅ Alles werkt samen

---

**Start met het installeren van Tesseract (Stap 1-2), dan komt de rest vanzelf!**

