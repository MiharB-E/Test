from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, case
from datetime import datetime, timezone

from app.database import get_db
from app.models import Product, Purchase, Category, User
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.group_id is None:
        product_scope = Product.group_id.is_(None)
        purchase_scope = [Purchase.group_id.is_(None)]
    else:
        product_scope = or_(
            Product.group_id == current_user.group_id,
            Product.group_id.is_(None),
        )
        purchase_scope = [Purchase.group_id == current_user.group_id]

    # Two queries instead of five: one for product aggregates, one for purchase aggregates.
    # NOTE: Purchase.price stores the *total* price of the transaction (not price-per-unit;
    # that lives on Product.price_per_unit).  Summing it directly gives the correct spend.
    product_agg = await db.execute(
        select(
            func.count().label("total"),
            func.sum(case((Product.status == "low", 1), else_=0)).label("low_stock"),
            func.sum(case((Product.is_favorite == True, 1), else_=0)).label("favorites"),
        ).where(product_scope)
    )
    row = product_agg.one()
    total_products = row.total or 0
    low_stock = row.low_stock or 0
    favorites = row.favorites or 0

    now = datetime.now(timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    purchase_agg = await db.execute(
        select(
            func.count().label("monthly_count"),
            func.coalesce(func.sum(Purchase.price), 0).label("monthly_spending"),
        ).where(*purchase_scope, Purchase.created_at >= month_start)
    )
    p_row = purchase_agg.one()

    return {
        "totalProducts": total_products,
        "monthlyPurchases": p_row.monthly_count or 0,
        "monthlySpending": float(p_row.monthly_spending or 0),
        "lowStockProducts": low_stock,
        "favoriteProducts": favorites,
        "activeGroups": 1,
    }


@router.get("/recent-purchases")
async def recent_purchases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.group_id is None:
        return []

    result = await db.execute(
        select(Purchase, Product)
        .join(Product, Purchase.product_id == Product.id)
        .where(Product.group_id == current_user.group_id)
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
            "created_at": p.created_at,
        }
        for p, prod in rows
    ]


@router.get("/category-spending")
async def category_spending(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.group_id is None:
        return []

    result = await db.execute(
        select(Category.name, func.coalesce(func.sum(Purchase.price), 0))
        .join(Product, Product.category_id == Category.id)
        .join(Purchase, Purchase.product_id == Product.id)
        .where(Product.group_id == current_user.group_id)
        .group_by(Category.name)
    )
    rows = result.all()
    colors = ["#9333ea", "#c084fc", "#e9d5ff", "#7e22ce", "#a855f7"]
    return [
        {"category": name, "amount": float(amount), "color": colors[i % len(colors)]}
        for i, (name, amount) in enumerate(rows)
    ]


@router.get("/monthly-trend")
async def monthly_trend(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.group_id is None:
        return []

    result = await db.execute(
        select(
            func.strftime("%Y-%m", Purchase.created_at),
            func.coalesce(func.sum(Purchase.price), 0),
        )
        .join(Product, Purchase.product_id == Product.id)
        .where(Product.group_id == current_user.group_id)
        .group_by(func.strftime("%Y-%m", Purchase.created_at))
        .order_by(func.strftime("%Y-%m", Purchase.created_at))
    )
    rows = result.all()
    return [
        {"month": month.split("-")[1], "amount": float(amount)}
        for month, amount in rows
    ]