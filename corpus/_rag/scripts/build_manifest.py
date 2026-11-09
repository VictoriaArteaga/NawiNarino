"""Construye documents.json, pages.jsonl, routing.json y gaps.json para la fase RAG.

Entradas : corpus/_rag/quality_report.json y corpus/_rag/text/**/*.pages.jsonl
           (generados por extract_text.py a partir de los originales).
Salidas  : corpus/_rag/{documents.json, pages.jsonl, routing.json, gaps.json}
Los metadatos de cada documento son CURADOS A MANO y solo contienen datos que
aparecen en el propio documento, en su pagina de origen o en corpus/sources.md.
`None` significa "no verificado": no se rellena por inferencia.
No toca los originales. No calcula embeddings ni indices.

Uso: python -X utf8 build_manifest.py
"""
import json
import re
from pathlib import Path

CORPUS = Path(__file__).resolve().parents[2]
RAG = CORPUS / "_rag"

CATS = {
    "L": "linguistico",
    "C": "cultural_territorial",
    "H": "historico",
    "S": "sociolinguistico",
    "B": "referencia_bibliografica",
    "?": "sin_clasificar",
}
# language_code: ISO 639-3 solo donde es inequivoco
LANG = {
    "nasa-yuwe": ("nasa_yuwe", "pbb"),
    "awapit": ("awapit", "kwi"),
    "ainga-cofan": ("aingae", "con"),
    "inga": ("inga", "inb"),
    "pasto-quillasinga": ("pasto_quillasinga", None),
}

# rag_use: primary = fuente adecuada para responder; supporting = contexto; none = no usar
P, S_, N = "primary", "supporting", "none"


def use(v=N, g=N, c=N, t=N, h=N):
    return {"vocabulary": v, "grammar": g, "culture": c, "territory": t, "history": h}


