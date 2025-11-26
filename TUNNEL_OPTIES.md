# 🌐 Internet Toegang via Tunnel

Om je Planning Industrie AI applicatie **vanaf overal op internet** toegankelijk te maken, zijn er twee opties:

## 🚀 Optie 1: Ngrok (Snel & Eenvoudig)

**Voordelen:**
- ✅ Snel te installeren (5 minuten)
- ✅ Publieke URL die je kunt delen
- ✅ Geen extra software nodig voor gebruikers
- ✅ Werkt direct vanuit browser

**Nadelen:**
- ⚠️ URL verandert elke keer (gratis plan)
- ⚠️ Publiek toegankelijk (iedereen met de URL kan het zien)
- ⚠️ Session timeout na 2 uur (gratis plan)
- ⚠️ 40 connections/minuut limiet (gratis plan)

**Geschikt voor:**
- Snel testen
- Tijdelijke toegang
- Demo's of presentaties

**Installatie:**
1. Zie **INSTALL_NGROK.md** voor stappen
2. Gebruik **START_WITH_NGROK.bat** om automatisch te starten

**Gebruik:**
1. Start server + ngrok: `START_WITH_NGROK.bat`
2. Deel de ngrok URL met anderen (bijv. `https://abc123.ngrok-free.app`)
3. Anderen openen de URL direct in browser

---

## 🔒 Optie 2: Tailscale (Veilig & Permanent)

**Voordelen:**
- ✅ Veilig - alleen toegankelijk voor je team
- ✅ Geen timeout - werkt altijd
- ✅ Vast IP-adres per apparaat
- ✅ Geen limieten
- ✅ Gratis voor persoonlijk gebruik

**Nadelen:**
- ⚠️ Iedereen moet Tailscale installeren
- ⚠️ Meer setup vereist

**Geschikt voor:**
- Productie gebruik
- Team toegang
- Veilige, permanente toegang

**Installatie:**
1. Zie **INSTALL_TAILSCALE.md** voor stappen
2. Alle teamleden installeren Tailscale
3. Gebruik **GET_TAILSCALE_IP.bat** om je IP te vinden

**Gebruik:**
1. Start server: `python run.py`
2. Vind je Tailscale IP: `GET_TAILSCALE_IP.bat`
3. Deel IP met teamleden (bijv. `http://100.64.0.1:8000`)
4. Teamleden openen de URL (ze moeten Tailscale hebben)

---

## 📊 Vergelijking

| Feature | Ngrok | Tailscale |
|---------|-------|-----------|
| Setup tijd | 5 minuten | 10-15 minuten |
| Publiek toegankelijk | ✅ Ja | ❌ Nee (privé) |
| Vast IP/URL | ❌ Nee (gratis) | ✅ Ja |
| Timeout | ⚠️ 2 uur (gratis) | ✅ Geen |
| Extra software | ❌ Nee | ✅ Ja (voor iedereen) |
| Beveiliging | ⚠️ Publiek | ✅ Privé VPN |
| Gratis | ✅ Ja | ✅ Ja |

---

## 💡 Aanbeveling

- **Voor testen/snel gebruik**: Gebruik **Ngrok**
- **Voor productie/team gebruik**: Gebruik **Tailscale**

---

## 🔗 Snelle Links

- **Ngrok**: https://ngrok.com/download
- **Tailscale**: https://tailscale.com/download
- **Ngrok Dashboard**: https://dashboard.ngrok.com
- **Tailscale Admin**: https://login.tailscale.com/admin

---

## 📝 Beide Opties Gebruiken

Je kunt beide opties naast elkaar gebruiken:
- **Ngrok** voor snelle, publieke toegang
- **Tailscale** voor veilige, permanente team toegang

Ze werken tegelijkertijd zonder problemen!

