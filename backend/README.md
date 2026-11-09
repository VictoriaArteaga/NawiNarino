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

## RAG (Explorador IA) — primera etapa

Pipeline RAG en `app/rag/`, expuesto en `POST /explorer/ask`
(`{"question": "...", "language": "opcional"}`). **No hay modelo generativo ni
entrenamiento**: la respuesta es extractiva (oraciones literales de los
fragmentos recuperados, con cita `[n]` a documento y página) o una abstención.

| Módulo | Función |
| --- | --- |
| `metadata.py` | Esquema (lengua, tipo, fuente, autor, año, página, licencia, `access_level`, `indexing_authorized`, `authorization_ref`, `validation_status`) y puerta de indexación |
| `extraction.py` / `cleaning.py` / `chunking.py` | `.txt`/`.md` con marcas `[[pagina N]]` y PDF vía `pdftotext`; limpieza que conserva diacríticos; fragmentos que no cruzan páginas |
| `embeddings.py` | `HashingEmbedder` local (palabras + trigramas de caracteres): similitud léxica, **no semántica profunda** |
| `vectorstore.py` | Índice JSON con coseno; rechaza cargar un índice de otro embedder |
| `retrieval.py` | Umbral de similitud + solapamiento mínimo de términos; vacío = abstenerse |
| `generation.py` | Respuesta extractiva con citas, avisos de sintético/pendiente de validación |

**Demostración.** Corpus ficticio en `rag_data/demo/` (manifiesto por defecto), recuperador `auto`
(híbrido bge-m3 + BM25 vía Ollama local, con respaldo `hashing`; variable `RAG_RETRIEVER`). Guía de ejecución,
guion de preguntas y limitaciones en [`docs/demo-explorador.md`](docs/demo-explorador.md). `/health` informa el
recuperador activo (`explorerRetriever`).

**Generación local (Ollama).** Explicaciones redactadas por `llama3.2:3b` solo a partir de los fragmentos citados, validadas en el backend y con fallback extractivo (`RAG_GENERATION`, `RAG_GEN_*`; `/health` → `explorerGenerator`). Ver [`docs/generacion-local.md`](docs/generacion-local.md). Android/APK: [`docs/android-apk.md`](docs/android-apk.md).

**Evidencia de respuesta.** Cada respuesta indica si la evidencia contiene los términos de la pregunta (`evidence`:
`direct`/`related`/`none`, `unmatchedTerms`). `related` = fragmentos del tema que no confirman la pregunta; no se
descartan. Medición, decisión y limitaciones en [`docs/rag-evidence-support.md`](docs/rag-evidence-support.md).

**Contenido no indexable.** Un párrafo marcado al inicio con `[[editorial]]`,
`[[revision]]`, `[[advertencia]]`, `[[interno]]` o `[[metadatos]]` no entra al índice
(el original no se modifica; el reporte de ingesta lo lista). Una etiqueta
desconocida rechaza el documento.

**Evaluación.** `python -m scripts.rag_eval [-v] [--embedder ollama:bge-m3] [--sweep]`
usa `rag_data/eval/questions.json` (38 preguntas sobre el corpus sintético).
Resultados, comparación de embeddings y limitaciones en
[`docs/rag-evaluation.md`](docs/rag-evaluation.md).

**Permisos.** Solo se indexa un documento si es `synthetic` o si tiene
`indexing_authorized: true` **y** `authorization_ref`. Borman está bloqueado
por id. Hoy ningún documento real de `corpus/` tiene autorización, así que el
único manifiesto es `rag_data/synthetic/manifest.json` (contenido ficticio de
una «Lengua de Prueba»; no describe ninguna lengua real).

Configuración (opcional, en `.env`): `RAG_MANIFEST_PATH`, `RAG_TOP_K` (4),
`RAG_MIN_SCORE` (0.15). Requiere `pdftotext` (poppler) solo para PDFs.

```shell
python -m scripts.rag_ingest                 # indexa el manifiesto e informa rechazos
python -m scripts.rag_ingest otro/manifest.json --out rag_data/index.json
python -m pytest tests/test_rag.py
```

El frontend (`frontend/app/explorador/conversacion.tsx`) consume este endpoint.
Respuesta (camelCase): `question`, `answer`, `abstained`, `citations[]`
(`ref`, `chunkId`, `documentId`, `title`, `author`, `year`, `page`, `language`,
`source`, `license`, `validationStatus`, `isSynthetic`, `excerpt`, `score`) y
`notices[]`. Si `abstained` es `true`, `citations` está vacío. Los fragmentos
débiles (menos del 85 % del mejor puntaje) no se citan.

Para añadir un documento real: agregar una entrada al manifiesto con su
`authorization_ref` (carta o permiso) una vez confirmado el permiso; el
original no se modifica.
