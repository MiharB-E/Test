from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.dependencies import get_current_user
from app.models import User
from app.services.email import send_product_request_email

router = APIRouter(prefix="/api/requests", tags=["requests"])


class ProductRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=1000)


@router.post("")
async def create_product_request(
    payload: ProductRequest,
    user: User = Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Nombre requerido")

    notes = payload.notes.strip() if payload.notes and payload.notes.strip() else None

    ok = await send_product_request_email(
        product_name=name,
        notes=notes,
        requester=getattr(user, "email", None),
    )
    # Only raise if SMTP is configured but sending still failed
    if not ok and settings.SMTP_USER:
        raise HTTPException(status_code=500, detail="No se pudo enviar el email")

    return {"ok": True}
