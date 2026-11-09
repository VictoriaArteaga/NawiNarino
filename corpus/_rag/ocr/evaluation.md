# Evaluación del OCR (2026-11-09)

Alcance: Borman 1976 (130 páginas, todas) y Curnow 1997 (las 198 páginas marcadas `noisy`). Entorno y parámetros: `ENVIRONMENT.md`. Los PDF originales no se modificaron.

**Qué significa «revisado» aquí.** Comparé el texto OCR con la imagen de la página (revisión de fidelidad de transcripción hecha por el asistente). **No** es validación lingüística: no hay hablantes ni especialistas en A'ingae o Awa Pit en la revisión. Todo el texto OCR sigue en estado `ocr_unreviewed`, salvo una página (Curnow p. 78) en `ocr/validated/`.

## 1. Resultados globales (confianza de Tesseract, 0-100)

| | Borman (spa, psm 3) | Curnow (eng, psm 4) |
|---|---|---|
| Páginas procesadas | 130 | 198 (de 422) |
| Confianza media | 91,6 (mediana 92,7) | 90,4 (mediana 93,0) |
| Páginas ≥ 90 / 85-90 / < 85 | 111 / 16 / 2 | 166 / 16 / 16 |
| Palabras con confianza < 60 (cuerpo) | 2,4 % | 2,7 % |
| Páginas con mala lectura | p. 1 (26,8), p. 7 (62,3) | pp. 7-14 (índice con puntos guía, 36-53), 17, 38 (mapa), 45, 105, 271, 273, 276, 278 |
| Páginas vacías | p. 6 (sin texto); p. 122 contiene «[página en blanco]» | ninguna |
| Mixed-alnum por 1000 palabras (ruido dígito+letra) | n/d (antes no había texto) | 33,8 en la capa original → 3,2 tras OCR |

La confianza de Tesseract **no mide corrección lingüística**: lee con seguridad formas incorrectas (ver 3 y 4).

## 2. Muestra revisada contra la imagen

| Documento | Página | Qué se revisó | Resultado |
|---|---|---|---|
| Borman | 41 | Dos columnas, entradas con glotales | Orden de lectura correcto; una pérdida de diéresis («ungüentos» → «ungientos») |
| Borman | 95 | Página completa (~230 palabras) | Orden correcto; ≥ 8 errores en grafemas lingüísticos (~3-4 % de palabras), ver 3 |
| Borman | 12 | Solo lectura del texto OCR (sin comparar con la imagen) | Estructura correcta; «ansin'tsse- i» parece una lectura dudosa, no confirmada |
| Curnow | 78 | Página con ejemplos glosados (26)-(30) | Prosa casi perfecta; 7 errores (1 en una forma awapit: «piva»; el resto en rótulos, números y signos). **Corregida y guardada en `validated/`** |
| Curnow | 100, 280 | Prosa con ejemplos | Prosa limpia (confianza 95); no revisé cada forma |
| Curnow | 9 | Índice | Texto con ruido de las líneas de puntos y del texto traspasado; **no usar** |
| Curnow | 271 | Ejemplos con transcripción fonética entre corchetes | Pierde símbolos especiales e inserta una «v»; ver 4 |

## 3. Errores frecuentes — Borman (vocabulario cofán)

1. **Oclusiva glotal (')**: leída como `!` (162 casos dentro de palabra en 52 páginas), como `l` («chúndundu'a'ye» → «chúndundula'ye») o perdida (p. 95: `cco'paya` → `cco!paya`, `ño'faye` → `ño!faye`, `qque'shoye` → `qque!'shoye`, `coe'je de'fa` → `coe!je de!fa`).
2. **Acentos y diacríticos** perdidos o cambiados («ítsaye» → «itsaye»).
3. **Negrita** (cabeza de entrada) perdida: la separación entrada/glosa ya no es explícita; solo se deduce por el primer término de cada línea.
4. **Ilustraciones** y rótulos se mezclan con el texto en las páginas con dibujos.
5. Texto cortado o repetido en pies de ilustración.

