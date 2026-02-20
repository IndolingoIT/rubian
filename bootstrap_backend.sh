#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-backend}"
mkdir -p "$ROOT_DIR"
cd "$ROOT_DIR"

mkdir -p app/{core,db/models,api/v1/endpoints,services/storage,tasks} alembic/versions nginx

########################################
# requirements.txt
########################################
cat > requirements.txt << 'EOF'
fastapi==0.109.2
uvicorn[standard]==0.27.1
gunicorn==21.2.0

sqlalchemy==2.0.27
psycopg2-binary==2.9.9
alembic==1.13.1

pydantic==2.6.1
pydantic-settings==2.1.0

python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

python-multipart==0.0.9
python-dotenv==1.0.1

celery==5.3.6
redis==5.0.1

httpx==0.26.0
google-generativeai==0.3.2

python-docx==1.1.0
reportlab==4.0.9
boto3==1.34.42

pytest==8.0.0
pytest-asyncio==0.23.5
EOF

########################################
# Dockerfile
########################################
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY app /app/app
COPY alembic.ini /app/alembic.ini
COPY alembic /app/alembic

EXPOSE 8000
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000", "--workers", "2"]
EOF

########################################
# docker-compose.yml (Podman rootless friendly)
########################################
cat > docker-compose.yml << 'EOF'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-jurnallingua}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-jurnallingua}"]
      interval: 5s
      timeout: 3s
      retries: 20

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 20

  api:
    build: .
    environment:
      ENVIRONMENT: ${ENVIRONMENT:-development}
      PROJECT_NAME: ${PROJECT_NAME:-JurnalLingua}
      API_V1_STR: ${API_V1_STR:-/api}
      SECRET_KEY: ${SECRET_KEY:-changeme}
      CORS_ORIGINS: ${CORS_ORIGINS:-*}

      POSTGRES_SERVER: db
      POSTGRES_PORT: 5432
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-jurnallingua}

      REDIS_HOST: redis
      REDIS_PORT: 6379

      GEMINI_API_KEY: ${GEMINI_API_KEY:-}
      GEMINI_ENABLED: ${GEMINI_ENABLED:-false}

      STORAGE_BACKEND: ${STORAGE_BACKEND:-local}
      LOCAL_STORAGE_PATH: /app/storage

      OPENALEX_EMAIL: ${OPENALEX_EMAIL:-test@example.com}

      MAX_TOKENS_PER_JOB: ${MAX_TOKENS_PER_JOB:-200000}
      MAX_CHUNKS_PER_JOB: ${MAX_CHUNKS_PER_JOB:-200}
      CREDIT_COST_PER_1K_TOKENS: ${CREDIT_COST_PER_1K_TOKENS:-10}

    volumes:
      - storage_data:/app/storage
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker:
    build: .
    command: ["celery", "-A", "app.tasks.celery_app:celery_app", "worker", "--loglevel=INFO", "--concurrency=1"]
    environment:
      ENVIRONMENT: ${ENVIRONMENT:-development}
      PROJECT_NAME: ${PROJECT_NAME:-JurnalLingua}
      API_V1_STR: ${API_V1_STR:-/api}
      SECRET_KEY: ${SECRET_KEY:-changeme}

      POSTGRES_SERVER: db
      POSTGRES_PORT: 5432
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-jurnallingua}

      REDIS_HOST: redis
      REDIS_PORT: 6379

      GEMINI_API_KEY: ${GEMINI_API_KEY:-}
      GEMINI_ENABLED: ${GEMINI_ENABLED:-false}

      STORAGE_BACKEND: ${STORAGE_BACKEND:-local}
      LOCAL_STORAGE_PATH: /app/storage

      OPENALEX_EMAIL: ${OPENALEX_EMAIL:-test@example.com}

      MAX_TOKENS_PER_JOB: ${MAX_TOKENS_PER_JOB:-200000}
      MAX_CHUNKS_PER_JOB: ${MAX_CHUNKS_PER_JOB:-200}
      CREDIT_COST_PER_1K_TOKENS: ${CREDIT_COST_PER_1K_TOKENS:-10}

    volumes:
      - storage_data:/app/storage
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  nginx:
    image: nginx:stable-alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api

volumes:
  postgres_data:
  storage_data:
EOF

########################################
# nginx.conf
########################################
cat > nginx/nginx.conf << 'EOF'
worker_processes 1;

events { worker_connections 1024; }

