from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Category, Product, Group
import secrets
import string


CATEGORIES = [
    {"name": "Frutas", "icon": "apple", "color": "green", "image_url": "/static/categories/frutas.webp"},
    {"name": "Verduras", "icon": "carrot", "color": "green", "image_url": "/static/categories/verduras.webp"},
    {"name": "Carnes", "icon": "beef", "color": "red", "image_url": "/static/categories/carnes.webp"},
    {"name": "Panes y Bollería", "icon": "bread", "color": "amber", "image_url": "/static/categories/panes.webp"},
    {"name": "Lácteos", "icon": "milk", "color": "blue", "image_url": "/static/categories/lacteos.webp"},
    {"name": "Bebidas", "icon": "coffee", "color": "cyan", "image_url": "/static/categories/bebidas.webp"},
    {"name": "Limpieza", "icon": "spray", "color": "purple", "image_url": "/static/categories/limpieza.webp"},
    {"name": "Gasolina", "icon": "fuel", "color": "orange", "image_url": "/static/categories/gasolina.webp"},
    {"name": "Congelados", "icon": "snowflake", "color": "sky", "image_url": "/static/categories/congelados.webp"},
    {"name": "Snacks", "icon": "candy", "color": "pink", "image_url": "/static/categories/snacks.webp"},
    {"name": "Higiene personal", "icon": "soap", "color": "teal", "image_url": "/static/categories/higiene%20personal.webp"},
    {"name": "Suministros", "icon": "receipt", "color": "slate", "image_url": "/static/categories/subministros.webp"},
]

PRODUCTS_BY_CATEGORY = {
    "Frutas": ["Manzana", "Plátano", "Naranja", "Pera", "Uvas", "Fresas", "Sandía", "Kiwi", "Piña"],
    "Verduras": ["Acelga", "Ajo", "Apio", "Berenjena", "Boniato", "Brócoli", "Calabacín", "Cebolla", "Col", "Coliflor", "Col de Bruselas", "Espinaca", "Lechuga", "Nabo", "Patata", "Pimiento", "Rábano", "Remolacha", "Rúcula", "Tomate", "Zanahoria"],
    "Carnes": ["Pollo", "Ternera", "Cerdo", "Cordero", "Pavo", "Salchichas", "Hamburguesas"],
    "Panes y Bollería": ["Pan de molde", "Baguette", "Magdalenas", "Bollos", "Galletas"],
    "Lácteos": ["Leche", "Queso", "Yogur", "Mantequilla", "Nata"],
    "Bebidas": ["Agua", "Refresco", "Zumo", "Café", "Té"],
    "Limpieza": ["Detergente", "Desinfectante", "Suavizante", "Limpiador de Cristales", "Estropajo", "Bayeta"],
    "Gasolina": ["Gasolina", "Diésel", "Otros_Gastos"],
    "Congelados": ["Pizza", "Verduras congeladas", "Helado", "Pescado", "Patatas fritas"],
    "Snacks": ["Chips", "Frutos secos", "Chocolate", "Palomitas", "Barritas"],
    "Higiene personal": ["Cepillo de dientes", "Pasta de dientes", "Shampoo", "Protector solar", "Papel higiénico"],
    "Suministros": ["Alquiler", "Teléfono", "Gas"],
}

# Fixed random prices for deterministic seeding (no random module needed)
_PRICES = [1.50, 2.30, 3.75, 5.00, 1.20, 4.40, 2.80, 6.50, 3.10, 1.90]


def _price_for(index: int) -> float:
    return _PRICES[index % len(_PRICES)]


async def seed_products_for_group(db: AsyncSession, group_id: int):
    """Batch-insert categories and products for a group."""

    # ── Categories (single flush) ─────────────────────────────────────────────
    category_objects = []
    for cat_data in CATEGORIES:
        cat = Category(
            name=cat_data["name"],
            icon=cat_data["icon"],
            color=cat_data["color"],
            group_id=group_id,
            is_default=True,
        )
        category_objects.append(cat)

    db.add_all(category_objects)
    await db.flush()  # single round-trip for all categories

    created_categories = {cat.name: cat for cat in category_objects}

    # ── Products (single flush) ───────────────────────────────────────────────
    product_objects = []
    price_idx = 0

    for cat_name, product_names in PRODUCTS_BY_CATEGORY.items():
        category = created_categories.get(cat_name)
        if not category:
            continue

        if cat_name in ("Frutas", "Verduras"):
            unit, unit_type = "kg", "weight"
        elif cat_name in ("Gasolina", "Lácteos", "Bebidas"):
            unit, unit_type = "litros", "volume"
        elif cat_name == "Higiene personal":
            unit, unit_type = "unidad", "unit"
        elif cat_name == "Suministros":
            unit, unit_type = "mes", "service"
        else:
            unit, unit_type = "unidad", "unit"

        for name in product_names:
            product_objects.append(
                Product(
                    name=name,
                    category_id=category.id,
                    quantity=price_idx % 21,  # 0-20 deterministic
                    unit=unit,
                    unit_type=unit_type,
                    price_per_unit=_price_for(price_idx),
                    group_id=group_id,
                    status="ok",
                )
            )
            price_idx += 1

    db.add_all(product_objects)
    await db.commit()

    print(
        f"Seeded {len(CATEGORIES)} categories and "
        f"{len(product_objects)} products for group {group_id}"
    )