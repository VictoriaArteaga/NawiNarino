# Resultados: verificadores de evidencia (sexta etapa)

**Experimental. Ningún prototipo está conectado al endpoint ni cambia el comportamiento de producción.
Ninguna alternativa resuelve el problema de las respuestas falsas.** Todo el corpus es ficticio.

## Montaje
- Corpus `rag_data/synthetic_experiments/{dev,test}` (generado por `experiments/verification/gen_corpus.py`):
  **ajuste (dev) 50 preguntas, evaluación (test) 54**, con documentos, formas y preguntas disjuntos.
  Casos: dato único, dos fuentes que coinciden (también validada+pendiente), dos fuentes que difieren,
  validada frente a pendiente, solo pendiente, dos pendientes en desacuerdo, dato ausente, ambiguas, fuera del corpus.
  El estado «validada/pendiente» es **simulado** y solo lo usa el experimento.
- Protocolo: parámetros elegidos **solo con dev** (mínimo de errores totales, empates → valor central),
  congelados y medidos **una vez** en test. Las cifras de dev son optimistas.
- Recuperación común: híbrida bge-m3 + BM25 exacto (config. de la etapa 5, sin reajustar); pool de 8 candidatos.
  En dev, el soporte estaba en el pool en 34/34 preguntas y en el recuperador S0 en 30/34.
- Modelos (locales): QA `deepset/xlm-roberta-base-squad2` (CC-BY-4.0, 1,1 GB) con margen
  `mejor_span − nulo`; reranker `BAAI/bge-reranker-v2-m3` (Apache-2.0, 2,3 GB). torch 2.15 CPU,
  transformers 5.22. El QA es extractivo: el span es siempre subcadena del fragmento (verificado con `assert`).
- Sistemas: S0 híbrida · S1 +reranker · S2 +QA · S3 +reranker+QA · S4 +QA+puerta léxica de oración · S5 todo.
  Detección de conflictos (`conflict.py`): spans distintos entre documentos → `conflict`; si solo un grupo
  tiene fuente validada → `conflict_by_status` (se propone la validada y se señala el conflicto).

## Resultados **medidos** en TEST (54 preguntas: 24 respondibles, 16 sin respuesta, 8 conflicto, 6 conflicto con validada)
| Sistema | Correctas /24 | Falsas abstenciones | Erróneas | Falsos conflictos | **Respuestas falsas /16** (IC 95 %) | Conflicto detectado /8 (certeza falsa) | Conflicto con validada: detectado /6 (resuelto, certeza falsa) | Citas precisas /38 | ms verificación/pregunta |
|---|---|---|---|---|---|---|---|---|---|
| S0 híbrida | 22 | 2 | 0 | 0 | 5 (14–56 %) | 0 (8) | 0 (0, 6) | 34 | 0 |
| S1 +reranker | 21 | 3 | 0 | 0 | **1** (1–28 %) | 0 (7) | 0 (0, 6) | 34 | ~3 500 |
| S2 +QA | 11 | 11 | 2 | 0 | **1** (1–28 %) | 3 (1) | 5 (5, 1) | 23 | ~245 |
| S3 +reranker+QA | 15 | 2 | 4 | 3 | 3 (7–43 %) | **7** (1) | **6** (5, 0) | 31 | ~3 800 |
| S4 +QA+puerta | 11 | 12 | 1 | 0 | 1 (1–28 %) | 3 (1) | 4 (4, 1) | 21 | ~245 |
| S5 todo | 17 | 5 | 1 | 1 | 3 (7–43 %) | 7 (1) | 5 (5, 0) | 32 | ~3 800 |

Parámetros (dev): S1 τ_reranker 0,1 · S2 margen QA ≥ 2 · S3 τ_reranker 0,01 y margen ≥ −2 · S5 igual + puerta (θ 3).
Latencia: CPU de 10 hilos, sin GPU; el reranker puntúa los 8 candidatos (≈0,4 s por par) y domina el costo; QA 0,2–0,5 s por fragmento.
Memoria: ≈2,3 GB de RSS con ambos modelos cargados (medido en una prueba de humo). Resultados completos: `experiments/results/`.
Intervalos de confianza muy anchos: n = 16.

