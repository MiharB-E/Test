import logging
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import text
import os

from app.config import settings
from app.auth import get_password_hash, generate_invite_code

logger = logging.getLogger(__name__)

# ✅ usar ruta absoluta dentro del contenedor
os.makedirs("/app/data", exist_ok=True)

engine = create_async_engine(settings.database_url, echo=settings.debug)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ Database tables created")
            await seed_data(conn)
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
        raise


async def seed_data(conn):
    # ✅ Verificar si ya existe usuario demo
    result = await conn.execute(text("SELECT COUNT(*) FROM users"))
    count_users = result.scalar()
    if count_users and count_users > 0:
        logger.info("✅ Usuarios ya existen, seed no necesario.")
        return

    group_code = generate_invite_code()
    result = await conn.execute(
        text("INSERT INTO groups (name, invite_code) VALUES (:name, :code) RETURNING id"),
        {'name': 'Mi Hogar', 'code': group_code}
    )
    group_id = result.fetchone()[0]
    logger.info(f"✅ Grupo creado con ID: {group_id}")
    
    demo_user = {
        'email': 'demo@invcasa.com',
        'password': get_password_hash('demo123'),
        'name': 'Usuario Demo',
        'group_id': group_id
    }
    
    await conn.execute(
        text("INSERT INTO users (email, password, name, group_id) VALUES (:email, :password, :name, :group_id)"),
        demo_user
    )
    logger.info("✅ Usuario demo creado: demo@invcasa.com / demo123")

    # ✅ rutas locales (backend/app/static/categories)
    categorias = [
        ('Frutas', 'apple', 'green', '/static/categories/FRUTA.WebP'),
        ('Verduras', 'carrot', 'green', '/static/categories/VERDURAS.WebP'),
        ('Carnes', 'beef', 'red', '/static/categories/CARNES.WebP'),
        ('Panes y Bolleria', 'bread', 'amber', '/static/categories/PYB.WebP'),
        ('Lácteos', 'milk', 'blue', '/static/categories/LACTICS.WebP'),
        ('Bebidas', 'coffee', 'cyan', '/static/categories/BEBIDA.WebP'),
        ('Limpieza', 'spray', 'purple', '/static/categories/LIMPIEZA.WebP'),
        ('Gasolina', 'fuel', 'orange', '/static/categories/COMUSTIBLE1.WebP'),
        ('Congelados', 'snowflake', 'sky', '/static/categories/CONGELADOS.WebP'),
        ('Snacks', 'candy', 'pink', '/static/categories/SNACKS.WebP'),
    ]
    
    for name, icon, color, image_url in categorias:
        await conn.execute(
            text("INSERT INTO categories (name, icon, color, image_url, group_id, is_default) VALUES (:name, :icon, :color, :image_url, :group_id, 1)"),
            {'name': name, 'icon': icon, 'color': color, 'image_url': image_url, 'group_id': group_id}
        )
    
    await conn.commit()
    logger.info("✅ Seed completo")