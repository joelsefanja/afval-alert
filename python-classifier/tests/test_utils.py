"""
Test Utilities voor AfvalAlert Classifier
Hulpmiddelen voor het schrijven van tests
"""

import numpy as np
from typing import Dict, List, Optional
from src.models.schemas import LocalClassification as LokaleClassificatie, GeminiClassification as GeminiClassificatieResultaat

# Since we don't have equivalent classes for VoorspellingsResultaat and GemeenteAfvalInfo,
# we'll define simple dataclasses for testing purposes
from dataclasses import dataclass
from typing import List

@dataclass
class VoorspellingsResultaat:
    klasse_naam: str
    waarschijnlijkheid: float

@dataclass
class GemeenteAfvalInfo:
    afval_type: str
    ophaal_dagen: List[str]
    instructies: str
    contact_info: str

def create_mock_image_data(width: int = 299, height: int = 299, channels: int = 3) -> bytes:
    """
    Maak mock afbeelding data voor tests
    
    Args:
        width: Breedte van afbeelding
        height: Hoogte van afbeelding
        channels: Aantal kleurkanalen (3 voor RGB)
        
    Returns:
        Bytes representatie van afbeelding
    """
    # Maak een eenvoudige numpy array met willekeurige data
    array = np.random.randint(0, 255, (height, width, channels), dtype=np.uint8)
    return array.tobytes()


def create_mock_classification_result(
    succes: bool = True,
    voorspellingen: List[Dict] = None,
    maximale_zekerheid: float = 0.85,
    fout_boodschap: str = None
) -> LokaleClassificatie:
    """
    Maak mock classificatie resultaat voor tests
    
    Args:
        succes: Of classificatie succesvol was
        voorspellingen: Lijst van voorspellingen
        maximale_zekerheid: Maximale zekerheid score
        fout_boodschap: Optionele foutboodschap
        
    Returns:
        LokaleClassificatie object
    """
    if voorspellingen is None:
        voorspellingen = [
            {"klasse_naam": "plastic", "vertrouwen": 0.85},
            {"klasse_naam": "papier", "vertrouwen": 0.12}
        ]
    
    # Converteer dicts naar VoorspellingsResultaat objecten
    voorspelling_objecten = [
        VoorspellingsResultaat(**pred) for pred in voorspellingen
    ]
    
    return LokaleClassificatie(
        succes=succes,
        voorspellingen=voorspelling_objecten,
        maximale_zekerheid=maximale_zekerheid,
        fout_boodschap=fout_boodschap
    )


def create_mock_gemini_result(
    is_zwerfafval: bool = True,
    afval_type: str = "plastic",
    zekerheid: float = 0.95,
    gedetecteerde_items: List[str] = None,
    bedank_boodschap: str = "Bedankt voor je melding!"
) -> GeminiClassificatieResultaat:
    """
    Maak mock Gemini resultaat voor tests
    
    Args:
        is_zwerfafval: Of het zwerfafval is
        afval_type: Type afval
        zekerheid: Zekerheid score
        gedetecteerde_items: Gedetecteerde items
        bedank_boodschap: Bedankboodschap
        
    Returns:
        GeminiClassificatieResultaat object
    """
    if gedetecteerde_items is None:
        gedetecteerde_items = ["plastic fles", "verpakking"]
    
    return GeminiClassificatieResultaat(
        is_zwerfafval=is_zwerfafval,
        afval_type=afval_type,
        zekerheid=zekerheid,
        gedetecteerde_items=gedetecteerde_items,
        bedank_boodschap=bedank_boodschap
    )


def create_mock_gemeente_info(
    afval_type: str = "plastic",
    beschrijving: str = "Plastic afval",
    verantwoordelijke_dienst: str = "Standaard reinigingsdienst",
    urgentie_niveau: str = "medium",
    recycling_mogelijkheden: str = "Recycleerbaar in plastic container",
    opruim_methode: str = "Handmatig opruimen"
) -> GemeenteAfvalInfo:
    """
    Maak mock gemeente info voor tests
    
    Args:
        afval_type: Type afval
        beschrijving: Beschrijving van afval
        verantwoordelijke_dienst: Verantwoordelijke dienst
        urgentie_niveau: Urgentie niveau
        recycling_mogelijkheden: Recycling mogelijkheden
        opruim_methode: Opruim methode
        
    Returns:
        GemeenteAfvalInfo object
    """
    return GemeenteAfvalInfo(
        afval_type=afval_type,
        beschrijving=beschrijving,
        verantwoordelijke_dienst=verantwoordelijke_dienst,
        urgentie_niveau=urgentie_niveau,
        recycling_mogelijkheden=recycling_mogelijkheden,
        opruim_methode=opruim_methode
    )


def assert_classification_result(result: LokaleClassificatie, expected_success: bool = True):
    """
    Assert dat classificatie resultaat correct is
    
    Args:
        result: LokaleClassificatie resultaat
        expected_success: Verwacht succes
    """
    assert isinstance(result, LokaleClassificatie)
    assert result.succes == expected_success
    
    if expected_success:
        assert len(result.voorspellingen) > 0
        assert 0.0 <= result.maximale_zekerheid <= 1.0
    else:
        assert result.fout_boodschap is not None


def assert_gemini_resultaat(resultaat: GeminiClassificatieResultaat, verwacht_is_afval: bool = True):
    """
    Assert dat Gemini resultaat correct is
    
    Args:
        resultaat: GeminiClassificatieResultaat
        verwacht_is_afval: Verwacht dat het zwerfafval is
    """
    assert isinstance(resultaat, GeminiClassificatieResultaat)
    assert resultaat.is_zwerfafval == verwacht_is_afval
    
    if verwacht_is_afval:
        assert resultaat.afval_type is not None
        assert 0.0 <= resultaat.zekerheid <= 1.0
        assert len(resultaat.gedetecteerde_items) > 0
    else:
        assert resultaat.bedank_boodschap is not None


def assert_gemeente_info(info: GemeenteAfvalInfo):
    """
    Assert dat gemeente info correct is
    
    Args:
        info: GemeenteAfvalInfo
    """
    assert isinstance(info, GemeenteAfvalInfo)
    assert info.afval_type is not None
    assert info.beschrijving is not None
    assert info.verantwoordelijke_dienst is not None