# fmt: off
DOCS = {
# ------------------------------------------------------------------ AWAPIT
"awapit/anu_curnow-1997_grammar-of-awa-pit.pdf": dict(
    title="A grammar of Awa Pit (Cuaiquer): an indigenous language of south-western Colombia",
    authors="Timothy Jowan Curnow", institution="Australian National University (tesis doctoral)", year=1997,
    cat="L", secondary=[], evidence="primary_linguistic_description", text_lang="en",
    community="Awá", municipality=None,
    source_url="https://openresearch-repository.anu.edu.au/handle/1885/145308",
    license="© 1997 Timothy Jowan Curnow (declarado en el PDF); sin licencia abierta", access="internal_use_only",
    confidence="high", use=use(v=S_, g=P),
    notes="Gramatica descriptiva completa con ejemplos glosados. Texto OCR del escaneo: cuerpo mayormente legible pero con ruido (portada, pagos de indice, glosas). Las 198 paginas ruidosas se re-OCR con Tesseract (ocr/unreviewed): la prosa queda bien pero los ejemplos awapit pierden fidelidad (p. ej. 'piya'->'piva'); toda forma awapit citada debe contrastarse con la imagen de pagina o con la capa original. Menciona Ricaurte y otras localidades como origen de variantes: no se usa como fuente de municipio.",
    ocr="clean_and_verify"),
"awapit/unipa_diccionario-awapit-espanol.pdf": dict(
    title="Diccionario Awapit-Español", authors="Pueblo Awá UNIPA", institution="UNIPA; publicado por MEN / Colombia Aprende", year=None,
    year_note="Nombre de archivo '08032019' sugiere 2019; no verificado en el documento",
    cat="L", secondary=["C"], evidence="primary_linguistic_data", text_lang="awapit+es", community="Awá (UNIPA)", municipality=None,
    source_url="http://colombiaaprende.edu.co/sites/default/files/files_public/2021-10/DICCIONARIO%20AWAPIT%20TUMACO%20final%2008032019-comprimido.pdf",
    license="No especificada (términos de Colombia Aprende)", access="community_permission_required",
    confidence="high", use=use(v=P),
    notes="Fuente comunitaria. Cada entrada trae transcripcion fonetica, glosa en español y ejemplos. Mantener el vinculo entrada-glosa; no recombinar. Los caracteres ɨ y similares deben preservarse (UTF-8). El nombre de archivo de origen incluye 'TUMACO' (variante dialectal posible, no verificada).",
    ocr="none"),
"awapit/unipa_vivamos-aprendiendo-awapit-conjugaciones.pdf": dict(
    title="Vivamos Aprendiendo Awapit - Conjugaciones verbales", authors="UNIPA", institution="UNIPA; publicado por MEN / Colombia Aprende", year=None,
    cat="L", secondary=[], evidence="primary_linguistic_data", text_lang="awapit+es", community="Awá (UNIPA)", municipality=None,
    source_url="http://colombiaaprende.edu.co/sites/default/files/files_public/2021-11/Vivamos%20Aprendiendo%20Awapit_-min.pdf",
    license="No especificada", access="community_permission_required",
    confidence="medium", use=use(v=S_, g=S_),
    notes="Material didactico con dialogos y conjugaciones en Awapit. Algunas paginas sin texto (10 de 132): revisar visualmente.",
    ocr="partial_pages"),
"awapit/unipa_alfabeto-awa.pdf": dict(
    title="Alfabeto Awá", authors="UNIPA", institution="UNIPA; publicado por MEN / Colombia Aprende", year=None,
    cat="L", secondary=[], evidence="primary_linguistic_data", text_lang="awapit+es", community="Awá (UNIPA)", municipality=None,
    source_url="http://colombiaaprende.edu.co/sites/default/files/files_public/2021-10/Abecedario%20Awa_.pdf",
    license="No especificada", access="community_permission_required",
    confidence="medium", use=use(v=S_),
    notes="Una sola lamina ilustrada; el texto extraido (72 palabras) mezcla columnas y es poco fiable. Revisar contra la imagen antes de usar pares palabra-glosa.",
    ocr="manual_review"),
"awapit/unipa_guia-aprendemos-awapit.pdf": dict(
    title="Aprendemos Awapit desde la forma de vida Ɨnkal Awá (guia pedagogica)", authors="UNIPA (apoyo USAID/OIM)", institution="UNIPA; MEN / Colombia Aprende", year=None,
    cat="S", secondary=["L"], evidence="educational_guidance", text_lang="es", community="Awá (UNIPA)", municipality=None,
    source_url="http://colombiaaprende.edu.co/sites/default/files/files_public/2021-10/Cartilla%20AWA_-comprimido.pdf",
    license="No especificada", access="community_permission_required",
    confidence="medium", use=use(c=S_),
    notes="Orientaciones pedagogicas para revitalizacion; no es fuente de vocabulario ni gramatica.",
    ocr="none"),
"awapit/unipa_PEC-inkal-awa.pdf": dict(
    title="Proyecto Educativo Comunitario PEC Ɨnkal Awá", authors="UNIPA", institution="Unidad Indigena del Pueblo Awá (UNIPA)", year=2019,
    cat="C", secondary=["S"], evidence="community_self_description", text_lang="es", community="Awá (UNIPA)", municipality=None,
    source_url="http://colombiaaprende.edu.co/sites/default/files/files_public/2021-10/PEC%20Awa_UNIPA_.pdf",
    license="No especificada", access="community_permission_required",
    confidence="high", use=use(c=P, t=S_),
    notes="Autodescripcion comunitaria; menciona resguardos y municipios (p. ej. Barbacoas, Tumaco). Antes de extraer municipios hay que leer cada pasaje.",
    ocr="none"),
"awapit/men_partes-cuerpo-cara-awapit.pdf": dict(
    title="Partes del cuerpo y la cara en Awapit", authors=None, institution="MEN / Colombia Aprende (productor no indicado)", year=None,
    cat="L", secondary=[], evidence="primary_linguistic_data_unread", text_lang="awapit+es", community="Awá", municipality=None,
    source_url="http://colombiaaprende.edu.co/sites/default/files/files_public/2021-10/partes%20de%20la%20cara%20%20y%20el%20cuerpo%20en%20awapit.pdf",
    license="No especificada", access="community_permission_required",
    confidence="low", use=use(),
    notes="3 paginas de imagen sin capa de texto. Contenido no leido: no usar hasta pasar OCR y revisar con un hablante. Tesseract no esta instalado en este entorno.",
    ocr="required"),
"awapit/men_pieza-radial-1-awa.mp3": dict(
    title="Pieza radial 1 (Awá)", authors=None, institution="MEN / Colombia Aprende", year=None, cat="?", secondary=[], evidence="audio_unverified",
    text_lang=None, community="Awá", municipality=None,
    source_url="http://www.colombiaaprende.edu.co/sites/default/files/files_public/2021-11/Pieza-radial-1-Awa.mp3",
    license="No especificada", access="community_permission_required", confidence="low", use=use(),
    notes="Audio de 22:46 sin transcripcion. No clasificado por contenido (no escuchado). No usar ASR automatico para Awapit: requiere transcripcion revisada por hablantes.",
    ocr="transcription_required"),
"awapit/men_pieza-radial-2-awa.mp3": dict(
    title="Pieza radial 2 (Awá)", authors=None, institution="MEN / Colombia Aprende", year=None, cat="?", secondary=[], evidence="audio_unverified",
    text_lang=None, community="Awá", municipality=None,
    source_url="http://www.colombiaaprende.edu.co/sites/default/files/files_public/2021-11/Pieza%20radial%202.mp3",
    license="No especificada", access="community_permission_required", confidence="low", use=use(),
    notes="Audio de 3:43 sin transcripcion; ver pieza radial 1.", ocr="transcription_required"),
"awapit/men_pieza-radial-3-awa.mp3": dict(
    title="Pieza radial 3 (Awá)", authors=None, institution="MEN / Colombia Aprende", year=None, cat="?", secondary=[], evidence="audio_unverified",
    text_lang=None, community="Awá", municipality=None,
    source_url="http://www.colombiaaprende.edu.co/sites/default/files/files_public/2021-11/Pieza%20radial%203%20Awa.mp3",
    license="No especificada", access="community_permission_required", confidence="low", use=use(),
    notes="Audio de 4:18 sin transcripcion; ver pieza radial 1.", ocr="transcription_required"),
# ------------------------------------------------------------------ NASA YUWE
"nasa-yuwe/mincultura_lenguas-vivas_vol-IV-tomo-I_nasa-yuwa-namtrik.pdf": dict(
    title="Lenguas nasa yuwe y namtrik (Colección Lenguas Vivas de Colombia, Vol. IV, Tomo I)", authors="Equipo Universidad Externado de Colombia (dir. Jon Landaburu)", institution="Ministerio de Cultura; Instituto Caro y Cuervo; U. Externado", year=None,
    year_note="Se mencionan 2008-2010 como periodo del proyecto; año de publicacion no verificado",
    cat="S", secondary=[], evidence="sociolinguistic_survey", text_lang="es", community="Nasa; Namtrik (Misak)", municipality=None,
    source_url="https://mng.mincultura.gov.co/areas/poblaciones/APP-de-lenguas-nativas/Documents/Biblioteca-Lenguas-Vivas-De-Colombia/VOL.%20IV%20TOMO%20I%20-%20Lenguas%20nasa%20yuwa%20y%20namtrik.pdf",
    license="No especificada", access="internal_use_only", confidence="high", use=use(c=S_, t=S_),
    notes="Autodiagnostico de vitalidad con encuestas; cifras citables solo con pagina. No contiene vocabulario ni gramatica. Menciona resguardos y municipios del Cauca. La extraccion tiene algunos tokens ruidosos.",
    ocr="light_cleaning"),
"nasa-yuwe/mincultura_lenguas-vivas_vol-IV-tomo-2_minga.pdf": dict(
    title="La minga por la vida de las lenguas (Colección Lenguas Vivas de Colombia, Vol. IV, Tomo II)", authors="Equipo Universidad Externado de Colombia", institution="Ministerio de Cultura; Instituto Caro y Cuervo; U. Externado", year=None,
    cat="S", secondary=["C"], evidence="sociolinguistic_policy", text_lang="es", community="Pueblos de la region andina (incl. Nasa)", municipality=None,
    source_url="https://mng.mincultura.gov.co/areas/poblaciones/APP-de-lenguas-nativas/Documents/Biblioteca-Lenguas-Vivas-De-Colombia/VOL.%20IV%20-%20TOMO%202%20-%20MINGA%20(FINAL)%20(1).pdf",
    license="No especificada", access="internal_use_only", confidence="high", use=use(c=S_, t=S_),
    notes="Politicas linguisticas y vitalidad en la region andina; no es especifico de Nasa Yuwe. Menciona Cauca, Putumayo y Nariño.",
    ocr="none"),
"nasa-yuwe/proeib_pitto_transmision-del-nasa.pdf": dict(
    title="Transmisión del idioma Nasa en la comunidad de los Caleños", authors="Antonio Pito Nache", institution="PROEIB Andes, Universidad Mayor de San Simón (Bolivia)", year=2001,
    year_note="Año tomado del texto de la tesis; confirmar en la portada",
    cat="S", secondary=["C"], evidence="sociolinguistic_thesis", text_lang="es+nasa_yuwe", community="Nasa, comunidad de Los Caleños", municipality=None,
    source_url="https://www.humanas.unal.edu.co/colantropos/files/5214/7292/7496/Antonio_Pitto_Transmision_del_nasa.pdf",
    license="No especificada", access="internal_use_only", confidence="high", use=use(c=S_, t=S_),
    notes="Tesis de maestria con trabajo de campo; incluye resumen en Nasa Yuwe (traduccion no verificada). Municipio de la comunidad no verificado en este analisis.",
    ocr="none"),
"nasa-yuwe/redalyc_413635242005.pdf": dict(
    title="Educación escolar, vida comunitaria y uso de las lenguas: reflexiones sobre el proceso en el pueblo nasa (paez)", authors="Abelardo Ramos Pacho; Tulio Rojas Curieux", institution="Universidad Pedagógica Nacional, Revista Colombiana de Educación n.º 48", year=2005,
    cat="S", secondary=[], evidence="sociolinguistic_article", text_lang="es", community="Nasa", municipality=None,
    source_url="https://www.redalyc.org/pdf/4136/413635242005.pdf",
    license="No verificada (acceso abierto Redalyc)", access="internal_use_only", confidence="high", use=use(c=S_),
    notes="Articulo sobre educacion y uso de la lengua; no incluye vocabulario ni gramatica.", ocr="none"),
"nasa-yuwe/scielo_corpus-nasa-yuwe-etiquetado.pdf": dict(
    title="Building a Nasa Yuwe Language Corpus and Tagging with a Metaheuristic Approach", authors="Sierra Martínez, Cobos, Corrales Muñoz, Rojas Curieux, Herrera-Viedma, Peluffo-Ordóñez", institution="Universidad del Cauca; Computación y Sistemas (SciELO México)", year=2018,
    year_note="Volumen 22 n.º 3 de la revista; confirmar año en la ficha SciELO",
    cat="L", secondary=[], evidence="computational_linguistics_method", text_lang="en", community="Nasa", municipality=None,
    source_url="https://www.scielo.org.mx/pdf/cys/v22n3/1405-5546-cys-22-03-881.pdf",
    license="No verificada (acceso abierto SciELO)", access="internal_use_only", confidence="medium", use=use(g=S_),
    notes="Describe como se construyo y etiqueto un corpus; el corpus mismo NO esta incluido. No usar para traducciones. Contiene caracteres de reemplazo (U+FFFD) en algunas paginas.",
    ocr="light_cleaning"),
"nasa-yuwe/ling-fi_dic-nasa.pdf": dict(
    title="NASA YUWE / PÁEZ (Diccionario etnolingüístico y guía bibliográfica de los pueblos indígenas sudamericanos)", authors="Alain Fabre", institution="ling.fi (publicación del autor)", year=2005,
    year_note="Obra de 2005; la ficha indica última modificación 20/06/20",
    cat="B", secondary=["C"], evidence="bibliographic_reference", text_lang="es", community="Nasa (Páez)", municipality=None,
    source_url="https://www.ling.fi/Entradas%20diccionario/Dic=Nasa.pdf",
    license="No especificada", access="internal_use_only", confidence="low", use=use(c=S_, t=S_),
    notes="Ficha enciclopedica con bibliografia: sirve para localizar fuentes, NO como evidencia linguistica. Texto con tokens ruidosos (guiones/numeros de pagina).",
    ocr="light_cleaning"),
# ------------------------------------------------------------------ A'INGAE
"ainga-cofan/sil-borman_vocabulario-cofan-1976.pdf": dict(
    title="Vocabulario cofán: cofán-castellano, castellano-cofán", authors="Marlytte Borman; Roberta Borman (SIL)", institution="Instituto Lingüístico de Verano (SIL), vía Internet Archive", year=1976,
    cat="L", secondary=[], evidence="primary_linguistic_data_unread", text_lang="aingae+es", community="Cofán (A'ingae)", municipality=None,
    source_url="https://archive.org/download/cofan-dictionary/VocabCofan_15403.pdf",
    license="Derechos reservados SIL; Internet Archive no declara licencia", access="internal_use_only",
    confidence="low", use=use(),
    notes="130 paginas SIN capa de texto. OCR Tesseract hecho (ocr/unreviewed, confianza media 91,6) pero la oclusiva glotal y los acentos salen mal en muchas entradas: NO es fuente de vocabulario hasta revisarlo. Ortografia de 1976, distinta a la actual; validar contra una fuente moderna. Unico lexico bilingue cofan-español localizado.",
    ocr="required"),
"ainga-cofan/anderbois-et-al_jipa_illustration-aingae.pdf": dict(
    title="A'ingae (Cofán), Illustrations of the IPA", authors="Chiara Repetti-Ludlow; Haoru Zhang; Hugo Lucitante; Scott AnderBois", institution="Brown University; Journal of the International Phonetic Association", year=2019,
    cat="L", secondary=[], evidence="descriptive_linguistic_analysis", text_lang="en", community="Cofán (A'ingae)", municipality=None,
    source_url="https://anderbois.github.io/PDFs/JIPA.pdf", license="Copia de los autores; derechos de la revista no especificados", access="internal_use_only",
    confidence="high", use=use(g=P),
    notes="Fonetica/fonologia con un hablante cofan como coautor. Las ilustraciones usan simbolos IPA: verificar que se conservan.", ocr="light_cleaning"),
"ainga-cofan/fischer-hengeveld_aingae-handbook-chapter-2023.pdf": dict(
    title="A'ingae (Cofán), cap. 2 de Amazonian Languages: an international handbook", authors="Rafael Fischer; Kees Hengeveld", institution="Universidad de Ámsterdam (UvA-DARE); De Gruyter", year=2023,
    cat="L", secondary=[], evidence="descriptive_linguistic_analysis", text_lang="en", community="Cofán (A'ingae)", municipality=None,
    source_url="https://pure.uva.nl/ws/files/134870247/10.1515_9783110419405_002.pdf", license="Acceso abierto por art. 25fa de la ley neerlandesa de derechos de autor (declarado en el PDF)", access="open_with_conditions",
    confidence="high", use=use(g=P),
    notes="Bosquejo gramatical. Datos principalmente de Rafael Fischer 2001-2006 segun el propio capitulo. El art. 25fa permite un uso limitado: confirmar sus condiciones antes de redistribuir.", ocr="none"),
"ainga-cofan/fischer-hengeveld_open-linguistics_operators_2018.pdf": dict(
    title="A'ingae (Cofán/Kofán) Operators", authors="Kees Hengeveld; Rafael Fischer", institution="Universidad de Ámsterdam (UvA-DARE); Open Linguistics 4", year=2018,
    cat="L", secondary=[], evidence="descriptive_linguistic_analysis", text_lang="en", community="Cofán (A'ingae)", municipality=None,
    source_url="https://pure.uva.nl/ws/files/36479109/_Open_Linguistics_Aingae_CofnKofn_Operators.pdf", license="CC BY-NC-ND (declarada en el PDF)", access="open_with_conditions",
    confidence="high", use=use(g=P),
    notes="CC BY-NC-ND: se puede citar con atribucion, uso no comercial y sin obras derivadas; confirmar si fragmentar/indexar cuenta como derivacion antes de publicar.", ocr="light_cleaning"),
"ainga-cofan/hengeveld-fischer_ch3-phonology_2022-draft.pdf": dict(
    title="A grammar of A'ingae, cap. 3 Fonología (borrador 2022-03-08)", authors="Kees Hengeveld; Rafael Fischer", institution="Universidad de Ámsterdam", year=2022,
    cat="L", secondary=[], evidence="draft_linguistic_analysis", text_lang="en", community="Cofán (A'ingae)", municipality=None,
    source_url="https://keeshengeveld.humanities.uva.nl/publications/A%20Grammar%20of%20A'ingae/Hengeveld%20%26%20Fischer%20in%20prep.%20Chapter%203%20Phonology%2020220308.pdf",
    license="No especificada (borrador 'in prep.')", access="internal_use_only", confidence="medium", use=use(g=S_),
    notes="Borrador: puede cambiar en la version publicada. Citar siempre como borrador y con fecha.", ocr="light_cleaning"),
"ainga-cofan/hengeveld-fischer_ch5-syntax_2023-draft.pdf": dict(
    title="A grammar of A'ingae, cap. 5 Sintaxis (borrador 2023-03-09)", authors="Kees Hengeveld; Rafael Fischer", institution="Universidad de Ámsterdam", year=2023,
    cat="L", secondary=[], evidence="draft_linguistic_analysis", text_lang="en", community="Cofán (A'ingae)", municipality=None,
    source_url="https://keeshengeveld.humanities.uva.nl/publications/A%20Grammar%20of%20A'ingae/Hengeveld%20%26%20Fischer%20in%20prep.%20Chapter%205%20Syntax%2020230309.pdf",
    license="No especificada (borrador 'in prep.')", access="internal_use_only", confidence="medium", use=use(g=S_),
    notes="Borrador; ver capitulo 3. Ruido moderado por glosas interlineales.", ocr="light_cleaning"),
# ------------------------------------------------------------------ INGA
"inga/cultural-survival_cartilla-cabildo-inga-santiago.pdf": dict(
    title="Fortalecimiento de la lengua materna Inga a través de talleres de teatro y canto en lengua propia", authors="Cabildo Inga de Santiago", institution="Cabildo Inga de Santiago; Cultural Survival", year=None,
    cat="S", secondary=["C", "L"], evidence="community_text_untranslated", text_lang="inga+es", community="Inga (Cabildo Inga de Santiago)", municipality="Santiago (Putumayo) [inferido del nombre del cabildo]",
    source_url="https://culturalsurvival.org/sites/default/files/CARTILLA%20SURVIVAL%20FINAL.pdf",
    license="No especificada", access="community_permission_required", confidence="medium", use=use(c=S_),
    notes="Contiene textos en Inga (p. ej. relatos) junto a texto en español. No hay traduccion verificada pagina a pagina: NO derivar vocabulario ni traducciones. Es la unica fuente textual en Inga del corpus.",
    ocr="none"),
"inga/unal_chasoy-et-al_numeracion-en-lengua-inga.pdf": dict(
    title="La numeración en lengua inga", authors="María Teresa Chasoy; María Emilia Montes; Marcela Hernández; Sofía Marmolejo (Grupo de trabajo sobre lengua inga)", institution="Universidad Nacional de Colombia, Forma y Función", year=None,
    year_note="Curso de 1999; año de publicacion no verificado",
    cat="L", secondary=[], evidence="primary_linguistic_data_partial", text_lang="es+inga", community="Inga (Valle de Sibundoy)", municipality=None,
    source_url="https://revistas.unal.edu.co/index.php/formayfuncion/article/download/17188/18039/54388",
    license="No verificada (revista de acceso abierto)", access="community_permission_required", confidence="high", use=use(v=P, g=S_),
    notes="Solo numerales y uso de la yupana; no es un diccionario general.", ocr="light_cleaning"),
"inga/uniremington_becerra_propuesta-diccionario-inga-yunguillo-2023.pdf": dict(
    title="Propuesta para crear un diccionario Inga mediante programación con Django en Python (Institución Educativa Rural Aborígenes de Colombia, resguardo de Yunguillo)", authors="James Rafael Becerra Jacanamejoy", institution="Corporación Universitaria Remington", year=2023,
    cat="S", secondary=[], evidence="technical_proposal", text_lang="es", community="Inga (resguardo de Yunguillo)", municipality=None,
    source_url="https://repositorio.uniremington.edu.co/bitstreams/6856fa02-7cd0-41bf-810a-24f1a00f129e/download",
    license="No especificada", access="internal_use_only", confidence="low", use=use(),
    notes="Trabajo de ingenieria de sistemas; no es fuente linguistica. No usar para vocabulario aunque contenga ejemplos.", ocr="none"),
# ------------------------------------------------------------------ PASTO / QUILLASINGA
"pasto-quillasinga/mincultura_pueblo-pastos.pdf": dict(
    title="Caracterización: Pasto, los hijos del sol", authors=None, institution="Ministerio de Cultura, Dirección de Poblaciones", year=None,
    cat="C", secondary=[], evidence="official_characterization", text_lang="es", community="Pueblo Pasto",
    municipality="Aldana, Córdoba, Cuaspud, Cumbal, Guachucal, Ipiales, Mallama, Potosí, Santacruz, Túquerres (Nariño)",
    source_url="https://mng.mincultura.gov.co/prensa/noticias/Documents/Poblaciones/PUEBLO%20PASTOS.pdf",
    license="No especificada", access="internal_use_only", confidence="high", use=use(c=P, t=P, h=S_),
    notes="Lista de municipios tomada del primer parrafo del documento. Documento corto (3 paginas). Los datos demograficos y de lengua deben citarse con pagina.", ocr="none"),
"pasto-quillasinga/mincultura_pueblo-quillacinga.pdf": dict(
    title="Caracterización: Quillacinga, los hijos de la luna", authors=None, institution="Ministerio de Cultura, Dirección de Poblaciones", year=None,
    cat="C", secondary=[], evidence="official_characterization", text_lang="es", community="Pueblo Quillacinga",
    municipality="Pasto, La Florida, Tangua, La Cruz (Nariño) [segun el primer parrafo]",
    source_url="https://mng.mincultura.gov.co/prensa/noticias/Documents/Poblaciones/PUEBLO%20QUILLACINGA.pdf",
    license="No especificada", access="internal_use_only", confidence="high", use=use(c=P, t=P, h=S_),
    notes="Documento corto (3 paginas). Contiene afirmaciones sobre la lengua perdida y rastros historicos: tratarlas como declaraciones institucionales, no como datos linguisticos.", ocr="none"),
"pasto-quillasinga/redalyc_ceballos_quillasinga-mocondino.pdf": dict(
    title="El cabildo de indígenas: de la opresión colonial a la resistencia contemporánea. El caso del pueblo quillasinga de Mocondino (San Juan de Pasto, Colombia)", authors="Franco Ceballos Rosero", institution="Universidad de Tarapacá, Diálogo Andino n.º 49", year=2016,
    cat="H", secondary=["C"], evidence="historical_ethnographic_article", text_lang="es", community="Pueblo quillasinga de Mocondino", municipality="San Juan de Pasto (Nariño)",
    source_url="https://www.redalyc.org/pdf/3713/371345325030.pdf", license="No verificada (acceso abierto Redalyc)", access="internal_use_only",
    confidence="high", use=use(c=S_, t=S_, h=P),
    notes="Historia del cabildo y la resistencia; no aporta lengua.", ocr="none"),
"pasto-quillasinga/banrep_fian_5130.pdf": dict(
    title="Intento de delimitación del territorio de los grupos étnicos Pastos y Quillacingas en el altiplano nariñense", authors="Ana María Groot de Mahecha", institution="Banco de la República, Fundación de Investigaciones Arqueológicas Nacionales", year=1991,
    year_note="Año de la obra segun la reseña del ICANH (1991)",
    cat="H", secondary=["C"], evidence="historical_archaeological_study", text_lang="es", community="Pastos; Quillacingas", municipality=None,
    source_url="https://publicaciones.banrepcultural.org/index.php/fian/article/download/5130/5381/10514", license="No verificada", access="internal_use_only",
    confidence="high", use=use(t=P, h=P),
    notes="Estudio interdisciplinar (historia, lingüística, arqueología) sobre el poblamiento. Las inferencias sobre lengua son hipotesis academicas, no datos.", ocr="none"),
"pasto-quillasinga/icanh_rca_1843.pdf": dict(
    title="Los Quillacinga y su posible relación con grupos prehispánicos del oriente ecuatoriano", authors="María Clemencia Ramírez de Jara", institution="ICANH, Revista Colombiana de Antropología XXIX", year=1992,
    cat="H", secondary=[], evidence="historical_hypothesis", text_lang="es", community="Quillacinga", municipality=None,
    source_url="https://revistas.icanh.gov.co/index.php/rca/article/download/1843/1392", license="No verificada", access="internal_use_only", confidence="medium",
    use=use(t=S_, h=P),
    notes="Plantea relaciones entre grupos quillacinga y quichua/otros; son HIPOTESIS. No presentar como hechos linguisticos.", ocr="none"),
"pasto-quillasinga/icanh_rca_1844.pdf": dict(
    title="Pastos y Quillacingas: dos grupos étnicos en busca de identidad arqueológica", authors="Felipe Cárdenas Arroyo", institution="ICANH, Revista Colombiana de Antropología XXIX", year=1992,
    cat="H", secondary=[], evidence="historical_archaeological_study", text_lang="es", community="Pastos; Quillacingas", municipality=None,
    source_url="https://revistas.icanh.gov.co/index.php/rca/article/download/1844/1393/6131", license="No verificada", access="internal_use_only", confidence="medium",
    use=use(t=S_, h=P),
    notes="Arqueologia; algunas paginas son figuras sin texto.", ocr="light_cleaning"),
"pasto-quillasinga/icanh_rca_1853.pdf": dict(
    title="Reseña de Groot de Mahecha & Hooykaas (1991), Intento de delimitación del territorio de los grupos étnicos pastos y quillacingas", authors=None, institution="ICANH, Revista Colombiana de Antropología", year=1992,
    year_note="Reseña del mismo volumen XXIX; confirmar",
    cat="B", secondary=["H"], evidence="bibliographic_reference", text_lang="es", community="Pastos; Quillacingas", municipality=None,
    source_url="https://revistas.icanh.gov.co/index.php/rca/article/download/1853/1401/6160", license="No verificada", access="internal_use_only", confidence="low",
    use=use(h=S_),
    notes="Reseña breve (5 paginas): sirve como puente a la obra reseñada, no como fuente primaria.", ocr="none"),
}
# fmt: on

