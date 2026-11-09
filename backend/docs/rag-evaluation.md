# Evaluación de la recuperación RAG (cuarta etapa)

Todo se midió con **38 preguntas** sobre los **documentos sintéticos** (ficticios) de
`rag_data/synthetic/`, que tras separar el contenido no indexable quedan en **4 fragmentos**.
Es un corpus minúsculo: sirve para detectar regresiones y comparar métodos, **no** para
predecir la calidad con documentos reales.

Reproducir: `python -m scripts.rag_eval [-v] [--embedder ollama:bge-m3] [--sweep]`.

## 1. Contenido no indexable

Problema: un aviso («AVISO: documento ficticio…») se indexaba y se recuperaba como
evidencia (apareció como fuente [2] en una respuesta real).

Solución (`app/rag/exclusion.py`): un párrafo se excluye **solo** si el documento lo marca al
inicio con `[[editorial]]`, `[[revision]]`, `[[advertencia]]`, `[[interno]]` o `[[metadatos]]`.
- No hay filtro por palabras clave (descartaría contenido lingüístico legítimo).
- Una etiqueta desconocida (`[[editoral]]`) **rechaza el documento**, no lo indexa.
- El archivo original no se modifica; el texto excluido sigue en él y el reporte de ingesta
  lo lista (`IngestReport.excluded`: documento, página, etiqueta, texto).
- Para PDF reales: un documento que tenga párrafos que empiecen con `[[algo]]` (notación
  fonética, por ejemplo) será rechazado hasta decidir cómo etiquetarlo. Es deliberado.

## 2. Resultados de la evaluación

Categorías: directas (10), reformuladas (5), sinónimos (5), términos específicos (5),
sin evidencia (8) y ambiguas (5). Un resultado es *ok* si la primera cita es la fuente y
página esperadas (o si se abstuvo cuando correspondía); *precise* si **todas** las citas lo son.

| Configuración | top-1 | alguna cita correcta | precise | falsas abstenciones | abstención correcta (sin evidencia) | respuestas falsas |
|---|---|---|---|---|---|---|
| Hashing, umbrales previos (`relative_min` 0,65) | 0,88 | 0,96 | 0,60 | 1 | 0,55 | 5 |
| **Hashing, `relative_min` 0,85 (actual)** | 0,88 | 0,96 | **0,84** | 1 | 0,55 | 5 |
| bge-m3, `min_score` 0,30, `relative_min` 0,85 | **1,00** | **1,00** | 0,88 | 0 | 0,55 | 5 |

(Las 25 preguntas respondibles; «respuestas falsas» = preguntas sin evidencia que recibieron respuesta.)

Fallos del embedder actual: «¿En qué posición va el verbo…?» y «¿Qué festividad celebran los
pobladores…?» (sinónimos sin palabras en común) devuelven la página equivocada primero, y
«¿Qué es kep?» se abstiene por falta de similitud. bge-m3 los resuelve.

### Umbrales: qué se cambió y qué no
Se probaron 108 (Hashing) y 144 (bge-m3) combinaciones (`--sweep`: `min_score`, `min_overlap`,
`relative_min` y la nueva `min_coverage`).
- **Cambiado:** `relative_min` 0,65 → **0,85**. Con ambos embedders mejora `precise`
  (Hashing 0,60→0,84; bge-m3 con `min_score` 0,3: 0,32→0,88) sin perder top-1, alguna-cita ni abstenciones.
- **Sin cambio:** `min_score` (0,15) y `min_overlap` (1). Con `min_score` 0,10 se evita la
  falsa abstención de «kep», pero es una sola pregunta en un corpus de 4 fragmentos: no es
  evidencia suficiente.
- **Nuevo y desactivado:** `min_coverage` (fracción de términos de la pregunta, ponderada por
  rareza, presente en el fragmento). Por defecto 0.

### Limitación principal (sin resolver)
Las 5 preguntas «tema presente, dato ausente» (`n02` hablantes, `n03` «dos», `n04` color del
río, `n06` quién fundó el valle, `n08` existencia) siguen recibiendo respuesta con citas del
tema. **Ningún umbral lo corrige sin rechazar preguntas legítimas**: la configuración que
elimina las 5 respuestas falsas rechaza al menos 13 de las 25 preguntas respondibles (13 con bge-m3, 15 con Hashing), con
ambos embedders. La similitud entre pregunta y fragmento no distingue «el fragmento habla del
tema» de «el fragmento contiene el dato». Requiere un paso de verificación de respuesta
(reranker/NLI o un LLM acotado al contexto), que queda fuera de esta etapa.

## 3. Comparación de embeddings

Medido = ejecutado aquí (CPU, sin GPU). El resto son características publicadas de cada
modelo, **no medidas**; confirmar licencia y tamaño en la ficha oficial antes de adoptar.

