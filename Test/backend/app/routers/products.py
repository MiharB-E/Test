from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_
from typing import Optional, List

from app.database import get_db
from app.models import User, Product, Category, Purchase, ShoppingListItem
from app.schemas import ProductCreate, ProductResponse, CategoryResponse, PurchaseResponse
from app.dependencies import get_current_user, get_current_group

router = APIRouter(prefix="/api", tags=["products"])


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.group_id is None:
        result = await db.execute(
            select(Category).where(Category.group_id.is_(None))
        )
    else:
        result = await db.execute(
            select(Category).where(
                or_(
                    Category.group_id.is_(None),
                    Category.group_id == current_user.group_id
                )
            )
        )
    return result.scalars().all()


@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = Query(default=None),
    favorite: Optional[bool] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.group_id is None:
        base_filter = Product.group_id.is_(None)
    else:
        base_filter = or_(
            Product.group_id.is_(None),
            Product.group_id == current_user.group_id
        )

    query = (
        select(Product, Category.name)
        .join(Category, Product.category_id == Category.id, isouter=True)
        .where(base_filter)
    )
    if category:
        query = query.where(Category.name == category)
    if favorite is True:
        query = query.where(Product.is_favorite == True)

    result = await db.execute(query)
    rows = result.all()

    products = []
    for product, category_name in rows:
        item = ProductResponse.model_validate(product)
        item = item.model_copy(update={"category_name": category_name})
        products.append(item)
    return products


@router.post("/products", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db),
    group_id: int = Depends(get_current_group)
):
    new_product = Product(
        name=product.name,
        category_id=product.category_id,
        quantity=product.quantity,
        unit=product.unit,
        unit_type=product.unit_type,
        price_per_unit=product.price_per_unit,
        image_url=product.image_url,
        group_id=group_id,
        status="ok",
        is_favorite=False
    )
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return ProductResponse.model_validate(new_product)


@router.patch("/products/{product_id}/low")
async def mark_low_stock(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            or_(
                Product.group_id.is_(None),
                Product.group_id == current_user.group_id
            )
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.status = "low"
    await db.commit()
    return {"success": True}


@router.patch("/products/{product_id}/favorite")
async def toggle_favorite(
    product_id: int,
    is_favorite: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            or_(
                Product.group_id.is_(None),
                Product.group_id == current_user.group_id
            )
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_favorite = is_favorite
    await db.commit()
    return {"success": True, "is_favorite": product.is_favorite}


@router.post("/products/{product_id}/purchase", response_model=PurchaseResponse)
async def purchase_product(
    product_id: int,
    quantity: float = Query(...),
    price_per_unit: float = Query(...),
    store_name: str = Query(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            or_(
                Product.group_id.is_(None),
                Product.group_id == current_user.group_id
            )
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    total_price = quantity * price_per_unit

    new_purchase = Purchase(
        product_id=product_id,
        user_id=current_user.id,
        group_id=current_user.group_id,  # ✅ guarda grupo si existe
        quantity=quantity,
        price=total_price,
        store_name=store_name.strip() or "Sin tienda"
    )
    db.add(new_purchase)

    product.quantity += quantity

    # ✅ si estaba en low, al comprar vuelve a ok
    if product.status == "low":
        product.status = "ok"


    await db.execute(
        update(ShoppingListItem)
        .where(ShoppingListItem.product_id == product_id)
        .values(status="purchased")
    )

    await db.commit()
    await db.refresh(new_purchase)

    return new_purchase

@router.patch("/products/{product_id}/unit")
async def update_product_unit(
    product_id: int,
    unit_type: str = Query(...),  # "unit" o "weight"
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if unit_type not in ("unit", "weight"):
        raise HTTPException(status_code=400, detail="unit_type inválido")

    result = await db.execute(
        select(Product).where(
            Product.id == product_id,
            or_(
                Product.group_id.is_(None),
                Product.group_id == current_user.group_id
            )
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # ajustar unidad visible según tipo
    product.unit_type = unit_type
    product.unit = "kg" if unit_type == "weight" else "ud"

    await db.commit()
    return {"success": True, "unit_type": product.unit_type, "unit": product.unit}