import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    type: Mapped[str] = mapped_column(String(50), nullable=False)  # TOPUP / DEBIT_TRANSLATION / DEBIT_DISCOVERY
    amount: Mapped[int] = mapped_column(Integer, nullable=False)   # + topup, - debit

    reference_type: Mapped[str] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[str] = mapped_column(String(64), nullable=True)

    note: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
