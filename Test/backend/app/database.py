import logging
import os

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import text

from app.config import settings
from app.auth import get_password_hash, generate_invite_code

logger = logging.getLogger(__name__)

os.makedirs("/app/data", exist_ok=True)

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    # check_same_thread=False is required by aiosqlite: the async engine uses
    # a single background thread per connection so SQLAlchemy's built-in
    # thread-safety check would always fire a false positive.
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created / verified")
            if settings.SEED_DEMO_DATA:
                await seed_data(conn)
    except Exception as e:
        logger.error("Database initialization error: %s", e)
        raise


async def seed_data(conn):
    result = await conn.execute(text("SELECT COUNT(*) FROM users"))
    if (result.scalar() or 0) > 0:
        logger.info("Users already exist – skipping seed")
        return

    group_code = generate_invite_code()
    result = await conn.execute(
        text("INSERT INTO groups (name, invite_code) VALUES (:name, :code) RETURNING id"),
        {"name": "Mi Hogar", "code": group_code},
    )
    group_id = result.fetchone()[0]

    await conn.execute(
        text(
            "INSERT INTO users (email, password, name, group_id, is_verified) "
            "VALUES (:email, :password, :name, :group_id, 1)"
        ),
        {
            "email": "demo@invcasa.com",
            "password": get_password_hash("demo123"),
            "name": "Usuario Demo",
            "group_id": group_id,
        },
    )
    logger.info("Demo user created: demo@invcasa.com")

    categorias = [
        ("Frutas", "apple", "green", "/static/categories/FRUTA.WebP"),
        ("Verduras", "carrot", "green", "/static/categories/VERDURAS.WebP"),
        ("Carnes", "beef", "red", "/static/categories/CARNES.WebP"),
        ("Panes y Bolleria", "bread", "amber", "/static/categories/PYB.WebP"),
        ("Lácteos", "milk", "blue", "/static/categories/LACTICS.WebP"),
        ("Bebidas", "coffee", "cyan", "/static/categories/BEBIDA.WebP"),
        ("Limpieza", "spray", "purple", "/static/categories/LIMPIEZA.WebP"),
        ("Gasolina", "fuel", "orange", "/static/categories/COMUSTIBLE1.WebP"),
        ("Congelados", "snowflake", "sky", "/static/categories/CONGELADOS.WebP"),
        ("Snacks", "candy", "pink", "/static/categories/SNACKS.WebP"),
    ]

    for name, icon, color, image_url in categorias:
        await conn.execute(
            text(
                "INSERT INTO categories (name, icon, color, image_url, group_id, is_default) "
                "VALUES (:name, :icon, :color, :image_url, :group_id, 1)"
            ),
            {"name": name, "icon": icon, "color": color, "image_url": image_url, "group_id": group_id},
        )

    await conn.commit()
    logger.info("Seed completed")