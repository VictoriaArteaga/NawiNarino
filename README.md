# Nawi-Narino

Mobile learning app and API for exploring the linguistic heritage of Nariño. The repository is split into independently runnable applications:

- [`frontend/`](./frontend/README.md): Expo, React Native, TypeScript, Expo Router, and NativeWind.
- [`backend/`](./backend/README.md): FastAPI, SQLAlchemy, PostgreSQL, and Alembic.

Demo records are temporary placeholders and are explicitly marked as mock data. Do not treat them as verified language or cultural information.

The current implementation includes learning activities with local demonstration progress, schematic territory markers, and heritage/toponym/source placeholders. No authentication, chatbot, generative AI, RAG, or verified indigenous-language content is included.

The backend defaults to an isolated in-memory MOCK data source. PostgreSQL is
not connected by default; enabling it requires explicitly setting
`DATA_SOURCE=database` and a local `DATABASE_URL`. The AI Explorer preview is
informational only: AI, RAG, and automatic answer generation are not
implemented.
