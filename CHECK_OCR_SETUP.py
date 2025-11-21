#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Diagnostisch script om OCR setup te controleren
Run dit script om te zien wat er mis is met pytesseract/Tesseract
"""

import sys
import os

# Fix encoding voor Windows console
if sys.platform == 'win32':
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass  # Als het niet lukt, gebruik gewoon default encoding

print("="*60)
print("OCR SETUP DIAGNOSTIEK")
print("="*60)
print()

# Check 1: Python versie
print("1. Python versie:")
print(f"   Python {sys.version}")
print()

# Check 2: PIL/Pillow
print("2. PIL/Pillow (voor image processing):")
try:
    from PIL import Image
    print(f"   [OK] Pillow geinstalleerd: {Image.__version__}")
except ImportError:
    print("   [FOUT] Pillow NIET geinstalleerd!")
    print("   Oplossing: pip install Pillow")
print()

# Check 3: pytesseract Python package
print("3. pytesseract Python package:")
try:
    import pytesseract
    print(f"   [OK] pytesseract geinstalleerd: {pytesseract.__version__}")
except ImportError:
    print("   [FOUT] pytesseract NIET geinstalleerd!")
    print("   Oplossing: pip install pytesseract")
    print()
    print("   Installeer nu met:")
    print("   pip install pytesseract")
    sys.exit(1)
print()

# Check 4: Tesseract OCR programma
print("4. Tesseract OCR programma:")
tesseract_found = False
tesseract_path = None

# Check in PATH
try:
    import subprocess
    result = subprocess.run(['tesseract', '--version'], 
                          capture_output=True, 
                          text=True,
                          timeout=5)
    if result.returncode == 0:
        tesseract_found = True
        version_line = result.stdout.split('\n')[0]
        print(f"   [OK] Tesseract gevonden in PATH: {version_line}")
except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
    # Niet in PATH, probeer standaard paden
    default_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Tesseract-OCR\tesseract.exe',
    ]
    
    for path in default_paths:
        if os.path.exists(path):
            tesseract_found = True
            tesseract_path = path
            print(f"   [OK] Tesseract gevonden op: {path}")
            
            # Test of het werkt
            try:
                pytesseract.pytesseract.tesseract_cmd = path
                version = pytesseract.get_tesseract_version()
                print(f"     Versie: {version}")
                break
            except Exception as e:
                print(f"     [WAARSCHUWING] Kan Tesseract niet uitvoeren: {e}")
                tesseract_path = None

if not tesseract_found:
    print("   [FOUT] Tesseract NIET gevonden!")
    print("   Oplossing: Installeer Tesseract van https://github.com/UB-Mannheim/tesseract/wiki")
    print("   Of voeg Tesseract toe aan PATH")
else:
    # Configureer pad als nodig
    if tesseract_path and not pytesseract.pytesseract.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
        print(f"   -> Pad geconfigureerd: {tesseract_path}")
print()

# Check 5: Language data
print("5. Geinstalleerde talen:")
try:
    langs = pytesseract.get_languages()
    print(f"   Geinstalleerde talen: {', '.join(langs)}")
    
    if 'nld' in langs:
        print("   [OK] Nederlands (nld) geinstalleerd")
    else:
        print("   [FOUT] Nederlands (nld) NIET geinstalleerd!")
        print("   Oplossing: Installeer Dutch language data (zie INSTALL_PYTESSERACT.md)")
    
    if 'eng' in langs:
        print("   [OK] Engels (eng) geinstalleerd")
    else:
        print("   [WAARSCHUWING] Engels (eng) NIET geinstalleerd (aanbevolen)")
        
except Exception as e:
    print(f"   [FOUT] Kan talen niet ophalen: {e}")
print()

# Check 6: Test OCR met een simpele test
print("6. Test OCR functionaliteit:")
try:
    # Maak een simpele test image
    from PIL import Image, ImageDraw, ImageFont
    
    # Maak een test afbeelding met tekst
    img = Image.new('RGB', (200, 50), color='white')
    draw = ImageDraw.Draw(img)
    try:
        # Probeer een font
        draw.text((10, 10), "Test OCR P25-0052", fill='black')
    except:
        draw.text((10, 10), "Test OCR P25-0052", fill='black')
    
    # Test OCR
    text = pytesseract.image_to_string(img, lang='eng')
    if text and len(text.strip()) > 0:
        print(f"   [OK] OCR werkt! Test tekst gelezen: '{text.strip()}'")
    else:
        print("   [WAARSCHUWING] OCR werkt, maar leest geen tekst (mogelijk font probleem)")
        
except Exception as e:
    print(f"   [FOUT] OCR test mislukt: {e}")
    import traceback
    traceback.print_exc()
print()

# Check 7: Configuratie voor app/main.py
print("7. Configuratie voor app/main.py:")
if tesseract_path:
    print(f"   Voeg dit toe aan app/main.py (rond regel 516):")
    print(f"   pytesseract.pytesseract.tesseract_cmd = r'{tesseract_path}'")
else:
    print("   Tesseract staat in PATH, geen pad configuratie nodig")
print()

# Samenvatting
print("="*60)
print("SAMENVATTING")
print("="*60)

issues = []
if tesseract_found:
    print("[OK] Tesseract OCR is geinstalleerd")
else:
    issues.append("Installeer Tesseract OCR")
    print("[FOUT] Tesseract OCR ontbreekt")

try:
    import pytesseract
    print("[OK] pytesseract Python package is geinstalleerd")
except ImportError:
    issues.append("Installeer pytesseract: pip install pytesseract")
    print("[FOUT] pytesseract Python package ontbreekt")

try:
    langs = pytesseract.get_languages()
    if 'nld' in langs:
        print("[OK] Nederlands language data is geinstalleerd")
    else:
        issues.append("Installeer Dutch language data")
        print("[FOUT] Nederlands language data ontbreekt")
except:
    print("[WAARSCHUWING] Kan taal data niet verifiëren")

print()

if issues:
    print("ACTIES NODIG:")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
    print()
    print("Zie STAPPENPLAN_PYTESSERACT_EENVOUDIG.md voor gedetailleerde instructies")
else:
    print("[SUCCES] Alles lijkt correct geinstalleerd te zijn!")
    print("   Test de OCR functionaliteit in de web applicatie")

print()
print("="*60)
