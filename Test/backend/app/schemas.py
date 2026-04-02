from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, Any


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., max_length=255)
    last_name: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class RegisterRequest(UserCreate):
    pass


class UserResponse(UserBase):
    id: int
    last_name: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    country: Optional[str] = None
    group_id: Optional[int] = None
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# Group schemas
class GroupBase(BaseModel):
    name: str = Field(..., max_length=255)


class GroupCreate(GroupBase):
    pass


class JoinGroupRequest(BaseModel):
    invite_code: str = Field(..., min_length=6, max_length=50)


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
    name: str = Field(..., max_length=255)
    category_id: Optional[int] = None
    quantity: float = 0
    unit: str = Field(default="unidad", max_length=50)
    unit_type: str = Field(default="unit", max_length=20)
    price_per_unit: float = Field(default=0, ge=0)
    image_url: Optional[str] = Field(default=None, max_length=500)


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
    quantity: float = Field(default=1, gt=0)
    price: float = Field(default=0, ge=0)
    store_name: str = Field(default="", max_length=255)
    group_id: Optional[int] = None


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
    category_name: Optional[str] = None
    user_id: int
    group_id: Optional[int] = None
    quantity: float
    price: float
    store_name: str
    created_at: datetime


# Shopping list schemas
class ShoppingListCreate(BaseModel):
    product_id: int
    quantity: float = Field(default=1, gt=0)


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
    password: str = Field(..., max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Response schemas
class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    error: Optional[str] = None


# Verification schemas
class VerificationRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)


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
