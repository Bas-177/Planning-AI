# 📋 Stappenplan: Vast IP-adres Instellen

Dit is een **stap-voor-stap handleiding** om een vast IP-adres in te stellen voor je Planning Industrie AI applicatie.

## 🎯 Doel
Zorgen dat je computer altijd hetzelfde IP-adres krijgt, zodat anderen altijd dezelfde link kunnen gebruiken om de applicatie te openen.

---

## 📊 Stap 1: Verzamel Netwerk Informatie

### Optie A: Automatisch (Aanbevolen)
1. **Open PowerShell als Administrator** (rechtsklik > "Als Administrator uitvoeren")
2. **Voer uit:**
   ```powershell
   .\INSTELLEN_VAST_IP.bat
   ```
3. **Noteer de volgende informatie:**
   - **IPv4 Adres** (bijv. `192.168.1.121`)
   - **Physical Address** (MAC-adres, bijv. `00-1B-44-11-3A-B7`)
   - **Gateway** (meestal `192.168.1.1` of `192.168.0.1`)
   - **Subnet Mask** (meestal `255.255.255.0`)

### Optie B: Handmatig
1. **Open Command Prompt** (Win + R, type `cmd`, Enter)
2. **Voer uit:**
   ```bash
   ipconfig /all
   ```
3. **Noteer dezelfde informatie** als hierboven

---

## 🔧 Stap 2: Kies Methode

Er zijn **2 methodes**. Kies de beste voor jou:

### **Methode 1: DHCP Reservation (AANBEVOLEN) ⭐**
- ✅ Eenvoudigste
- ✅ Router beheert alles automatisch
- ✅ Geen wijzigingen aan Windows nodig
- ✅ Makkelijk terug te draaien

### **Methode 2: Statisch IP in Windows**
- ⚠️ Iets complexer
- ⚠️ Moet handmatig instellen
- ⚠️ Kan problemen geven als router configuratie verandert

---

## 🌐 Methode 1: DHCP Reservation (Aanbevolen)

### Stap 2.1: Log in op je Router

1. **Open je browser** (Chrome, Edge, Firefox, etc.)
2. **Ga naar je router IP-adres:**
   - Meestal: `http://192.168.1.1`
   - Of: `http://192.168.0.1`
   - Of: `http://10.0.0.1`
   - **Check de sticker op je router** als je het niet weet
3. **Log in:**
   - Gebruikersnaam: Meestal `admin` of leeg
   - Wachtwoord: Check router sticker of handleiding
   - **Veel routers hebben standaard wachtwoord op sticker staan**

### Stap 2.2: Vind DHCP Reservation Instellingen

De locatie verschilt per router merk. Zoek naar een van deze termen:

**Mogelijke locaties:**
- **"DHCP Reservation"**
- **"Static IP"**
- **"Address Reservation"**
- **"IP Reservation"**
- **"Fixed IP"**
- **"DHCP Settings" > "Reservations"**

**Voorbeelden per merk:**
- **TP-Link**: Advanced > Network > DHCP Server > Address Reservation
- **Netgear**: Advanced > Setup > LAN Setup > Address Reservation
- **ASUS**: LAN > DHCP Server > Manual Assignment
- **Linksys**: Connectivity > Local Network > DHCP Reservation
- **D-Link**: Setup > Network Settings > DHCP Reservation

### Stap 2.3: Voeg Reservation Toe

1. **Klik op "Add" of "New Reservation"**
2. **Vul in:**
   - **MAC Address**: Je Physical Address (bijv. `00-1B-44-11-3A-B7`)
   - **IP Address**: Het gewenste IP-adres (bijv. `192.168.1.121`)
   - **Device Name**: Optioneel, bijv. "Planning Server"
3. **Sla op** (Save/Apply)
4. **Wacht 30 seconden** tot router de wijziging verwerkt

### Stap 2.4: Herstart je Computer

1. **Herstart je computer** (Start > Power > Restart)
2. **Na herstart, check je IP-adres:**
   ```bash
   ipconfig
   ```
3. **Controleer of het IP-adres nu `192.168.1.121` is** (of wat je hebt ingesteld)

### Stap 2.5: Test

1. **Start de server:**
   ```bash
   python run.py
   ```
2. **Check de console output** - je ziet nu:
   ```
   📱 Toegang vanaf andere apparaten:
      http://192.168.1.121:8000
   ```
3. **Test vanaf je telefoon:**
   - Zorg dat telefoon op hetzelfde WiFi-netwerk zit
   - Open browser op telefoon
   - Ga naar: `http://192.168.1.121:8000`

✅ **Klaar!** Je hebt nu een vast IP-adres.

---

## 💻 Methode 2: Statisch IP in Windows

### Stap 2.1: Open Netwerk Instellingen

