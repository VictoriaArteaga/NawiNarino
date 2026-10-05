# Nawi-Narino API

FastAPI service for the Nawi-Narino educational application. All included records are clearly marked as temporary demo data; they are not verified linguistic or cultural information.

## Requirements

- Python 3.10 or newer
- PostgreSQL 14 or newer

## Setup

From the `backend` directory, create and activate a virtual environment:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux, activate it with `source .venv/bin/activate`.

Install dependencies and create the local environment file:

```shell
python -m pip install -r requirements.txt
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env`. Update `DATABASE_URL` to match your local PostgreSQL credentials and database. Create the `nawi_narino` database before running migrations.

## Database and demo data

Apply the versioned schema with Alembic, then load temporary demonstration records:

```shell
alembic upgrade head
python -m scripts.seed
```

The seed operation is safe to repeat. It only adds missing placeholder records and never substitutes verified community information.

## Run the API

```shell
uvicorn app.main:app --reload
```

The service listens on `http://localhost:8000`. Interactive API documentation is available at `/docs`; the OpenAPI schema is at `/openapi.json`.

## Endpoints

- `GET /health`
- `GET /languages`
- `GET /languages/{language_id}`
- `GET /languages/{language_id}/vocabulary`
- `GET /languages/{language_id}/culture`
- `GET /vocabulary/{vocabulary_id}`

API response field names use camelCase to align with the TypeScript client. All date values are ISO 8601 timestamps.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | FastAPI title shown in the documentation |
| `ENVIRONMENT` | Deployment environment label |
| `DATABASE_URL` | SQLAlchemy PostgreSQL connection URL |
| `CORS_ORIGINS` | JSON array of permitted frontend origins |

Keep the real `.env` file local. `.env.example` contains example values only.

## Structure

`app/routers` defines HTTP endpoints, `app/services` handles application rules, `app/repositories` owns database queries, `app/models` defines SQLAlchemy tables, and `app/schemas` defines validated API responses. Alembic migrations, repeatable demo seeding, and pytest tests live outside the application package.

Run the backend tests from this directory with `python -m pytest`.

