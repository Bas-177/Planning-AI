# Installatie van python-docx

## Wat is python-docx?

`python-docx` is een Python bibliotheek die nodig is om Word documenten (.docx) te kunnen lezen en verwerken in de applicatie.

## Installatie Instructies

### Optie 1: Automatische installatie (Aanbevolen)

1. **Dubbelklik op het bestand:**
   ```
   INSTALL_PYTHON_DOCX.bat
   ```

2. **Wacht tot de installatie voltooid is**

3. **Herstart de server** (stop en start `run.py` opnieuw)

### Optie 2: Handmatige installatie via Command Prompt

1. **Open Command Prompt** (Windows + R, type `cmd`, druk Enter)

2. **Navigeer naar de project folder:**
   ```cmd
   cd "N:\12. Bas\Algemeen\2025\8. TEST AI - Divers\Planning Industrie AI gestuurd"
   ```

3. **Installeer python-docx:**
   ```cmd
   python -m pip install python-docx
   ```
   
   OF als dat niet werkt:
   ```cmd
   pip install python-docx
   ```

4. **Controleer of de installatie succesvol was:**
   ```cmd
   python -c "import docx; print('python-docx is geïnstalleerd!')"
   ```

5. **Herstart de server** (stop en start `run.py` opnieuw)

### Optie 3: Installeren via requirements.txt

1. **Open Command Prompt**

2. **Navigeer naar de project folder**

3. **Installeer alle requirements:**
   ```cmd
   python -m pip install -r requirements.txt
   ```

   Dit installeert ook python-docx (staat al in requirements.txt)

4. **Herstart de server**

## Verificatie

Na installatie kun je controleren of python-docx werkt door:

1. **De server te herstarten**

2. **Een Word document (.docx) te uploaden** via de "Upload Screenshot/Document" functie

3. **Als het werkt**, zie je in plaats van een foutmelding:
   - "Word document gelezen: X karakters"
   - De geëxtraheerde gegevens (projectnummer, klant, etc.)

## Problemen oplossen

### Fout: "pip is not recognized"
- **Oplossing:** Gebruik `python -m pip` in plaats van alleen `pip`

### Fout: "Permission denied"
- **Oplossing:** Open Command Prompt als Administrator

### Fout: "No module named 'docx'"
- **Oplossing:** Zorg dat je de juiste Python omgeving gebruikt (waar de server draait)

### Fout: "python-docx niet geïnstalleerd" in de applicatie
- **Oplossing:** 
  1. Controleer of de installatie succesvol was (zie verificatie hierboven)
  2. Herstart de server volledig (stop en start opnieuw)
  3. Controleer of je de juiste Python omgeving gebruikt

## Belangrijk

**Na installatie moet je de server HERSTARTEN** voor de wijzigingen om effect te hebben!

Stop de server (Ctrl+C) en start deze opnieuw met:
```cmd
python run.py
```

