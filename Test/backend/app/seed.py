from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Category, Product, Group
import random

CATEGORIES = [
    {"name": "Frutas", "icon": "apple", "color": "green", "image_url": "/static/categories/frutas.webp"},
    {"name": "Verduras", "icon": "carrot", "color": "green", "image_url": "/static/categories/verduras.webp"},
    {"name": "Carnes", "icon": "beef", "color": "red", "image_url": "/static/categories/carnes.webp"},
    {"name": "Panes y Bolleria", "icon": "bread", "color": "amber", "image_url": "/static/categories/panes.webp"},
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
    "Verduras": ["Acelga", "Ajo", "Apio", "Berenjena", "Boniato", "Brócoli", "Calabacín", "Cebolla", "Col", "Coliflor", "Col de Bruselas", "Espinaca", "Kiwi", "Lechuga", "Nabo", "Patata", "Pimiento", "Rábano", "Remolacha", "Rúcula", "Tomate", "Zanahoria"],
    "Carnes": ["Pollo", "Ternera", "Cerdo", "Cordero", "Pavo", "Salchichas", "Hamburguesas"],
    "Panes y Bolleria": ["Pan de molde", "Baguette", "Magdalenas", "Bollos", "Galletas"],
    "Lácteos": ["Leche", "Queso", "Yogur", "Mantequilla", "Nata"],
    "Bebidas": ["Agua", "Refresco", "Zumo", "Café", "Té"],
    "Limpieza": ["Detergente", "Desinfectante", "Suavizante", "Limpiador de Cristales", "Estropajo", "Bayeta"],
    "Gasolina": ["Gasolina", "Diésel", "Otros_Gastos"],
    "Congelados": ["Pizza", "Verduras", "Helado", "Pescado", "Patatas fritas"],
    "Snacks": ["Chips", "Frutos secos", "Chocolate", "Palomitas", "Barritas"],
    "Higiene personal": ["Cepillo de dientes", "Pasta de dientes", "Shampoo", "Protector solar", "Papel higiénico"],
    "Suministros": ["Alquiler", "Teléfono", "Gas"],
}


async def seed_products_for_group(db: AsyncSession, group_id: int):
    """Insertar categorías y productos para un grupo"""
    
    # Crear categorías
    created_categories = {}
    for cat_data in CATEGORIES:
        category = Category(
            name=cat_data["name"],
            icon=cat_data["icon"],
            color=cat_data["color"],
            group_id=group_id,
            is_default=True
        )
        db.add(category)
        await db.flush()
        created_categories[cat_data["name"]] = category
    
    # Crear productos para cada categoría
    for cat_name, products in PRODUCTS_BY_CATEGORY.items():
        category = created_categories.get(cat_name)
        if category:
            for product_name in products:
                # Determinar unidad según categoría
                if cat_name in ["Frutas", "Verduras"]:
                    unit, unit_type = "kg", "weight"
                elif cat_name == "Gasolina":
                    unit, unit_type = "litros", "volume"
                elif cat_name in ["Lácteos", "Bebidas"]:
                    unit, unit_type = "litros", "volume"
                elif cat_name == "Higiene personal":
                    unit, unit_type = "unidad", "unit"
                elif cat_name == "Suministros":
                    unit, unit_type = "mes", "service"
                else:
                    unit, unit_type = "unidad", "unit"
                
                # Precio aleatorio para demo
                price = round(random.uniform(1, 10), 2)
                
                product = Product(
                    name=product_name,
                    category_id=category.id,
                    quantity=random.randint(0, 20),
                    unit=unit,
                    unit_type=unit_type,
                    price_per_unit=price,
                    group_id=group_id,
                    status="ok"
                )
                db.add(product)
    
    await db.commit()
    print(f"✅ Creadas {len(CATEGORIES)} categorías y {sum(len(p) for p in PRODUCTS_BY_CATEGORY.values())} productos")