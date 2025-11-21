import pandas as pd
import openpyxl

file_path = 'Planning 2025 Industrie 1.xlsx'

print("="*80)
print("COMPLETE ANALYSE VAN HET PLANNINGSBESTAND")
print("="*80)

# Analyseer het Invulblad tabblad met data
print("\n1. INVULBLAD - HUIDIGE STRUCTUUR")
print("-"*80)
df_invul = pd.read_excel(file_path, sheet_name='Invulblad', header=None)

# Zoek waar de headers staan
print("\nHeaders gevonden op rij 3:")
headers = df_invul.iloc[3].values
for i, header in enumerate(headers[:20]):
    if pd.notna(header) and str(header).strip():
        print(f"  Kolom {i}: {header}")

# Zoek naar daadwerkelijke data rijen
print("\n\n2. DATA IN HET INVULBLAD")
print("-"*80)
df_data = pd.read_excel(file_path, sheet_name='Invulblad', header=3)
print(f"Aantal rijen met data: {len(df_data)}")
print(f"Kolommen: {list(df_data.columns)}")

# Toon eerste paar rijen met data
print("\nEerste 3 rijen met data:")
for idx in range(min(3, len(df_data))):
    row = df_data.iloc[idx]
    if not row.isna().all():
        print(f"\nRij {idx}:")
        for col in df_data.columns[:10]:
            if pd.notna(row[col]):
                print(f"  {col}: {row[col]}")

# Analyseer Invulmogelijkheden
print("\n\n3. INVULMOGELIJKHEDEN (Dropdown opties)")
print("-"*80)
df_opties = pd.read_excel(file_path, sheet_name='Invulmogelijkheden', header=None)
print("Status opties:")
status_opties = df_opties.iloc[4:15, [0, 1, 3]]  # Rijen 4-14, kolommen Week, Medewerker, Status
for idx, row in status_opties.iterrows():
    if pd.notna(row.iloc[2]):
        print(f"  {row.iloc[2]}")

print("\nMedewerkers:")
medewerkers = df_opties.iloc[4:10, 2].dropna().unique()
for med in medewerkers:
    if pd.notna(med):
        print(f"  - {med}")

# Analyseer Dashboard structuur
print("\n\n4. DASHBOARD STRUCTUUR")
print("-"*80)
df_dash = pd.read_excel(file_path, sheet_name='Dashboard', header=None)
print("Dashboard heeft verschillende status kolommen")
print("Status kolommen gevonden:")
for idx in range(min(10, len(df_dash))):
    row = df_dash.iloc[idx]
    for col_idx, val in enumerate(row):
        if pd.notna(val) and isinstance(val, str):
            if 'Werkvoorbereiding' in str(val) or 'Materiaal' in str(val) or 'productie' in str(val).lower():
                print(f"  Rij {idx}, Kolom {col_idx}: {val}")

print("\n\n5. SAMENVATTING VAN HUIDIGE STRUCTUUR")
print("="*80)
print("""
HUIDIGE SITUATIE:
- Invulblad: Orderdata invoer met kolommen voor ordernummer, omschrijving, klant, week, uren, medewerkers, status
- Dashboard: Overzicht van orders per status
- Status tabbladen: Gescheiden weergave per status (Ber. st. 1 t/m 9)
- Planningstabbladen: Per medewerker (Tomasz, Ed, Mark, Zoltan, etc.)
- Invulmogelijkheden: Dropdown lijsten voor status en medewerkers

BEVINDINGEN:
- Structuur is complex met veel tabbladen
- Data is verspreid over meerdere tabbladen
- Geen centrale database structuur
- Geen automatische meldingen of suggesties
- Geen zoekfunctionaliteit
- Geen zelflerend systeem
""")

