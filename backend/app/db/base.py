from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import models so Alembic can see them
from app.db.models import *  # noqa
