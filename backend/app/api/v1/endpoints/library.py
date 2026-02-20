from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models.library_item import LibraryItem

router = APIRouter()

class LibraryCreate(BaseModel):
    type: str
    title: str
    metadata_json: str | None = None
    file_docx_uri: str | None = None
    file_pdf_uri: str | None = None

@router.get("/items")
def list_items(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(LibraryItem).filter(LibraryItem.user_id == user.id).order_by(LibraryItem.created_at.desc()).all()
    return {"items": [{"id": str(r.id), "type": r.type, "title": r.title} for r in rows]}

@router.post("/items")
def create_item(payload: LibraryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if payload.type not in ("TRANSLATION_OUTPUT", "DISCOVERY_ITEM"):
        raise HTTPException(status_code=400, detail="Invalid type")
    row = LibraryItem(
        user_id=user.id,
        type=payload.type,
        title=payload.title,
        metadata_json=payload.metadata_json,
        file_docx_uri=payload.file_docx_uri,
        file_pdf_uri=payload.file_pdf_uri,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": str(row.id)}
