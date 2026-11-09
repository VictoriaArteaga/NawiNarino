# Borman (1976): ortografía del propio libro y pruebas de OCR alternativo

Estado: **evaluación previa**. No se procesaron las 130 páginas ni se reemplazó el OCR de `ocr/unreviewed/`. Todo lo de esta carpeta es de pruebas. Scripts: `scripts/ocr_experiments.py`, `scripts/analyze_experiments.py`. Resultados numéricos: `results.json`, `confidence.json`, `ensemble_agreement.json`. Salidas por configuración: `borman/<config>/pNNNN.txt`.

## 1. Qué dice el libro sobre su escritura

Páginas del PDF; entre paréntesis, la numeración impresa.

| Dónde | Qué dice (texto del libro, leído de la imagen y del OCR) |
|---|---|
| p. 5 (iii), Introducción | Los verbos van en infinitivo con sufijo `-ye`; si la raíz es nasalizada, se indica con `-n`. Las palabras cofán se acentúan en la penúltima sílaba, pero «las palabras que tienen oclusión glotal se acentúan en la penúltima sílaba anterior a la oclusión». Las palabras con comillas son términos no aprobados por la RAE |
| p. 123 (115), «El alfabeto cofán» | «se compone de diez vocales y veintiocho consonantes». Vocales orales: a e i o u. Vocales nasales (an/am, en/em, in/im, on/om, un/um): «la nasalización se indica con **m** delante de b o p; antes de otras consonantes, con **n**» (no con diacrítico). Consonantes con ejemplo: b, c, cc, ch, chh, d |
| p. 124 (116) | Siguen dy, f, g (dos sonidos), j, m, n, ñ, p, pp, qu, qqu, r, s, sh, t, tt, ts, tss, v, y, z y una **última fila cuya «Letra» es una marca vertical pequeña**, con ejemplo `a'i` «persona» y explicación «**oclusivo glotal—tan importante como cualquier otro consonante en cofán**» |

Conteo: b, c, cc, ch, chh, d, dy, f, g, j, m, n, ñ, p, pp, qu, qqu, r, s, sh, t, tt, ts, tss, v, y, z y la marca glotal suman 28, que coincide con las «veintiocho consonantes» del texto. **`l` y `h` no están en el alfabeto del libro, ni tampoco el signo `!`.**

Cómo se imprime la glotal: una **marca vertical elevada** que se ve en el cuerpo de las entradas (`bo'mbo`, `cca'na`, `dusu'cho`, `simba'cco`, `o'ma`, `na'e`, `ta'va`, `shaga'to`, `gunguve'cco`, `chhichhi'cco`, `a'i`). En las referencias de este análisis la escribo con el apóstrofo ASCII `'`: es una convención de transcripción, no una afirmación fonológica adicional.

**Acentos escritos** (p. ej. `ítsaye`, `piyíccufa`, `chúndundu'a'ye`, `ccúyaye`): el libro no explica en las páginas leídas qué indica la tilde en las entradas. El OCR actual no encuentra otra explicación (búsquedas de «acento», «tilde» y «escritura»). No hay base documental para añadirlas, quitarlas ni normalizarlas.

## 2. Contraste con el OCR actual y las imágenes

Referencias manuales (transcritas por el asistente desde las imágenes, no por hablantes): páginas 41 y 95 completas y 42 palabras de la tabla del alfabeto. En esas referencias hay **75 palabras con marca glotal** y 71 con acentos o ñ/ü.

Lo que sale en el lugar de la marca glotal con el OCR actual (87 apariciones clasificadas de la marca en las referencias, más 2 sin clasificar):

| Lectura del OCR | Casos |
|---|---|
| `'` correcta | 77 |
| `!` | 7 (p. ej. `cco'paya` → `cco!paya`, `ño'faye` → `ño!faye`, `de'fa` → `de!fa`) |
| `l` | 3 (`chu'oco` → `chuloco`, `chúndundu'a'ye` → `chúndundula'ye`, y `a'i` → `ali` en la propia fila de la glotal de la tabla del alfabeto) |
| otro error / no encontrado | 2 |

Documentación de las equivalencias:

