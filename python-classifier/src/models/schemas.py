"""
Data modellen en schemas voor AfvalAlert classificatie

Deze module definieert alle data structuren die gebruikt worden
voor het classificeren van zwerfafval met AI modellen.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ClassificationResult:
    """
    Enkelvoudig classificatie resultaat met betrouwbaarheidsscore
    
    Attributes:
        class_name: Naam van de gedetecteerde afval klasse
        probability: Betrouwbaarheidsscore tussen 0.0 en 1.0
    """
    class_name: str
    probability: float
    
    def __post_init__(self):
        """Valideer waarschijnlijkheid binnen bereik"""
        if not 0.0 <= self.probability <= 1.0:
            raise ValueError(f"Waarschijnlijkheid moet tussen 0.0 en 1.0 zijn, kreeg: {self.probability}")


@dataclass
class ClassificatieResultaat(ClassificationResult):
    """
    Nederlandse alias voor ClassificationResult
    """
    pass


@dataclass
class LocalClassification:
    """
    Resultaat van lokale AI model classificatie
    
    Attributes:
        success: Of classificatie succesvol was
        predictions: Lijst van classificatie resultaten
        max_confidence: Hoogste betrouwbaarheidsscore
        processing_time: Tijd in seconden voor verwerking (optioneel)
    """
    success: bool
    predictions: List[ClassificationResult]
    max_confidence: float
    processing_time: Optional[float] = None
    
    def __post_init__(self):
        """Valideer dat max_confidence klopt met predictions"""
        if self.predictions and self.success:
            werkelijke_max = max(v.probability for v in self.predictions)
            if abs(self.max_confidence - werkelijke_max) > 0.001:
                self.max_confidence = werkelijke_max


@dataclass
class LokaleClassificatie(LocalClassification):
    """
    Nederlandse alias voor LocalClassification
    """
    pass


@dataclass
class AfvalTypeZekerheid:
    """
    Afval type met bijbehorende zekerheid
    
    Attributes:
        afval_type: Type zwerfafval (uit configuratie)
        zekerheid: Betrouwbaarheidsscore van Gemini tussen 0.0 en 1.0
    """
    afval_type: str
    zekerheid: float
    
    def __post_init__(self):
        """Valideer zekerheid binnen bereik"""
        if not 0.0 <= self.zekerheid <= 1.0:
            raise ValueError(f"Zekerheid moet tussen 0.0 en 1.0 zijn, kreeg: {self.zekerheid}")


@dataclass
class GeminiClassification:
    """
    Resultaat van Google Gemini AI classificatie
    
    Attributes:
        is_afval: Of het gedetecteerde object zwerfafval is
        afval_types: Lijst van afval types met zekerheid scores (als dict voor flexibiliteit)
        kenmerken: Lijst van gedetecteerde kenmerken
        bedank_boodschap: Vriendelijke boodschap voor de gebruiker
    """
    is_afval: bool
    afval_types: List[dict]  # Changed to dict for flexibility with API parsing
    kenmerken: List[str]
    bedank_boodschap: str


@dataclass
class GeminiClassificatie(GeminiClassification):
    """
    Nederlandse alias voor GeminiClassification
    """
    pass