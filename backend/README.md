# Nawi-Narino API

FastAPI service for the Nawi-Narino educational application. All included records are clearly marked as temporary demo data; they are not verified linguistic or cultural information.

## Requirements

- Python 3.10 or newer
- PostgreSQL 14 or newer only when enabling database mode

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
```

On PowerShell, create the local environment file with `Copy-Item .env.example .env`.
The default `DATA_SOURCE=mock` mode uses an in-memory SQLite database, creates the
schema, and seeds clearly marked demonstration records when the API starts. It
does not connect to PostgreSQL and its data resets when the process stops.

## Optional PostgreSQL development mode

The production database is not connected or enabled by default. To test the
existing PostgreSQL/Alembic path locally, first create a PostgreSQL database and
set local values in `backend/.env`:

```shell
DATA_SOURCE=database
DATABASE_URL=postgresql+psycopg://<local-user>:<local-password>@localhost:5432/nawi_narino
```

Never commit real credentials. Alembic refuses to run unless database mode and an
explicit `DATABASE_URL` are configured. Apply the schema and optionally load
demonstration-only records:

```shell
alembic upgrade head
python -m scripts.seed
```

The seed operation is safe to repeat. It only adds missing placeholder records
and never substitutes verified community information.

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
- `GET /languages/{language_id}/lessons`
- `GET /lessons/{lesson_id}`
- `GET /lessons/{lesson_id}/activities`
- `GET /activities/{activity_id}`
- `POST /activities/{activity_id}/submit`
- `GET /progress?userId=local-demo-user`
- `GET /progress/{user_id}`
- `GET /progress/{user_id}/language/{language_id}`
- `GET /territories`
- `GET /territories/{territory_id}`
- `GET /languages/{language_id}/territories`
- `GET /heritage?category=historical`
- `GET /heritage/{heritage_id}`
- `GET /toponyms?search=demo`
- `GET /toponyms/{toponym_id}`
- `GET /sources`
- `GET /sources/{source_id}`
- `GET /vocabulary/{vocabulary_id}`

API response field names use camelCase to align with the TypeScript client. All date values are ISO 8601 timestamps.

Learning submissions accept one selected option for each question. The local progress identifier defaults to `local-demo-user`; this is not an authentication system. Activities, scores, territories, heritage, toponyms, and source records seeded by `scripts.seed` are demonstrations only. Territory coordinates are intentionally unset until validated information is available.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | FastAPI title shown in the documentation |
| `ENVIRONMENT` | Deployment environment label |
| `DATA_SOURCE` | `mock` (default) or explicitly enabled `database` |
| `DATABASE_URL` | Required only for `DATA_SOURCE=database`; keep credentials local |
| `CORS_ORIGINS` | JSON array of permitted frontend origins |

Keep the real `.env` file local. `.env.example` contains example values only.

## Structure

`app/routers` defines HTTP endpoints, `app/services` handles application rules, `app/repositories` owns database queries, `app/models` defines SQLAlchemy tables, and `app/schemas` defines validated API responses. Alembic migrations, repeatable demo seeding, and pytest tests live outside the application package.

Run the backend tests from this directory with `python -m pytest`.

## Future dataset and AI/RAG integration

All records available in mock mode are demonstrations and carry `isMock: true`.
Language, vocabulary, cultural, territory, heritage, toponym, and source records
must not be treated as verified community information. Import a future dataset
only after validation, normalization, and source attribution; retain the
`Source` metadata (`title`, `author`, `year`, `type`, `reference`, `url`, and
`description`) for every sourced claim. Pending or unvalidated material must
remain clearly marked as pending validation and must never be represented as
verified real data. Do not mix unvalidated records into a verified dataset.

A future retrieval-based explorer may retrieve passages from a validated
document corpus, link each answer to its source, and report insufficient
evidence when retrieval is inadequate. Generation, retrieval, embeddings, and
the AI explorer API are **not implemented in this phase**. No AI service or
database is enabled by default.
