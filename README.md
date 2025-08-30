# BullBearMail

Lightweight newsletter-style app: a Django REST API (server/) and a Next.js frontend (web/). Built to run locally or via Docker Compose. This README summarizes how to run, configure, and troubleshoot the main integration points (SMTP, proxying, Celery).

## Project layout (important files)
- `server/` — Django 4.2 REST API. Key modules: `subscriptions/` (mailer, tasks, ai_helper), `accounts/` (auth), `core/` (settings, urls, wsgi). DB: `server/db.sqlite3` by default.
- `web/` — Next.js frontend. Client API calls use `web/lib/axiosInstance.ts` and `NEXT_PUBLIC_DJANGO_API_URL`.
- `docker/` — `nginx.conf` and other helper scripts.
- `docker-compose.yml` — orchestrates `redis`, `api`, `worker`, `beat`, `web`, `nginx`.

## Quickstart — recommended (Docker Compose)
1. Copy or edit env files:
   - `server/.env` should contain secrets like `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CELERY_BROKER_URL`, etc.
   - `web/product.env` contains frontend env (e.g. `NEXT_PUBLIC_DJANGO_API_URL=/backend`).
2. Build & start:
```bash
docker compose up -d --build
```
3. Migrate and collectstatic (if needed):
```bash
docker compose exec api python manage.py migrate --noinput
docker compose exec api python manage.py collectstatic --noinput
```
4. Visit `http://localhost` (nginx proxies frontend and API).

Notes:
- nginx proxies requests to the Next app and the Django api. By default this repo mounts Django under `/backend` (see `docker-compose.yml` via `NEXT_PUBLIC_DJANGO_API_URL=/backend`).
- If you change nginx config, restart nginx container:
```bash
docker compose restart nginx
```

## Quickstart — run services locally (no Docker)
1. Python backend
```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
2. Frontend
```bash
cd web
npm ci
npm run dev
```

## Environment variables (important)
- server/.env (examples)
  - `GMAIL_USER` — SMTP username
  - `GMAIL_APP_PASSWORD` — SMTP app password (use App Password if Gmail 2FA enabled)
  - `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` — Redis URLs
  - `OPENAI_API_KEY` / `OPENAI_MODEL` — if using AI features
  - `FORCE_SCRIPT_NAME` — optional override for mount prefix (e.g. `/backend`)
  - `EMAIL_TIMEOUT` — socket timeout (seconds)
- web/product.env
  - `NEXT_PUBLIC_DJANGO_API_URL` — base path used by frontend axios (e.g. `/backend`)
  - `NEXTAUTH_URL` — NextAuth base URL

Keep secrets out of source control. Use `.env` files or your deployment secret store.

## Important behaviour and configuration notes
- API prefix: The repo commonly exposes Django under `/backend` to avoid Next.js `/api/*` route conflicts. See `docker/nginx.conf` and `web/lib/axiosInstance.ts` for how paths are composed.
- Reverse proxy headers: If Django is served behind a prefix, set `FORCE_SCRIPT_NAME=/backend` or pass `X-Forwarded-Prefix` and use middleware so redirects contain the prefix. See `server/core/settings.py` for `FORCE_SCRIPT_NAME`.
- Nginx and read-only mounts: If you mount `docker/nginx.conf` into `/etc/nginx/conf.d/default.conf:ro`, the official nginx container may attempt to modify files and log errors. Remove `:ro` in `docker-compose.yml` or build a custom image to avoid write attempts.

## Email troubleshooting (common causes when deploy works locally but not in server)
- Missing env vars in the container: run `docker compose exec api printenv | egrep 'GMAIL|DEFAULT_FROM_EMAIL|EMAIL'`.
- Network egress blocked by host/cloud provider: test connectivity from the api container:
```bash
docker compose exec api python - <<'PY'
import socket
try:
    socket.create_connection(("smtp.gmail.com", 587), 10)
    print('OK')
except Exception as e:
    print('ERR', e)
PY
```
- Gmail restrictions: enable 2FA and use an App Password; verify the account isn't blocking the login.
- Production best-practice: send mail asynchronously via Celery (the project already has `worker` and `beat`). Move heavy or unreliable mail sends into tasks with retries.

## Tests
- Server tests live under `server/*/tests.py`. Run them with:
```bash
cd server
python manage.py test
```

## Key places to look when changing behavior
- `server/subscriptions/mailer.py` — email composition and send paths
- `server/subscriptions/tasks.py` — background task wiring (Celery)
- `server/core/settings.py` — proxy, email, and Celery configuration
- `docker/nginx.conf` — reverse proxy behavior and `proxy_pass` rules
- `web/lib/axiosInstance.ts` — frontend baseURL and token header handling

## Recommended next steps / improvements
- Move all email sending to Celery tasks with a retry/backoff policy.
- Replace direct SMTP with an API-based transactional provider (SendGrid/Mailgun/Postmark) if host network blocks SMTP.
- Add a small middleware to honor `X-Forwarded-Prefix` so Django always generates prefixed URLs.

## Contact / further help
If you want, I can:
- modify `docker/nginx.conf` to redirect /backend → API and add `proxy_redirect` mapping, or
- implement a small middleware and example Celery task to move mail sending off-request.
Tell me which change you'd like and I will create the patch.
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