## Lectura (medido)
- **Reranker (S0→S1):** baja las respuestas falsas de 5/16 a 1/16 y elimina las 2 citas irrelevantes (S0: 2 preguntas con cita irrelevante, S1: 0),
  a costa de 1 falsa abstención más. No detecta conflictos. Un mejor ranking **no** demuestra que la pregunta esté respondida: S1 sigue
  respondiendo 7 de 8 conflictos con certeza falsa y «saluda al anochecer» con evidencia de otro dato.
- **QA extractivo (S2):** reduce respuestas falsas (5→1) y **detecta conflictos** (3/8; 5/6 con fuente validada), pero rechaza casi la mitad
  de las preguntas legítimas (11/24 correctas): spans mal delimitados (`ficticio` en vez de `-ra`; `ulven` en vez de `la cima de Ulven`)
  y márgenes bajos en formas cortas.
- **Reranker + QA (S3):** el mejor en contradicciones (7/8 y 6/6, certeza falsa 1 y 0) y en respuestas correctas (15/24), pero vuelve
  a 3/16 respuestas falsas y genera **3 falsos conflictos** por spans con ruido que se interpretan como datos distintos.
- **Puerta léxica de oración (S4/S5):** no mejora; en S4 empeora las falsas abstenciones (12). No se recomienda.
- **Generalización dev→test:** S3 pasó de 19/22 (dev) a 15/24 (test) correctas; S2 de 15/22 a 11/24. El umbral del QA es inestable con
  este tamaño de muestra.

## Casos de error que siguen sin resolverse (test)
- Dato ausente respondido: `test-10-2` «saludo al anochecer» → S2 devuelve `nuko` (el saludo de la tarde, dato vecino) con margen ≥ 2;
  S3: `test-07-1` «numeral para veinte» → `galu` (valor de «trece»). El QA extrae el vecino con confianza: el margen no distingue
  «dato vecino» de «dato pedido».
- Conflictos con certeza falsa: S2 en `test-04-2` (trece → `galu`, la versión pendiente) y `test-18-2` (aumentativo → `ficticio`); S3 en `test-18-1` (aumentativo → `ficticio`). El QA devolvió un span erróneo como valor único.
  
- Falsos conflictos (S3): `test-08-2`, `test-17-2`, `test-00-1`: spans distintos por delimitación, no por desacuerdo real.
- Polisemia (`test-24-2`): el span `humo" y "sombra` contiene ambos sentidos; el juez estricto lo marca como erróneo (cuestión de criterio de evaluación).

## Comportamiento ante contradicciones
Solo S2–S5 las detectan. Cuando hay una fuente validada y otra pendiente, S3 lo resolvió y señaló en 5/6 casos (y detectó 6/6),
mostrando ambas versiones. Para dos fuentes sin base para decidir (`conflict`), lo detectó en 7/8 con 1 certeza falsa.
No se presenta una versión como cierta sin señalar el desacuerdo en esos casos, pero **el resultado depende de que el span extraído
sea correcto**, y no lo fue en todos.

## Limitaciones
Corpus ficticio, pequeño y en español; ajuste y evaluación comparten plantillas de frases (no son corpus independientes); estado
validada/pendiente simulado; criterio de juez estricto; IC muy anchos; ninguno de los modelos conoce lenguas indígenas; no se probó NLI
ni un LLM juez; latencia medida en CPU con un solo proceso.

## Recomendación (hipótesis, no resultado)
Merece una **siguiente prueba S3 con mejoras de extracción**, no una adopción: (1) delimitar mejor el span (devolver la oración o el
tramo entre comillas y comparar contra el fragmento, no solo el span del modelo), (2) calibrar el umbral con un conjunto de ajuste
mayor y documentos reales autorizados, (3) añadir una prueba de «¿el dato vecino contesta?» (p. ej. NLI sobre la oración candidata).
Si solo importa reducir citas irrelevantes y respuestas falsas con bajo riesgo, **S1 (reranker)** es la mejora más barata de probar,
sabiendo que no detecta contradicciones. No se adopta ningún modelo.

Reproducir: `C:\nawiexp\Scripts\python -X utf8 -m experiments.verification.precompute dev|test` y luego
`... -m experiments.verification.run` (ver `requirements-experiments.txt`).
