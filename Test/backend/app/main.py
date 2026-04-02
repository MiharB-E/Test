import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.database import init_db
from app.routers import (
    auth_router,
    groups_router,
    products_router,
    purchases_router,
    dashboard_router,
    shopping_list_router,
    requests_router,
)
from app.routers.geo import router as geo_router

logger = logging.getLogger(__name__)

# Rate limiter – keyed on client IP address
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.warn_if_insecure()
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
    # Disable schema exposure in production
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Attach limiter to app state (required by slowapi)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS – allow credentials (needed for the HttpOnly refresh-token cookie)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (product / category images)
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Rate-limit auth endpoints at the middleware level
# (individual limits are applied in routers/auth.py via the limiter instance)
app.include_router(auth_router)
app.include_router(groups_router)
app.include_router(products_router)
app.include_router(purchases_router)
app.include_router(dashboard_router)
app.include_router(shopping_list_router)
app.include_router(geo_router)
app.include_router(requests_router)


@app.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "ok", "version": settings.app_version}


# Expose the limiter so individual routers can import it
__all__ = ["app", "limiter"] 