- **Qué está establecido por la evidencia:** (a) el libro define una letra glotal con una marca vertical y la usa en las entradas; (b) en 10 de las 87 apariciones clasificadas, comparadas con la imagen, Tesseract escribió `!` o `l` donde la imagen muestra esa marca; (c) en las páginas de referencia, **ninguna palabra cofán contiene `l`** (las pocas con `l` son glosas en español o nombres latinos: `palma`, `leña`, `Calliandra`…), y el alfabeto del libro no incluye `l` ni `!`.
- **Qué NO está establecido:** que todo `!` o `l` del OCR sea una glotal. `l` es una letra normal en las glosas en español y en los nombres latinos, y `!` es un signo legítimo en glosas como `¡ve!` y `¡ven!` (p. 123-124). Sin distinguir la lengua de cada palabra (la negrita se pierde en el OCR), no se puede reemplazar automáticamente. **No se aplicó ninguna normalización.**
- **Uso permitido:** marcar las palabras cofán con `!` o `l` interior como «lectura dudosa de la glotal» y verificarlas contra la imagen.

## 3. Configuraciones probadas (10 páginas: 5, 12, 41, 60, 66, 95, 118, 123, 124, 126)

Las cinco páginas de entradas léxicas incluyen las dos secciones del diccionario; también hay prosa, lista de fauna, tablas y gramática.

| Configuración | Qué cambia | p41 F1 | p95 F1 | Palabras glotales exactas | Acentos exactos | Alfabeto | `!` dentro de palabra (10 págs) |
|---|---|---|---|---|---|---|---|
| OCR actual | spa, psm 3, 300 dpi | 0,970 | 0,910 | 62/75 (82,7 %) | 66/71 (93,0 %) | 40/42 | 16 |
| base300 (re-ejecución) | igual | 0,970 | 0,915 | 63/75 (84,0 %) | 66/71 (93,0 %) | 40/42 | 15 |
| dpi600 | 600 dpi | 0,965 | 0,915 | 69/75 (92,0 %) | 59/71 (83,1 %) | 38/42 | 8 |
| bin300 / bin600 | binarización Otsu | 0,971 / 0,965 | 0,910 / 0,915 | 62/75 / 69/75 | 65/71 / 59/71 | 40/42 / 38/42 | 10 / 8 |
| **thick600** | 600 dpi + binarización + engrosar trazos | **0,975** | **0,956** | **72/75 (96,0 %)** | 67/71 (94,4 %) | 39/42 | 7 |
| thick450 | 450 dpi + engrosar | 0,975 | 0,947 | 70/75 (93,3 %) | **68/71 (95,8 %)** | 39/42 | 6 |
| cols300 | columnas separadas, psm 6 | 0,965 | 0,910 | 62/75 | 66/71 | 40/42 | 16 |
| spaeng300 | modelos spa+eng | 0,973 | 0,934 | 70/75 (93,3 %) | 60/71 (84,5 %) | 40/42 | 1 |
| blacklist300 | prohíbe `!` y `\|` | 0,970 | 0,937 | 68/75 (90,7 %) | 66/71 (93,0 %) | 40/42 | 0 |
| thick600_spaeng | thick600 + spa+eng | 0,971 | 0,936 | 73/75 (97,3 %) | 58/71 (81,7 %) | 40/42 | 1 |
| thick600_blacklist | thick600 + prohíbe `!`/`\|` | 0,975 | **0,961** | **73/75 (97,3 %)** | 67/71 (94,4 %) | 41/42 | 0 |

(F1 sobre tokens exactos; el signo `-a` de entradas como `delgado-a` cuenta como error en todas las configuraciones por una diferencia de tokenización, no por el OCR.)

## 4. Lectura de los resultados

1. **Lo que ayuda:** subir a 600 dpi y engrosar los trazos finos (`thick600`): la marca glotal se lee bien 96 % de las veces (antes 83-84 %) y no empeora los acentos. Es la mejor configuración **sin efectos secundarios conocidos**.
2. **Lo que no ayuda o perjudica:**
   - `dpi600` solo: mejora la glotal pero baja los acentos al 83 %.
   - `spa+eng`: casi elimina el `!`, pero empeora los acentos (82-85 %).
   - Separar columnas o binarizar a 300 dpi: sin mejora.
   - **Prohibir `!`** (`blacklist`): da el mejor número, pero cambia signos legítimos de las glosas (`¡ve!` → `¡ve?`, `¡ven!` → `¡ven`) y en la prueba introdujo pérdidas de acento (`leña` → `lena`, `río` → `rio`, `ungüentos` → `unguentos`). Impone en el OCR la suposición que no está demostrada. **No recomendado como configuración general.**
