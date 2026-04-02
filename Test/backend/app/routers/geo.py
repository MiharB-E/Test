from fastapi import APIRouter, HTTPException
import httpx
import os

from app.dependencies import get_current_user
from app.models import User
from app.schemas import GeoReverseResponse
from fastapi import Depends

router = APIRouter(prefix="/api/geo", tags=["geo"])

NOMINATIM_USER_AGENT = os.getenv("NOMINATIM_USER_AGENT", "InvCasa/1.0")


@router.get("/reverse", response_model=GeoReverseResponse)
async def reverse_geocode(
    lat: float,
    lon: float,
    _: User = Depends(get_current_user),
):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"format": "jsonv2", "lat": lat, "lon": lon, "addressdetails": 1}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url, params=params, headers={"User-Agent": NOMINATIM_USER_AGENT})
            res.raise_for_status()
            data = res.json()

        address = data.get("address", {})
        city = address.get("city") or address.get("town") or address.get("village") or ""
        country = address.get("country") or ""

        if not city or not country:
            raise HTTPException(status_code=502, detail="No se pudo determinar ciudad/país")

        return GeoReverseResponse(city=city, country=country)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="Error al resolver ubicación")