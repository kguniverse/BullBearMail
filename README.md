BullBearMail

Docker quickstart

This repo includes a docker-compose setup that runs Redis, the Django API, Celery worker/beat, Next.js frontend, and nginx.

To build and run locally:

1. Ensure you have Docker and docker-compose installed.
2. From the repo root run:

	docker compose up --build

Notes:
- nginx is the only host-facing service (port 80). It serves Django static files from `server/staticfiles` and proxies `/api/` to the Django service and other requests to the Next.js service.
- The Django image runs migrations and `collectstatic` at container start via `server/docker/entrypoint.sh`.