3. **Quedan errores incluso en las mejores configuraciones:** `Preroglossus` por `Pteroglossus`, `delfa` por `de'fa`, `tsosicculfa'su` por `tsosiccu'fa'su`, `ítsaye` → `itsaye` (según la configuración), y la fila de la propia letra glotal (`a'i`) falla en casi todas. La estructura de negrita sigue sin recuperarse.
4. **Combinar configuraciones sirve para detectar errores, aunque no para corregirlos.** Con `base300`, `thick600` y `spaeng300` juntas:
   - Los tokens en los que **las tres coinciden** son correctos el **99,0 %** de las veces (386 de 390).
   - **Marcar los tokens donde discrepan** atrapa el **87,5 %** de las lecturas erróneas (28 de 32), a costa de revisar 20 tokens que eran correctos (alrededor del 11 % de los tokens distintos).
   - Con `thick600`, `thick450` y `spaeng300`: 99,2 % y 89,7 %.

## 5. Límites de la evaluación
- Referencias pequeñas: 2 páginas completas y 42 palabras de la tabla. Las transcribí yo desde las imágenes; puede haber errores, y no las revisó ningún hablante.
- Ninguna de las dos páginas completas es de fauna, flora o gramática; los resultados en esas secciones no están medidos con referencia.
- Dos ejecuciones iguales dan resultados casi idénticos pero no exactos (OCR actual frente a `base300`: una palabra de diferencia).
- No se probó un modelo propio de Tesseract para A'ingae (habría que entrenarlo; fuera de este alcance).

## 6. ¿Aportaría una segunda pasada completa una mejora real?

**Sí, pero parcial.** La mejora medida es real en la marca glotal (≈ 83 % → 96 %) sin perder acentos, y la combinación de configuraciones permite marcar para revisión casi 9 de cada 10 lecturas erróneas. Aun así:
- el mejor resultado sigue dejando ~4 % de palabras glotales mal leídas y ~6 % de acentos, y no se puede corregir ninguna automáticamente sin evidencia por palabra;
- el texto resultante seguiría sin servir como vocabulario hasta que alguien revise las marcadas contra la imagen (idealmente con un hablante);
- el permiso de uso sigue pendiente (SIL), así que el resultado sería solo de uso local.

**Propuesta si se aprueba** (no ejecutada): pasar las 130 páginas con `thick600`, `spaeng300` y el OCR actual; conservar las tres lecturas; marcar los tokens con discrepancia o con `!`/`l` interior en palabras que no son glosas españolas; y dejar `index_readiness = no` hasta una revisión humana. Antes de lanzarla convendría ampliar las referencias a 3-5 páginas más (fauna, flora, castellano-cofán y gramática) para confirmar que estos resultados se mantienen.

*(Esa ampliación se hizo: ver la sección 7. Cambia la conclusión.)*

---

# 7. Ronda 3: ampliación a fauna, flora y gramática (2026-11-09)

## 7.1 Qué se hizo
- Cuatro páginas nuevas con **transcripción manual completa verificada visualmente** contra la imagen: p. 69 (fauna), p. 78 (flora), p. 127 y p. 129 (gramática). Se suman a p. 41 (diccionario cofán→castellano), p. 95 (castellano→cofán) y las 42 palabras de la tabla del alfabeto. Archivos en `ground_truth/` (aparte de este informe, por derechos de autor).
- Tres lecturas comparadas: **OCR actual** (spa, 300 dpi), **`thick600`** (600 dpi, binarización, trazos engrosados) y **`spaeng300`** (spa+eng, 300 dpi). Script: `scripts/analyze_by_type.py`; resultados: `results_by_type.json`.
- **Criterios de decisión fijados antes de calcular**, aplicados a las 4 páginas nuevas: (1) la lectura glotal de `thick600` mejora ≥ 5 puntos respecto al OCR actual; (2) los acentos no empeoran más de 2 puntos; (3) el F1 de ninguna página nueva baja más de 0,01.
- No se normalizó ningún carácter: los tokens se comparan tal cual, salvo recortar puntuación y comillas tipográficas en los bordes.

## 7.2 Resultados por tipo de contenido
Marca glotal = palabras de referencia con `'` leídas exactamente; acentos = palabras con á é í ó ú ñ ü leídas exactamente; F1 sobre tokens.

