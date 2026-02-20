from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from app.api.deps import get_current_user
from app.db.models.user import User

router = APIRouter()

class MeOut(BaseModel):
    id: str
    email: EmailStr
    plan: str

@router.get("/me", response_model=MeOut)
def me(user: User = Depends(get_current_user)):
    return MeOut(id=str(user.id), email=user.email, plan=user.plan)