from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models.translation_job import TranslationJob

router = APIRouter()

@router.post("")
def create_job(
    source_lang: str,
    target_lang: str,
    output_format: str = "docx",
    upload: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if output_format not in ("docx", "pdf", "both"):
        raise HTTPException(status_code=400, detail="Invalid output_format")

    # For test-stage boot: just create job row (worker tasks later)
    job = TranslationJob(
        user_id=user.id,
        source_lang=source_lang,
        target_lang=target_lang,
        input_uri=f"local://uploads/{upload.filename}",
        status="PENDING",
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"job_id": str(job.id), "status": job.status}

@router.get("/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    job = db.query(TranslationJob).filter(TranslationJob.id == job_id, TranslationJob.user_id == user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    return {"id": str(job.id), "status": job.status, "input_uri": job.input_uri}
