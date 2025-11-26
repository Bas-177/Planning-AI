# 🌐 Ngrok Installatie & Setup

Ngrok maakt je lokale Planning Industrie AI applicatie toegankelijk via een publieke URL die overal werkt.

## 📥 Stap 1: Download Ngrok

1. **Ga naar**: https://ngrok.com/download
2. **Download** de Windows versie (.zip bestand)
3. **Pak uit** naar een map, bijv. `C:\ngrok\`

## 🔑 Stap 2: Maak Ngrok Account (Gratis)

1. **Ga naar**: https://dashboard.ngrok.com/signup
2. **Maak een gratis account** (met email)
3. **Na inloggen**, ga naar: https://dashboard.ngrok.com/get-started/your-authtoken
4. **Kopieer je Authtoken** (bijv. `2abc123xyz456...`)

## ⚙️ Stap 3: Configureer Ngrok

1. **Open Command Prompt**
2. **Ga naar de ngrok map** (bijv. `cd C:\ngrok`)
3. **Voer uit:**
   ```bash
   ngrok config add-authtoken JE_AUTHTOKEN_HIER
   ```
   Vervang `JE_AUTHTOKEN_HIER` met je echte authtoken

4. **Test:**
   ```bash
   ngrok version
   ```
   Dit zou de versie moeten tonen

## 🚀 Stap 4: Gebruik Ngrok

### Optie A: Handmatig
1. **Start je Planning server:**
   ```bash
   python run.py
   ```
2. **In een nieuwe terminal, start ngrok:**
   ```bash
   ngrok http 8000
   ```
3. **Je ziet nu:**
   ```
   Forwarding    https://abc123.ngrok-free.app -> http://localhost:8000
   ```
4. **Deel deze URL** met anderen: `https://abc123.ngrok-free.app`

### Optie B: Automatisch (met script)
Gebruik `START_WITH_NGROK.bat` - dit start alles automatisch!

## 📝 Belangrijk

- **URL verandert elke keer** (behalve met betaald plan)
- **Gratis plan**: 40 connections/minuut limiet
- **Gratis plan**: Session timeout na 2 uur
- **Je computer moet aan staan** en server moet draaien

## 🔒 Beveiliging

- Ngrok URLs zijn **publiek toegankelijk**
- Overweeg **basic auth** toe te voegen (zie `START_WITH_NGROK.bat`)
- Deel URL **alleen met vertrouwde mensen**

## 💡 Tips

- **Betaald plan** geeft je een **vaste URL** (domaingegeven)
- **Betaald plan** heeft geen timeout
- Check https://ngrok.com/pricing voor details

