# Demostración del Explorador IA (Ñawi Explora)

**Todo el contenido de la demo es sintético (ficticio).** La «Lengua de Prueba», el «Valle Ficticio», las formas
(`zumba lo`, `kep`, `sa`…) y las fiestas están inventados y **no corresponden a ninguna lengua ni comunidad real**.
No se procesa ningún documento real (no existe autorización escrita; ver `rag-real-evaluation-blocker.md`).

## Qué hace la demo
**Corpus real:** con `RAG_CORPUS=real` la demo responde con el corpus real de `corpus/` (solo uso local, validación pendiente). Ver [`corpus-real-demo.md`](corpus-real-demo.md); con `demo` usa el corpus ficticio de abajo.

**Actualización:** además de los extractos, Ñawi redacta una explicación con un modelo local (`llama3.2:3b` vía Ollama), validada en el backend y con fallback extractivo. Instalación, variables, validación y límites: [`generacion-local.md`](generacion-local.md). Para solo extractivo: `RAG_GENERATION=off`. Con generación, la primera respuesta tras un arranque en frío puede tardar más de 1 minuto; precalentar con una pregunta antes de presentar.

`POST /explorer/ask` → recupera fragmentos del corpus de demo → responde con **extractos literales** de los fragmentos,
cada uno con documento, página, autor, año y estado de validación; o **se abstiene** si no hay evidencia suficiente.
No hay modelo generativo, ni QA, ni reranker: lo que se muestra es texto de los documentos, nunca texto inventado.

Corpus de demo: `backend/rag_data/demo/manifest.json` (4 documentos ficticios, 7 fragmentos; reutiliza los dos de
`rag_data/synthetic/` y agrega `calendario_sintetico.md` y `glosario_sintetico_sentidos.md`). Los avisos dentro de los
documentos están marcados con `[[advertencia]]` y no se indexan.

## Cómo iniciarlo (Windows, PowerShell, desde la raíz del proyecto)
1. **(Recomendado) Ollama con bge-m3** para la recuperación híbrida (embeddings + BM25):
   `ollama list` debe mostrar `bge-m3`; si no, `ollama pull bge-m3` (1,2 GB, una sola vez). Ollama debe estar en ejecución.
   *Sin Ollama la demo sigue funcionando* con el recuperador de respaldo `hashing` (ver «Modos»).
2. **Backend:**
   ```powershell
   cd backend
   ..\.venv\Scripts\Activate.ps1          # entorno ya creado; si no: py -m venv ..\.venv; pip install -r requirements.txt
   uvicorn app.main:app --port 8000
   ```
   Comprobar: `curl http://localhost:8000/health` → `"explorerRetriever": "hybrid"` (o `"hashing"` si no hay Ollama).
   **El índice se construye solo al arrancar** (unos segundos con bge-m3); no hay que prepararlo aparte.
   Para validar la ingesta a mano: `python -m scripts.rag_ingest rag_data/demo/manifest.json --out rag_data/index.json`
   (informa documentos indexados/rechazados; el índice guardado es opcional).
3. **Frontend:**
   ```powershell
   cd frontend
   npx expo start --web --port 8081
   ```
   Abrir `http://localhost:8081`, entrar a **Explorar → Ñawi Explora**. La URL del backend sale de
   `EXPO_PUBLIC_API_URL` (`frontend/.env.example`: `http://localhost:8000`). El backend permite CORS desde
   `http://localhost:8081`/`127.0.0.1:8081`. Teléfono físico: usar la IP del equipo en `EXPO_PUBLIC_API_URL` y agregar el
   origen a `CORS_ORIGINS`; reiniciar Expo.
   Si el bundle no refleja cambios: `npx expo start --web --clear`.

### Modos del recuperador (`RAG_RETRIEVER` en `backend/.env`)
| Valor | Comportamiento |
|---|---|
| `auto` (por defecto) | Híbrido bge-m3 + BM25 si Ollama responde y tiene bge-m3; si no, `hashing` |
| `hybrid` | Fuerza el híbrido; falla al arrancar si no hay Ollama |
| `hashing` | Solo el recuperador local léxico, sin servicios externos |
Otras variables: `RAG_OLLAMA_HOST` (`http://127.0.0.1:11434`), `RAG_DENSE_MODEL` (`bge-m3`), `RAG_MANIFEST_PATH`, `RAG_TOP_K`, `RAG_MIN_SCORE`.
Si el híbrido falla a mitad de la demo (p. ej. se cierra Ollama), la consulta se responde con `hashing` en vez de dar error.
Los umbrales no se cambiaron: híbrido α 0,5 / `min_score` 0,3 / `relative_min` 0,85 (evaluados en la etapa 5); `hashing` 0,15.

