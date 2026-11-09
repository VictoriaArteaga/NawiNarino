# Paquete de revisión humana — Borman (1976), sección castellano→cofán (PDF pp. 84–121)

**Estado: material local, no indexable, pendiente de permisos (SIL) y de revisión especializada.** No está integrado al RAG ni hay índice. Las imágenes y el texto proceden de una obra con derechos reservados: no compartir fuera del equipo.

La base provisional es el OCR actual (Tesseract 5.4.0, `spa`, 300 dpi). Los scripts **no ejecutan OCR**; renderizan las páginas del PDF original solo como apoyo visual. Nada del OCR existente se modificó ni se sustituyó ningún carácter.

## Archivos
| Archivo | Para qué |
|---|---|
| `index.html` | Vista de revisión: imagen de la página junto al OCR numerado por línea y la tabla de elementos a revisar |
| `review_items.csv` | Hoja de trabajo (UTF-8 con BOM, abre en Excel): una fila por elemento, con columnas vacías para la decisión |
| `review_items.jsonl` | Lo mismo con todos los campos (contexto, ubicación, preguntas) |
| `pages_summary.json` | Resumen por página y estadísticas del paquete |
| `pages/pNNNN.png` | Render del PDF original a 130 dpi |
| `../../scripts/build_review_package.py` | Genera todo lo anterior (sin OCR) |

## Contenido
- 38 páginas (PDF 84–121), **262 elementos**: 178 de prioridad 1, 39 de prioridad 2 y 45 de prioridad 3.
- Solo las pp. **95, 102 y 118** tienen las tres lecturas (OCR actual, `thick600`, `spaeng300`). En las otras 35 páginas hay una sola lectura y la prioridad sale únicamente de reglas heurísticas.

## Tipos de elemento y prioridad
| Prioridad | Tipo | Qué marca | N |
|---|---|---|---|
| 1 | `discrepancia` | Las tres lecturas difieren (solo pp. 95, 102, 118) | 44 |
| 1 | `exclam_en_palabra` | `!` o `\|` dentro de una palabra (posible marca glotal mal leída); incluye las marcas dobles (`!'`, `'!`) | 134 |
| 2 | `l_en_forma_cofan` | `l` dentro de una palabra con forma de cofán (la `l` no figura en el alfabeto del libro) | 22 |
| 2 | `latin_y_v` | Nombre latino (cursiva) con `y` o `v` | 12 |
| 2 | `digito_o_simbolo_en_palabra`, `n_sin_enie`, `letra_inicial_ausente` | Dígitos dentro de palabras; terminación `-ene/-ane…` en forma cofán (¿`ñ` perdida?); cabecera que empieza sin su letra inicial | 3 + 1 + 1 |
| 3 | `grupo_tildes` | Por página: lista de las palabras con tilde, diéresis o `ñ` que dejó el OCR | 38 |
| 3 | `ruido_ilustracion`, `guion_fin_de_linea` | Líneas muy cortas (posible ilustración) y guiones de fin de línea | 6 + 1 |

Cuando una palabra cae en varias reglas, hay **un solo elemento** con `also_flagged_as`. Cuando cae dentro de una discrepancia, las marcas sistemáticas se agregan a ese elemento.

## Ubicación de cada elemento
`page_pdf` (número de página del PDF), `page_printed_derived` (página impresa = PDF − 8; el OCR confirma el número en 34 de 38 páginas, y no en las pp. 84, 86, 104 y 114), `header_range` (la cabecera «adorno — al revés»), `line_in_ocr_page` y `token_position_in_line` (sobre el texto OCR de la página, columna izquierda y luego derecha) y las líneas de contexto. **No hay coordenadas**: el OCR existente solo guarda texto y no se podía volver a ejecutar. En `index.html` el OCR va numerado por línea junto a la imagen.

## Verificable a simple vista y lo que requiere especialistas
Cada elemento tiene dos pasos:
1. **`step1_visual_question`** — se resuelve comparando con la imagen: ¿qué carácter se imprime (marca vertical, `l`, `ñ`/`n`, `y`/`v`, tilde), ¿una palabra o dos? Lo hace un revisor con el PDF, aunque no sepa cofán.
2. **`step2_specialist_question`** (solo cuando existe, 110 elementos) — requiere interpretación y **no** se puede decidir mirando la imagen:
   - si la imagen muestra una `l` real: ¿es un préstamo del español o una errata del libro?;
   - qué indican las tildes escritas en las entradas (el libro no lo explica en las páginas leídas);
   - si una variación en la forma o posición de la marca impresa distingue algo;
   - la ortografía de los nombres científicos (aquí basta un especialista en taxonomía, no necesariamente cofán).