**No hay modelo de Tesseract para A'ingae**: se usó `spa`, que no contempla la ortografía propia; esto es la explicación más probable de los errores 1 y 2, no una causa comprobada.

## 4. Errores frecuentes — Curnow (gramática awapit)

1. **Formas awapit alteradas en los ejemplos**: p. 78 ej. (27) `piya` → `piva`; p. 271 ej. (588) la transcripción fonética del libro, `[nukulmaraw ~ nukulmaro]` con un símbolo especial en la «u», sale como «[nukuvlmaraw ~ nukulmaro]» (se inserta una «v» y se pierde el símbolo). Esto es lo más peligroso: confianza alta y forma incorrecta.
2. **Símbolos fonéticos y diacríticos** (corchetes de transcripción) no reconocidos por el modelo inglés.
3. **Letras/dígitos**: «I» leída `1`, `[` o `'[`; «is» leído «1s»; «1SG.» leído «ISG.».
4. **Numeración de ejemplos** mal leída: `(28)` → `(23)`.
5. **Superíndices** de nota al pie leídos como comillas (`7See` → `"See`).
6. **Signos**: `/` perdida (`staying/stopping` → `staying stopping`), `.` sobrante en `SUB.J`.
7. **Alineación de glosas** interlineales y tablas: se conserva de forma aproximada con espacios (`preserve_interword_spaces`); aparecen barras `|` espurias (p. 105, tabla de parentesco).
8. **Texto traspasado** («show-through») en páginas finas contamina las páginas del índice (7-17) y algunos márgenes.

## 5. Mejora respecto a la capa de texto original (Curnow)

En p. 78, la capa original tenía además 20 errores de prosa (p. ej. «sin1ple», «Demetria», «forrns», «\iej a»). El OCR nuevo los corrige, pero introduce otros distintos en las formas (arriba). Ninguna de las dos lecturas es fiable por sí sola para formas awapit: **coincidir ambas es una señal útil; discrepar marca la forma para revisión.**

## 6. ¿Está suficientemente limpio para indexar?

| Texto | Veredicto | Condición |
|---|---|---|
| Borman, 130 páginas OCR | **No** | Las glotales y acentos son parte de las palabras; indexar así crearía vocabulario falso. Hace falta una segunda pasada con modelo propio o revisión humana comparando con la imagen |
| Curnow, 181 páginas OCR con confianza ≥ 85 | **Solo prosa** (`prose_only_forms_unverified`) | Sirven para recuperar explicaciones gramaticales. Las formas awapit, glosas y transcripciones deben mostrarse como «sin verificar» y contrastarse con la imagen |
| Curnow, 16 páginas OCR con confianza < 85 | **No** | Índice, listas, mapa y páginas con ruido |
| Curnow p. 78 | Sí (transcripción verificada contra la imagen) | Validación lingüística sigue pendiente |
| Curnow, 224 páginas no re-procesadas | Sin cambios | Conservan la capa original; no se verificaron una a una |

Aun siendo «indexables», **ninguno** de estos textos tiene autorización de publicación: el índice, si se construye, debe ser local y privado (ver README, reglas de acceso).

## 7. Pendiente
- Segunda pasada de OCR para Borman con preprocesado y verificación de la glotal (hay que decidir con evidencia documental, p. ej. la sección de alfabeto del propio libro, si `!` y `l` en ese contexto representan `'`; no se hizo normalización automática).
- Revisión por hablantes o especialistas de A'ingae y Awa Pit.
- Re-OCR del resto de páginas de Curnow que tengan ejemplos glosados (la heurística de ruido no marcó las otras 224).
- OCR de la lámina de partes del cuerpo en Awapit y transcripción de los 3 audios (siguen sin hacerse).
