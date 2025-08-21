"""AfvalAlert Main Service"""

# Import the main app with all registered routes
from .controller import app

# Export app for uvicorn
__all__ = ["app"]