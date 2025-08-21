"""Afval Classification Configuration"""

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Union

import yaml

logger = logging.getLogger(__name__)


@dataclass
class AfvalConfig:
    """Configuratie voor afval types en Gemini prompts"""

    afval_types: List[str] = field(default_factory=list)
    prompt_template: str = ""

    @classmethod
    def from_yaml(cls, config_path: Optional[Union[str, Path]] = None) -> "AfvalConfig":
        """Laad configuratie uit YAML bestand"""
        if config_path is None:
            config_path = (
                Path(__file__).parent.parent.parent / "config" / "afval_types.yaml"
            )

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            return cls(
                afval_types=data.get("afval_types", []),
                prompt_template=data.get("gemini_prompt_template", ""),
            )
        except Exception as e:
            logger.warning(f"Kan config niet laden: {e}, gebruik defaults")
            return cls(
                afval_types=["Grofvuil", "Restafval", "Glas", "Papier en karton", "Organisch", "Textiel", "Elektronisch afval", "Bouw- en sloopafval", "Chemisch afval", "Overig", "Geen afval"],
                prompt_template="Classificeer: {lokaal_resultaat}\nTypes: {afval_types}",
            )