| Tipo de contenido | Lectura | F1 | Glotal | Acentos |
|---|---|---|---|---|
| Diccionario cofán→castellano (p. 41) | OCR actual | 0,963 | 25/26 (96,2 %) | 34/36 (94,4 %) |
| | `thick600` | 0,971 | 26/26 (100 %) | 33/36 (91,7 %) |
| | `spaeng300` | 0,966 | 25/26 (96,2 %) | 34/36 (94,4 %) |
| Diccionario castellano→cofán (p. 95) | OCR actual | 0,942 | 37/49 (**75,5 %**) | 32/35 (91,4 %) |
| | `thick600` | **0,982** | 46/49 (**93,9 %**) | 34/35 (97,1 %) |
| | `spaeng300` | 0,960 | 45/49 (91,8 %) | 26/35 (**74,3 %**) |
| Fauna (p. 69) | OCR actual | 0,983 | 15/15 | 17/17 |
| | `thick600` | 0,975 | 15/15 | 17/17 |
| | `spaeng300` | 0,995 | 15/15 | 17/17 |
| Flora (p. 78) | OCR actual | 0,987 | 24/26 (92,3 %) | 25/27 (92,6 %) |
| | `thick600` | 0,989 | 25/26 (96,2 %) | 25/27 (92,6 %) |
| | `spaeng300` | 0,989 | 24/26 (92,3 %) | 25/27 (92,6 %) |
| Gramática (p. 127, 129) | OCR actual | 0,993 | 21/25 (84,0 %) | 84/84 (100 %) |
| | `thick600` | 0,983 | 19/25 (**76,0 %**) | 82/84 (97,6 %) |
| | `spaeng300` | 0,984 | 24/25 (**96,0 %**) | 77/84 (**91,7 %**) |
| Tabla del alfabeto (42 palabras) | OCR actual / `thick600` / `spaeng300` | – | – | 40 / 39 / 40 de 42 palabras exactas |
| **Páginas nuevas, agrupadas** | OCR actual | 0,989 | 60/66 (90,9 %) | 126/128 (98,4 %) |
| | `thick600` | 0,983 | 59/66 (89,4 %) | 124/128 (96,9 %) |
| | `spaeng300` | 0,988 | 63/66 (95,5 %) | 119/128 (93,0 %) |
| **Las seis páginas con referencia** | OCR actual | 0,979 | 122/141 (86,5 %) | 192/199 (96,5 %) |
| | `thick600` | 0,981 | 131/141 (92,9 %) | 191/199 (96,0 %) |
| | `spaeng300` | 0,981 | 133/141 (94,3 %) | 179/199 (89,9 %) |

## 7.3 Decisión sobre la pasada completa: `thick600` **no** cumple los criterios en las páginas nuevas

| Criterio (páginas nuevas) | Resultado | ¿Cumple? |
|---|---|---|
| Glotal ≥ +5 puntos | −1,5 puntos (89,4 % frente a 90,9 %) | **No** |
| Acentos ≥ −2 puntos | −1,5 puntos | Sí |
| F1 por página, peor diferencia ≥ −0,01 | −0,011 (p. 127) | **No** |

Conclusión: **la ventaja de `thick600` no se mantiene.** Su mejora grande se concentra en una sola página de la sección castellano→cofán (p. 95: 75,5 % → 93,9 %). En fauna y flora el OCR actual ya lee bien las glotales, y en gramática `thick600` las lee peor. Con esta evidencia **no ejecuté las 130 páginas con las tres configuraciones**, como pedía la condición. Los resultados de la sección 3 (10 páginas, 2 referencias) sobrestimaban el beneficio.

## 7.4 Errores persistentes (en las tres lecturas)
1. **La glotal leída como `l`**: `a'i` → `ali` (p. 127, p. 124 y la tabla del alfabeto; las tres lecturas), `cu'i` → `culi`, `simba'se` → `simbalse`, `simbaya'cho` → `simbayal'cho`. Es el error más persistente y ninguna configuración lo elimina.
2. **La glotal leída como `!`**: aparece sobre todo en la sección castellano→cofán con el OCR actual (10 casos en p. 95); `thick600` y `spaeng300` lo reducen a 1. En gramática también: `-'se` → `-!se` (`thick600`).
3. **Glotal perdida o confundida con otra letra**: `fi'tti` → `filtti`; `a'ta` → `ata`.
4. **`ñ` leída como `n`**: `ñome'mba` → `nome'mba` en las tres lecturas (p. 78; `thick600` da `ñhome'mba`).
5. **`y` cursiva leída como `v`** en nombres latinos: `cyanoptera` → `cvanoptera` en las tres lecturas; `thick600` añade `Nvyctibius`, `geoffroyvi`. Nota: esta confusión `y`/`v` es del mismo tipo que la hallada en Curnow.
6. **Acentos en español**: `spaeng300` pierde tildes en palabras españolas (`Así` → `Asi`, `cláusula` → `clausula`, `dejó` → `dejo`; 91,7 % en gramática y 74,3 % en p. 95). `thick600` pierde algunas (`habló`, `mató`, `retoño`).
7. **Estructura**: la negrita que separa cabeza de entrada y glosa sigue perdida, y los guiones de fin de línea (`brin-` `cadora`) quedan separados.

