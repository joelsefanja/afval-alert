"""Services module exports"""

from .service_factory import ServiceFactory

# Global factory instance for backward compatibility
factory = ServiceFactory()

__all__ = ["ServiceFactory", "factory"]
