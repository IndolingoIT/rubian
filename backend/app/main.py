'''from fastapi import FastAPI
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
'''

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import router as v1_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

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
