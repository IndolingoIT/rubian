import uuid
from sqlalchemy import String, Integer, DateTime, func, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class TranslationJob(Base):
    __tablename__ = "translation_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)

    source_lang: Mapped[str] = mapped_column(String(32), nullable=False)
    target_lang: Mapped[str] = mapped_column(String(32), nullable=False)
    output_format: Mapped[str] = mapped_column(String(16), default="docx", nullable=False)  # docx|pdf|both

    status: Mapped[str] = mapped_column(String(32), default="queued", nullable=False)

    input_uri: Mapped[str] = mapped_column(Text, nullable=False)
    output_docx_uri: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_pdf_uri: Mapped[str | None] = mapped_column(Text, nullable=True)

    token_est_in: Mapped[int] = mapped_column(Integer, default=0)
    token_est_out: Mapped[int] = mapped_column(Integer, default=0)
    token_act_in: Mapped[int | None] = mapped_column(Integer, nullable=True)
    token_act_out: Mapped[int | None] = mapped_column(Integer, nullable=True)

    processed_chunks: Mapped[int] = mapped_column(Integer, default=0)
    total_chunks: Mapped[int] = mapped_column(Integer, default=0)

    debit_ledger_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())