## Guion de la demostración (preguntas y resultado esperado)
Comprobadas con ambos recuperadores (pruebas `tests/test_demo_scenarios.py` y recorrido en Chrome con el híbrido).

| # | Escenario | Pregunta | Resultado esperado |
|---|---|---|---|
| 1 | Respuesta con cita | ¿Cuál es el saludo de la mañana en la Lengua de Prueba? | 1 tarjeta: «…el saludo ficticio de la mañana es "zumba lo"», *Guía sintética de gramática*, **Página 2**, estado «Contenido sintético de prueba» + aviso de contenido sintético |
| 2 | Varios fragmentos | ¿Qué pasa en la Fiesta de la Luna de Papel? | 2–3 tarjetas: *Relato* p. 1 (dónde y cuándo), *Calendario* p. 1 (tres días, faroles) y, con el híbrido, *Calendario* p. 2 (pan de maíz azul). Con `hashing`: *Relato* p. 1 y *Calendario* p. 1 |
| 3 | Página específica | ¿Qué plato se prepara en la Fiesta de la Luna de Papel? | 1 tarjeta: *Calendario* **p. 2**, «el pan de maíz azul, un plato ficticio…» |
| 4 | Palabra ambigua | ¿Qué significa sa? | 1 tarjeta del *Glosario*, p. 1: dos sentidos registrados, `"tarde"` y `"orilla"` (se muestran ambos, sin elegir uno) |
| 5 | Información ausente | ¿Cómo se dice agua en awapit? | «Sin evidencia suficiente… No voy a inventar una respuesta.», sin tarjetas (no hay documentos de awapit autorizados) |
| 5b | Fuera del corpus | ¿Cuál es la capital de Colombia? | Abstención |
| 6 | Pregunta sin contenido | ¿Cómo se dice? | Abstención |
| 7 | Entrada inválida | `a`, o solo espacios | El botón de enviar queda deshabilitado y aparece «Escribe al menos 3 caracteres.»; el backend responde 422 si se llama directo |
| 8 | Error de conexión | Apagar el backend y preguntar | Mensaje de error con botón «Intentar de nuevo»; al volver el backend, el reintento responde |

Otras preguntas que funcionan: ¿Qué cultivan las familias del valle? (*Relato* p. 2) · ¿Cómo se dice uno en la Lengua de Prueba? (*Guía* p. 2, `"kep"`).
**Demostración de la etiqueta de evidencia** (escenario 9): ¿Quién fundó el Valle Ficticio? → «Fragmentos relacionados (no confirman tu pregunta)», aviso «no aparece: fundó».
Evitar en vivo: ¿En qué orden pone el verbo la Lengua de Prueba? (sale como «relacionados» por la reformulación).
Las sugerencias de la pantalla del Explorador y de la conversación son estas mismas.

## Limitaciones de esta versión (decirlas en la presentación)
- **Corpus ficticio y diminuto** (7 fragmentos): no demuestra rendimiento con documentos reales.
- **Tema presente, dato ausente:** «¿Cómo se dice dos en la Lengua de Prueba?», «¿Quién fundó el Valle Ficticio?» y «¿De qué color es el río Imaginario?»
  no se abstienen (retirar la respuesta descartaría ~20 % de las correctas), pero **ya no se presentan como respuesta**: salen con el encabezado
  «Fragmentos relacionados (no confirman tu pregunta)» y un aviso con el término que falta. Ver `rag-evidence-support.md`. Costo: una reformulación
  correcta puede mostrar ese mismo encabezado (p. ej. «¿En qué orden pone el verbo…?»). Los verificadores probados (QA, reranker) no están integrados.
- **No detecta contradicciones** entre fuentes.
- Las respuestas son extractos literales, no redacciones; el recuperador léxico (`hashing`) no entiende sinónimos (el híbrido sí, en parte).
- El híbrido depende de Ollama local; el índice se reconstruye en cada arranque.
- No hay autenticación, ni validación lingüística real; el estado de validación de todo el contenido es «sintético».

## Verificación realizada
`python -m pytest` (backend): 195 pruebas; `npx tsc --noEmit` (frontend); recorrido completo en Chrome (ver informe de la entrega).
