# Evidencia de respuesta: «tema presente, dato ausente» (corrección final)

## Problema
El recuperador devuelve fragmentos del mismo **tema** que la pregunta aunque no contengan el **dato** pedido, y la interfaz los
presentaba como respuesta. Casos de `demo-explorador.md`, medidos con ambos recuperadores (hashing e híbrido):
«¿Cómo se dice **dos** en la Lengua de Prueba?» (el numeral no existe), «¿Quién **fundó** el Valle Ficticio?» (no hay ese dato),
«¿De qué **color** es el río Imaginario?» (característica no documentada). El puntaje de recuperación no sirve para distinguirlos
(es alto: el tema coincide), por lo que no se usa como prueba de respuesta.

## Qué se probó (medido, fuera de `app/`: `experiments/verification/support_gate_analysis.py`)
Compuerta determinista de «soporte»: la respuesta se retiraría si algún término de contenido de la pregunta no aparece en los
fragmentos citados **ni en la metadata de su documento** (título y lengua). Variantes fijadas antes de medir: G1 (todos los términos),
G2 (G1 sin una lista cerrada de 11 palabras genéricas de pregunta: *significa, pasa, hace…*) y G3 (G2 con coincidencia por raíz).
Cinco conjuntos ficticios etiquetados (A 38, B 18, demo 13, dev 50, test 54 preguntas), ambos recuperadores:

| Recuperador | Respuestas correctas | Respuestas sin dato (falsas) | G2 corrige | **G2 retiraría respuestas correctas** |
|---|---|---|---|---|
| híbrido | 113 | 18 | 18 de 18 | **23 (20 %)** |
| hashing | 107 | 27 | 27 de 27 | **22 (21 %)** |
G1 empeora (retira 49–50 correctas); G3 no mejora a G2. Las correctas que se perderían son reformulaciones y sinónimos
(«¿En qué lugar tiene lugar la Fiesta…?», «¿Con qué expresión se saluda…?», «¿En qué orden pone el verbo…?», «festividad», «siembran»),
justo donde la recuperación híbrida aporta más. Sin contar la metadata del documento la pérdida era mucho mayor (63–68 casos).

## Decisión
**No se implementó una abstención**, porque descarta ~1 de cada 5 respuestas correctas con una regla léxica (criterio del encargo:
no usar reglas que perjudiquen respuestas correctas). Se implementó la alternativa más segura: **etiquetar** la evidencia con la misma señal.
- `app/rag/support.py`: `unmatched_terms(pregunta, fragmentos citados)`; la evidencia es `direct` si todos los términos están, `related` si falta alguno,
  `none` si se abstuvo. Nada se descarta: se conservan las citas literales y páginas.
- La API agrega `evidence` y `unmatchedTerms` (cambio aditivo del contrato). Si es `related`, además se agrega el aviso
  «Los fragmentos son del mismo tema, pero no contienen directamente lo que preguntas (no aparece: …). No los tomes como una respuesta confirmada.»
- Frontend (cambio mínimo en `conversacion.tsx` y `types/explorer.ts`): el encabezado pasa de «Encontré esto en las fuentes:» a
  **«Fragmentos relacionados (no confirman tu pregunta):»**. Los avisos de contenido sintético se conservan.
- Recuperación híbrida, fallback hashing, varios fragmentos y dos sentidos de una palabra: sin cambios. Umbrales de producción: sin cambios.

## Resultado (medido)
- Los tres casos quedan `related` con ambos recuperadores, con el término faltante (`dos`, `fundó`, `color`).
- Las 6 preguntas respondibles de la demo siguen `direct` (varios fragmentos y dos sentidos incluidos); abstenciones sin cambio.
- Verificado en Chrome; `tests/test_evidence_support.py` (29 casos, incluidos los tres problemáticos) y toda la suite: 169 pruebas pasan.

## Ampliación (corpus real): búsqueda de palabras
Para «¿cómo se dice X?» / «¿qué significa X?», la palabra debe figurar en una fuente de vocabulario; si no, se etiqueta `related` con un aviso específico (`lookup_gap` en `app/rag/support.py`; ver `corpus-real-demo.md`).

## Limitaciones
- **No es una verificación de que el fragmento responda**: es coincidencia léxica exacta (sin tildes/mayúsculas). Un fragmento puede contener todos
  los términos y no contestar (p. ej. términos presentes pero con otro sentido). `direct` significa «los términos están», no «respuesta correcta».
- **Costo medido:** una reformulación correcta puede salir `related` (≈20 % de las respuestas correctas en los conjuntos de prueba; en la demo,
  «¿En qué orden pone el verbo la Lengua de Prueba?» → faltan *orden, pone*). Se muestra con citas y un aviso prudente, no se oculta.
- La lista de 11 palabras genéricas es fija y mínima; otros verbos de pregunta («tiene lugar») no están y cuentan como términos faltantes.
- Evaluado solo con corpus ficticio y en español; con documentos reales los resultados pueden diferir. La alternativa de abstención sigue sin
  justificarse: haría falta un verificador (QA/NLI) que no perjudique reformulaciones, y los probados (etapa 6) no lo logran.
