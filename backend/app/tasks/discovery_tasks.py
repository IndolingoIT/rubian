from app.tasks.celery_app import celery_app

@celery_app.task(name="app.tasks.discovery_tasks.ping")
def ping():
    return {"ok": True}
