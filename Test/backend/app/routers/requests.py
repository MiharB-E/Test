from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.models import User
from app.services.email import send_product_request_email

router = APIRouter(prefix="/api/requests", tags=["requests"])


class ProductRequest(BaseModel):
    name: str
    notes: str | None = None


@router.post("")
async def create_product_request(
    payload: ProductRequest,
    user: User = Depends(get_current_user),
):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Nombre requerido")

    ok = send_product_request_email(
        product_name=payload.name.strip(),
        notes=payload.notes.strip() if payload.notes and payload.notes.strip() else None,
        requester=getattr(user, "email", None),
    )
    if not ok:
        raise HTTPException(status_code=500, detail="No se pudo enviar el email")

    return {"ok": True}
