"""Server Startup Functions"""


def start_server(host: str = "0.0.0.0", port: int = 8000) -> None:
    """Start server met uvicorn"""
    import uvicorn

    uvicorn.run(
        "src.controller:app", host=host, port=port, log_level="info", reload=False
    )
