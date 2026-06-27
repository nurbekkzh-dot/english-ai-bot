from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db_users import add_user, get_user, update_level, update_mode, update_format

router = APIRouter()

class UserInit(BaseModel):
    user_id: int
    username: str | None = None

class UpdateLevel(BaseModel):
    user_id: int
    level: str

class UpdateMode(BaseModel):
    user_id: int
    mode: str

class UpdateFormat(BaseModel):
    user_id: int
    format: str

@router.post("/init")
async def init_user(data: UserInit):
    add_user(data.user_id, data.username)
    user = get_user(data.user_id)
    return user

@router.get("/{user_id}")
async def get_user_info(user_id: int):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/level")
async def set_level(data: UpdateLevel):
    update_level(data.user_id, data.level)
    return {"ok": True}

@router.post("/mode")
async def set_mode(data: UpdateMode):
    update_mode(data.user_id, data.mode)
    return {"ok": True}

@router.post("/format")
async def set_format(data: UpdateFormat):
    update_format(data.user_id, data.format)
    return {"ok": True}