Preguntas generales para hablantes y especialistas: `expert_questions.md`.

## Cómo registrar la decisión
Se anota en `review_items.csv` (o en el campo `reviewer` del JSONL), **nunca en el texto OCR**:
- `reviewer_decision`: `confirmed_ocr_correct` · `transcription_corrected` · `printed_form_unclear` · `needs_specialist` · `not_an_error`
- `printed_form_as_seen`: la forma tal como se imprime, copiada literalmente (si se corrige);
- `reviewer_notes`, `reviewer_id`, `date`.
Una corrección de transcripción no equivale a validación lingüística: eso es un paso posterior con hablantes.

## Primera tanda de revisión (PDF pp. 95, 102 y 118) — `batch_01/`

**Estado: preparada, sin revisar.** Los 56 elementos están en `doc_status = pending` y `ling_validation_status = not_validated`; ninguno está validado lingüísticamente. Material local, no indexable, no integrado al RAG.

| Archivo (`batch_01/`) | Contenido |
|---|---|
| `index.html` | Por página: imagen original, OCR actual y las lecturas `thick600` y `spaeng300` lado a lado (líneas del paquete resaltadas), y dos tablas: **A. decisiones documentales** y **B. cuestiones que requieren hablantes o especialistas** |
| `items_batch01.csv` / `.jsonl` | Hoja de trabajo con los 56 elementos y los campos de decisión de ambas vías |
| `linguistic_queue.csv` | Solo los 15 elementos que necesitan conocimiento lingüístico |
| `instructions_documental.md` | Instrucciones breves para el revisor documental |
| `instructions_linguistic.md` | Instrucciones breves para hablantes y especialistas |
| `batch_manifest.json` | Recuento, valores permitidos y reglas |
| `../../../scripts/build_batch01.py` | Genera todo lo anterior. Solo lee; no modifica imágenes, PDF ni OCR |

### Contenido
- **56 elementos:** p. 95 (17), p. 102 (16), p. 118 (23). Son 44 discrepancias entre lecturas, 3 listas de tildes y `ñ`, 3 listas de comprobación de página completa, 1 nombre latino y 5 pares de formas parecidas separadas por coma.
- Los elementos del paquete general se copian sin cambios; los 3 de lista de página y los 5 pares son nuevos.
- No se muestran las transcripciones de trabajo del asistente (`ocr/experiments/ground_truth/`) para no condicionar a los revisores; además no están validadas por nadie.

### Dos vías separadas
| | Vía documental | Vía lingüística |
|---|---|---|
| Quién | Cualquier revisor con el PDF; no hace falta saber cofán | Hablantes cofán; un especialista en taxonomía para el nombre científico |
| Qué decide | Qué se imprime: carácter (marca vertical, `l`, `ñ`/`n`, `y`/`v`), tilde, palabra partida, omisiones, cabecera, número de página | Significado, variantes, préstamos, errata del libro, ortografía científica |
| Campos | `doc_status`, `doc_decision`, `doc_printed_form_as_seen`, `doc_justification`, `doc_reviewer_id`, `doc_date` | `ling_validation_status`, `ling_decision`, `ling_justification`, `ling_reviewer_id`, `ling_reviewer_role`, `ling_date` |
| Vocabulario | `confirmed_ocr_correct`, `transcription_corrected`, `printed_form_unclear`, `not_an_error`, `omissions_found`, `no_omissions_found`, `cannot_determine` | `confirmed_form`, `corrected_form`, `variant_noted`, `loanword`, `misprint_in_book`, `cannot_determine`, `refer_to_community` |

**Reglas:** (1) una decisión documental **no** cambia `ling_validation_status`; (2) ese estado solo lo cambia un hablante o especialista (`validated_by_speaker`, `validated_by_specialist`, `disputed`); (3) las correcciones se anotan en los campos de decisión, nunca en el texto OCR; (4) el estado de la vía documental es `pending` → `in_review` → `done` (o `disputed`).

