from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.database import get_db
from app.models import User, Group
from app.schemas import GroupResponse, GroupCreate, JoinGroupRequest
from app.dependencies import get_current_user
from app.auth import generate_invite_code

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.post("", response_model=GroupResponse)
async def create_group(
    payload: GroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invite_code = generate_invite_code()
    
    new_group = Group(
        name=payload.name,
        invite_code=invite_code
    )
    db.add(new_group)
    await db.flush()
    
    await db.execute(
        update(User).where(User.id == current_user.id).values(group_id=new_group.id)
    )
    await db.commit()
    await db.refresh(new_group)
    
    return new_group


@router.post("/join", response_model=GroupResponse)
async def join_group(
    payload: JoinGroupRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Group).where(Group.invite_code == payload.invite_code))
    group = result.scalar_one_or_none()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite code"
        )
    
    await db.execute(
        update(User).where(User.id == current_user.id).values(group_id=group.id)
    )
    await db.commit()
    
    return group


@router.get("/me", response_model=GroupResponse)
async def get_my_group(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.group_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not in a group"
        )
    
    result = await db.execute(select(Group).where(Group.id == current_user.group_id))
    group = result.scalar_one_or_none()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    return group