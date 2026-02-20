from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models.discovery_search import DiscoverySearch

router = APIRouter()

class SearchIn(BaseModel):
    query: str
    mode: str = "global"
    max_results: int = 10
    include_synthesis: bool = False

@router.post("/search")
def search(payload: SearchIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = DiscoverySearch(user_id=user.id, query=payload.query, estimated_tokens=0)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"search_id": str(row.id), "query": payload.query, "results": [], "synthesis": None}
