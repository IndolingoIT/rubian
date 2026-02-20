from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.credit_ledger import CreditLedger

router = APIRouter()

class BalanceOut(BaseModel):
    balance: int

@router.get("/balance", response_model=BalanceOut)
def balance(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total = db.query(func.coalesce(func.sum(CreditLedger.amount), 0)).filter(CreditLedger.user_id == user.id).scalar()
    return BalanceOut(balance=int(total or 0))

class TopupIn(BaseModel):
    amount: int
    note: str | None = "stub topup"

@router.post("/topup", response_model=BalanceOut)
def topup(payload: TopupIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # MVP stub: no payment gateway
    entry = CreditLedger(
        user_id=user.id,
        type="TOPUP",
        amount=max(0, payload.amount),
        reference_type="PAYMENT_STUB",
        note=payload.note,
    )
    db.add(entry)
    db.commit()

    total = db.query(func.coalesce(func.sum(CreditLedger.amount), 0)).filter(CreditLedger.user_id == user.id).scalar()
    return BalanceOut(balance=int(total or 0))