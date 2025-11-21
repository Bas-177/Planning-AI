"""
Data modellen voor de planningsmodule
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class Order(BaseModel):
    """Order model"""
    ordernummer: str = Field(..., description="Uniek ordernummer")
    klant: str = Field(..., description="Klant naam")
    omschrijving: str = Field(..., description="Korte omschrijving")
    klantreferentie: Optional[str] = Field(None, description="Klantreferentie")
    leverdatum: date = Field(..., description="Gewenste leverdatum")
    opmerkingen: Optional[str] = Field(None, description="Opmerkingen en aandachtspunten")
    
    # FASE 1: VOORBEREIDING
    uren_voorbereiding: float = Field(0.0, description="Uren voorbereiding")
    voorbereiding_types: Optional[List[str]] = Field(default_factory=list, description="Types voorbereiding: Boren, Tappen, etc.")
    voorbereiding_parallel_toegestaan: bool = Field(False, description="Voorbereiding mag parallel lopen met productie (bij grote projecten)")
    
    # FASE 2: PRODUCTIE
    uren_samenstellen: float = Field(0.0, description="Uren samenstellen")
    uren_aflassen: float = Field(0.0, description="Uren aflassen")
    
    # FASE 3: CONSERVERING
    conserveringen: Optional[List[str]] = Field(default_factory=list, description="Lijst van conserveringen")
    conserveringsdatum: Optional[date] = Field(None, description="Datum conservering")
    conservering_doorlooptijd: Optional[int] = Field(None, description="Doorlooptijd conservering in dagen")
    
    # FASE 4: MONTAGE
    heeft_montage: bool = Field(False, description="Heeft montage")
    montage_type: Optional[str] = Field(None, description="Intern of Extern montage")
    montage_opmerkingen: Optional[str] = Field(None, description="Opmerkingen bij montage")
    uitlevering_opmerkingen: Optional[str] = Field(None, description="Opmerkingen bij uitlevering")
    
    # Status checkboxes
    materiaal_besteld: bool = Field(False, description="Materiaal besteld")
    materiaal_binnen: bool = Field(False, description="Materiaal binnen")
    productie_gereed: bool = Field(False, description="Productie gereed")
    project_gereed: bool = Field(False, description="Project gereed")
    
    # Bestelde materialen
    bestelde_materialen: Optional[List[str]] = Field(default_factory=list, description="Lijst van bestelde materialen")
    materiaal_opmerkingen: Optional[str] = Field(None, description="Opmerkingen over materialen/bestellingen")
    uiterste_leverdatum_materiaal: Optional[date] = Field(None, description="Uiterste leverdatum materiaal (productie kan niet eerder starten)")
    
    # Metadata
    datum_aangemaakt: Optional[datetime] = None
    laatste_update: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "ordernummer": "ORD-2025-001",
                "klant": "Klant ABC",
                "omschrijving": "Staalconstructie",
                "klantreferentie": "REF-123",
                "conserveringen": ["Thermisch verzinken", "Poedercoaten"],
                "conserveringsdatum": "2025-12-01",
                "leverdatum": "2025-12-15",
                "uren_voorbereiding": 8.0,
                "uren_samenstellen": 16.0,
                "uren_aflassen": 4.0,
                "opmerkingen": "Let op: speciale afmetingen",
                "materiaal_besteld": True,
                "materiaal_binnen": False,
                "productie_gereed": False,
                "project_gereed": False
            }
        }


class OrderUpdate(BaseModel):
    """Model voor order updates (alle velden optioneel)"""
    klant: Optional[str] = None
    omschrijving: Optional[str] = None
    klantreferentie: Optional[str] = None
    leverdatum: Optional[date] = None
    opmerkingen: Optional[str] = None
    # Voorbereiding
    uren_voorbereiding: Optional[float] = None
    voorbereiding_types: Optional[List[str]] = None
    # Productie
    uren_samenstellen: Optional[float] = None
    uren_aflassen: Optional[float] = None
    # Conservering
    conserveringen: Optional[List[str]] = None
    conserveringsdatum: Optional[date] = None
    conservering_doorlooptijd: Optional[int] = None
    # Montage
    heeft_montage: Optional[bool] = None
    montage_type: Optional[str] = None
    # Status
    materiaal_besteld: Optional[bool] = None
    materiaal_binnen: Optional[bool] = None
    productie_gereed: Optional[bool] = None
    project_gereed: Optional[bool] = None
    # Bestelde materialen
    bestelde_materialen: Optional[List[str]] = None
    materiaal_opmerkingen: Optional[str] = None
    uiterste_leverdatum_materiaal: Optional[date] = None


class Standard(BaseModel):
    """Standaard doorlooptijd model"""
    nabehandeling: str = Field(..., description="Type nabehandeling")
    standaard_doorlooptijd_dagen: int = Field(..., description="Standaard doorlooptijd in dagen")
    klant: Optional[str] = Field(None, description="Klant specifieke eis (optioneel)")
    opmerkingen: Optional[str] = Field(None, description="Extra opmerkingen")


class Suggestion(BaseModel):
    """AI suggestie model"""
    order_id: str
    type: str = Field(..., description="Type suggestie: deadline, planning, resource")
    bericht: str = Field(..., description="Suggestie bericht")
    prioriteit: str = Field("medium", description="Prioriteit: low, medium, high")
    actie: Optional[str] = Field(None, description="Voorgestelde actie")


class VrijeDag(BaseModel):
    """Vrije dag model voor agenda"""
    datum: date = Field(..., description="Datum van vrije dag")
    omschrijving: Optional[str] = Field(None, description="Omschrijving (bijv. feestdag, vakantie)")
    medewerker: Optional[str] = Field(None, description="Specifieke medewerker (None = alle medewerkers)")


class Medewerker(BaseModel):
    """Medewerker model"""
    naam: str = Field(..., description="Naam van medewerker")
    actief: bool = Field(True, description="Is medewerker actief")
    standaard_uren_per_week: float = Field(40.0, description="Standaard uren per week")
    # Dagelijkse standaard uren (ma t/m zo)
    standaard_uren_ma: Optional[float] = Field(8.0, description="Standaard uren maandag")
    standaard_uren_di: Optional[float] = Field(8.0, description="Standaard uren dinsdag")
    standaard_uren_wo: Optional[float] = Field(8.0, description="Standaard uren woensdag")
    standaard_uren_do: Optional[float] = Field(8.0, description="Standaard uren donderdag")
    standaard_uren_vr: Optional[float] = Field(8.0, description="Standaard uren vrijdag")
    standaard_uren_za: Optional[float] = Field(0.0, description="Standaard uren zaterdag")
    standaard_uren_zo: Optional[float] = Field(0.0, description="Standaard uren zondag")
    # Bewerkingen die medewerker kan uitvoeren
    kan_voorbereiden: bool = Field(False, description="Kan voorbereiden")
    kan_samenstellen: bool = Field(False, description="Kan samenstellen")
    kan_aflassen: bool = Field(False, description="Kan aflassen")
    kan_montage: bool = Field(False, description="Kan montage")


class WeekPlanning(BaseModel):
    """Week planning model voor beschikbare uren"""
    week_nummer: int = Field(..., description="Week nummer (1-52)")
    jaar: int = Field(..., description="Jaar")
    medewerker: str = Field(..., description="Naam van medewerker")
    beschikbare_uren: float = Field(..., description="Beschikbare uren deze week")
    # Dagelijkse uren voor deze week (override standaard)
    uren_ma: Optional[float] = Field(None, description="Uren maandag")
    uren_di: Optional[float] = Field(None, description="Uren dinsdag")
    uren_wo: Optional[float] = Field(None, description="Uren woensdag")
    uren_do: Optional[float] = Field(None, description="Uren donderdag")
    uren_vr: Optional[float] = Field(None, description="Uren vrijdag")
    uren_za: Optional[float] = Field(None, description="Uren zaterdag")
    uren_zo: Optional[float] = Field(None, description="Uren zondag")
    opmerkingen: Optional[str] = Field(None, description="Opmerkingen voor deze week")
