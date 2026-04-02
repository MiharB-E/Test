from pydantic import BaseModel, EmailStr, conint
from datetime import datetime
from typing import Optional, Any


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    last_name: str
    password: str


class RegisterRequest(UserCreate):
    pass


class UserResponse(UserBase):
    id: int
    last_name: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    country: Optional[str] = None
    group_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# (resto igual)


# Group schemas
class GroupBase(BaseModel):
    name: str


class GroupCreate(GroupBase):
    pass


class JoinGroupRequest(BaseModel):
    invite_code: str


class GroupResponse(GroupBase):
    id: int
    invite_code: str
    created_at: datetime

    class Config:
        from_attributes = True


# Category schemas
class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    image_url: Optional[str] = None
    group_id: Optional[int] = None
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Product schemas
class ProductBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    quantity: float = 0
    unit: str = "unidad"
    unit_type: str = "unit"
    price_per_unit: float = 0
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    status: str
    group_id: int | None = None
    is_favorite: bool
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductUpdate(BaseModel):
    is_favorite: Optional[bool] = None


# Purchase schemas
class PurchaseCreate(BaseModel):
    product_id: int
    quantity: float = 1
    price: float = 0
    store_name: str = ""
    group_id: Optional[int] = None  # None = compra personal


class PurchaseResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    group_id: Optional[int] = None
    quantity: float
    price: float
    store_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseWithProductResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    category_name: Optional[str] = None  # ✅ añadido
    user_id: int
    group_id: Optional[int] = None
    quantity: float
    price: float
    store_name: str
    created_at: datetime


# Shopping list schemas
class ShoppingListCreate(BaseModel):
    product_id: int
    quantity: float = 1


class ShoppingListItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str]
    category_name: Optional[str]
    unit: str
    quantity: float
    status: str
    created_at: datetime


# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Response schemas
class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    error: Optional[str] = None


# Verification schemas
class VerificationRequest(BaseModel):
    email: EmailStr
    code: str


class VerificationResponse(BaseModel):
    success: bool
    message: str


class RegisterStep1Response(BaseModel):
    success: bool
    message: str
    email: str 

class GeoReverseResponse(BaseModel):
    city: str
    country: str
