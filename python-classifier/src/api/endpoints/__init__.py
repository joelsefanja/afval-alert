"""API endpoints module"""

# Import all endpoint modules to register routes
from . import classification, info, status

__all__ = ["classification", "info", "status"]
