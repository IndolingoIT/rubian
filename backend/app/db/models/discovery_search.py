import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class DiscoverySearch(Base):
    __tablename__ = "discovery_searches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    query: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_tokens: Mapped[int] = mapped_column(Integer, default=0)
    debit_ledger_id: Mapped[str] = mapped_column(String(64), nullable=True)

    result_json: Mapped[str] = mapped_column(Text, nullable=True)
    synthesis_text: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
