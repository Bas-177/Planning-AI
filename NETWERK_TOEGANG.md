# 🌐 Netwerk Toegang Configuratie

Om de Planning Industrie AI applicatie toegankelijk te maken voor andere apparaten (telefoon, tablet, andere computers) op je netwerk, volg deze stappen:

## 📱 Toegang vanaf andere apparaten

### 1. Vind je IP-adres
Wanneer je de server start met `python run.py`, zie je automatisch je IP-adres in de console output.

**Voorbeeld output:**
```
📱 Toegang vanaf andere apparaten (telefoon, tablet, etc.):
   http://192.168.1.121:8000
```

### 2. Windows Firewall Configureren

De Windows Firewall moet poort 8000 toestaan voor binnenkomende verbindingen.

#### Optie A: Automatisch (aanbevolen)
1. Open **PowerShell als Administrator**
2. Voer dit commando uit:
   ```powershell
   netsh advfirewall firewall add rule name="Planning Industrie AI" dir=in action=allow protocol=TCP localport=8000
   ```

#### Optie B: Handmatig via Windows Firewall
1. Open **Windows Defender Firewall** (zoek naar "Firewall" in Start menu)
2. Klik op **"Geavanceerde instellingen"** (aan de linkerkant)
3. Klik op **"Binnenkomende regels"** (aan de linkerkant)
4. Klik op **"Nieuwe regel..."** (aan de rechterkant)
5. Selecteer **"Poort"** → Klik **"Volgende"**
6. Selecteer **"TCP"** → Voer **"8000"** in bij "Specifieke lokale poorten" → Klik **"Volgende"**
7. Selecteer **"Verbinding toestaan"** → Klik **"Volgende"**
8. Zorg dat alle profielen aangevinkt zijn (Domein, Privé, Openbaar) → Klik **"Volgende"**
9. Geef de regel een naam: **"Planning Industrie AI"** → Klik **"Voltooien"**

### 3. Toegang vanaf andere apparaten

Zorg dat alle apparaten op hetzelfde WiFi-netwerk zitten!

#### Vanaf een telefoon/tablet:
1. Open je browser (Chrome, Safari, etc.)
2. Ga naar: `http://192.168.1.121:8000` (vervang met JOUW IP-adres)
3. De applicatie zou nu moeten laden!

#### Vanaf een andere computer:
1. Zorg dat deze op hetzelfde netwerk zit
2. Open een browser
3. Ga naar: `http://192.168.1.121:8000` (vervang met JOUW IP-adres)

### 4. QR Code voor Snelle Toegang (Optioneel)

Voor makkelijke toegang vanaf je telefoon, kun je een QR code genereren:

1. Ga naar: https://www.qr-code-generator.com/
2. Voer je URL in: `http://192.168.1.121:8000/planning/week`
3. Genereer de QR code
4. Scan met je telefoon camera

## 🔍 Troubleshooting

### Probleem: "Kan verbinding niet maken"
**Oplossingen:**
1. Controleer dat de server draait (`python run.py`)
2. Controleer dat je IP-adres klopt (zie console output bij starten)
3. Controleer Windows Firewall regel (zie stap 2 hierboven)
4. Zorg dat alle apparaten op hetzelfde WiFi-netwerk zitten
5. Probeer de server te stoppen en opnieuw te starten

### Probleem: "Server niet bereikbaar"
**Oplossingen:**
1. Controleer dat de server op `0.0.0.0` draait (staat in `run.py`)
2. Controleer of poort 8000 niet al in gebruik is:
   ```bash
   netstat -ano | findstr :8000
   ```
3. Probeer een andere poort (bijv. 8001) in `run.py`:
   ```python
   port=8001
   ```

### Probleem: Firewall blokkeert nog steeds
**Oplossingen:**
1. Controleer Windows Defender Firewall instellingen
2. Tijdelijk uitschakelen van firewall om te testen (NIET aanbevolen voor productie!)
3. Controleer antivirus software (sommige blokkeren poorten)

### Probleem: IP-adres verandert
**Oplossingen:**
1. Zet een vast IP-adres in je router instellingen (DHCP reservation)
2. Of noteer je huidige IP-adres en check het elke keer bij het starten

## 🌍 Externe Toegang (buiten je netwerk)

Als je de applicatie ook **buiten je eigen netwerk** beschikbaar wilt maken (bijv. vanaf thuis terwijl de server op kantoor staat), heb je extra configuratie nodig:

### Optie 1: Port Forwarding in Router
1. Log in op je router admin panel (meestal `192.168.1.1` of `192.168.0.1`)
2. Zoek naar "Port Forwarding" of "Virtual Server"
3. Forward poort 8000 naar je computer IP (bijv. `192.168.1.121`)
4. Gebruik je publieke IP-adres (vind via https://whatismyipaddress.com/)

⚠️ **Waarschuwing**: Dit maakt je applicatie openbaar toegankelijk. Zorg voor beveiliging!

### Optie 2: Ngrok (Tunnel Service)
1. Download Ngrok: https://ngrok.com/
2. Start je applicatie: `python run.py`
3. In een andere terminal: `ngrok http 8000`
4. Gebruik de gegenereerde URL (bijv. `https://abc123.ngrok.io`)

### Optie 3: Cloud Hosting
Voor permanente toegang overweeg cloud hosting:
- **Heroku** (gratis tier beschikbaar)
- **DigitalOcean** (vanaf $5/maand)
- **AWS** (EC2 instance)
- **Azure** (App Service)

## 📱 Mobile Responsive

De applicatie is al geoptimaliseerd voor mobiele apparaten! De planning en andere pagina's passen zich automatisch aan aan het schermformaat.

## ✅ Checklist

- [ ] Server gestart met `python run.py`
- [ ] IP-adres genoteerd uit console output
- [ ] Windows Firewall regel toegevoegd voor poort 8000
- [ ] Getest vanaf telefoon op hetzelfde WiFi-netwerk
- [ ] Planning pagina werkt: `http://<IP>:8000/planning/week`

## 📞 Hulp Nodig?

Als je problemen hebt:
1. Check de console output bij het starten van de server
2. Controleer Windows Firewall instellingen
3. Test eerst met een andere computer op hetzelfde netwerk
4. Gebruik een QR code generator voor makkelijke toegang vanaf telefoon