## 7.5 Detección de lecturas dudosas por discrepancia (sin ejecutar la pasada completa)
Con las tres lecturas en las seis páginas con referencia (1.224 tokens distintos):

| | Todas las páginas con referencia | Solo páginas nuevas |
|---|---|---|
| Tokens en los que las tres lecturas coinciden y son correctos | 1.104 | 718 |
| Coinciden pero son incorrectos | 7 | 3 |
| Discrepan (a revisar) | 113 (9,2 %) | 65 (8,3 %) |
| Precisión del acuerdo | 99,4 % | 99,6 % |
| Errores atrapados por la discrepancia | 90,4 % | 92,7 % |

En tokens con marca glotal, acento o `!`: **los 206 tokens en los que coinciden las tres lecturas son correctos**; entre los 55 que discrepan, 21 eran errores y 34 eran correctos.

**Límite importante:** el acuerdo **no detecta los errores sistemáticos** que las tres lecturas comparten (`ali`, `nome'mba`, `cvanoptera`). Por eso la discrepancia sirve para priorizar la revisión, no para certificar el texto.

## 7.6 Recomendaciones
**Sobre la segunda pasada**
- No hacer una pasada completa con `thick600` para todo el libro. Si se hace una pasada ampliada, que sea **por sección**: solo la parte castellano→cofán (pp. 84-121 del PDF), donde `thick600` tuvo la ganancia medida. Esa conclusión descansa en **una sola página de referencia (p. 95)**; antes de ejecutarla conviene transcribir 1-2 páginas más de esa sección (por ejemplo la p. 118, que ya tiene lecturas de prueba).
- Descartar `spaeng300` como lectura principal (pierde acentos en español), aunque sirve como tercera lectura para detectar discrepancias.
- Para los errores sistemáticos (`l` por glotal, `ñ` por `n`, `y` por `v`), **no hay configuración de Tesseract que los corrija**; hace falta entrenar o ajustar un modelo con las formas del propio libro, o revisión humana.

**Para la revisión por especialistas o hablantes cofán**
1. Revisar primero las páginas del alfabeto (pp. 123-124) y de gramática (pp. 125-130): son las más densas en marcas glotales y sufijos como `-'se`, `-'ma`, `-ya'cho`.
2. Mostrar la imagen de página junto al texto y pedir confirmación palabra por palabra en: (a) toda palabra cofán con `!`, `l` interior o sin marca donde se esperaría; (b) todas las discrepancias entre lecturas; (c) toda `ñ`, `ü` y vocal acentuada.
3. Preguntar expresamente qué indican las tildes escritas en las entradas (`ítsaye`, `chúndundu'a'ye`): el libro no lo explica en las páginas leídas.
4. Documentar la ortografía de 1976 frente a la actual: el libro puede no coincidir con la escritura que usa hoy la comunidad. Las decisiones de actualizar o conservar la ortografía le corresponden a los hablantes.
5. Pedir permiso de uso a SIL y a las comunidades antes de cualquier uso fuera del equipo; hasta entonces todo permanece local y como `index_readiness = no`.

## 7.7 Estado
- OCR existente (`ocr/unreviewed/`) **sin cambios**; originales intactos.
- Pruebas guardadas por separado en `ocr/experiments/` (excluidas de git por derechos de autor).
- No se construyó ningún índice ni se integró nada al RAG.

---

# 8. Ronda 4: verificación de `thick600` en la sección castellano→cofán (PDF pp. 84-121)

**Decisión final: `thick600` NO cumple los criterios; el proceso se detuvo y no se procesaron las pp. 84-121.**

## 8.1 Método
- Páginas nuevas con transcripción manual completa, hecha desde la imagen **antes de ver ningún OCR** y verificada con ampliaciones a 300 dpi en las palabras dudosas: **p. 102** (hoja o techo – inclinado-a; 94 impresa) y **p. 118** (tamal – tigre; 110 impresa). Archivos en `ground_truth/p0102.txt` y `p0118.txt` (excluidos de git).
- La p. 95, que dio origen a la hipótesis, se muestra como contexto y **no entra en la decisión**.
- Criterios idénticos a los originales: (1) ganancia de glotales ≥ 5 puntos porcentuales; (2) pérdida de acentos ≤ 2 puntos; (3) el F1 de ninguna página baja más de 0,01. Scripts: `scripts/analyze_section.py` (usa `analyze_by_type.py`); resultados: `results_section_castellano_cofan.json`.
- Comparación literal de tokens: no se sustituyó `!`, `l`, apóstrofos ni otros caracteres, y no se normalizaron acentos ni formas cofán.
- Observación de la p. 118: el libro imprime la entrada «tapa picco'cho» dos veces (antes de «tapar» y después de «tarro o alijaba…»). La referencia la reproduce tal como está impresa; no se corrigió.

