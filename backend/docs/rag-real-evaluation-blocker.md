# Evaluación del RAG con documentación real: estado y procedimiento

> **Actualización:** el responsable del proyecto habilitó el corpus real **solo para la demostración local** y dio por aprobada la revisión lingüística humana (estado `project_approved`, que NO equivale a validación de hablantes) (ver [`corpus-real-demo.md`](corpus-real-demo.md)). Eso NO equivale a los permisos de los titulares ni de las comunidades, que siguen pendientes, y la **evaluación con preguntas validadas sigue sin hacerse**; el análisis de abajo sobre permisos y procedimiento sigue vigente.

## Estado: BLOQUEADA — no hay autorización escrita para ningún documento real

Medido hoy (`python -m scripts.rag_authorization_check` → código de salida 1):
- 32 documentos en `corpus/_rag/documents.json`; **0** con autorización de indexación; **0** entradas en
  `rag_data/real/authorizations.json`. El registro de fuentes (`corpus/sources.md`) dice expresamente que antes
  de ingerir en el RAG hay que confirmar con la institución, y que los textos indígenas pueden tener
  restricciones culturales (propiedad intelectual colectiva).
- Por tanto **no se indexó, extrajo ni evaluó ningún documento real**, y los corpus sintéticos no se
  presentan como evidencia de rendimiento real.

### Candidatos revisados
| Documento | Acceso registrado | Calidad de texto | Autorización que falta | Observación |
|---|---|---|---|---|
| `unipa_alfabeto-awa` (candidato propuesto) | `community_permission_required`; licencia «No especificada» | 1 página, 72 palabras, columnas mezcladas; requiere revisión manual contra la imagen | Permiso escrito de UNIPA (y MEN/Colombia Aprende como publicador) para indexar, evaluar y citar extractos; validación lingüística por una persona awapit | **Candidato técnicamente débil:** una sola lámina da un conjunto de evaluación diminuto y el texto extraído no es fiable |
| Resto de materiales UNIPA (diccionario, guía, PEC, conjugaciones) | `community_permission_required` | A–B (149, 40, 152 y 132 págs.) | Mismo permiso | Más útiles para evaluar; mismo bloqueo |
| `fischer-hengeveld_open-linguistics_operators_2018` | `open_with_conditions`; **CC BY-NC-ND** declarada | B, 29 págs. | Confirmación (editorial/autores) de que fragmentar, indexar y citar extractos en un sistema no comercial es compatible con «sin obras derivadas» | Una licencia abierta **no equivale** a autorización escrita de indexación; no es decisión técnica |
| `fischer-hengeveld_aingae-handbook-chapter-2023` | `open_with_conditions` (art. 25fa, ley neerlandesa) | B, 61 págs. | Confirmar condiciones del art. 25fa | Uso limitado; confirmar antes de redistribuir |
| Borman 1976 | Bloqueado | — | — | Excluido por decisión del proyecto (OCR y permisos) |

### Qué autorización se necesita (por documento)
Un documento escrito y archivado del titular de derechos o de su representante que cubra, como mínimo:
1. **Indexación** (extraer, fragmentar y guardar texto y vectores localmente),
2. **Evaluación** (usar preguntas y respuestas derivadas),
3. **Cita de extractos** literales en las respuestas (con documento y página),
4. condiciones (no comercial, atribución, vigencia, si el índice puede salir del equipo),
5. y, para contenido de comunidades, el consentimiento de la autoridad comunitaria correspondiente.
Además, una **persona competente en la lengua** debe validar las respuestas esperadas (ver abajo).

Recomendación de orden de gestión: (1) UNIPA/MEN, **solicitud conjunta de varios materiales** (el alfabeto sirve
de piloto, pero no basta para evaluar); (2) consulta a la editorial/autores de Fischer & Hengeveld, la vía
probablemente más rápida por ser acceso abierto, con la pregunta concreta sobre indexación y citas.

## Procedimiento listo para cuando haya autorización
1. **Registrar la autorización** en `backend/rag_data/real/authorizations.json` (campos en
   `scripts/rag_authorization_check.py`: `document_id`, `authorizer`, `written_reference`, `date`, `scope` ⊇
   {indexing, evaluation, quoting_excerpts}, opcionalmente `conditions` y `validator`). Archivar el documento de
   autorización fuera del repositorio si contiene datos personales, y referenciarlo en `written_reference`.
