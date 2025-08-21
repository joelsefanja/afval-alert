"""Application Configuration"""

import os
from dataclasses import dataclass, field


@dataclass
class AppConfig:
    """Hoofdconfiguratie voor de applicatie"""

    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    model_name: str = "convnext_base_384_in22k_ft_in1k"
    max_file_size: int = 20 * 1024 * 1024  # 20MB
    device: str = "cpu"
    log_level: str = "INFO"
