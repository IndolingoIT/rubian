from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models.credit_ledger import CreditLedger

router = APIRouter()

class TopupIn(BaseModel):
    amount: int
    note: str | None = None

@router.get("/balance")
def balance(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total = db.query(CreditLedger).filter(CreditLedger.user_id == user.id).all()
    balance_val = sum(x.amount for x in total) if total else 0
    return {"balance": balance_val}

@router.get("/ledger")
def ledger(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(CreditLedger).filter(CreditLedger.user_id == user.id).order_by(CreditLedger.created_at.desc()).all()
    return {"items": [{"id": str(r.id), "type": r.type, "amount": r.amount, "note": r.note, "created_at": r.created_at.isoformat()} for r in rows]}

@router.post("/topup")
def topup(payload: TopupIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = CreditLedger(user_id=user.id, type="TOPUP", amount=payload.amount, note=payload.note)
    db.add(row)
    db.commit()
    return {"ok": True}
