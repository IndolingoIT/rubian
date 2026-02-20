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
