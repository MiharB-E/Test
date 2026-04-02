from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from datetime import datetime

from app.database import get_db
from app.models import Product, Purchase, Category, User
from app.dependencies import get_current_group, get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ mismos productos que /products
    if current_user.group_id is None:
        product_scope = Product.group_id.is_(None)
        purchase_scope = Purchase.group_id.is_(None)
    else:
        product_scope = or_(
            Product.group_id == current_user.group_id,
            Product.group_id.is_(None)
        )
        purchase_scope = or_(
            Purchase.group_id == current_user.group_id,
            Purchase.group_id.is_(None)
        )

    total_products = await db.scalar(
        select(func.count()).select_from(Product).where(product_scope)
    )
    low_stock = await db.scalar(
        select(func.count()).select_from(Product).where(product_scope, Product.status == "low")
    )
    favorites = await db.scalar(
        select(func.count()).select_from(Product).where(product_scope, Product.is_favorite == True)
    )

    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    monthly_purchases = await db.scalar(
        select(func.count())
        .select_from(Purchase)
        .where(purchase_scope, Purchase.created_at >= month_start)
    )
    monthly_spending = await db.scalar(
        select(func.coalesce(func.sum(Purchase.price), 0))
        .select_from(Purchase)
        .where(purchase_scope, Purchase.created_at >= month_start)
    )

    return {
        "totalProducts": total_products or 0,
        "monthlyPurchases": monthly_purchases or 0,
        "monthlySpending": monthly_spending or 0,
        "lowStockProducts": low_stock or 0,
        "favoriteProducts": favorites or 0,
        "activeGroups": 1
    }

@router.get("/recent-purchases")
async def recent_purchases(
    db: AsyncSession = Depends(get_db),
    group_id: int = Depends(get_current_group)
):
    result = await db.execute(
        select(Purchase, Product)
        .join(Product, Purchase.product_id == Product.id)
        .where(Product.group_id == group_id)
        .order_by(desc(Purchase.created_at))
        .limit(5)
    )
    rows = result.all()
    return [
        {
            "id": p.id,
            "product_name": prod.name,
            "quantity": p.quantity,
            "price": p.price,
            "store_name": p.store_name,
            "created_at": p.created_at
        }
        for p, prod in rows
    ]


@router.get("/category-spending")
async def category_spending(
    db: AsyncSession = Depends(get_db),
    group_id: int = Depends(get_current_group)
):
    result = await db.execute(
        select(Category.name, func.coalesce(func.sum(Purchase.price * Purchase.quantity), 0))
        .join(Product, Product.category_id == Category.id)
        .join(Purchase, Purchase.product_id == Product.id)
        .where(Product.group_id == group_id)
        .group_by(Category.name)
    )
    rows = result.all()
    colors = ["#9333ea", "#c084fc", "#e9d5ff", "#7e22ce", "#a855f7"]
    return [
        {"category": name, "amount": amount, "color": colors[i % len(colors)]}
        for i, (name, amount) in enumerate(rows)
    ]

@router.get("/monthly-trend")
async def monthly_trend(
    db: AsyncSession = Depends(get_db),
    group_id: int = Depends(get_current_group)
):
    result = await db.execute(
        select(func.strftime("%Y-%m", Purchase.created_at), func.coalesce(func.sum(Purchase.price * Purchase.quantity), 0))
        .join(Product, Purchase.product_id == Product.id)
        .where(Product.group_id == group_id)
        .group_by(func.strftime("%Y-%m", Purchase.created_at))
        .order_by(func.strftime("%Y-%m", Purchase.created_at))
    )
    rows = result.all()
    return [
        {"month": month.split("-")[1], "amount": amount}
        for month, amount in rows
    ]