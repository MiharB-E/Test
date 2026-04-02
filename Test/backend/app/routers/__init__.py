from app.routers.auth import router as auth_router
from app.routers.groups import router as groups_router
from app.routers.products import router as products_router
from app.routers.purchases import router as purchases_router
from app.routers.dashboard import router as dashboard_router
from app.routers.shopping_list import router as shopping_list_router

__all__ = [
    "auth_router",
    "groups_router",
    "products_router",
    "purchases_router",
    "dashboard_router",
    "shopping_list_router",
]