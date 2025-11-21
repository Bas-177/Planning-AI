import pandas as pd
import openpyxl

# Open het Excel bestand
file_path = 'Planning 2025 Industrie 1.xlsx'
xl = pd.ExcelFile(file_path)

print("="*70)
print("ANALYSE VAN HET PLANNINGSBESTAND")
print("="*70)
print(f"\nAantal tabbladen: {len(xl.sheet_names)}")
print(f"Tabbladen: {xl.sheet_names}")

# Analyseer elk tabblad
for sheet_name in xl.sheet_names:
    print("\n" + "="*70)
    print(f"TABBLAD: {sheet_name}")
    print("="*70)
    
    # Lees het tabblad
    df = pd.read_excel(xl, sheet_name=sheet_name)
    
    # Basis informatie
    print(f"\nAantal rijen: {len(df)}")
    print(f"Aantal kolommen: {len(df.columns)}")
    
    # Kolommen
    print(f"\nKolommen ({len(df.columns)}):")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i}. {col}")
    
    # Eerste paar rijen met data
    print(f"\nEerste 5 rijen met data:")
    print(df.head().to_string())
    
    # Data types
    print(f"\nData types:")
    print(df.dtypes)
    
    # Lege cellen per kolom
    print(f"\nLege cellen per kolom:")
    for col in df.columns:
        empty_count = df[col].isna().sum()
        if empty_count > 0:
            print(f"  {col}: {empty_count} lege cellen")