WANT_TYPES = ["vocabulary", "grammar", "culture", "territory", "history"]


OCR_DOCS = {
    "ainga-cofan/sil-borman_vocabulario-cofan-1976.pdf": dict(stem="sil-borman_vocabulario-cofan-1976", lang="spa", psm=3),
    "awapit/anu_curnow-1997_grammar-of-awa-pit.pdf": dict(stem="anu_curnow-1997_grammar-of-awa-pit", lang="eng", psm=4),
}
# Paginas con transcripcion verificada contra la imagen (no equivale a validacion linguistica por hablantes)
VALIDATED_PAGES = {"awapit/anu_curnow-1997_grammar-of-awa-pit.pdf": [78]}
# Hallazgos de la evaluacion manual (ver ocr/evaluation.md)
OCR_ERROR_CLASSES = {
    "ainga-cofan/sil-borman_vocabulario-cofan-1976.pdf": [
        "oclusiva glotal (') leida como '!' (162 casos dentro de palabra en 52 paginas) o como 'l', o perdida",
        "acentos y diacriticos perdidos (p. ej. 'ítsaye' -> 'itsaye')",
        "se pierde la negrita que separa cabeza de entrada y glosa",
        "ilustraciones y rotulos se mezclan con el texto",
    ],
    "awapit/anu_curnow-1997_grammar-of-awa-pit.pdf": [
        "letras y digitos confundidos: 'I' leida como '1', '[' o '1s' por 'is'",
        "formas awapit alteradas en ejemplos (p. ej. 'piya' leida 'piva'; 'nukulmaraw' con 'v' insertada)",
        "simbolos foneticos especiales y diacriticos no reconocidos por el modelo ingles",
        "marcas de nota al pie (superindices) leidas como comillas",
        "numeracion de ejemplos mal leida ('(28)' leida '(23)'); '/' leida como espacio; '.' sobrante en glosas",
        "paginas 7-17: indice y listas con puntos guia generan ruido",
        "alineacion de glosas interlineales solo aproximada; tablas conservadas por espacios con barras '|' espurias",
    ],
}


