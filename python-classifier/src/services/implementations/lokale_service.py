"""Lokale Service Implementation"""

from ...config.app_config import AppConfig
from ...decorators.logging_decorator import logged
from ...decorators.singleton_decorator import singleton
from ...decorators.validation_decorator import validate_image


@singleton
class LokaleService:
    """ConvNeXt Base service voor afbeelding feature extractie"""

    def __init__(self, config: AppConfig = AppConfig()):
        self.config = config
        self.device = torch.device(config.device)
        self.model = None
        self.transform = None
        self._initialized = False

    def _lazy_init(self):
        """Lazy initialization - ConvNeXt model laden bij eerste gebruik"""
        if not self._initialized:
            # Import only when needed
            import timm
            import torch
            from timm.data import create_transform, resolve_data_config

            print(f"Laden van ConvNeXt model: {self.config.model_name}")
            self.device = torch.device(self.config.device)
            self.model = (
                timm.create_model(self.config.model_name, pretrained=True)
                .to(self.device)
                .eval()
            )

            config = resolve_data_config({}, model=self.model)
            self.transform = create_transform(**config)
            self._initialized = True
            print("✅ ConvNeXt model succesvol geladen")

    @logged
    @validate_image
    def extract_features(self, afbeelding_bytes: bytes):
        """Extract features met PIL en torch context managers"""
        self._lazy_init()  # Initialiseer alleen bij eerste gebruik
        
        # Import context managers only when needed
        from ...context_managers.image_context import pil_image
        from ...context_managers.torch_context import torch_inference
        
        with pil_image(afbeelding_bytes) as img:
            tensor = self.transform(img).unsqueeze(0).to(self.device)

        with torch_inference():
            return self.model(tensor)

    def is_ready(self) -> bool:
        """Quick check zonder model te laden"""
        return True  # Service is altijd 'ready', model wordt lazy geladen
