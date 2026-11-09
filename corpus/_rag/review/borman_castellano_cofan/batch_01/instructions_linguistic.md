# Instrucciones — hablantes cofán y especialistas (tanda 1: PDF pp. 95, 102, 118)

**Quién:** hablantes de A'ingae (cofán) y, para el nombre científico, un especialista en taxonomía. Su participación es voluntaria; la comunidad decide si participa y en qué condiciones.
**Qué decides:** lo que **no** se resuelve mirando la imagen: significado, variantes, préstamos, errata del libro. Material local, no indexable; revisar no autoriza reproducir ni publicar la obra (SIL; faltan permisos de SIL y de las comunidades).

## Cómo trabajar
1. Trabaja con `linguistic_queue.csv` (15 elementos). Cada fila trae la imagen de la página (`../pages/pNNNN.png`), la línea del OCR, la lectura de las tres configuraciones y la pregunta.
2. Antes de responder, mira el resultado de la revisión documental (`doc_decision`, `doc_printed_form_as_seen`). Si esa parte sigue `pending`, pide que se haga primero: tu respuesta debe partir de lo que realmente se imprime, no de una lectura del OCR.
3. Para cada fila rellena:
   - `ling_decision`: `confirmed_form` · `corrected_form` · `variant_noted` · `loanword` · `misprint_in_book` · `cannot_determine` · `refer_to_community`
   - `ling_justification`: en tus palabras, con el fundamento (conocimiento de la lengua, uso actual, consulta a otras personas). Si corriges una forma, escríbela aquí; **no** se modifica el texto OCR.
   - `ling_validation_status`: `validated_by_speaker` · `validated_by_specialist` · `disputed` (si hay desacuerdo entre personas) · o déjalo en `not_validated`.
   - `ling_reviewer_id`, `ling_reviewer_role` (hablante / especialista y de qué), `ling_date`.

## Qué sí y qué no
- **Sí:** decir lo que sabes y lo que no. `cannot_determine` y `refer_to_community` son respuestas válidas.
- **No:** inventar ni completar formas por analogía; validar algo que solo parece correcto.
- Las preguntas de esta tanda: (a) qué indican las tildes escritas en las entradas; (b) si una `l` impresa en una palabra cofán es préstamo o errata; (c) si una variación en la marca impresa distingue algo; (d) si las formas separadas por coma son variantes; (e) la ortografía de un nombre científico (especialista en taxonomía).
- La ortografía de 1976 puede diferir de la actual. Decidir si se actualiza o se conserva le corresponde a la comunidad.
- Tu respuesta **no autoriza** por sí sola el uso del material fuera del equipo; eso requiere el permiso de SIL y de las autoridades de la comunidad.
