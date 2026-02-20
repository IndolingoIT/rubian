import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class LibraryItem(Base):
    __tablename__ = "library_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    type: Mapped[str] = mapped_column(String(50), nullable=False)  # TRANSLATION_OUTPUT / DISCOVERY_ITEM
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    metadata_json: Mapped[str] = mapped_column(Text, nullable=True)
    file_docx_uri: Mapped[str] = mapped_column(String(1024), nullable=True)
    file_pdf_uri: Mapped[str] = mapped_column(String(1024), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
