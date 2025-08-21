"""PyTorch Context Manager"""

from contextlib import contextmanager

import torch


@contextmanager
def torch_inference():
    """Context manager voor PyTorch inference"""
    try:
        with torch.no_grad():
            yield
    finally:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
