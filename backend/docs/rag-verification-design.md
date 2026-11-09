# Diseño experimental: verificar que la evidencia contiene el dato solicitado

**Estado: solo diseño + línea base medida. No hay verificador implementado, no se agregó ningún
LLM al endpoint y el problema de las respuestas falsas NO está resuelto.**

## 1. Problema
El recuperador devuelve fragmentos *relacionados* con la pregunta, no necesariamente fragmentos que
*contengan el dato*. Ejemplo medido: «¿Cómo se dice cuatro en la Lengua de Verificación?» recibe una
respuesta con citas del tema, aunque el corpus no tiene el numeral cuatro. En la evaluación de la
etapa 4, ningún umbral de similitud, solapamiento ni cobertura lo corrigió sin rechazar preguntas
legítimas (13–15 de 25 como mínimo).

## 2. Conjunto de datos (implementado)
`rag_data/synthetic_verification/` (**ficticio**) + `rag_data/eval/questions_verification.json`
(15 preguntas). Las Guías A y B se contradicen a propósito: el numeral para tres es `"mora"` (A) y
`"mura"` (B).

| Categoría | n | Comportamiento correcto |
|---|---|---|
| `answerable` | 3 | Responder citando una página que contiene el dato |
| `topic_no_datum` | 4 | **Abstenerse** (el tema está, el dato no) |
| `ambiguous` | 3 | `answer_all` (varios sentidos: citar todos) o `clarify_or_abstain` (sin contenido) |
| `contradictory` | 2 | Citar **todas** las fuentes en disputa y **señalar la contradicción** (o abstenerse); nunca elegir una en silencio |
| `must_abstain` | 3 | Abstenerse (fuera del corpus, incluida una instrucción inyectada) |

### Línea base **medida** (pipeline actual, sin verificador)
`python -m scripts.rag_verify_baseline -v`

| Categoría | Correctas hoy |
|---|---|
| answerable | 3/3 |
| topic_no_datum | **0/4** (responde con citas del tema) |
| ambiguous | 3/3 |
| contradictory | **0/2** (cita ambas fuentes 2/2, pero señala la contradicción 0/2) |
| must_abstain | 3/3 |

Confirma, en un segundo corpus, el hallazgo de la etapa 4. Limitaciones del conjunto: 15 preguntas,
todas en español, corpus de 3 fragmentos.

## 3. Alternativas de verificación a evaluar (sin implementar)
Las licencias se contrastaron con las fichas públicas (resultados de búsqueda); **verificar el texto
de la licencia antes de adoptar**.

| Alternativa | Qué haría | Candidatos | Licencia (ficha) | Notas |
|---|---|---|---|---|
| **QA extractivo con «sin respuesta»** | Extrae el tramo que responde; si no hay, señala ausencia | `deepset/xlm-roberta-base-squad2` (multilingüe, SQuAD 2.0) | CC-BY-4.0 | Natural para «¿está el dato?». La versión `…-distilled` es MIT. No se confirmó su manejo de «sin respuesta» en español |
| **NLI** (¿el fragmento implica la afirmación?) | Premisa = fragmento; hipótesis = afirmación candidata | `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` | MIT (según listados) | Necesita convertir pregunta+respuesta en afirmación; su entrenamiento usó traducción automática. Débil con formas indígenas (no las vio) |
| **Reranker cross-encoder** como medida de «suficiencia» | Puntúa pregunta+fragmento con atención conjunta | `BAAI/bge-reranker-v2-m3` | Apache-2.0 (según etiquetas) | Mide relevancia, no presencia del dato: *hipótesis* de que separe mejor que el coseno; hay que probarlo |
| **LLM local como juez** (solo evaluación) | Etiquetar «respondible / no» sobre el contexto | Modelos locales vía Ollama | Según modelo | Fuera del endpoint; útil para estimar techo y apoyar el etiquetado humano, **no** para decidir en producción |
| **Verificación determinista** | Toda forma citada debe aparecer literalmente en el fragmento; la pregunta por un término debe encontrarlo en el texto | Sin modelo | n/a | Ya se cumple en la respuesta extractiva; es una puerta barata y complementaria, no sustituye a las anteriores |

**Limitación común (hecho, no hipótesis):** ninguno de esos modelos se entrenó con awapit, nasa yuwe,
inga ni cofán. Verificarán bien el texto explicativo en español/inglés, pero no el contenido en la
lengua indígena; por eso la puerta léxica exacta debe acompañarlos.

## 4. Protocolo experimental propuesto
1. **Etiquetado:** cada pregunta lleva `behavior` y `support` (ya hecho). Con documentos reales
   autorizados: dos anotadores independientes por pregunta y acuerdo (κ de Cohen) antes de usarlas.
2. **Particiones:** conjunto de **ajuste** (elegir umbrales) y de **prueba** (reportar), separados.
   Las suites actuales son tan pequeñas que se usaron para ambas cosas; no vale como evidencia final.
3. **Condiciones:** (0) pipeline actual; (1) +QA extractivo; (2) +NLI; (3) +reranker; (4) combinaciones
   (QA→NLI). Mismo recuperador y mismos documentos en todas.
4. **Métricas (conteos con intervalos de confianza, no solo %):**
   - tasa de respuesta no sustentada (preguntas que debían abstenerse y recibieron respuesta);
   - tasa de falsa abstención (preguntas respondibles rechazadas);
   - citas correctas (documento + página) y precisión de citas;
   - **señalamiento de contradicción** (citar todas las fuentes + marcar el conflicto);
   - separación de puntajes del verificador (AUROC entre respondibles y no respondibles);
   - latencia y memoria por pregunta.
5. **Criterio de éxito (a fijar antes de medir):** p. ej. cero respuestas no sustentadas en
   `must_abstain` y `topic_no_datum` con falsa abstención aceptable ≤ un umbral acordado con el equipo.
   Hoy no se fija un número: faltan datos reales para decidirlo.
6. **Ablaciones:** con/sin puerta léxica exacta; con/sin recuperación híbrida; umbral del verificador
   barrido en el conjunto de ajuste.
7. **Riesgos a medir expresamente:** falsas abstenciones en preguntas con la forma indígena exacta;
   desempeño en inglés→español (documentos en inglés); sensibilidad al orden de los fragmentos.

## 5. Decisiones pendientes
- Qué verificador probar primero (propuesta: QA extractivo `xlm-roberta-base-squad2` y reranker, por
  ser los que miden «¿está el dato?» sin generar texto).
- Cómo debe mostrarse un conflicto entre fuentes al usuario (hoy ni siquiera se detecta).
- Presupuesto de latencia/memoria aceptable en el servidor y en el dispositivo.
- Autorización escrita de documentos reales para crear el conjunto de prueba definitivo.