http {
  sendfile on;

  upstream api_upstream {
    server api:8000;
  }

  server {
    listen 80;

    client_max_body_size 25m;

    location = / {
      default_type text/plain;
      return 200 "NGINX OK. Backend is at /api (try /api/docs)\n";
    }

    location /api/ {
      proxy_pass http://api_upstream/api/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 300;
    }
  }
}
EOF

########################################
# .env.example
########################################
cat > .env.example << 'EOF'
ENVIRONMENT=development
PROJECT_NAME=JurnalLingua
API_V1_STR=/api
SECRET_KEY=changeme
CORS_ORIGINS=*

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jurnallingua

GEMINI_API_KEY=
GEMINI_ENABLED=false

STORAGE_BACKEND=local
OPENALEX_EMAIL=test@example.com

MAX_TOKENS_PER_JOB=200000
MAX_CHUNKS_PER_JOB=200
CREDIT_COST_PER_1K_TOKENS=10
EOF

########################################
# Makefile
########################################
cat > Makefile << 'EOF'
.PHONY: up down logs migrate revision fmt

up:
	podman-compose up -d --build

down:
	podman-compose down -v

logs:
	podman-compose logs -f --tail=200

migrate:
	podman-compose exec api alembic upgrade head

revision:
	podman-compose exec api alembic revision --autogenerate -m "auto"

EOF

########################################
# app/core/config.py
########################################
cat > app/core/config.py << 'EOF'
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "JurnalLingua"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    SECRET_KEY: str = "changeme"
    CORS_ORIGINS: str = "*"

    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "jurnallingua"
    POSTGRES_PORT: int = 5432

    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379

    GEMINI_API_KEY: str = ""
    GEMINI_ENABLED: bool = False

    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_PATH: str = "/app/storage"

    OPENALEX_EMAIL: str = "test@example.com"

    MAX_TOKENS_PER_JOB: int = 200000
    MAX_CHUNKS_PER_JOB: int = 200
    CREDIT_COST_PER_1K_TOKENS: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def CELERY_BROKER_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

settings = Settings()
EOF

########################################
# app/core/security.py
########################################
cat > app/core/security.py << 'EOF'
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_access_token(subject: str, expires_minutes: int = 60) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
EOF

########################################
# app/db/session.py
########################################
cat > app/db/session.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
EOF

########################################
# app/db/base.py
########################################
cat > app/db/base.py << 'EOF'
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import models so Alembic can see them
from app.db.models import *  # noqa
EOF

########################################
# MODELS (SQLAlchemy 2.0 Mapped[] — fix error kamu)
########################################
cat > app/db/models/__init__.py << 'EOF'
from app.db.models.user import User
from app.db.models.credit_ledger import CreditLedger
from app.db.models.translation_job import TranslationJob
from app.db.models.discovery_search import DiscoverySearch
from app.db.models.library_item import LibraryItem

__all__ = ["User", "CreditLedger", "TranslationJob", "DiscoverySearch", "LibraryItem"]
EOF

cat > app/db/models/user.py << 'EOF'
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="free", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
EOF

cat > app/db/models/credit_ledger.py << 'EOF'
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
EOF

cat > app/db/models/translation_job.py << 'EOF'
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
EOF

cat > app/db/models/discovery_search.py << 'EOF'
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
EOF

cat > app/db/models/library_item.py << 'EOF'
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
EOF

########################################
# app/api/deps.py
########################################
cat > app/api/deps.py << 'EOF'
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import decode_token
from app.db.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("missing sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
EOF

########################################
# Routers – NO circular import
########################################
cat > app/api/v1/api.py << 'EOF'
from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.credits import router as credits_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.discovery import router as discovery_router
from app.api.v1.endpoints.library import router as library_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(credits_router, prefix="/credits", tags=["credits"])
router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
router.include_router(discovery_router, prefix="/discovery", tags=["discovery"])
router.include_router(library_router, prefix="/library", tags=["library"])
EOF

########################################
# app/main.py
########################################
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import router as v1_router

app = FastAPI(title=settings.PROJECT_NAME)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()] if settings.CORS_ORIGINS else []
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins and origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(f"{settings.API_V1_STR}/health")
def health():
    return {"ok": True, "service": "jurnallingua-backend"}

app.include_router(v1_router, prefix=settings.API_V1_STR)
EOF

########################################
# Minimal endpoints (test stage)
########################################
cat > app/api/v1/endpoints/auth.py << 'EOF'
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.db.models.user import User

router = APIRouter()

class RegisterIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(id=uuid.uuid4(), email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return TokenOut(access_token=token)

@router.post("/login", response_model=TokenOut)
def login(payload: RegisterIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return TokenOut(access_token=token)
EOF

cat > app/api/v1/endpoints/credits.py << 'EOF'
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
EOF

# Placeholder minimal jobs/discovery/library so app boots & docs show.
cat > app/api/v1/endpoints/jobs.py << 'EOF'
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
EOF

cat > app/api/v1/endpoints/discovery.py << 'EOF'
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
EOF

cat > app/api/v1/endpoints/library.py << 'EOF'
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
EOF

########################################
# Celery minimal (so worker boots)
########################################
cat > app/tasks/celery_app.py << 'EOF'
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "jurnallingua",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_BROKER_URL,
)

celery_app.conf.task_routes = {
    "app.tasks.translation_tasks.*": {"queue": "translation"},
    "app.tasks.discovery_tasks.*": {"queue": "discovery"},
}
EOF

cat > app/tasks/translation_tasks.py << 'EOF'
from app.tasks.celery_app import celery_app

@celery_app.task(name="app.tasks.translation_tasks.ping")
def ping():
    return {"ok": True}
EOF

cat > app/tasks/discovery_tasks.py << 'EOF'
from app.tasks.celery_app import celery_app

@celery_app.task(name="app.tasks.discovery_tasks.ping")
def ping():
    return {"ok": True}
EOF

########################################
# alembic.ini + alembic env + migration init
########################################
cat > alembic.ini << 'EOF'
[alembic]
script_location = alembic
sqlalchemy.url =

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = INFO
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
EOF

cat > alembic/env.py << 'EOF'
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

from app.core.config import settings
from app.db.base import Base  # imports models

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    url = settings.SQLALCHEMY_DATABASE_URI
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = settings.SQLALCHEMY_DATABASE_URI

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
EOF

cat > alembic/script.py.mako << 'EOF'
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""
from alembic import op
import sqlalchemy as sa

revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}

def upgrade():
    ${upgrades if upgrades else "pass"}

def downgrade():
    ${downgrades if downgrades else "pass"}
EOF

cat > alembic/versions/0001_init.py << 'EOF'
"""init

Revision ID: 0001_init
Revises:
Create Date: 2026-02-18
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("plan", sa.String(length=50), nullable=False, server_default="free"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "credit_ledger",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("reference_type", sa.String(length=50), nullable=True),
        sa.Column("reference_id", sa.String(length=64), nullable=True),
        sa.Column("note", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_credit_ledger_user_id", "credit_ledger", ["user_id"])

    op.create_table(
        "translation_jobs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("source_lang", sa.String(length=16), nullable=False),
        sa.Column("target_lang", sa.String(length=16), nullable=False),
        sa.Column("input_uri", sa.String(length=1024), nullable=False),
        sa.Column("output_docx_uri", sa.String(length=1024), nullable=True),
        sa.Column("output_pdf_uri", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("total_chunks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("processed_chunks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("token_est_in", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("token_est_out", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("token_act_in", sa.Integer(), nullable=True),
        sa.Column("token_act_out", sa.Integer(), nullable=True),
        sa.Column("debit_ledger_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.String(length=1024), nullable=True),
    )
    op.create_index("ix_translation_jobs_user_id", "translation_jobs", ["user_id"])

    op.create_table(
        "discovery_searches",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("estimated_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("debit_ledger_id", sa.String(length=64), nullable=True),
        sa.Column("result_json", sa.Text(), nullable=True),
        sa.Column("synthesis_text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_discovery_searches_user_id", "discovery_searches", ["user_id"])

    op.create_table(
        "library_items",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column("file_docx_uri", sa.String(length=1024), nullable=True),
        sa.Column("file_pdf_uri", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_library_items_user_id", "library_items", ["user_id"])

def downgrade():
    op.drop_table("library_items")
    op.drop_table("discovery_searches")
    op.drop_table("translation_jobs")
    op.drop_table("credit_ledger")
    op.drop_table("users")
EOF

########################################
# README
########################################
cat > README.md << 'EOF'
# JurnalLingua Backend (Test Stage Ready)

## Run (Podman)
1) Copy env
   cp .env.example .env

2) Start
   podman-compose up -d --build

3) Migrate
   podman-compose exec api alembic upgrade head

4) Test endpoints
   curl -i http://localhost:8080/
   curl -i http://localhost:8080/api/health
   curl -i http://localhost:8080/api/docs
EOF

echo ""
echo "✅ Backend generated in: $ROOT_DIR"
echo "Next:"
echo "  cd $ROOT_DIR"
echo "  cp .env.example .env"
echo "  podman-compose up -d --build"
echo "  podman-compose exec api alembic upgrade head"
echo "  open http://localhost:8080/api/docs"