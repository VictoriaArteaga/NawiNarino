# Instrucciones — revisor documental (tanda 1: PDF pp. 95, 102, 118)

**Quién:** cualquier persona cuidadosa con acceso al PDF o a las imágenes de `../pages/`. No hace falta saber cofán.
**Qué decides:** únicamente **qué se imprime** en la página. **No** decides si una forma es correcta en cofán.
Material local, no indexable. Revisar no autoriza reproducir ni publicar la obra (SIL; faltan permisos).

## Cómo trabajar
1. Abre `index.html` y la hoja `items_batch01.csv`. Trabaja una página a la vez.
2. Empieza por el elemento **`lectura_completa_de_pagina`**: compara toda la página con la imagen, columna por columna. Anota omisiones, repeticiones, orden de columnas, cabecera y número de página.
3. Sigue con los demás elementos de la vía documental (columna `track` = `documental` o `documental_y_linguistico`). Mira la imagen, no solo las lecturas: **que las tres lecturas coincidan no prueba nada.**
4. Para cada elemento rellena en el CSV:
   - `doc_decision`: `confirmed_ocr_correct` · `transcription_corrected` · `printed_form_unclear` · `not_an_error` · `omissions_found` / `no_omissions_found` (solo en la lista de página) · `cannot_determine`
   - `doc_printed_form_as_seen`: la forma **tal como se imprime**, copiada literalmente, solo si difiere del OCR (conserva tildes y `ñ`; la marca vertical elevada escríbela `'`; si no estás seguro de la marca, usa `printed_form_unclear`).
   - `doc_justification`: una línea con lo que viste (p. ej. «la imagen muestra una marca vertical, no `!`»).
   - `doc_reviewer_id`, `doc_date`, y `doc_status` (`in_review` → `done`; `disputed` si dos revisores discrepan).

## Qué sí y qué no
- **Sí:** decidir si un carácter impreso es una marca vertical, una `l`, una `ñ` o una `n`; si hay tilde; si una palabra está partida por el fin de línea o por un espacio impreso; si falta o sobra una línea.
- **No:** corregir el OCR, normalizar la ortografía, añadir tildes que no se imprimen, unir palabras sin mirar la imagen, ni «arreglar» una forma porque parezca más cofán.
- Si dudas entre dos lecturas, escribe `printed_form_unclear` y describe la duda. No elijas por intuición.
- **No cambies `ling_validation_status`**: tu decisión documental no valida nada lingüísticamente. Los elementos con `ling_needed` = `si` o `condicional` pasan después a la cola lingüística (`linguistic_queue.csv`).

## Cuándo deriva a la cola lingüística
- Elementos `condicional`: derivan **solo si** tu comprobación confirma la condición (p. ej. la imagen muestra una `l` real; la marca impresa varía de forma o posición). Anótalo en `doc_justification`.
- Elementos `si` (tildes, pares de formas parecidas, nombre científico): derivan siempre.