| | HashingEmbedder (actual) | **bge-m3** (BAAI) | multilingual-e5-small/base | paraphrase-multilingual-MiniLM-L12-v2 | APIs (OpenAI, Cohere, Google…) |
|---|---|---|---|---|---|
| Comprensión semántica | Solo léxica/morfológica | **Medido:** top-1 1,00; resuelve sinónimos | No medido; buena en retrieval | No medido; límite de ~128 tokens | Alta; no medida |
| Multilingüe | No (n-gramas de caracteres) | Sí, 100+ idiomas, también consultas cruzadas (no medido aquí) | Sí | Sí | Sí |
| Local | Sí | Sí (Ollama o `sentence-transformers`) | Sí | Sí | **No** |
| Memoria / cómputo | ~0 / 0,1 ms por consulta | **Medido:** 1,2 GB de modelo, ~150 ms por consulta en CPU, 1024 dim | ~0,5 GB (small), 384 dim | ~0,5 GB, 384 dim | Ninguna local |
| Licencia (verificar) | Propia | MIT | MIT | Apache-2.0 | Términos del proveedor |
| Costo | 0 | 0 (descarga única) | 0 | 0 | Pago por token; verificar precios vigentes |
| Privacidad | Total | Total (el texto no sale del equipo) | Total | Total | **El texto sale a un tercero** |

Consideraciones propias del proyecto:
- **Privacidad y permisos:** los documentos tienen permisos comunitarios pendientes. Enviarlos a
  una API es compartirlos con un tercero: requeriría autorización expresa. Por eso se
  recomienda un modelo **local**.
- **Lenguas indígenas:** ninguno de estos modelos se entrenó con awapit, nasa yuwe, inga ni
  cofán. Entenderán las explicaciones en español o inglés, pero las formas en lengua indígena se
  tratarán como cadenas de caracteres. Por eso conviene una **recuperación híbrida** (densa +
  léxica por n-gramas, como el embedder actual) y no reemplazar el léxico del todo.
- **Documentos en inglés** (p. ej. Curnow) con preguntas en español: bge-m3 soporta consultas
  cruzadas; el embedder actual no. **No se midió** aquí porque el corpus sintético es solo en
  español.
- bge-m3 se evaluó mediante un servidor Ollama local (`app/rag/embedders_optional.py`,
  solo evaluación, **no conectado** a la configuración ni al endpoint).

**Recomendación (sin aplicar):** adoptar bge-m3 en modo híbrido con el léxico actual cuando se
indexen documentos reales; antes, ampliar la evaluación con documentos reales autorizados y
preguntas cruzadas español–inglés, y recalibrar `min_score` (las escalas de coseno son
distintas: ~0,3 para bge-m3 frente a ~0,15 para el actual).

## 4. Presentación de fuentes (propuesta, no implementada)

**Problema comprobado en Chrome:** el texto de la respuesta contiene las oraciones
recuperadas y, justo debajo, cada tarjeta de fuente repite el mismo extracto entre comillas.
La información útil está dos veces y la pantalla se alarga.

Opciones:
- **A (recomendada) — tarjeta de evidencia única, sin cambios de API.** Encabezado corto
  («Encontré esto en las fuentes:») y una tarjeta por cita, numerada `[1]`, `[2]`. Dentro:
  el **extracto literal** como contenido principal, y debajo documento · página · autor · año
  con una etiqueta de estado («Contenido sintético», «Pendiente de validación»). Los avisos
  globales siguen al final. Se oculta el párrafo duplicado, no la evidencia; el campo `answer`
  del API se conserva para otros clientes y lectores de pantalla.
- B — mantener el párrafo y plegar el extracto en cada tarjeta («Ver extracto»). Reduce la
  duplicación, pero esconde por defecto lo que permite verificar.
- C — que el backend devuelva en `answer` solo una frase breve con las referencias. Cambia el
  contrato del API y empeora la lectura sin tarjetas.

## 5. Decisiones pendientes
1. Elegir la presentación (A, B o C).
2. Verificar la respuesta antes de mostrarla (reranker/NLI o LLM acotado): única vía probada
   para las 5 «respuestas falsas».
3. Adoptar o no bge-m3 y si la recuperación será híbrida; tamaño de modelo aceptable.
4. Recalibrar umbrales cuando existan documentos reales autorizados.

---

# Quinta etapa: recuperación híbrida (prototipo)

Código: `app/rag/hybrid.py` (**no conectado al endpoint**; el modelo activo sigue siendo
`HashingEmbedder`). Comparación: `python -m scripts.rag_compare [--sweep]` (requiere Ollama con
bge-m3). Pruebas: `tests/test_rag_hybrid.py`.

## Qué es
Puntaje final = `alpha · coseno_denso(bge-m3) + (1 − alpha) · léxico`, con léxico en [0, 1]:
- `bm25`: BM25 sobre tokens que **conservan diacríticos y apóstrofos** (+ una pasada plegada con
  peso 0,25 para consultas escritas sin diacríticos).
- `hash`: coseno del `HashingEmbedder` actual (pliega diacríticos).

