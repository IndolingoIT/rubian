import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class TranslationJob(Base):
    __tablename__ = "translation_jobs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    source_lang: Mapped[str] = mapped_column(String(16), nullable=False)
    target_lang: Mapped[str] = mapped_column(String(16), nullable=False)

    input_uri: Mapped[str] = mapped_column(String(1024), nullable=False)
    output_docx_uri: Mapped[str] = mapped_column(String(1024), nullable=True)
    output_pdf_uri: Mapped[str] = mapped_column(String(1024), nullable=True)

    status: Mapped[str] = mapped_column(String(32), default="PENDING")
    total_chunks: Mapped[int] = mapped_column(Integer, default=0)
    processed_chunks: Mapped[int] = mapped_column(Integer, default=0)

    token_est_in: Mapped[int] = mapped_column(Integer, default=0)
    token_est_out: Mapped[int] = mapped_column(Integer, default=0)

    token_act_in: Mapped[int] = mapped_column(Integer, nullable=True)
    token_act_out: Mapped[int] = mapped_column(Integer, nullable=True)

    debit_ledger_id: Mapped[str] = mapped_column(String(64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str] = mapped_column(String(1024), nullable=True)
