from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc
from typing import List

from app.database import get_db
from app.models import User, Product, Purchase, ShoppingListItem, Category
from app.schemas import PurchaseCreate, PurchaseResponse, PurchaseWithProductResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/purchases", tags=["purchases"])


@router.post("", response_model=PurchaseResponse)
async def create_purchase(
    purchase: PurchaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if purchase.group_id is not None:
        if current_user.group_id is None or purchase.group_id != current_user.group_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to create group purchases for this group",
            )

        result = await db.execute(
            select(Product).where(
                Product.id == purchase.product_id,
                Product.group_id == purchase.group_id,
            )
        )
    else:
        result = await db.execute(
            select(Product).where(
                Product.id == purchase.product_id,
                Product.group_id.is_(None),
            )
        )

    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    new_purchase = Purchase(
        product_id=purchase.product_id,
        user_id=current_user.id,
        group_id=purchase.group_id,
        quantity=purchase.quantity,
        price=purchase.price,
        store_name=purchase.store_name,
    )
    db.add(new_purchase)
    await db.flush()

    await db.execute(
        update(Product)
        .where(Product.id == purchase.product_id)
        .values(quantity=Product.quantity + purchase.quantity)
    )
    await db.execute(
        update(ShoppingListItem)
        .where(ShoppingListItem.product_id == purchase.product_id)
        .values(status="purchased")
    )

    await db.commit()
    await db.refresh(new_purchase)
    return new_purchase


@router.get("/recent", response_model=List[PurchaseWithProductResponse])
async def get_recent_purchases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.group_id is None:
        filters = [Purchase.user_id == current_user.id, Purchase.group_id.is_(None)]
    else:
        filters = [Purchase.group_id == current_user.group_id]

    result = await db.execute(
        select(Purchase, Product, Category)
        .join(Product, Purchase.product_id == Product.id)
        .outerjoin(Category, Product.category_id == Category.id)
        .where(*filters)
        .order_by(desc(Purchase.created_at))
        .limit(5)
    )
    rows = result.all()
    return [
        PurchaseWithProductResponse(
            id=p.id,
            product_id=p.product_id,
            product_name=prod.name,
            product_image=prod.image_url,
            category_name=cat.name if cat else None,
            user_id=p.user_id,
            group_id=p.group_id,
            quantity=p.quantity,
            price=p.price,
            store_name=p.store_name,
            created_at=p.created_at,
        )
        for p, prod, cat in rows
    ]


@router.get("/history", response_model=List[PurchaseWithProductResponse])
async def get_purchase_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.group_id is None:
        filters = [Purchase.user_id == current_user.id, Purchase.group_id.is_(None)]
    else:
        filters = [Purchase.group_id == current_user.group_id]

    result = await db.execute(
        select(Purchase, Product, Category)
        .join(Product, Purchase.product_id == Product.id)
        .outerjoin(Category, Product.category_id == Category.id)
        .where(*filters)
        .order_by(desc(Purchase.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    rows = result.all()
    return [
        PurchaseWithProductResponse(
            id=p.id,
            product_id=p.product_id,
            product_name=prod.name,
            product_image=prod.image_url,
            category_name=cat.name if cat else None,
            user_id=p.user_id,
            group_id=p.group_id,
            quantity=p.quantity,
            price=p.price,
            store_name=p.store_name,
            created_at=p.created_at,
        )
        for p, prod, cat in rows
    ]