## Por qué (hallazgo medido)
`HashingEmbedder` pliega diacríticos: `embed("tamu") == embed("tamú")` (probado en
`test_hashing_alone_cannot_tell_tamu_from_tamu_with_accent`). Para formas de lenguas indígenas
eso es un defecto: el diacrítico o el apóstrofo glotal puede distinguir palabras.

## Suites (mismos documentos y preguntas para las tres alternativas)
- **A:** corpus `synthetic/` + `eval/questions.json` (27 respondibles, 11 sin respuesta).
- **B:** corpus nuevo `synthetic_lexical/` (glosario **ficticio** con formas casi idénticas:
  `tamu/tamo/tamú`, `nupa/nupe/nupá`, `kiru/kiro/kirú`, `ta'mu`, `tamu'a`) + `eval/questions_lexical.json`
  (14 respondibles: 10 por forma exacta y 4 por significado; 4 formas inexistentes y 2 conceptos ausentes).

## Resultados **medidos** (conteos, sin porcentajes)
| Alternativa | A: top-1 | A: precise | A: respuestas falsas | B: top-1 | B: forma exacta | B: precise | B: formas inexistentes que se abstienen |
|---|---|---|---|---|---|---|---|
| Hashing (actual) | 24/27 | 23/27 | 5/11 | 9/14 | 7/10 | 8/14 | 4/4 |
| bge-m3 (`min_score` 0,30) | **27/27** | 24/27 | 5/11 | **14/14** | **10/10** | 8/14 | 4/4 |
| Híbrida bge-m3 + hash (α 0,5, `min_score` 0,3) | 26/27 | 22/27 | 5/11 | 13/14 | 9/10 | 8/14 | **0/4** |
| Híbrida bge-m3 + **BM25 exacto** (α 0,5, `min_score` 0,3) | 26/27 | 24/27 | 5/11 | **14/14** | **10/10** | **14/14** | 4/4 |

`precise` = todas las citas son la página esperada. Lectura:
- bge-m3 por sí solo ya acierta la primera cita en las 10 formas exactas, pero **cita también las
  páginas de formas casi idénticas** (`precise` 8/14): ante «tamu» cita la página 1 y además las páginas 4 y 3 (`ta'mu` y `tamú`), con puntajes 0,58 / 0,56 / 0,53.
- Solo la híbrida con **BM25 exacto** cita únicamente la página correcta (14/14).
- La híbrida con el léxico plegado actual **empeora** las formas inexistentes (0/4 abstenciones):
  «tamy» se parece lo bastante a `tamu` para pasar el umbral.
- Ninguna alternativa reduce las **5/11 respuestas falsas** de la suite A: el híbrido no resuelve
  «tema presente, dato ausente».
- La mejor configuración perdió una pregunta de la suite A respecto a bge-m3 puro («cumbre» →
  `s03`, que se abstiene).

## Sensibilidad (hallazgo importante)
En el barrido (α ∈ {0,3; 0,5; 0,7} × `min_score` ∈ {0,2; 0,3; 0,4; 0,5}) el desempeño depende
mucho del umbral. Con BM25, α 0,5: `min_score` 0,2 → 0/4 abstenciones en formas inexistentes;
0,3 → 4/4; 0,4 → 10 falsas abstenciones en A y 12 en B. **La ventana útil es estrecha** y las
suites son diminutas y se usaron tanto para elegir como para evaluar. Por eso **no se cambió
ningún umbral de producción** y la cifra de la tabla es indicativa, no una garantía.

## Hipótesis y recomendaciones (no medidas)
- *Hipótesis:* con documentos reales (más fragmentos, vocabulario más denso) la ventaja del léxico
  exacto será mayor, porque habrá más formas parecidas; y el umbral fijo seguirá siendo frágil.
- *Hipótesis:* una normalización explícita del apóstrofo glotal (`'`, `’`, `ʼ`) puede hacer falta
  según la ortografía de cada fuente; hoy se tratan como caracteres distintos. **Decisión pendiente
  con hablantes/lingüistas.**
- *Riesgo conocido:* la consulta descarta stopwords españolas; una palabra indígena que coincida con
  una (p. ej. `no`, `mi`, `se`) se perdería de la consulta.
- *Recomendación:* si se adopta, hacerlo con BM25 exacto (no con el léxico plegado), calibrar
  `alpha`/`min_score` con una evaluación **separada** (conjunto de ajuste y de prueba) sobre
  documentos reales autorizados, y mantener el embedder actual como respaldo.

## Presentación de fuentes (opción A, implementada)
`frontend/app/explorador/conversacion.tsx`: una tarjeta por cita con el **extracto literal** como
contenido principal y, debajo, título, página, autor, año y etiqueta de estado de validación
(resaltada con el color de aviso si es sintético o pendiente). Se dejó de mostrar el párrafo de
`answer` (que repetía los extractos); el campo se conserva en la API. Sin cambios de contrato.
