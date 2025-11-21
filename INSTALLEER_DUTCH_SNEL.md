# SNELLE STAP-VOOR-STAP: Dutch Language Data Installeren

Je hebt Tesseract al geïnstalleerd met English. Nu moet je Dutch language data handmatig toevoegen.

## STAP 1: Download Dutch Language Data

1. **Open je browser**
2. **Ga naar deze link:**
   ```
   https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata
   ```
   
3. **Download het bestand:**
   - De browser opent een pagina met tekst/gegevens
   - **Rechtsklik** op de pagina
   - Kies **"Save as..."** of **"Opslaan als..."**
   - **BELANGRIJK:** 
     - Bestandsnaam: `nld.traineddata`
     - **Verwijder `.txt` extensie als Windows die toevoegt!**
     - Het moet exact heten: `nld.traineddata`
   - Kies een makkelijke locatie zoals je **Downloads** map
   - Klik **"Save"** of **"Opslaan"**

---

## STAP 2: Vind je Tesseract Installatie Map

1. **Open File Explorer** (Windows + E)

2. **Ga naar:**
   ```
   C:\Program Files\Tesseract-OCR\tessdata
   ```
   
   **Als deze map niet bestaat, probeer:**
   - `C:\Program Files (x86)\Tesseract-OCR\tessdata`
   - Of gebruik de zoekfunctie: zoek naar `tessdata`

3. **In deze map zou je moeten zien:**
   - `eng.traineddata` (English - al geïnstalleerd)
   - Mogelijk andere bestanden

---

## STAP 3: Kopieer Dutch Language Data (ALS ADMINISTRATOR!)

1. **Zoek het gedownloade bestand** `nld.traineddata` (waarschijnlijk in Downloads)

2. **Rechtsklik op `nld.traineddata`** → Kies **"Copy"** of druk **Ctrl+C**

3. **Open File Explorer als Administrator:**
   - Zoek "File Explorer" in Start menu
   - **Rechtsklik** → **"Run as administrator"**

4. **Navigeer naar de tessdata map:**
   ```
   C:\Program Files\Tesseract-OCR\tessdata
   ```

5. **Plak het bestand** (Ctrl+V)
   - Je krijgt mogelijk een melding dat je administrator rechten nodig hebt
   - Klik **"Continue"** of **"Doorgaan"**

6. **Verifieer:**
   - In de `tessdata` map zou je nu moeten zien:
     - `eng.traineddata`
     - `nld.traineddata` ← NIEUW!

---

## STAP 4: Test of het Werkt

Open **PowerShell als Administrator** en voer uit:

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
- Het bestand is niet correct gekopieerd
- Of het bestand heeft verkeerde naam
- Probeer opnieuw vanaf STAP 1

**Als je "nld" ziet:**
- ✅ **SUCCES!** Dutch is geïnstalleerd!

---

## ALTERNATIEF: Gebruik het Install Script

Als je PowerShell/command prompt als Administrator opent:

```powershell
cd "N:\12. Bas\Algemeen\2025\8. TEST AI - Divers\Planning Industrie AI gestuurd"
.\INSTALLEER_DUTCH.bat
```

Dit script download en installeert het automatisch (vereist admin rechten).

---

## PROBLEMEN OPLOSSEN

### Probleem: "Access Denied" bij kopiëren

**Oplossing:**
1. Open File Explorer **als Administrator**
2. Of rechtsklik op `nld.traineddata` → Properties → Security → Geef jezelf "Full Control"

### Probleem: Bestand heet "nld.traineddata.txt"

**Oplossing:**
1. In File Explorer: View → **Show file extensions** (bestandsextensies weergeven)
2. Hernoem naar: `nld.traineddata` (zonder .txt)
3. Windows vraagt om bevestiging → Klik "Yes"

### Probleem: Kan tesseract --list-langs niet uitvoeren

**Oplossing:**
- Tesseract staat niet in PATH
- Open PowerShell
- Navigeer naar: `C:\Program Files\Tesseract-OCR\`
- Voer uit: `.\tesseract.exe --list-langs`

---

## NA INSTALLATIE

Test met het diagnostisch script:

```powershell
python CHECK_OCR_SETUP.py
```

Je zou moeten zien:
```
[OK] Nederlands (nld) geinstalleerd
```

---

## DIRECTE DOWNLOAD LINK

Klik hier om direct te downloaden:
**https://github.com/tesseract-ocr/tessdata/raw/main/nld.traineddata**

**Tip:** Rechtsklik → "Save link as..." of "Koppeling opslaan als..."

