"""Logging Decorator"""

import functools
import inspect
import logging
from typing import Any, Callable

logger = logging.getLogger(__name__)

ServiceCallable = Callable[..., Any]


def logged(func: ServiceCallable) -> ServiceCallable:
    """Log service calls met performance tracking - ondersteunt async functies"""

    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        name = f"{func.__module__}.{func.__qualname__}"
        logger.info(f"Gestart: {name}")

        try:
            result = await func(*args, **kwargs)
            logger.info(f"Voltooid: {name}")
            return result
        except Exception as e:
            logger.error(f"Fout: {name} - {e}")
            raise

    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        name = f"{func.__module__}.{func.__qualname__}"
        logger.info(f"Gestart: {name}")

        try:
            result = func(*args, **kwargs)
            logger.info(f"Voltooid: {name}")
            return result
        except Exception as e:
            logger.error(f"Fout: {name} - {e}")
            raise

    if inspect.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper
