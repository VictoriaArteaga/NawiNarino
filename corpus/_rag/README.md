# _rag — preparación del corpus para la fase RAG

Estado: **preparación de datos solamente**. No hay embeddings, índice vectorial ni modelo. Los originales en `corpus/<lengua>/` no se tocan.

## Archivos

| Archivo | Contenido | Generado por |
|---|---|---|
| `documents.json` | 32 documentos con clasificación y metadatos (curados a mano, `null` = no verificado) | `scripts/build_manifest.py` |
| `quality_report.json` | Calidad de extracción por documento (A–E) | `scripts/extract_text.py` |
| `text/<lengua>/*.pages.jsonl` | Texto por página tal como lo extrajo `pdftotext` (sin limpiar) | `scripts/extract_text.py` |
| `pages.jsonl` | 1 989 registros página + metadatos: entrada directa de la siguiente fase | `scripts/build_manifest.py` |
| `routing.json` | Qué documentos responden cada tipo de pregunta (vocabulario, gramática, cultura, territorio, historia) | `scripts/build_manifest.py` |
| `gaps.json` | Vacíos documentales por lengua | a mano |
| `pages_ocr.jsonl` | 328 registros de texto OCR (Borman 130 + Curnow 198), **separados** de `pages.jsonl`; con `text_status`, `ocr_mean_conf` e `index_readiness` | `scripts/build_manifest.py` |
| `ocr/unreviewed/` | Salida de Tesseract sin corregir (`ocr_unreviewed`) | `scripts/ocr_pages.py` |
| `ocr/validated/` | Páginas con transcripción verificada contra la imagen (hoy solo Curnow p. 78); la validación lingüística sigue pendiente | a mano |
| `ocr/ENVIRONMENT.md`, `ocr/evaluation.md` | Versiones y parámetros de OCR; evaluación manual y errores frecuentes | a mano |
| `ocr/experiments/report.md` | Ortografía del propio Borman (glotal, alfabeto) y pruebas de 11 configuraciones en 10 páginas y ampliación (sección 7) con métricas por tipo de contenido en 6 páginas con transcripción manual. Conclusión (secciones 7 y 8): la pasada con `thick600` **no** se ejecutó ni para el libro completo ni para la sección castellano→cofán (pp. 84-121), porque no cumplió los criterios fijados de antemano | `scripts/ocr_experiments.py`, `scripts/analyze_experiments.py` |
| `review/borman_castellano_cofan/` | Paquete de revisión humana de Borman, pp. 84-121 (262 elementos; hoja CSV, vista HTML con imágenes, preguntas para hablantes). Local, no indexable, sin integrar al RAG | `scripts/build_review_package.py` |
| `ocr/tessdata/` | Modelos `spa`, `eng`, `osd` (no versionar) | descarga |

Reproducir: `python -X utf8 scripts/extract_text.py && python -X utf8 scripts/build_manifest.py` (requiere `pdftotext`).

## Metadatos por fragmento (`pages.jsonl`)

`language`, `category`, `community`, `municipality`, `source`, `document`, `page`, `year`, `confidence`, `license`, `access_level`, más `chunk_id`, `document_id`, `institution`, `evidence_class`, `page_quality`.

- `page`: índice de página del PDF (1 = primera), **no** la numeración impresa. Hay que convertirla antes de citar.
- `category`: `linguistico` · `cultural_territorial` · `historico` · `sociolinguistico` · `referencia_bibliografica` · `sin_clasificar` (audios sin transcribir).
- `confidence`: `high` fuente primaria o académica con texto limpio · `medium` borrador, parcial o texto ruidoso · `low` bibliografía, propuesta técnica o contenido ilegible. Se baja a `medium` en páginas `noisy` y a `low` en páginas vacías.
- `access_level`: `open_with_conditions` (2) · `internal_use_only` (19) · `community_permission_required` (11). Ninguno está autorizado para publicación abierta.
- `municipality`: solo cuando el documento lo dice; si fue inferido, el valor lo indica entre corchetes.
- `language`: `nasa_yuwe`, `awapit`, `aingae`, `inga`, `pasto_quillasinga` (+ `language_code` ISO 639-3 en `documents.json`: pbb, kwi, con, inb; sin código para Pasto/Quillasinga).

## Separación de lo verificable (`evidence_class`)

| Clase | Uso permitido |
|---|---|
| `primary_linguistic_data`, `primary_linguistic_data_partial` | Citar como dato lingüístico (vocabulario, ejemplos), siempre con documento y página |
| `primary_linguistic_description`, `descriptive_linguistic_analysis` | Gramática y fonología; citar como análisis del autor |
| `draft_linguistic_analysis` | Solo con la advertencia «borrador» y fecha |
| `computational_linguistics_method`, `educational_guidance`, `sociolinguistic_*`, `community_self_description`, `official_characterization` | Contexto cultural, educativo y sociolingüístico; no son fuente de traducciones |
| `historical_*` (incluye `historical_hypothesis`) | Historia y territorio; toda afirmación sobre la lengua es hipótesis académica y se presenta como tal |
| `bibliographic_reference`, `technical_proposal` | Orientación y localización de fuentes; nunca evidencia |
| `community_text_untranslated`, `*_unread`, `audio_unverified` | **No** derivar vocabulario ni traducciones |

## Reglas para la siguiente fase

1. Filtrar por `access_level` antes de mostrar texto literal; las respuestas públicas no deben reproducir fragmentos de `internal_use_only` ni `community_permission_required`.
2. Excluir de la indexación las páginas `page_quality = empty` y los documentos con `ocr_action` `required` o `transcription_required` hasta resolverlo.
3. Curnow: sus 198 páginas ruidosas ya tienen OCR en `pages_ocr.jsonl`. Usar solo las de `index_readiness = prose_only_forms_unverified` (181) para explicaciones gramaticales, y `validated_transcription` (p. 78). Las formas awapit no son fiables sin contrastar con la imagen (ver `ocr/evaluation.md`).
3b. Borman: OCR hecho pero **`index_readiness = no`** en las 130 páginas (glotales y acentos mal leídos). No indexar como vocabulario.
4. Enrutar por pregunta con `routing.json`; si el tipo de pregunta solo tiene fuentes `supporting` o ninguna (p. ej. vocabulario nasa yuwe, inga, cofán, pasto), la respuesta correcta es «no hay fuente en el corpus».
5. Guardar la cita (`document`, `page`, `institution`, `year`, `source`) con cada fragmento recuperado.
6. Permisos pendientes antes de cualquier uso público: UNIPA/MEN, Cabildo Inga de Santiago, CRIC/PEBI, SIL, Living Tongues y los autores (ver `corpus/sources.md`).
