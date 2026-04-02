from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import init_db
from app.routers import auth_router, groups_router, products_router, purchases_router, dashboard_router, shopping_list_router, requests_router
from app.routers.geo import router as geo_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan
)

# ✅ Servir imágenes locales
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ✅ CORS CORRECTO (sin "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(groups_router)
app.include_router(products_router)
app.include_router(purchases_router)
app.include_router(dashboard_router)
app.include_router(shopping_list_router)
app.include_router(geo_router)
app.include_router(requests_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.app_version} ; 