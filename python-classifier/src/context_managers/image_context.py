"""PIL Image Context Manager"""

import io
from contextlib import contextmanager

from PIL import Image


@contextmanager
def pil_image(afbeelding_bytes: bytes):
    """Context manager voor PIL Image processing"""
    with io.BytesIO(afbeelding_bytes) as buffer:
        afbeelding = Image.open(buffer).convert("RGB")
        try:
            yield afbeelding
        finally:
            afbeelding.close()