## 8.2 Resultados por página (tokens exactos)

| Página | Lectura | F1 | Glotal | Acentos | `!` dentro de palabra |
|---|---|---|---|---|---|
| **p. 102** | OCR actual | 0,972 | 25/30 (83,3 %) | 23/24 (95,8 %) | 3 |
| | `thick600` | **0,961** | 25/30 (83,3 %) | 23/24 (95,8 %) | 3 |
| | `spaeng300` | 0,989 | 28/30 (93,3 %) | 22/24 (91,7 %) | 0 |
| **p. 118** | OCR actual | 0,954 | 16/23 (69,6 %) | 32/35 (91,4 %) | 5 |
| | `thick600` | 0,969 | 19/23 (82,6 %) | 34/35 (97,1 %) | 2 |
| | `spaeng300` | 0,973 | 21/23 (91,3 %) | 32/35 (91,4 %) | 0 |
| p. 95 (contexto, no decide) | OCR actual | 0,942 | 37/49 (75,5 %) | 32/35 (91,4 %) | 10 |
| | `thick600` | 0,982 | 46/49 (93,9 %) | 34/35 (97,1 %) | 1 |
| | `spaeng300` | 0,960 | 45/49 (91,8 %) | 26/35 (74,3 %) | 1 |
| **Páginas nuevas agrupadas (102 + 118)** | OCR actual | 0,964 | 41/53 (77,4 %) | 55/59 (93,2 %) | 8 |
| | `thick600` | 0,965 | 44/53 (83,0 %) | 57/59 (96,6 %) | 5 |
| | `spaeng300` | 0,981 | 49/53 (92,5 %) | 54/59 (91,5 %) | 0 |

## 8.3 Evaluación de los tres criterios para `thick600`

| Criterio (páginas nuevas 102 + 118) | Resultado | ¿Cumple? |
|---|---|---|
| Ganancia glotal ≥ +5 puntos | +5,6 puntos (83,0 % frente a 77,4 %) | **Sí** |
| Pérdida de acentos ≤ 2 puntos | +3,4 puntos (96,6 % frente a 93,2 %) | **Sí** |
| F1 por página: ninguna baja más de 0,01 | p. 102: **−0,0114** (0,9725 → 0,9611); p. 118: +0,0146 | **No** |

**Resultado: NO CUMPLE (2 de 3).** El incumplimiento es marginal (−0,0114 frente a una tolerancia de −0,01), pero la regla era estricta y la condición decía «si no cumple, detén el proceso». No se forzó la ejecución ni se redefinió el criterio.

Lectura de los datos, sin cambiar la decisión:
- La ganancia de glotales de `thick600` se confirma en la p. 118 (69,6 % → 82,6 %) pero **no existe en la p. 102** (83,3 % en ambas). La ventaja es dependiente de la página, como en la ronda 3.
- La pérdida de F1 en la p. 102 viene de lecturas como `ma'ndeye` → «ma» + «ndeye», `changoeñe` → «changoene» y `yarina` → «vyarina»; es decir, errores de espaciado, ñ y cursiva, no de la marca glotal.
- Con **las tres páginas de la sección** juntas (95, 102 y 118; análisis exploratorio, no decisorio, porque incluye la p. 95 que originó la hipótesis): glotales 76,5 % → 88,2 %; acentos 92,6 % → 96,8 %.

## 8.4 Errores persistentes en la sección (páginas 102 y 118)
1. **Marca glotal leída como `!`, con apóstrofo duplicado o ausente**: `ishoanzú'je` → `ishoanzú!je`, `potacho'fa` → `potacho!'fa`/`potacho!fa`, `cashen'tti` → `cashen!'tti`, `zu'tta` → `zutta`, `aya'fa` → `aya!fa`, `dyo'joye` → `dyo!joye`. `thick600` reduce el `!` en 118 (5 → 2) pero no en 102 (3 → 3), y en 118 lee `!ngeye` por `noe'ngeye`.
2. **Marca glotal leída como `l` o con otro carácter**: `chánchanchan'cho'a` → `chánchanchan'chola` (OCR actual); `oqquiccu'o` → `ogquicculo` (`thick600`). Un caso más de la confusión `'` ↔ `l` ya documentada.
3. **Palabras cortadas en dos por la glotal**: `fue'ngatssi` → «fue» + «ngatssi», `noe'ngeye` → «noe» + «ngeye» (las tres lecturas en al menos una página).
4. **Diéresis y tildes perdidas**: `vergüenza` → `vergúenza`/`verguenza`/`vergiienza`; `spaeng300` pierde tildes españolas (`maíz` → `maiz`, `chánchanchan'cho'a` → `chanchanchan'cho'a`, `indián'cco` → `indian'cco`).
5. **`ñ` leída como `n`** (`changoeñe` → `changoene`, `thick600`) y **`y` cursiva como `v`** (`vyarina`).
6. La negrita sigue perdiéndose y las ilustraciones (tambor, huangana, iguana, tigre) no generan texto útil.

