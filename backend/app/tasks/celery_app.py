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
