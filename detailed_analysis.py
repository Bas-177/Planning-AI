import pandas as pd
import openpyxl

file_path = 'Planning 2025 Industrie 1.xlsx'

# Lees het Invulblad tabblad met verschillende header opties
print("="*80)
print("GEDETAILLEERDE ANALYSE - INVULBLAD")
print("="*80)

# Probeer verschillende header rijen
for header_row in [0, 1, 2, 3]:
    try:
        df = pd.read_excel(file_path, sheet_name='Invulblad', header=header_row)
        print(f"\n--- Met header op rij {header_row} ---")
        print(f"Kolommen: {list(df.columns[:15])}")  # Eerste 15 kolommen
        if len(df) > 0:
            print(f"Eerste data rij:\n{df.iloc[0] if header_row < len(df) else 'Geen data'}")
    except:
        pass

# Lees zonder header om de ruwe structuur te zien
df_raw = pd.read_excel(file_path, sheet_name='Invulblad', header=None)
print("\n" + "="*80)
print("RUWE DATA STRUCTUUR (eerste 10 rijen, eerste 15 kolommen)")
print("="*80)
print(df_raw.iloc[:10, :15].to_string())

# Bekijk het Dashboard tabblad
print("\n\n" + "="*80)
print("DASHBOARD TABBLAD STRUCTUUR")
print("="*80)
df_dash = pd.read_excel(file_path, sheet_name='Dashboard', header=None)
print(df_dash.iloc[:10, :20].to_string())

# Bekijk Invulmogelijkheden
print("\n\n" + "="*80)
print("INVULMOGELIJKHEDEN TABBLAD")
print("="*80)
df_invul = pd.read_excel(file_path, sheet_name='Invulmogelijkheden', header=None)
print(df_invul.to_string())