## 8.5 Discrepancias entre las tres lecturas (páginas 102 y 118)
| | Tokens |
|---|---|
| Coinciden las tres y son correctos | 306 |
| Coinciden las tres y son incorrectos | 1 |
| Discrepan, y la lectura es incorrecta | 30 |
| Discrepan, pero hay una lectura correcta | 17 |

- Precisión del acuerdo: 99,7 %. Las discrepancias atrapan 30 de 31 tokens erróneos (96,8 %); marcar para revisión 47 de 354 tokens distintos (13,3 %).
- En tokens con marca glotal, acento o `!`: **los 80 en los que coinciden las tres lecturas son correctos**; entre los 33 que discrepan, 17 eran erróneos y 16 correctos.
- Igual que antes, las coincidencias **no son validación lingüística**: las tres lecturas comparten sus errores sistemáticos y ninguna de las referencias fue revisada por hablantes.

## 8.6 Estado y recomendaciones
- **No se ejecutó la pasada pp. 84-121.** `thick600` y `spaeng300` solo existen para las páginas de prueba (en `borman/<config>/`); el OCR existente en `ocr/unreviewed/` sigue siendo la única lectura por página de las 130 páginas.
- Nada cambió en los metadatos de `documents.json`/`pages_ocr.jsonl`: Borman sigue con `index_readiness = no`, uso local, pendiente de revisión por especialistas o hablantes cofán.
- **Opciones para decidir (sin ejecutar):**
  1. **Aceptar el resultado** y pasar directamente a la revisión humana de la sección con el OCR actual, usando la discrepancia entre lecturas para priorizar. En este punto el esfuerzo de OCR adicional rinde poco frente al error sistemático (`l`, `ñ`, `y`, tildes) que solo se arregla con revisión o con un modelo ajustado.
  2. **Formular un criterio nuevo y fijarlo antes de medir** (por ejemplo, con `spaeng300` en la sección: tuvo el mejor resultado glotal en las dos páginas nuevas, 92,5 % sin ningún `!`, pero pierde tildes españolas). Esto sería una hipótesis nueva evaluada con páginas distintas, no un rescate de `thick600`.
  3. **Ampliar el conjunto de referencia** con 2-3 páginas más de la sección antes de decidir. Las dos páginas nuevas dan resultados contradictorios en F1 con una diferencia de apenas 0,0014 respecto al umbral.
- Para la revisión especializada, las recomendaciones de la sección 7.6 siguen vigentes. Se añade: mostrar al revisor las palabras partidas por la glotal (`fue'ngatssi`, `noe'ngeye`), porque suelen aparecer como dos tokens en el OCR.

---

# 9. Cierre de la experimentación y estructura de revisión humana (pp. 84–121)

**Decisión adoptada:** se aceptan los resultados de la sección 8 y se cierra la experimentación de configuraciones de OCR para Borman. No se ejecutó ninguna configuración nueva ni se procesaron las pp. 84–121 con `thick600`. El OCR actual (`ocr/unreviewed/`) es la base provisional y no se tocó.

## 9.1 Qué se preparó
Un paquete de revisión en `corpus/_rag/review/borman_castellano_cofan/` (documentación en su `README.md` y `expert_questions.md`; el resto es local y está excluido de git). Se genera con `scripts/build_review_package.py`, que **no ejecuta OCR**: lee el OCR existente y las lecturas de prueba que ya estaban guardadas, y solo renderiza imágenes de página del PDF original.

| Componente | Descripción |
|---|---|
| `index.html` | Por página: imagen del PDF junto al OCR numerado por línea y la tabla de elementos a revisar |
| `review_items.csv` / `.jsonl` | **262 elementos** (178 de prioridad 1, 39 de prioridad 2, 45 de prioridad 3), con columnas vacías para la decisión del revisor |
| `pages_summary.json` | Resumen por página y estadísticas |
| `pages/` | 38 imágenes de página (130 dpi) |

## 9.2 Estructura propuesta
**Ubicación.** Página del PDF, página impresa derivada (PDF − 8; confirmada por el número que lee el OCR en 34 de 38 páginas), cabecera de la página, línea y posición sobre el texto OCR, y líneas de contexto. No hay coordenadas.

