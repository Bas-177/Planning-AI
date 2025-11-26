# 🔒 Tailscale Installatie & Setup

Tailscale maakt een veilige VPN verbinding zodat je Planning Industrie AI applicatie alleen toegankelijk is voor mensen die jij toevoegt.

## 📥 Stap 1: Download Tailscale

1. **Ga naar**: https://tailscale.com/download
2. **Download** de Windows versie
3. **Installeer** het programma (volg de wizard)

## 🔑 Stap 2: Maak Tailscale Account (Gratis)

1. **Start Tailscale** (na installatie)
2. **Klik op "Sign up"** of "Log in"
3. **Maak account** met:
   - Google account (aanbevolen)
   - Of Microsoft account
   - Of email + wachtwoord
4. **Log in** op je computer

## 👥 Stap 3: Voeg Teamleden Toe

1. **Ga naar**: https://login.tailscale.com/admin/machines
2. **Klik op "Add device"** of "Invite user"
3. **Voeg teamleden toe** via:
   - Email adres
   - Of deel een invite link
4. **Teamleden downloaden** Tailscale op hun apparaat
5. **Teamleden loggen in** met hetzelfde account

## 🚀 Stap 4: Gebruik Tailscale

### Op je server computer (waar Planning draait):

1. **Start Planning server:**
   ```bash
   python run.py
   ```
2. **Noteer je Tailscale IP-adres:**
   - Open Tailscale app
   - Of ga naar: https://login.tailscale.com/admin/machines
   - Je ziet een IP-adres zoals: `100.64.0.1`

### Op andere apparaten:

1. **Zorg dat Tailscale draait**
2. **Open browser**
3. **Ga naar**: `http://100.64.0.1:8000`
   (Vervang met jouw Tailscale IP-adres)

## 📝 Belangrijk

- ✅ **Veiliger** dan Ngrok (alleen toegankelijk voor je team)
- ✅ **Gratis** voor persoonlijk gebruik
- ✅ **Geen timeout** - werkt altijd
- ✅ **Vast IP-adres** per apparaat
- ⚠️ **Iedereen moet Tailscale installeren**

## 🔒 Beveiliging

- Alleen mensen in je **Tailscale netwerk** kunnen toegang krijgen
- **Veilig** - versleutelde verbinding
- Geen publieke URL - **privé netwerk**

## 💡 Tips

- **Zorg dat alle teamleden Tailscale draaien** op hun apparaat
- **Deel je Tailscale IP-adres** met teamleden
- Je kunt **meerdere apparaten** toevoegen aan je netwerk
- **Access Control Lists (ACL)** kunnen worden ingesteld voor extra beveiliging

