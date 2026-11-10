# Corpus real en la demostración local

**Decisión:** el responsable del proyecto indicó que la demo debe responder con el corpus real de `corpus/` (documentos sobre awapit, nasa yuwe,
aingae/cofán, inga y pasto/quillasinga). Se habilitó **solo para una demostración académica local**. Esto **no** sustituye el permiso de los titulares de
derechos ni de las comunidades: esos permisos siguen **pendientes** (`corpus/sources.md`, `rag-real-evaluation-blocker.md`) y la validación lingüística también.
No redistribuir el corpus, los textos extraídos ni el índice, y no publicar la demo con este corpus sin esos permisos.

## Revisión humana lingüística: dada por aprobada por el responsable del proyecto
El responsable del proyecto indicó que lo relativo a la revisión humana lingüística se da **por aprobado**. Se implementó como un estado propio y **veraz**,
`project_approved` («Aprobado por el equipo · sin validación de hablantes»): quita el bloqueo y el rótulo «pendiente de validación», pero **no** se marca como
`specialist_validated` ni `community_validated`, porque ninguna persona competente en la lengua revisó el contenido y decirlo sería falso. La interfaz y los avisos lo dicen:
«aprobado por el responsable del proyecto… NO ha sido validado por hablantes, especialistas ni comunidades».
Lo que la aprobación **no** cambia (son problemas de los datos, no de revisión pendiente):
- **Borman sigue excluido:** su texto OCR está mal leído (glotales y acentos) y su revisión humana (`corpus/_rag/review/`) nunca se hizo; aprobarla por decreto
  introduciría vocabulario cofán incorrecto. Además fue una exclusión explícita del proyecto.
- **El alfabeto de UNIPA** se incluyó, pero **no** con el texto extraído (mezclaba columnas): se transcribió contra la imagen (ver más abajo).
- **Las páginas de OCR ruidoso** (p. ej. 198 de Curnow) siguen fuera por la misma razón.
Si alguna persona competente revisa el contenido, se puede cambiar el estado a `specialist_validated`/`community_validated` por documento.

## Alfabeto Awá (UNIPA): transcripción contra la imagen
Lengua: **awapit** (Awá Pit). Es una lámina ilustrada con 28 pares «palabra en awapit = significado en castellano». Se renderizó el PDF a 10× (PyMuPDF, en un entorno fuera del repositorio)
y cada etiqueta se leyó contra la imagen; el resultado está en `backend/rag_data/real/transcriptions/unipa_alfabeto-awa.json` (28 entradas, método y notas de diacríticos).
- **Qué se transcribió:** solo los pares palabra = significado (p. ej. `Kual = Familia`, `Yal = Casa`, `Pi = Río`, `Pã = Sol`). No se asigna cada par a su letra destacada (ese emparejamiento visual no se verificó) ni se transcriben logotipos.
- **Qué NO es:** no fue revisada por un hablante ni un especialista. La transcripción la hizo una IA leyendo la imagen. Los signos `ɨ` (i barrada), `ĩ`, `ã`, `ũ` se leyeron pero **son lo más delicado: deben confirmarse con un hablante**.
- **No se versiona:** la transcripción deriva de un documento con permisos pendientes y el repositorio de GitHub es **público**, así que `backend/rag_data/real/transcriptions/` está en `.gitignore` y vive solo en esta máquina (igual que `corpus/_rag/pages.jsonl` y el índice). Las pruebas que la necesitan se omiten si no está.
- **Cómo se indexa:** un fragmento por entrada («Alfabeto Awá (lámina de UNIPA; transcripción contra la imagen, sin revisión de un hablante). Awapit = castellano: Kual = Familia.»), con el estado `project_approved`.
  El texto extraído del PDF **nunca** se usa para este documento. El PDF original no se modificó.
- **Efecto observado (recuperador `hashing`):** «¿Cómo se dice casa/río/familia en awapit?» recupera la entrada correcta; las consultas por la forma awapit (`Kual`, `Pã`) no la recuperan con `hashing` y deberían mejorar con la parte exacta (BM25) del híbrido cuando el índice termine.
- **Palabras sin información (aviso explícito):** la lámina no tiene «agua» ni la mayoría del vocabulario. En preguntas de búsqueda de palabra («¿cómo se dice X?», «¿qué significa X?») la palabra debe figurar en una **fuente de vocabulario** (diccionario, alfabeto o conjugaciones; clase de evidencia `primary_linguistic_data*`), no solo en un texto que hable del tema. Si no figura, se siguen mostrando los fragmentos pero como **«relacionados»** y con el aviso «No encontré información sobre «agua» en las fuentes de vocabulario…: lo que se muestra es contenido relacionado, no su traducción ni su significado». Cualquier otra palabra de la pregunta que no aparezca en los fragmentos se nombra también en el aviso general («no aparece: X»). Medido: «casa», «río» y «familia en awapit» siguen directos con su entrada de la lámina; «agua» y «perro» salen como relacionados con aviso. Límite: la regla solo existe en el corpus real (donde se conoce la clase de evidencia) y es léxica; una palabra presente en un diccionario con otro sentido puede pasar.

## Cómo está habilitado
- Registro: `backend/rag_data/real/authorizations.json` (22 entradas). Cada una dice quién autoriza (el responsable del proyecto, **no titular de derechos**),
  el alcance (indexar, evaluar, citar extractos) y las condiciones («solo demostración LOCAL; sin redistribución; permisos pendientes»).
