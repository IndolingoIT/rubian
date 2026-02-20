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
