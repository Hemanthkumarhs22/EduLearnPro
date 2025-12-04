"""FastAPI application entrypoint for Edu Learn Pro."""

import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import api_router
from app.core.config import get_settings


settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.project_name)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log validation errors for debugging."""
    logger.error(f"Validation error: {exc.errors()}")
    try:
        body = await request.body()
        logger.error(f"Request body: {body.decode() if body else 'empty'}")
    except Exception as e:
        logger.error(f"Could not read request body: {e}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

# CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
app.mount("/media", StaticFiles(directory="media"), name="media")


@app.get("/healthz", tags=["health"])
async def health_check() -> dict[str, str]:
    """Simple health check endpoint."""

    return {"status": "ok", "service": settings.project_name}