1. **Druk op `Win + I`** (Windows Instellingen)
2. **Klik op "Netwerk en Internet"**
3. **Klik op "Ethernet"** (als je bekabeld bent) of **"Wi-Fi"** (als je draadloos bent)
4. **Klik op je actieve verbinding** (bijv. "Ethernet" of je WiFi naam)

### Stap 2.2: Wijzig IP-instellingen

1. **Scroll naar beneden** tot je "IP-instellingen" ziet
2. **Klik op "Bewerken"** naast "IP-toewijzing"
3. **Selecteer "Handmatig"** in plaats van "Automatisch (DHCP)"
4. **Schakel "IPv4" in** (als het nog niet aan staat)

### Stap 2.3: Vul Netwerk Gegevens In

Vul de volgende velden in:

**IP-adres:**
- Bijv. `192.168.1.121`
- **Zorg dat dit adres NIET al in gebruik is**
- **Kies een adres buiten het DHCP bereik** (bijv. als DHCP `192.168.1.100-200` gebruikt, kies `192.168.1.121`)

**Subnetmasker:**
- Meestal: `255.255.255.0`
- Dit wordt vaak automatisch ingevuld

**Gateway:**
- Meestal: `192.168.1.1` of `192.168.0.1`
- Dit is je router IP-adres (zie Stap 1)

**Voorkeurs-DNS:**
- Optie 1: `8.8.8.8` (Google DNS)
- Optie 2: Je router IP (bijv. `192.168.1.1`)

**Alternatieve DNS:**
- Optie 1: `8.8.4.4` (Google DNS)
- Optie 2: `1.1.1.1` (Cloudflare DNS)

### Stap 2.4: Sla Op

1. **Klik op "Opslaan"**
2. **Wacht 10 seconden** tot Windows de instellingen toepast
3. **Test je internet verbinding:**
   - Open een browser
   - Ga naar `google.com`
   - Als het werkt, is alles goed!

### Stap 2.5: Test

1. **Check je IP-adres:**
   ```bash
   ipconfig
   ```
2. **Controleer of het IP-adres nu `192.168.1.121` is**
3. **Start de server:**
   ```bash
   python run.py
   ```
4. **Test vanaf je telefoon** (zie Methode 1, Stap 2.5)

✅ **Klaar!** Je hebt nu een vast IP-adres.

---

## ⚠️ Troubleshooting

### Probleem: "Geen internet verbinding"

**Oplossing:**
1. **Check je Gateway** - moet het IP-adres van je router zijn
2. **Check je DNS** - probeer `8.8.8.8` en `8.8.4.4`
3. **Ga terug naar "Automatisch (DHCP)"** en probeer Methode 1 (DHCP Reservation) in plaats daarvan

### Probleem: "IP conflict" of "IP-adres al in gebruik"

**Oplossing:**
1. **Kies een ander IP-adres** binnen je subnet
2. **Check welke IP-adressen in gebruik zijn:**
   ```bash
   arp -a
   ```
3. **Kies een adres dat NIET in de lijst staat**

### Probleem: "Kan router niet vinden"

**Oplossing:**
1. **Check de sticker op je router** - daar staat meestal het IP-adres
2. **Probeer:**
   - `192.168.1.1`
   - `192.168.0.1`
   - `10.0.0.1`
3. **Check je Gateway** (zie Stap 1) - dat is meestal je router IP

### Probleem: "Router heeft geen DHCP Reservation optie"

**Oplossing:**
- Gebruik **Methode 2** (Statisch IP in Windows) in plaats daarvan

---

## ✅ Checklist

Na het instellen, controleer:

- [ ] IP-adres is nu vast (check met `ipconfig`)
- [ ] Internet werkt nog (test met browser)
- [ ] Server start zonder problemen (`python run.py`)
- [ ] IP-adres wordt getoond in console output
- [ ] Toegang werkt vanaf telefoon op hetzelfde netwerk

---

## 📞 Hulp Nodig?

Als je problemen hebt:

1. **Check `VAST_IP_ADRES.md`** voor meer details
2. **Gebruik `INSTELLEN_VAST_IP.bat`** voor automatische hulp
3. **Probeer eerst Methode 1** (DHCP Reservation) - dat is het makkelijkst
4. **Als Methode 1 niet werkt**, probeer Methode 2 (Statisch IP)

---

## 🎉 Succes!

Na het voltooien van deze stappen heb je een vast IP-adres. Je kunt nu dit IP-adres delen met je team, en ze kunnen altijd dezelfde link gebruiken om de Planning Industrie AI applicatie te openen!

**Voorbeeld link:**
```
http://192.168.1.121:8000/planning/week
```

Deze link werkt altijd, zolang je computer aan staat en de server draait! 🚀

