# HANDMATIG INSTALLEREN DUTCH LANGUAGE DATA

Als de automatische installatie niet werkt, volg deze stappen:

## STAP 1: Download Dutch Language Data

### Optie A: Direct Download (Aanbevolen)

1. **Open je browser**
2. **Ga naar deze link:**
   ```
   https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata
   ```
   
3. **Download het bestand:**
   - Rechtsklik op de pagina
   - Kies **"Save as..."** of **"Opslaan als..."**
   - **BELANGRIJK:** Sla op als: `nld.traineddata`
   - Let op: Verwijder eventuele `.txt` extensie die Windows toevoegt!
   - Het bestand moet heten: `nld.traineddata` (geen extra extensie)

### Optie B: Via GitHub Website

1. Ga naar: https://github.com/tesseract-ocr/tessdata/tree/main
2. Zoek naar `nld.traineddata`
3. Klik erop
4. Klik op de knop **"Raw"** (rechts boven)
5. Rechtsklik op de pagina → **"Save as..."**
6. Sla op als: `nld.traineddata`

---

## STAP 2: Vind je Tesseract Installatie Map

Standaard is dit:
```
C:\Program Files\Tesseract-OCR\tessdata\
```

**Check of deze map bestaat:**
- Open File Explorer
- Ga naar `C:\Program Files\Tesseract-OCR\`
- Je zou een map `tessdata` moeten zien

**Als deze map NIET bestaat:**
1. Controleer of Tesseract geïnstalleerd is
2. Of check alternatieve locaties:
   - `C:\Program Files (x86)\Tesseract-OCR\tessdata\`
   - `C:\Tesseract-OCR\tessdata\`

---

## STAP 3: Kopieer Dutch Language Data

1. **Open File Explorer als Administrator:**
   - Zoek "File Explorer" in het Start menu
   - Rechtsklik → **"Run as administrator"** of **"Als administrator uitvoeren"**

2. **Navigeer naar de tessdata map:**
   ```
   C:\Program Files\Tesseract-OCR\tessdata\
   ```

3. **Kopieer het gedownloade bestand:**
   - Zoek het bestand `nld.traineddata` dat je in STAP 1 hebt gedownload
   - Kopieer het bestand (Ctrl+C)
   - Plak het in de `tessdata` map (Ctrl+V)
   - Je krijgt mogelijk een melding dat je administrator rechten nodig hebt → Klik **"Continue"** of **"Doorgaan"**

4. **Verifieer:**
   - In de `tessdata` map zou je nu moeten zien:
     - `eng.traineddata` (English - al geïnstalleerd)
     - `nld.traineddata` (Dutch - net gekopieerd)

---

## STAP 4: Test of het Werkt

Open PowerShell en voer uit:

```powershell
tesseract --list-langs
```

Je zou moeten zien:
```
List of available languages (2):
eng
nld
```

**Als je alleen "eng" ziet:**
- Het bestand is niet correct gekopieerd
- Of het bestand heeft verkeerde naam/extensie
- Probeer opnieuw vanaf STAP 1

**Als je "nld" ziet:**
- ✅ Dutch is geïnstalleerd!
- Test nu je OCR functionaliteit

---

## ALTERNATIEF: Gebruik het Install Script

Je kunt ook proberen:
```powershell
.\INSTALLEER_DUTCH.bat
```

Dit script probeert automatisch te downloaden en installeren.

---

## PROBLEMEN OPLOSSEN

### Probleem 1: "Access Denied" bij kopiëren

**Oplossing:**
- Run File Explorer als Administrator
- Of rechtsklik op `nld.traineddata` → Properties → Security tab → Geef jezelf "Full Control"

### Probleem 2: Bestand heet "nld.traineddata.txt"

**Oplossing:**
1. In File Explorer, ga naar View → Show file extensions
2. Hernoem het bestand naar `nld.traineddata`
3. Windows vraagt om bevestiging → Klik "Yes"

### Probleem 3: Kan tesseract --list-langs niet uitvoeren

**Oplossing:**
- Tesseract staat niet in PATH
- Open nieuwe PowerShell als Administrator
- Navigeer naar: `C:\Program Files\Tesseract-OCR\`
- Voer uit: `.\tesseract.exe --list-langs`

### Probleem 4: Bestand is te klein (< 1 MB)

**Oplossing:**
- Download is niet compleet
- Download opnieuw vanaf STAP 1
- Gebruik een stabiele internetverbinding

---

## VERIFICATIE NA INSTALLATIE

Na het installeren, test met:

```powershell
# Check geïnstalleerde talen
tesseract --list-langs

# Of gebruik het diagnostisch script
python CHECK_OCR_SETUP.py
```

Je zou moeten zien:
```
[OK] Nederlands (nld) geinstalleerd
```

---

## HANDIGE LINKS

- **Direct Download:** https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata
- **GitHub Repository:** https://github.com/tesseract-ocr/tessdata
- **Alle Languages:** https://github.com/tesseract-ocr/tessdata/tree/main