### Elementos que no se resuelven sin conocimiento lingüístico (15)
| Tipo | N | Pregunta | ¿Cuándo? |
|---|---|---|---|
| `grupo_tildes` (una por página) | 3 | ¿Qué indican las tildes escritas en las entradas? El libro no lo explica | Siempre |
| `pares_de_formas_parecidas` | 5 | ¿Son variantes dialectales, de escritura u otra relación? (p. ej. el libro imprime dos formas separadas por coma con ortografía parecida) | Siempre |
| `latin_y_v` | 1 | Ortografía del nombre científico (especialista en taxonomía, no necesariamente cofán) | Tras fijar qué se imprime |
| Discrepancia con `l_en_forma_cofan` | 1 | Si la imagen muestra una `l` real: ¿préstamo o errata? | Solo si se confirma la `l` |
| Discrepancia con `marca_doble_o_variante` | 5 | Si la marca impresa varía de forma o posición: ¿distingue algo? | Solo si se confirma la variación |

### Procedimiento
1. **Coordinación:** asignar páginas y roles; confirmar con la comunidad quién y cómo participa; recordar que el material es local y que revisar no autoriza reproducirlo (SIL, comunidades).
2. **Revisión documental** (`instructions_documental.md`): empezar por la lista de página completa; después cada elemento; registrar en `items_batch01.csv`.
3. **Derivación:** los elementos condicionales pasan a `linguistic_queue.csv` solo si la revisión documental confirma la condición; los demás pasan siempre.
4. **Revisión lingüística** (`instructions_linguistic.md`): sobre lo que se imprime realmente (resultado documental), no sobre el OCR.
5. **Cierre de la tanda:** conservar las hojas con sus fechas y responsables; no editar el OCR ni el PDF; informar de los elementos `disputed` o `refer_to_community`.

### Límites de esta tanda
- Las reglas del paquete cubrieron 25 de 27 lecturas erróneas conocidas en estas tres páginas; las otras dos (una tilde perdida y una palabra partida) **no tienen elemento propio** y solo las detecta la lectura completa de página. De ahí que `lectura_completa_de_pagina` sea el primer paso.
- La detección de pares de formas parecidas (5) no es exhaustiva: se basa en la ortografía del OCR y puede omitir pares o incluir falsos pares.
- Esta tanda no mide nada sobre las otras 35 páginas de la sección.
- Una revisión documental completa **no convierte el texto en fuente validada ni autoriza** su reproducción, publicación o indexación.

## Limitaciones
1. **Las coincidencias entre lecturas no validan nada.** Las tres lecturas comparten sus errores sistemáticos (`a'i` → «ali», `ñ` → `n`, `y` → `v` en cursiva).
2. **Las reglas son heurísticas y su cobertura solo se mide en 3 páginas.** En las pp. 95, 102 y 118 (27 lecturas distintas de la referencia manual), las reglas solas detectan 19 (70 %), la discrepancia entre lecturas 25 (93 %) y juntas también 25. Quedaron fuera `ítsaye` → «itsaye» (tilde perdida) y la palabra partida «noe». **Sesgo:** las reglas se diseñaron mirando esos mismos errores, así que no es una medición independiente. En las otras 35 páginas el recall es desconocido.
3. **No se pueden detectar tildes, ñ o palabras que el OCR eliminó**; `grupo_tildes` solo lista las presentes. Tampoco se detectan entradas o líneas **omitidas** por el OCR: hace falta una lectura completa de cada página contra la imagen, no solo de los elementos marcados.
4. **No se distingue el lado español del cofán** (se pierde la negrita). Por eso `l` y las tildes se marcan por forma, y habrá falsos positivos y falsos negativos.
5. La regla de palabras partidas (`palabra_partida_posible`) **no marcó ningún caso** en estas páginas, aunque se conocen ejemplos (`fue'ngatssi`, `noe'ngeye`, p. 102 y 118): en esas páginas solo los revelan las discrepancias entre lecturas. La regla `n_sin_enie` casi no dispara (1 caso) y `latin_y_v` es conservadora: el recall de `ñ`→`n` y de `y`→`v` es probablemente bajo.
6. 134 elementos son `!` dentro de palabra: son muchos y repetitivos; se pueden revisar por lotes en la imagen, pero no se debe sustituir el `!` automáticamente.
7. La ortografía es la de 1976; puede no coincidir con la actual. Decidir si se actualiza o se conserva corresponde a los hablantes.
8. Hay una entrada que el libro imprime dos veces («tapa picco'cho», p. 118): se reproduce tal cual está impresa.