- Compuerta: `app/rag/authorization.py` (+ `scripts/rag_authorization_check.py`). Sin una entrada completa, el documento no entra. **Borman nunca se habilita.**
- Activación: `RAG_CORPUS=real` (variable de entorno o `backend/.env`; por defecto `demo`, el corpus ficticio, y las pruebas fuerzan `demo`).
- Fuente de texto: `corpus/_rag/pages.jsonl` (texto ya extraído por página; los PDF originales **no se modifican**).

## Qué se indexa y qué no
**Indexado:** 23 documentos, **6 130 fragmentos** (6 102 de PDF + 28 de la transcripción del alfabeto) — awapit 6 documentos (con el alfabeto), nasa yuwe 5, aingae 5, pasto/quillasinga 6 y inga 1 (el resto del corpus inga es texto comunitario
sin traducir, que se excluye, por lo que la cobertura de inga es mínima: un solo documento sobre numeración). Todo con estado `project_approved` (aprobado por el responsable del proyecto, sin validación de hablantes).
**Excluido por código** (`app/rag/real_corpus.py`, reglas de `corpus/_rag/README.md`):
- Borman (bloqueado por decisión del proyecto: OCR y permisos).
- Referencias bibliográficas, propuestas técnicas, texto comunitario sin traducir y material sin leer/transcribir (no son evidencia).
- El alfabeto awapit de UNIPA (una lámina con columnas mezcladas: revisión manual pendiente).
- Páginas vacías o con OCR ruidoso (incluye 198 páginas de Curnow: sus formas awapit no son fiables) y fragmentos de menos de 100 caracteres (encabezados y números de página).
`page` es el índice de página **del PDF**, no la numeración impresa; la interfaz lo muestra como «p. N del PDF».

## Cómo funciona (sin cambios de arquitectura)
Mismo pipeline: recuperación híbrida o `hashing`, extractos literales con documento y página, etiqueta `direct`/`related`/`none`, abstención y explicación local validada.
Cambios por ser documentos reales: la advertencia «Contenido aprobado por el responsable del proyecto… NO ha sido validado por hablantes, especialistas ni comunidades… no lo tomes como información validada» sustituye al aviso de contenido sintético, y el prompt del modelo indica que los fragmentos son reales, sin validar y pueden tener ruido de extracción.

## Índice de la recuperación híbrida (bge-m3)
Con 6 102 fragmentos, calcular embeddings en CPU tarda **≈1 fragmento/s (~1 h 45 min)**, así que se hace una vez y se guarda:
```powershell
cd backend
python -m scripts.rag_build_index      # reanudable: si se interrumpe, al relanzarlo continúa
```
Genera `rag_data/index_cache/real-ollama-bge-m3.json` (no versionado, ~60–100 MB). Si falta o el corpus/los permisos cambiaron, el motor **no se bloquea**: usa el recuperador
`hashing` (se construye en memoria en ≈10 s) y lo registra en el log. Reiniciar el backend cuando el índice esté listo para activar el híbrido (`/health` → `explorerRetriever`).
Estado al cerrar esta sesión: el índice quedó **parcialmente calculado** (archivo `.partial.jsonl`) y debe terminarse con el comando anterior.

## Comportamiento observado (recuperador `hashing`, corpus real; verificado en Chrome)
- «¿Qué es el pueblo Quillacinga?» → respuesta directa con cita de la caracterización de Quillacinga (MinCultura).
- «¿Qué es la Unidad Indígena del Pueblo Awá UNIPA?» → 3 fragmentos del PEC Ɨnkal Awá (UNIPA 2019), con p. del PDF y «Aprobado por el equipo · sin validación de hablantes».
- «¿Cómo se transmite el nasa yuwe en las familias?» → «Fragmentos relacionados (no confirman tu pregunta)».
- «¿Cuál es la capital de Francia?» → abstención.
- Sin generación en estas pruebas (para no competir con la construcción del índice); la generación se probó antes con el corpus ficticio.

## Limitaciones (importantes)
- **No hay evaluación con documentos reales:** no existen preguntas etiquetadas ni validación de una persona competente. Las cifras de las etapas anteriores se midieron con corpus **ficticio** y no
  se transfieren; los umbrales no están calibrados para 6 102 fragmentos reales.
- Con un corpus grande y mezclado el recuperador léxico trae fuentes de otro tema (p. ej. una tesis nasa para una pregunta sobre el PEC Awá) y repite encabezados de página; es esperable que haya
  **más respuestas sobre el tema equivocado** que en la demo ficticia. La etiqueta «relacionados» frena parte de ellas, no todas.
- El texto proviene de PDF con ruido de extracción (letras y diacríticos mal leídos); no se corrige ni se completa. Las formas en lenguas indígenas se citan tal como están en el texto.
- Un modelo de 3 B nunca vio estas lenguas: la validación exige que toda forma entre comillas esté literalmente en los fragmentos, pero no garantiza exactitud lingüística.
- Documentos en inglés (Curnow, Hengeveld, Fischer…) con preguntas en español: solo el híbrido (bge-m3) lo maneja; `hashing` no.
- Esto sigue siendo una demostración: **no presentarla como conocimiento validado de las lenguas**.
