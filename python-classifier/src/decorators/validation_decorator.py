"""Validation Decorators"""

import functools
import io
from typing import Any, Callable

from PIL import Image

ServiceCallable = Callable[..., Any]


def validate_image(func: ServiceCallable) -> ServiceCallable:
    """Valideer afbeelding input"""

    @functools.wraps(func)
    def wrapper(afbeelding_bytes: bytes, *args, **kwargs):
        if not afbeelding_bytes:
            raise ValueError("Geen afbeelding data")
        if len(afbeelding_bytes) > 20 * 1024 * 1024:
            raise ValueError("Afbeelding te groot (>20MB)")

        # Test of PIL het kan lezen
        try:
            with io.BytesIO(afbeelding_bytes) as buffer:
                Image.open(buffer).verify()
        except Exception:
            raise ValueError("Ongeldige afbeelding")

        return func(afbeelding_bytes, *args, **kwargs)

    return wrapper
