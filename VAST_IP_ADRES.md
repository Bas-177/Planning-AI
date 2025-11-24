# 🔧 Vast IP-adres Instellen

Om ervoor te zorgen dat je altijd hetzelfde IP-adres hebt voor de Planning Industrie AI applicatie, zijn er twee opties:

## Optie 1: DHCP Reservation (Aanbevolen)

Dit is de beste optie omdat je router het IP-adres automatisch toewijst, maar altijd hetzelfde adres geeft aan je computer.

### Stappen:

1. **Vind je huidige IP-adres en MAC-adres:**
   ```bash
   ipconfig /all
   ```
   - Noteer je **IPv4 Address** (bijv. `192.168.1.121`)
   - Noteer je **Physical Address** (MAC-adres, bijv. `00-1B-44-11-3A-B7`)

2. **Log in op je router:**
   - Open je browser
   - Ga naar: `192.168.1.1` of `192.168.0.1` (check je router handleiding)
   - Log in met je router gebruikersnaam en wachtwoord

3. **Zoek DHCP Reservation of Static IP:**
   - Navigeer naar "DHCP Settings" of "Network Settings"
   - Zoek naar "DHCP Reservation", "Static IP", of "Address Reservation"
   - Dit kan onder verschillende namen staan afhankelijk van je router merk

4. **Voeg reservation toe:**
   - Klik op "Add" of "New Reservation"
   - Voer je MAC-adres in (Physical Address)
   - Voer het gewenste IP-adres in (bijv. `192.168.1.121`)
   - Sla op

5. **Herstart je computer:**
   - Na het instellen, herstart je computer
   - Je krijgt nu altijd hetzelfde IP-adres toegewezen

## Optie 2: Statisch IP-adres (Handmatig)

Als je router geen DHCP Reservation ondersteunt, kun je handmatig een statisch IP instellen.

### Stappen:

1. **Vind je netwerk instellingen:**
   - Open **Instellingen** > **Netwerk en Internet** > **Ethernet** (of **Wi-Fi**)
   - Klik op je actieve verbinding
   - Scroll naar beneden en klik op **"Bewerken"** bij IP-instellingen

2. **Wijzig naar handmatig:**
   - Selecteer **"Handmatig"** in plaats van "Automatisch (DHCP)"
   - Vul in:
     - **IP-adres**: `192.168.1.121` (of een ander beschikbaar adres)
     - **Subnetmasker**: `255.255.255.0` (meestal standaard)
     - **Gateway**: `192.168.1.1` (meestal je router IP)
     - **DNS**: `8.8.8.8` en `8.8.4.4` (Google DNS) of gebruik je router IP

3. **Sla op en test:**
   - Sla de instellingen op
   - Test je internet verbinding
   - Test of je applicatie nog werkt

### Belangrijk bij Statisch IP:

⚠️ **Let op:** Zorg dat het IP-adres dat je kiest:
- Binnen het bereik van je router subnet valt (meestal `192.168.1.x` of `192.168.0.x`)
- Niet al in gebruik is door een ander apparaat
- Buiten het DHCP bereik valt (bijv. als DHCP `192.168.1.100-200` gebruikt, kies `192.168.1.121`)

## Controleren of het werkt:

1. **Herstart je computer**
2. **Check je IP-adres:**
   ```bash
   ipconfig
   ```
3. **Start de server:**
   ```bash
   python run.py
   ```
4. **Noteer het IP-adres** dat in de console wordt getoond
5. **Herstart opnieuw** en check of het IP-adres hetzelfde is

## Troubleshooting:

### Probleem: "Geen internet verbinding"
- Controleer of je Gateway en DNS correct zijn ingesteld
- Probeer terug te gaan naar "Automatisch (DHCP)" en probeer Optie 1 (DHCP Reservation)

### Probleem: "IP conflict"
- Er is al een ander apparaat met dit IP-adres
- Kies een ander IP-adres binnen je subnet

### Probleem: "Kan router niet vinden"
- Check je router handleiding voor het standaard IP-adres
- Meestal: `192.168.1.1`, `192.168.0.1`, of `10.0.0.1`
- Check ook de sticker op de achterkant van je router

## Aanbevolen IP-adres:

Voor de Planning Industrie AI applicatie raden we aan:
- **IP-adres**: `192.168.1.121` (of een ander adres buiten DHCP bereik)
- **Zorg dat dit adres altijd hetzelfde blijft**

Na het instellen kun je dit IP-adres delen met je team zodat ze altijd dezelfde link kunnen gebruiken!

