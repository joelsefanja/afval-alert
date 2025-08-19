"""Classification result models for waste classification"""

from dataclasses import dataclass
from typing import List


@dataclass
class ClassificationResult:
    """Single classification result with waste type and confidence"""
    waste_type: str
    confidence: float
    
    def __post_init__(self):
        """Validate confidence is between 0 and 1"""
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError(f"Confidence must be between 0.0 and 1.0, got: {self.confidence}")


@dataclass
class WasteClassification:
    """Complete waste classification result"""
    status: str
    data: List[ClassificationResult]
    timestamp: str