**Lecturas.** Cuando existen, cada elemento muestra juntas las del OCR actual, `thick600` y `spaeng300`. Eso ocurre **solo en las pp. 95, 102 y 118** (3 de 38 páginas); en las otras 35 hay una única lectura.

**Prioridad.**
| Prioridad | Tipo | Elementos |
|---|---|---|
| 1 | Discrepancia entre lecturas (pp. 95, 102, 118) | 44 |
| 1 | `!` o `\|` dentro de palabra (posible marca glotal mal leída), incluidas marcas dobles | 134 |
| 2 | `l` dentro de una palabra con forma de cofán | 22 |
| 2 | Nombre latino con `y`/`v` | 12 |
| 2 | Dígitos en palabras, posible `ñ`→`n`, cabecera sin su letra inicial | 3 + 1 + 1 |
| 3 | Lista por página de palabras con tilde, diéresis o `ñ` | 38 |
| 3 | Posible ruido de ilustración, guion de fin de línea | 6 + 1 |

**Errores sistemáticos que pueden aparecer en las tres lecturas** (glotales, `ñ`/`n`, `y`/`v`, tildes, palabras partidas) se marcan con reglas aunque las lecturas coincidan. La regla de palabras partidas no produjo ningún elemento en las páginas de la sección con la heurística actual; los casos conocidos (`fue'ngatssi`, `noe'ngeye`) están descritos en las preguntas para especialistas.

**Dos pasos por elemento.**
1. *Verificable a simple vista:* comparar con la imagen qué se imprime (marca vertical, `l`, `ñ`/`n`, `y`/`v`, tilde; una palabra o dos).
2. *Requiere hablantes o especialistas* (110 elementos): si una `l` impresa es préstamo o errata, qué indican las tildes escritas, si la forma de la marca distingue algo, ortografía de nombres científicos (especialista en taxonomía). Las decisiones de ortografía actual frente a la de 1976 corresponden a los hablantes.

**Registro de decisiones.** En la hoja (`reviewer_decision`: `confirmed_ocr_correct`, `transcription_corrected`, `printed_form_unclear`, `needs_specialist`, `not_an_error`; `printed_form_as_seen` literal), nunca en el texto OCR. Corregir una transcripción no equivale a validar la forma lingüística.

## 9.3 Cobertura medida de las reglas (solo pp. 95, 102 y 118)
Sobre las 27 lecturas del OCR actual que difieren de la referencia manual: las reglas solas detectan 19 (70 %), la discrepancia entre las tres lecturas 25 (93 %) y juntas también 25. No se detectaron `ítsaye` → «itsaye» (tilde perdida) y la palabra partida «noe». De los 20 tokens que marcan las reglas en esas páginas, 19 eran erróneos.

**Sesgo importante:** las reglas se afinaron mirando esos mismos errores, de modo que **no** es una prueba independiente. En las otras 35 páginas el recall es desconocido, y es probablemente bajo para `ñ`→`n` y `y`→`v`.

## 9.4 Limitaciones
1. **Las coincidencias entre lecturas no validan nada**; las tres comparten sus errores sistemáticos (`a'i` → «ali», `ñ` → `n`, `y` → `v`).
2. **Solo 3 de 38 páginas tienen lecturas alternativas.** En las otras 35 la prioridad sale de reglas, no de discrepancias.
3. **No se pueden detectar tildes, `ñ`, palabras ni líneas que el OCR haya omitido.** La lista de tildes solo recoge las presentes. Hace falta una lectura de cada página completa contra la imagen, no solo de los elementos marcados.
4. **No se distingue el lado español del cofán** (se pierde la negrita): hay falsos positivos y falsos negativos en `l` y tildes.
5. **134 elementos son `!` dentro de palabra:** son repetitivos, pero ninguno se sustituye automáticamente.
6. **No hay coordenadas**; la ubicación es por línea de texto OCR más la imagen de la página.
7. La página impresa es derivada; en las pp. 84, 86, 104 y 114 el OCR no confirma el número.
8. **Todo sigue local, no indexable y pendiente de permisos (SIL, comunidades) y de revisión especializada.** Las imágenes y el texto proceden de una obra con derechos reservados.

## 9.5 Pendiente
- Revisión humana de los 262 elementos y lectura completa de cada página contra la imagen.
- Consulta a hablantes cofán y especialistas (`expert_questions.md`).
- Permisos de uso.
- Decidir, tras la revisión, si merece la pena un modelo de OCR ajustado al libro. No se hace ahora.
