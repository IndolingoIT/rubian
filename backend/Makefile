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

