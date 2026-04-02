from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List

from app.database import get_db
from app.models import ShoppingListItem, Product, Category
from app.schemas import ShoppingListCreate, ShoppingListItemResponse
from app.dependencies import get_current_group

router = APIRouter(prefix="/api/shopping-list", tags=["shopping-list"])


@router.get("", response_model=List[ShoppingListItemResponse])
async def get_shopping_list(
    db: AsyncSession = Depends(get_db),
    group_id: int = Depends(get_current_group)
):
    result = await db.execute(
        select(ShoppingListItem, Product, Category.name)
        .join(Product, ShoppingListItem.product_id == Product.id)
        .join(Category, Product.category_id == Category.id, isouter=True)
        .where(Product.group_id == group_id, ShoppingListItem.status == "pending")
    )
    rows = result.all()
    return [
        ShoppingListItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=product.name,
            product_image=product.image_url,
            category_name=category_name,
            unit=product.unit,
            quantity=item.quantity,
            status=item.status,
            created_at=item.created_at
        )
        for item, product, category_name in rows
    ]


@router.post("", response_model=ShoppingListItemResponse)
async def add_to_shopping_list(
    payload: ShoppingListCreate,
    db: AsyncSession = Depends(get_db),
    group_id: int = Depends(get_current_group)
):
    product_result = await db.execute(
        select(Product, Category.name)
        .join(Category, Product.category_id == Category.id, isouter=True)
        .where(Product.id == payload.product_id, Product.group_id == group_id)
    )
    product_row = product_result.first()
    if not product_row:
        raise HTTPException(status_code=404, detail="Product not found")

    product, category_name = product_row

    existing_result = await db.execute(
        select(ShoppingListItem).where(ShoppingListItem.product_id == payload.product_id)
    )
    existing_item = existing_result.scalar_one_or_none()

    if existing_item:
        existing_item.quantity += payload.quantity
        existing_item.status = "pending"
        await db.commit()
        await db.refresh(existing_item)
        return ShoppingListItemResponse(
            id=existing_item.id,
            product_id=existing_item.product_id,
            product_name=product.name,
            product_image=product.image_url,
            category_name=category_name,
            unit=product.unit,
            quantity=existing_item.quantity,
            status=existing_item.status,
            created_at=existing_item.created_at
        )

    item = ShoppingListItem(
        product_id=payload.product_id,
        quantity=payload.quantity,
        status="pending"
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return ShoppingListItemResponse(
        id=item.id,
        product_id=item.product_id,
        product_name=product.name,
        product_image=product.image_url,
        category_name=category_name,
        unit=product.unit,
        quantity=item.quantity,
        status=item.status,
        created_at=item.created_at
    )


@router.patch("/{item_id}/status")
async def update_status(
    item_id: int,
    status: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ShoppingListItem).where(ShoppingListItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.status = status
    await db.commit()
    return {"success": True, "status": item.status}


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    db: AsyncSession = Depends(get_db)
):
    await db.execute(delete(ShoppingListItem).where(ShoppingListItem.id == item_id))
    await db.commit()
    return {"success": True} ; 