2. **Verificar:** `python -m scripts.rag_authorization_check` debe listar el documento como HABILITADO.
   `require_cleared(...)` debe llamarse antes de leer cualquier PDF real. Borman nunca se habilita.
3. **Corpus de evaluación:** crear `rag_data/real/manifest.json` solo con documentos habilitados
   (`access_level` real, `indexing_authorized: true`, `authorization_ref` = `written_reference`,
   `validation_status: pending_validation` hasta que valide una persona competente). Los PDF originales no se
   tocan. Extraer con `pdftotext` (trazabilidad documento + página, como en `corpus/_rag`); revisar a mano la
   calidad de texto de las páginas usadas (formas awapit y diacríticos) **contra la imagen** y excluir las
   dudosas. No completar ni corregir contenido lingüístico. Etiquetar con `[[editorial]]` etc. lo no indexable.
4. **Preguntas** en `rag_data/real/questions.json` con este esquema (cada respuesta con evidencia verbatim):
   `id`, `category`, `q`, `behavior` (`answer` | `abstain` | `clarify_or_abstain`), `expected` (valor literal o
   null), `evidence` {`document_id`, `pdf_page`, `quote` literal}, `validator` {`name_role`, `date`, `status`},
   `split` (`dev` | `test`). La cita debe aparecer literalmente en la página extraída (comprobación automática
   solo para documentos habilitados).
5. **Evaluación:** sistemas **S0** (híbrida bge-m3 + BM25 exacto) y **S1** (S0 + reranker `BAAI/bge-reranker-v2-m3`),
   con los parámetros de la etapa 6 congelados (`τ_reranker` 0,1; recuperación de la etapa 5). Mismos documentos y
   preguntas para ambos. Ejecutar una sola vez sobre `test`.

## Diseño de la evaluación (preguntas)
| Categoría | Qué prueba | Ejemplo de forma (sin contenido real) |
|---|---|---|
| `explicit` | Dato literal presente en el documento | «¿Qué dice el documento sobre X?» con cita textual |
| `absent` | Tema documentado, dato no documentado | Pedir un dato que el documento no contiene |
| `ambiguous` | Pregunta sin referente o con varios sentidos | «¿Cómo se dice?» |
| `distinction` | Pares que difieren en un diacrítico, vocal o apóstrofo; letras que se confunden | Forma con y sin marca, validadas por hablante |
| `out_of_corpus` | Fuera del alcance | Preguntas de cultura general o de otra lengua |

Las respuestas esperadas solo valen con evidencia verbatim y, para lo que dependa de la lengua, validación
de una persona competente; sin esa validación la pregunta no se usa.

## Métricas
Respuestas correctas (la primera cita contiene el dato esperado) y falsas (respondió algo sin evidencia o con
dato incorrecto); abstenciones correctas y falsas; pertinencia de citas (precisas, con irrelevantes, completas);
latencia por pregunta y memoria. Conteos con intervalos de Wilson (`experiments/verification/judge.py`).
Se informan casos de error, no solo agregados.

## Qué NO se puede afirmar todavía
- **Medido:** el bloqueo, y que la compuerta y el esquema funcionan (106 pruebas del backend pasan,
  7 nuevas en `tests/test_real_corpus_gate.py`).
- **Hipótesis, sin evidencia real:** que los umbrales de la etapa 6 (calibrados con corpus sintético) se
  transfieran a documentos reales; que el reranker reduzca citas irrelevantes en documentos reales como en el
  sintético; que bge-m3 y el reranker manejen formas awapit (ningún modelo se entrenó con la lengua). Hará falta
  una partición `dev` real aparte si hubiera que reajustar.
- **Limitaciones previsibles:** una sola lámina (alfabeto) no sostiene una evaluación; OCR/columnas; criterio
  de validación lingüística; derechos y consentimiento comunitario.

## Recomendación técnica
No avanzar con datos reales. Con las dos gestiones de arriba: (1) pedir a UNIPA/MEN la autorización conjunta de
varios materiales y no solo del alfabeto, con validación de una persona awapit; (2) consultar la compatibilidad
de la licencia CC BY-NC-ND con indexación y citas en el caso de Fischer & Hengeveld. Cuando exista la primera
autorización, ejecutar el procedimiento anterior; **S1 (reranker)** es el único prototipo con evidencia sintética de
reducir respuestas falsas a bajo riesgo, pero no detecta contradicciones y se debe medir con datos reales antes de
cualquier decisión. No se cambia nada en producción (`/explorer/ask`, umbrales y `app/` quedan intactos).
