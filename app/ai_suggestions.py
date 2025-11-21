"""
AI Suggestie Engine voor zelflerend systeem
"""
from typing import List, Dict
from datetime import datetime, date
import pandas as pd

from app.models import Suggestion
from app.database import ExcelDatabase


class AISuggestionEngine:
    """Engine voor AI suggesties gebaseerd op historische data"""
    
    def __init__(self, database: ExcelDatabase):
        self.db = database
    
    def get_suggestions(self, order: Dict) -> List[Suggestion]:
        """Genereer suggesties voor een order"""
        suggestions = []
        
        # Analyseer order
        leverdatum = self._parse_date(order.get('leverdatum'))
        totaal_uren = (
            order.get('uren_voorbereiding', 0) +
            order.get('uren_samenstellen', 0) +
            order.get('uren_aflassen', 0)
        )
        
        # Suggestie 1: Realistische leverdatum check
        if leverdatum:
            dagen_tot_deadline = (leverdatum - datetime.now().date()).days
            geschatte_dagen_nodig = self._schat_benodigde_dagen(totaal_uren, order)
            
            if dagen_tot_deadline < geschatte_dagen_nodig:
                suggestions.append(Suggestion(
                    order_id=order['ordernummer'],
                    type='planning',
                    bericht=f"Deadline lijkt onrealistisch. Geschatte benodigde tijd: {geschatte_dagen_nodig} dagen, resterend: {dagen_tot_deadline} dagen",
                    prioriteit='high',
                    actie=f"Overweeg leverdatum te verplaatsen naar {datetime.now().date().replace(day=datetime.now().day + geschatte_dagen_nodig)}"
                ))
        
        # Suggestie 2: Materiaal timing
        if not order.get('materiaal_besteld') and leverdatum:
            dagen_tot_deadline = (leverdatum - datetime.now().date()).days
            if dagen_tot_deadline < 10:
                suggestions.append(Suggestion(
                    order_id=order['ordernummer'],
                    type='materiaal',
                    bericht="Materiaal nog niet besteld, maar deadline nadert. Overweeg materiaal direct te bestellen.",
                    prioriteit='high'
                ))
        
        # Suggestie 3: Conservering timing
        conservering = order.get('conservering')
        conserveringsdatum = self._parse_date(order.get('conserveringsdatum'))
        if conservering and not conserveringsdatum and leverdatum:
            standaard_doorlooptijd = self._get_conservering_doorlooptijd(conservering)
            if standaard_doorlooptijd:
                benodigde_datum = leverdatum - pd.Timedelta(days=standaard_doorlooptijd)
                suggestions.append(Suggestion(
                    order_id=order['ordernummer'],
                    type='conservering',
                    bericht=f"Voor {conservering} is {standaard_doorlooptijd} dagen nodig. Productie moet gereed zijn voor {benodigde_datum}",
                    prioriteit='medium',
                    actie=f"Plan productie afronding voor {benodigde_datum}"
                ))
        
        # Suggestie 4: Resource planning
        if totaal_uren > 40:
            suggestions.append(Suggestion(
                order_id=order['ordernummer'],
                type='resource',
                bericht=f"Grote order ({totaal_uren} uren). Overweeg meerdere medewerkers in te plannen.",
                prioriteit='medium'
            ))
        
        return suggestions
    
    def _parse_date(self, date_value) -> date:
        """Parse datum van verschillende formaten"""
        if not date_value:
            return None
        
        if isinstance(date_value, date):
            return date_value
        
        if isinstance(date_value, datetime):
            return date_value.date()
        
        if isinstance(date_value, str):
            try:
                return datetime.fromisoformat(date_value).date()
            except:
                try:
                    return datetime.strptime(date_value, "%Y-%m-%d").date()
                except:
                    return None
        
        return None
    
    def _schat_benodigde_dagen(self, totaal_uren: float, order: Dict) -> int:
        """Schat benodigde dagen op basis van historische data"""
        # Basis schatting: 8 uren per dag
        basis_dagen = int(totaal_uren / 8)
        
        # Check historische data voor betere schatting
        history = self.db.get_history()
        similar_orders = [
            h for h in history 
            if h.get('action') == 'create' and 
            abs(h.get('data', {}).get('uren_voorbereiding', 0) + 
                h.get('data', {}).get('uren_samenstellen', 0) + 
                h.get('data', {}).get('uren_aflassen', 0) - totaal_uren) < 10
        ]
        
        if similar_orders:
            # Gebruik gemiddelde van vergelijkbare orders
            # (vereenvoudigde versie - kan uitgebreid worden)
            pass
        
        # Voeg buffer toe voor onzekerheid
        return max(basis_dagen + 2, 3)
    
    def _get_conservering_doorlooptijd(self, conservering: str) -> int:
        """Haal standaard doorlooptijd op voor conservering"""
        standards = self.db.get_standards()
        for std in standards:
            if std.get('nabehandeling', '').lower() == conservering.lower():
                return std.get('standaard_doorlooptijd_dagen', 0)
        return 0

