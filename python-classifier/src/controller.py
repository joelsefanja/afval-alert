"""Main Controller - Correct app with registered routes"""

# Import the FastAPI app instance  
from .api.app import app

# Import endpoints om routes te registreren
print("Endpoints importeren...")
from .api.endpoints import info, status, classification
print("Alle endpoints geïmporteerd")
print(f"App: {app.title} v{app.version}")
print(f"Routes: {[(r.path, list(r.methods)) for r in app.routes if not r.path.startswith('/docs')]}")

# Test of routes werken
@app.middleware("http")
async def debug_middleware(request, call_next):
    print(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    return response

# Re-export for backward compatibility
__all__ = ["app"]
