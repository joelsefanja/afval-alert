"""Logging Decorator"""

import functools
import logging
from typing import Any, Callable

logger = logging.getLogger(__name__)

ServiceCallable = Callable[..., Any]


def logged(func: ServiceCallable) -> ServiceCallable:
    """Log service calls met performance tracking"""

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        name = f"{func.__module__}.{func.__qualname__}"
        logger.info(f"Gestart: {name}")

        try:
            result = func(*args, **kwargs)
            logger.info(f"Voltooid: {name}")
            return result
        except Exception as e:
            logger.error(f"Fout: {name} - {e}")
            raise

    return wrapper
