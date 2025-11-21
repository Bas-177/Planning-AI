"""
Database handler voor Excel bestanden
"""
import pandas as pd
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
import json
import math

from app.models import Order, Standard


class ExcelDatabase:
    """Handler voor Excel database"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        self.orders_file = self.data_dir / "orders.xlsx"
        self.standards_file = self.data_dir / "standards.xlsx"
        self.history_file = self.data_dir / "history.json"
        self.vrije_dagen_file = self.data_dir / "vrije_dagen.xlsx"
        self.medewerkers_file = self.data_dir / "medewerkers.xlsx"
        self.week_planning_file = self.data_dir / "week_planning.xlsx"
        self.order_assignments_file = self.data_dir / "order_assignments.xlsx"
        
        # Initialiseer bestanden als ze niet bestaan
        self._initialize_files()
    
    def _initialize_files(self):
        """Initialiseer Excel bestanden met lege dataframes"""
        if not self.orders_file.exists():
            df = pd.DataFrame(columns=[
                'ordernummer', 'klant', 'omschrijving', 'klantreferentie', 'leverdatum', 'opmerkingen',
                # Voorbereiding
                'uren_voorbereiding', 'voorbereiding_types', 'voorbereiding_parallel_toegestaan',
                # Productie
                'uren_samenstellen', 'uren_aflassen',
                # Conservering
                'conserveringen', 'conserveringsdatum', 'conservering_doorlooptijd',
            # Montage
            'heeft_montage', 'montage_type', 'montage_opmerkingen', 'uitlevering_opmerkingen',
                # Status
                'materiaal_besteld', 'materiaal_binnen', 'productie_gereed', 'project_gereed',
                # Bestelde materialen
                'bestelde_materialen', 'materiaal_opmerkingen', 'uiterste_leverdatum_materiaal',
                # Metadata
                'datum_aangemaakt', 'laatste_update'
            ])
            df.to_excel(self.orders_file, index=False)
        
        if not self.standards_file.exists():
            df = pd.DataFrame(columns=[
                'nabehandeling', 'standaard_doorlooptijd_dagen', 'klant', 'opmerkingen'
            ])
            df.to_excel(self.standards_file, index=False)
        
        if not self.vrije_dagen_file.exists():
            df = pd.DataFrame(columns=[
                'datum', 'omschrijving', 'medewerker'
            ])
            df.to_excel(self.vrije_dagen_file, index=False)
        
        if not self.medewerkers_file.exists():
            df = pd.DataFrame(columns=[
                'naam', 'actief', 'standaard_uren_per_week',
                'standaard_uren_ma', 'standaard_uren_di', 'standaard_uren_wo', 'standaard_uren_do',
                'standaard_uren_vr', 'standaard_uren_za', 'standaard_uren_zo',
                'kan_voorbereiden', 'kan_samenstellen', 'kan_aflassen', 'kan_montage'
            ])
            df.to_excel(self.medewerkers_file, index=False)
        
        if not self.week_planning_file.exists():
            df = pd.DataFrame(columns=[
                'week_nummer', 'jaar', 'medewerker', 'beschikbare_uren',
                'uren_ma', 'uren_di', 'uren_wo', 'uren_do', 'uren_vr', 'uren_za', 'uren_zo',
                'opmerkingen'
            ])
            df.to_excel(self.week_planning_file, index=False)
        
        if not self.order_assignments_file.exists():
            df = pd.DataFrame(columns=[
                'ordernummer', 'medewerker', 'bewerking', 'uren', 'week_nummer', 'jaar', 'start_datum', 'eind_datum'
            ])
            df.to_excel(self.order_assignments_file, index=False)
        
        if not self.history_file.exists():
            with open(self.history_file, 'w') as f:
                json.dump([], f)
    
    def get_all_orders(self) -> List[Dict]:
        """Haal alle orders op"""
        if not self.orders_file.exists():
            return []
        
        df = pd.read_excel(self.orders_file)
        
        # Converteer datetime kolommen naar strings eerst
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].dt.strftime('%Y-%m-%d')
        
        # Converteer NaN naar None voor JSON serialisatie
        df = df.where(pd.notnull(df), None)
        
        # Converteer specifieke boolean kolommen - NaN wordt False
        boolean_cols = ['materiaal_besteld', 'materiaal_binnen', 'productie_gereed', 'project_gereed', 'heeft_montage']
        for col in boolean_cols:
            if col in df.columns:
                df[col] = df[col].fillna(False)
                # Converteer naar echte boolean
                df[col] = df[col].astype(bool)
        
        # Converteer float kolommen - NaN wordt 0.0
        float_cols = ['uren_voorbereiding', 'uren_samenstellen', 'uren_aflassen']
        for col in float_cols:
            if col in df.columns:
                df[col] = df[col].fillna(0.0)
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)
        
        records = df.to_dict('records')
        
        # Parse JSON strings terug naar lijsten en migreer oude kolommen
        for record in records:
            # Clean NaN/None waarden - converteer naar geschikte defaults
            for key, value in list(record.items()):
                # Check voor NaN, None, of invalid float waarden
                is_nan = False
                if value is None:
                    is_nan = True
                elif isinstance(value, float):
                    is_nan = math.isnan(value) or math.isinf(value)
                elif pd.isna(value) if hasattr(pd, 'isna') else False:
                    is_nan = True
                
                if is_nan:
                    if key in ['materiaal_besteld', 'materiaal_binnen', 'productie_gereed', 'project_gereed', 'heeft_montage']:
                        record[key] = False
                    elif key in ['uren_voorbereiding', 'uren_samenstellen', 'uren_aflassen']:
                        record[key] = 0.0
                    else:
                        record[key] = None
            
            # Migreer oude 'conservering' kolom naar 'conserveringen' (lijst)
            if 'conservering' in record and 'conserveringen' not in record:
                if record.get('conservering'):
                    record['conserveringen'] = [record['conservering']] if isinstance(record['conservering'], str) else record['conservering']
                else:
                    record['conserveringen'] = []
            
            # Conserveringen
            if record.get('conserveringen') and isinstance(record['conserveringen'], str):
                try:
                    record['conserveringen'] = json.loads(record['conserveringen'])
                except:
                    # Als het geen JSON is, maak er een lijst van
                    record['conserveringen'] = [record['conserveringen']] if record['conserveringen'] else []
            elif record.get('conserveringen') is None:
                record['conserveringen'] = []
            
            # Voorbereiding types
            if record.get('voorbereiding_types') and isinstance(record['voorbereiding_types'], str):
                try:
                    record['voorbereiding_types'] = json.loads(record['voorbereiding_types'])
                except:
                    record['voorbereiding_types'] = []
            elif record.get('voorbereiding_types') is None:
                record['voorbereiding_types'] = []
            
            # Bestelde materialen
            if record.get('bestelde_materialen') and isinstance(record['bestelde_materialen'], str):
                try:
                    record['bestelde_materialen'] = json.loads(record['bestelde_materialen'])
                except:
                    record['bestelde_materialen'] = []
            elif record.get('bestelde_materialen') is None:
                record['bestelde_materialen'] = []
            
            # Zorg dat alle nieuwe velden bestaan
            if 'montage_opmerkingen' not in record:
                record['montage_opmerkingen'] = None
            if 'uitlevering_opmerkingen' not in record:
                record['uitlevering_opmerkingen'] = None
            if 'heeft_montage' not in record:
                record['heeft_montage'] = False
            if 'montage_type' not in record:
                record['montage_type'] = None
            if 'opmerkingen' not in record:
                record['opmerkingen'] = None
            if 'conservering_doorlooptijd' not in record:
                record['conservering_doorlooptijd'] = None
            if 'materiaal_opmerkingen' not in record:
                record['materiaal_opmerkingen'] = None
            if 'uiterste_leverdatum_materiaal' not in record:
                record['uiterste_leverdatum_materiaal'] = None
            
            # Converteer boolean velden expliciet
            for bool_key in ['materiaal_besteld', 'materiaal_binnen', 'productie_gereed', 'project_gereed', 'heeft_montage']:
                if bool_key in record:
                    val = record[bool_key]
                    if isinstance(val, str):
                        record[bool_key] = val.lower() in ['true', '1', 'yes']
                    elif val is None or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
                        record[bool_key] = False
                    else:
                        record[bool_key] = bool(val)
        
        return records
    
    def get_order(self, ordernummer: str) -> Optional[Dict]:
        """Haal specifieke order op"""
        orders = self.get_all_orders()
        for order in orders:
            if order.get('ordernummer') == ordernummer:
                return order
        return None
    
    def create_order(self, order: Order) -> Dict:
        """Maak nieuwe order aan"""
        df = pd.read_excel(self.orders_file) if self.orders_file.exists() else pd.DataFrame()
        
        # Check of ordernummer al bestaat
        if order.ordernummer in df['ordernummer'].values:
            raise ValueError(f"Ordernummer {order.ordernummer} bestaat al")
        
        # Voeg order toe
        new_row = {
            'ordernummer': order.ordernummer,
            'klant': order.klant,
            'omschrijving': order.omschrijving,
            'klantreferentie': order.klantreferentie,
            'leverdatum': order.leverdatum,
            'opmerkingen': order.opmerkingen,
            # Voorbereiding
            'uren_voorbereiding': order.uren_voorbereiding,
            'voorbereiding_types': json.dumps(order.voorbereiding_types or []),
            'voorbereiding_parallel_toegestaan': order.voorbereiding_parallel_toegestaan if hasattr(order, 'voorbereiding_parallel_toegestaan') else False,
            # Productie
            'uren_samenstellen': order.uren_samenstellen,
            'uren_aflassen': order.uren_aflassen,
            # Conservering
            'conserveringen': json.dumps(order.conserveringen or []),
            'conserveringsdatum': order.conserveringsdatum,
            'conservering_doorlooptijd': order.conservering_doorlooptijd,
            # Montage
            'heeft_montage': order.heeft_montage,
            'montage_type': order.montage_type,
            'montage_opmerkingen': order.montage_opmerkingen,
            'uitlevering_opmerkingen': order.uitlevering_opmerkingen,
            # Status
            'materiaal_besteld': order.materiaal_besteld,
            'materiaal_binnen': order.materiaal_binnen,
            'productie_gereed': order.productie_gereed,
            'project_gereed': order.project_gereed,
            # Bestelde materialen
            'bestelde_materialen': json.dumps(order.bestelde_materialen or []),
            'materiaal_opmerkingen': order.materiaal_opmerkingen,
            'uiterste_leverdatum_materiaal': order.uiterste_leverdatum_materiaal,
            # Metadata
            'datum_aangemaakt': datetime.now(),
            'laatste_update': datetime.now()
        }
        
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        df.to_excel(self.orders_file, index=False)
        
        # Log in history
        self._log_history('create', order.ordernummer, new_row)
        
        # Converteer datetime objecten naar strings voor JSON serialisatie
        cleaned_row = {}
        for key, value in new_row.items():
            if value is None:
                cleaned_row[key] = None
            elif isinstance(value, (datetime, date)):
                cleaned_row[key] = value.isoformat() if hasattr(value, 'isoformat') else str(value)
            elif isinstance(value, float) and (value != value or value == float('inf') or value == float('-inf')):
                cleaned_row[key] = None if key in ['start_datum', 'eind_datum'] else 0.0
            else:
                cleaned_row[key] = value
        
        return cleaned_row
    
    def update_order(self, ordernummer: str, order_update: Dict) -> Optional[Dict]:
        """Update bestaande order"""
        if not self.orders_file.exists():
            return None
            
        df = pd.read_excel(self.orders_file)
        
        if ordernummer not in df['ordernummer'].values:
            return None
        
        # Update velden
        idx = df[df['ordernummer'] == ordernummer].index[0]
        for key, value in order_update.items():
            if key == 'ordernummer':
                continue  # Skip ordernummer, kan niet gewijzigd worden
            if value is not None:
                # Speciale behandeling voor lijsten (JSON string)
                if key in ['conserveringen', 'voorbereiding_types', 'bestelde_materialen'] and isinstance(value, list):
                    df.at[idx, key] = json.dumps(value)
                elif key in ['conserveringen', 'voorbereiding_types', 'bestelde_materialen'] and isinstance(value, str):
                    # Al een JSON string, gebruik direct
                    df.at[idx, key] = value
                else:
                    df.at[idx, key] = value
        
        df.at[idx, 'laatste_update'] = datetime.now()
        df.to_excel(self.orders_file, index=False)
        
        # Log in history
        self._log_history('update', ordernummer, order_update)
        
        # Parse JSON strings terug naar lijsten
        result = df.iloc[idx].to_dict()
        for key in ['conserveringen', 'voorbereiding_types', 'bestelde_materialen']:
            if result.get(key) and isinstance(result[key], str):
                try:
                    result[key] = json.loads(result[key])
                except:
                    result[key] = []
            elif result.get(key) is None:
                result[key] = []
        
        return result
    
    def delete_order(self, ordernummer: str) -> bool:
        """Verwijder order"""
        df = pd.read_excel(self.orders_file)
        
        if ordernummer not in df['ordernummer'].values:
            return False
        
        df = df[df['ordernummer'] != ordernummer]
        df.to_excel(self.orders_file, index=False)
        
        # Log in history
        self._log_history('delete', ordernummer, {})
        
        return True
    
    def search_orders(self, query: str) -> List[Dict]:
        """Zoek in orders"""
        orders = self.get_all_orders()
        query_lower = query.lower()
        
        results = []
        for order in orders:
            # Zoek in alle tekstvelden
            searchable_text = ' '.join([
                str(order.get('ordernummer', '')),
                str(order.get('klant', '')),
                str(order.get('omschrijving', '')),
                str(order.get('klantreferentie', ''))
            ]).lower()
            
            if query_lower in searchable_text:
                results.append(order)
        
        return results
    
    def get_standards(self) -> List[Dict]:
        """Haal standaard doorlooptijden op"""
        if not self.standards_file.exists():
            return []
        
        df = pd.read_excel(self.standards_file)
        df = df.where(pd.notnull(df), None)
        return df.to_dict('records')
    
    def create_standard(self, standard: Standard) -> Dict:
        """Voeg standaard doorlooptijd toe"""
        df = pd.read_excel(self.standards_file) if self.standards_file.exists() else pd.DataFrame()
        
        new_row = {
            'nabehandeling': standard.nabehandeling,
            'standaard_doorlooptijd_dagen': standard.standaard_doorlooptijd_dagen,
            'klant': standard.klant,
            'opmerkingen': standard.opmerkingen
        }
        
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        df.to_excel(self.standards_file, index=False)
        
        return new_row
    
    def delete_standard(self, nabehandeling: str) -> bool:
        """Verwijder standaard doorlooptijd"""
        if not self.standards_file.exists():
            return False
        
        df = pd.read_excel(self.standards_file)
        if len(df) == 0:
            return False
        
        df = df[df['nabehandeling'] != nabehandeling]
        df.to_excel(self.standards_file, index=False)
        return True
    
    def _log_history(self, action: str, ordernummer: str, data: Dict):
        """Log actie in history voor zelflerend systeem"""
        if not self.history_file.exists():
            history = []
        else:
            with open(self.history_file, 'r') as f:
                history = json.load(f)
        
        history.append({
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'ordernummer': ordernummer,
            'data': data
        })
        
        with open(self.history_file, 'w') as f:
            json.dump(history, f, indent=2)
    
    def get_history(self) -> List[Dict]:
        """Haal history op voor AI analyse"""
        if not self.history_file.exists():
            return []
        
        with open(self.history_file, 'r') as f:
            return json.load(f)
    
    # Vrije dagen functies
    def get_vrije_dagen(self) -> List[Dict]:
        """Haal alle vrije dagen op"""
        if not self.vrije_dagen_file.exists():
            return []
        
        df = pd.read_excel(self.vrije_dagen_file)
        df = df.where(pd.notnull(df), None)
        return df.to_dict('records')
    
    def add_vrije_dag(self, vrije_dag: Dict) -> Dict:
        """Voeg vrije dag toe"""
        df = pd.read_excel(self.vrije_dagen_file) if self.vrije_dagen_file.exists() else pd.DataFrame()
        df = pd.concat([df, pd.DataFrame([vrije_dag])], ignore_index=True)
        df.to_excel(self.vrije_dagen_file, index=False)
        return vrije_dag
    
    def delete_vrije_dag(self, datum: str) -> bool:
        """Verwijder vrije dag"""
        if not self.vrije_dagen_file.exists():
            return False
        
        df = pd.read_excel(self.vrije_dagen_file)
        if len(df) == 0:
            return False
        
        df = df[df['datum'].astype(str) != str(datum)]
        df.to_excel(self.vrije_dagen_file, index=False)
        return True
    
    # Medewerkers functies
    def get_medewerkers(self) -> List[Dict]:
        """Haal alle medewerkers op"""
        if not self.medewerkers_file.exists():
            return []
        
        df = pd.read_excel(self.medewerkers_file)
        df = df.where(pd.notnull(df), None)
        return df.to_dict('records')
    
    def add_medewerker(self, medewerker: Dict) -> Dict:
        """Voeg medewerker toe"""
        df = pd.read_excel(self.medewerkers_file) if self.medewerkers_file.exists() else pd.DataFrame()
        
        # Check of medewerker al bestaat
        if len(df) > 0 and medewerker['naam'] in df['naam'].values:
            raise ValueError(f"Medewerker {medewerker['naam']} bestaat al")
        
        df = pd.concat([df, pd.DataFrame([medewerker])], ignore_index=True)
        df.to_excel(self.medewerkers_file, index=False)
        return medewerker
    
    def update_medewerker(self, naam: str, update_data: Dict) -> Optional[Dict]:
        """Update medewerker"""
        if not self.medewerkers_file.exists():
            return None
        
        df = pd.read_excel(self.medewerkers_file)
        
        if naam not in df['naam'].values:
            return None
        
        idx = df[df['naam'] == naam].index[0]
        for key, value in update_data.items():
            if value is not None:
                df.at[idx, key] = value
        
        df.to_excel(self.medewerkers_file, index=False)
        return df.iloc[idx].to_dict()
    
    def delete_medewerker(self, naam: str) -> bool:
        """Verwijder medewerker"""
        if not self.medewerkers_file.exists():
            return False
        
        df = pd.read_excel(self.medewerkers_file)
        
        if naam not in df['naam'].values:
            return False
        
        df = df[df['naam'] != naam]
        df.to_excel(self.medewerkers_file, index=False)
        return True
    
    # Week planning functies
    def get_week_planning(self, week_nummer: Optional[int] = None, jaar: Optional[int] = None) -> List[Dict]:
        """Haal week planning op"""
        if not self.week_planning_file.exists():
            return []
        
        df = pd.read_excel(self.week_planning_file)
        df = df.where(pd.notnull(df), None)
        
        if week_nummer is not None:
            df = df[df['week_nummer'] == week_nummer]
        if jaar is not None:
            df = df[df['jaar'] == jaar]
        
        return df.to_dict('records')
    
    def set_week_planning(self, week_planning: Dict) -> Dict:
        """Stel week planning in"""
        df = pd.read_excel(self.week_planning_file) if self.week_planning_file.exists() else pd.DataFrame()
        
        # Check of planning al bestaat
        if len(df) > 0:
            mask = (df['week_nummer'] == week_planning['week_nummer']) & \
                   (df['jaar'] == week_planning['jaar']) & \
                   (df['medewerker'] == week_planning['medewerker'])
            
            if mask.any():
                # Update bestaande
                idx = df[mask].index[0]
                for key, value in week_planning.items():
                    df.at[idx, key] = value
            else:
                # Voeg nieuwe toe
                df = pd.concat([df, pd.DataFrame([week_planning])], ignore_index=True)
        else:
            df = pd.DataFrame([week_planning])
        
        df.to_excel(self.week_planning_file, index=False)
        return week_planning
    
    # Order assignments functies
    def get_order_assignments(self, ordernummer: Optional[str] = None, medewerker: Optional[str] = None) -> List[Dict]:
        """Haal order toewijzingen op"""
        if not self.order_assignments_file.exists():
            return []
        
        df = pd.read_excel(self.order_assignments_file)
        df = df.where(pd.notnull(df), None)
        
        if ordernummer:
            df = df[df['ordernummer'] == ordernummer]
        if medewerker:
            df = df[df['medewerker'] == medewerker]
        
        return df.to_dict('records')
    
    def add_order_assignment(self, assignment: Dict) -> Dict:
        """Voeg order toewijzing toe"""
        df = pd.read_excel(self.order_assignments_file) if self.order_assignments_file.exists() else pd.DataFrame()
        df = pd.concat([df, pd.DataFrame([assignment])], ignore_index=True)
        df.to_excel(self.order_assignments_file, index=False)
        return assignment
    
    def delete_order_assignment(self, ordernummer: str, medewerker: str, bewerking: str) -> bool:
        """Verwijder order toewijzing"""
        if not self.order_assignments_file.exists():
            return False
        
        df = pd.read_excel(self.order_assignments_file)
        df = df[~((df['ordernummer'] == ordernummer) & (df['medewerker'] == medewerker) & (df['bewerking'] == bewerking))]
        df.to_excel(self.order_assignments_file, index=False)
        return True
    
    def update_order_assignment(self, ordernummer: str, medewerker: str, bewerking: str, update_data: Dict) -> Optional[Dict]:
        """Update order toewijzing"""
        if not self.order_assignments_file.exists():
            return None
        
        df = pd.read_excel(self.order_assignments_file)
        mask = (df['ordernummer'] == ordernummer) & (df['medewerker'] == medewerker) & (df['bewerking'] == bewerking)
        
        if not mask.any():
            return None
        
        idx = df[mask].index[0]
        for key, value in update_data.items():
            if value is not None:
                df.at[idx, key] = value
        
        df.to_excel(self.order_assignments_file, index=False)
        return df.iloc[idx].to_dict()