def load_ocr():
    """Lee ocr/unreviewed/*.pages.jsonl y ocr/validated/*.txt. Devuelve {doc_path: {page: record}}."""
    out = {}
    for path, o in OCR_DOCS.items():
        f = RAG / "ocr" / "unreviewed" / f'{o["stem"]}.pages.jsonl'
        if not f.exists():
            continue
        recs = {}
        for line in f.read_text(encoding="utf-8").splitlines():
            r = json.loads(line)
            recs[r["page"]] = r
        out[path] = recs
    return out


def readiness(path, page, rec):
    """no | prose_only_forms_unverified | validated_transcription"""
    if page in VALIDATED_PAGES.get(path, []):
        return "validated_transcription"
    if path.startswith("ainga-cofan/"):
        return "no"  # glotal y acentos poco fiables: no es fuente de vocabulario hasta revision
    if rec["mean_conf"] is None or rec["mean_conf"] < 85:
        return "no"
    return "prose_only_forms_unverified"


def main():
    q = json.loads((RAG / "quality_report.json").read_text(encoding="utf-8"))
    files = set(q)
    assert files == set(DOCS), (files ^ set(DOCS))
    docs = []
    for path, m in DOCS.items():
        folder = path.split("/")[0]
        lang_name, lang_code = LANG[folder]
        qual = q[path]
        docs.append({
            "document_id": path.replace("/", "__").rsplit(".", 1)[0],
            "path": f"corpus/{path}",
            "title": m["title"], "authors": m.get("authors"), "institution": m["institution"],
            "year": m["year"], "year_note": m.get("year_note"),
            "language": lang_name, "language_code": lang_code, "text_language": m["text_lang"],
            "category": CATS[m["cat"]], "secondary_categories": [CATS[c] for c in m["secondary"]],
            "evidence_class": m["evidence"],
            "community": m["community"], "municipality": m["municipality"],
            "source": m["source_url"], "license": m["license"], "access_level": m["access"],
            "confidence": m["confidence"],
            "rag_use": m["use"],
            "text_quality": {k: qual.get(k) for k in ("grade", "pages", "pages_without_text", "total_words", "mixed_alnum_per_1000_words", "flags")},
            "ocr_action": m["ocr"],
            "notes": m["notes"],
        })
    ocr = load_ocr()
    for d in docs:
        p = d["path"].removeprefix("corpus/")
        if p not in ocr:
            continue
        recs = ocr[p]
        confs = [r["mean_conf"] for r in recs.values() if r["mean_conf"] is not None]
        rd = {pg: readiness(p, pg, r) for pg, r in recs.items()}
        d["ocr"] = {
            "engine": "tesseract 5.4.0", "lang": OCR_DOCS[p]["lang"], "psm": OCR_DOCS[p]["psm"], "dpi": 300,
            "pages_processed": len(recs), "pages_list_file": f'corpus/_rag/ocr/unreviewed/{OCR_DOCS[p]["stem"]}.pages.jsonl',
            "mean_conf": round(sum(confs) / len(confs), 1),
            "pages_conf_ge_90": sum(c >= 90 for c in confs), "pages_conf_lt_85": sum(c < 85 for c in confs),
            "text_status": "ocr_unreviewed",
            "pages_validated_vs_image": VALIDATED_PAGES.get(p, []),
            "linguistic_validation": "pending (sin hablante ni revision de especialista)",
            "index_readiness_counts": {k: list(rd.values()).count(k) for k in ("no", "prose_only_forms_unverified", "validated_transcription")},
            "known_error_classes": OCR_ERROR_CLASSES[p],
        }
        d["ocr_action"] = "ocr_done_unreviewed" if p.startswith("ainga-cofan/") else "reocr_done_noisy_pages_forms_unverified"
    (RAG / "documents.json").write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding="utf-8")

    by_id = {d["path"].removeprefix("corpus/"): d for d in docs}
    n_pages = 0
    with (RAG / "pages.jsonl").open("w", encoding="utf-8", newline="\n") as out:
        for jl in sorted((RAG / "text").glob("*/*.pages.jsonl")):
            for line in jl.read_text(encoding="utf-8").splitlines():
                r = json.loads(line)
                d = by_id[r["document"]]
                words = len(re.findall(r"[^\W\d_]+", r["text"]))
                mixed = len(re.findall(r"\b(?=[A-Za-z]*\d)(?=\d*[A-Za-z])[A-Za-z0-9]{4,}\b", r["text"]))
                if words < 5:
                    pq = "empty"
                elif mixed / max(words, 1) > 0.02 or "�" in r["text"]:
                    pq = "noisy"
                else:
                    pq = "ok"
                n_pages += 1
                out.write(json.dumps({
                    "chunk_id": f'{d["document_id"]}::p{r["page"]:04d}',
                    "text": r["text"] if pq != "empty" else "",
                    "page": r["page"],  # indice de pagina del PDF (1 = primera), NO la numeracion impresa
                    "page_quality": pq,
                    "document": d["title"], "document_id": d["document_id"],
                    "language": d["language"], "category": d["category"],
                    "community": d["community"], "municipality": d["municipality"],
                    "source": d["source"], "institution": d["institution"], "year": d["year"],
                    "confidence": d["confidence"] if pq == "ok" else ("low" if pq == "empty" else max(d["confidence"], "medium", key=["high", "medium", "low"].index)),
                    "license": d["license"], "access_level": d["access_level"],
                    "evidence_class": d["evidence_class"],
                }, ensure_ascii=False) + "\n")

    # pages_ocr.jsonl: texto OCR por pagina, SEPARADO de pages.jsonl (texto de capa original)
    n_ocr = 0
    with (RAG / "pages_ocr.jsonl").open("w", encoding="utf-8", newline="\n") as out:
        for p, recs in ocr.items():
            d = by_id[p]
            for pg in sorted(recs):
                r = recs[pg]
                vfile = RAG / "ocr" / "validated" / f'{OCR_DOCS[p]["stem"]}.p{pg:04d}.txt'
                validated = pg in VALIDATED_PAGES.get(p, []) and vfile.exists()
                text = vfile.read_text(encoding="utf-8") if validated else r["text"]
                n_ocr += 1
                out.write(json.dumps({
                    "chunk_id": f'{d["document_id"]}::p{pg:04d}::ocr',
                    "text": text, "page": pg,
                    "text_status": "validated_vs_image" if validated else "ocr_unreviewed",
                    "ocr_mean_conf": r["mean_conf"], "ocr_low_conf_words": r["low_conf_words"], "ocr_n_words": r["n_words"],
                    "index_readiness": readiness(p, pg, r),
                    "linguistic_validation": "pending",
                    "document": d["title"], "document_id": d["document_id"],
                    "language": d["language"], "category": d["category"],
                    "community": d["community"], "municipality": d["municipality"],
                    "source": d["source"], "institution": d["institution"], "year": d["year"],
                    "confidence": "low" if readiness(p, pg, r) == "no" else "medium" if not validated else "high",
                    "license": d["license"], "access_level": d["access_level"],
                    "evidence_class": d["evidence_class"],
                }, ensure_ascii=False) + "\n")
    print("paginas OCR:", n_ocr)

    routing = {t: {"primary": [], "supporting": []} for t in WANT_TYPES}
    for d in docs:
        for t, lvl in d["rag_use"].items():
            if lvl in ("primary", "supporting"):
                usable = d["text_quality"]["grade"] not in ("E", "N/A")
                routing[t][lvl].append({
                    "document_id": d["document_id"], "language": d["language"],
                    "evidence_class": d["evidence_class"],
                    "usable_now": usable, "access_level": d["access_level"],
                })
    (RAG / "routing.json").write_text(json.dumps(routing, ensure_ascii=False, indent=2), encoding="utf-8")
    print("documentos:", len(docs), "paginas:", n_pages)


if __name__ == "__main__":
    main()
