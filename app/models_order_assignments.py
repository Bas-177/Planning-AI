"""
Model voor order-medewerker toewijzingen
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class OrderAssignment(BaseModel):
    """Toewijzing van medewerker aan order met bewerking"""
    ordernummer: str = Field(..., description="Ordernummer")
    medewerker: str = Field(..., description="Naam van medewerker")
    bewerking: str = Field(..., description="Type bewerking: voorbereiding, samenstellen, aflassen, montage")
    uren: float = Field(..., description="Aantal uren")
    week_nummer: Optional[int] = Field(None, description="Week nummer")
    jaar: Optional[int] = Field(None, description="Jaar")
    start_datum: Optional[date] = Field(None, description="Start datum")
    eind_datum: Optional[date] = Field(None, description="Eind datum")

