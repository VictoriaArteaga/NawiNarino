"""Contenido REAL de las lenguas (reemplaza los registros de demostración).

Cada dato sale de un documento del corpus y lleva documento + página + cita textual. `verify()` comprueba por
programa que la cita aparece en esa página (comparación sin mayúsculas ni signos) y que la palabra/traducción están
en la cita: si alguna no coincide, NO se carga. Todo queda como «aprobado por el equipo, sin validación de hablantes».

Uso (desde backend/):
    python -m scripts.real_content            # solo verifica (no toca la base de datos)
    python -m scripts.real_content --apply    # verifica y reemplaza los registros de demostración en la base configurada
"""

from __future__ import annotations

import json
import random
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PAGES = ROOT / "corpus" / "_rag" / "pages.jsonl"
DOCS = ROOT / "corpus" / "_rag" / "documents.json"
REGISTRY = ROOT / "backend" / "rag_data" / "real" / "authorizations.json"
ALFABETO = ROOT / "backend" / "rag_data" / "real" / "transcriptions" / "unipa_alfabeto-awa.json"

AWA, INGA, AINGAE, NASA = "Awá Pit", "Inga", "A'ingae", "Nasa Yuwe"

PEC = "awapit__unipa_PEC-inkal-awa"
HB = "ainga-cofan__fischer-hengeveld_aingae-handbook-chapter-2023"
NUM = "inga__unal_chasoy-et-al_numeracion-en-lengua-inga"
PITO = "nasa-yuwe__proeib_pitto_transmision-del-nasa"
RED = "nasa-yuwe__redalyc_413635242005"
LV = "nasa-yuwe__mincultura_lenguas-vivas_vol-IV-tomo-"  # prefijo: se resuelve tomo I / tomo 2 por la cita

# (lengua, palabra, significado, categoría, documento, página, cita, modo)
# modo "pair": palabra y significado deben estar en la cita. modo "numeral": la palabra debe estar en la cita/página.
V: list[tuple] = [
    # ---- Awá Pit (PEC UNIPA 2019) ----
    (AWA, "ɨnkal Awá", "gente de la selva", "Pueblo", PEC, 32, "Al llamarnos ɨnkal Awá “gente de la selva”", "pair"),
    (AWA, "Pi Awá", "gente de río", "Pueblo", PEC, 32, "la gente de río – Pi Awá", "pair"),
    (AWA, "Put Awá", "gente de loma", "Pueblo", PEC, 32, "la gente de loma –Put Awá", "pair"),
    (AWA, "Ishkum Awá", "gente del primer mundo", "Pueblo", PEC, 32, "gente del primer mundo -Ishkum Awá", "pair"),
    (AWA, "pãnchit tit", "cordón umbilical", "Tejido", PEC, 83, "al que se llama pãnchit tit “cordón umbilical”", "pair"),
    (AWA, "Kɨnaz Patapcha", "luna clara", "Naturaleza", PEC, 102, "Kɨnaz Patapcha (Luna Clara )", "pair"),
    (AWA, "Tɨtnaz patapcha", "luna oscura", "Naturaleza", PEC, 102, "Tɨtnaz patapcha (luna oscura)", "pair"),
    (AWA, "Kuna", "tierno", "Naturaleza", PEC, 102, "los árboles y las personas están tiernos “Kuna”", "pair"),
    (AWA, "Sam", "maduro", "Naturaleza", PEC, 102, "los árboles y las personas están maduros, “Sam”", "pair"),
    (AWA, "Tɨh napnu", "entra frío", "Naturaleza", PEC, 104, "Tɨh napnu “entra frío”", "pair"),
    (AWA, "sau", "espacio vital Awá", "Territorio", PEC, 104, "al sau (espacio vital Awá)", "pair"),
    # ---- Nasa Yuwe ----
    (NASA, "Nasa", "gente", "Pueblo", PITO, 42, "la palabra Nasa significa: “gente, aquí, con la gente, minga, la misma, los mismos, partes de la tierra”", "pair"),
    (NASA, "yuwe", "boca, palabra", "Lengua", RED, 13, "Yuwe es el término utilizado para designar “labio”, “boca”, “palabra”", "pair"),
    (NASA, "nasa yuwe", "lengua de los paeces", "Lengua", RED, 13, "nasa yuwe (“lengua de los paeces”)", "pair"),
    (NASA, "wakas", "blancos", "Pueblo", RED, 13, "Los wakas (blancos)", "pair"),
    (NASA, "musxka", "blancos", "Pueblo", LV, 83, "los musxka (‘blancos’)", "pair"),
    (NASA, "sa’t", "caciques", "Autoridad", LV, 83, "los sa’t (‘caciques’)", "pair"),
    (NASA, "kase", "calmar el dolor", "Palabras", LV, 101, "kase (‘calmar el dolor’)", "pair"),
    (NASA, "kuse", "mano", "Cuerpo", LV, 101, "kuse (‘mano’)", "pair"),
    (NASA, "tel", "telar", "Casa y trabajo", LV, 101, "tel (‘telar’)", "pair"),
    (NASA, "tul", "huerto", "Casa y trabajo", LV, 101, "tul (‘huerto’)", "pair"),
    (NASA, "misx", "gato", "Animales", LV, 101, "misx (‘gato’)", "pair"),
    (NASA, "musx", "fracción", "Palabras", LV, 101, "musx (‘fracción’)", "pair"),
    (NASA, "sxûulepha", "orejiperro (planta)", "Plantas", PITO, 51, "en Nasa se llama ”sxûulepha” (orejiperro)", "pair"),
    (NASA, "kwet pûc", "espadilla (planta)", "Plantas", PITO, 51, "otra planta que se llama “kwet pûc,” (espadilla)", "pair"),
    # ---- Inga (Valle del Sibundoy) ----
    *[
        (INGA, w, n, "Números", NUM, 6, "Los términos básicos para los números son los siguientes", "numeral")
        for w, n in [("Sug", "1"), ("Iskai", "2"), ("Kimsa", "3"), ("Chusku", "4"), ("Pichka", "5"), ("Sugta", "6"),
                     ("Kanchis", "7"), ("Pusag", "8"), ("Iskun", "9"), ("Chunga", "10"), ("Patsa", "100"),
                     ("Uaranga", "1000")]
    ],
    # ---- A'ingae (Fischer y Hengeveld 2023, a partir de Borman 1976) ----
    (AINGAE, "fûe", "1", "Números", HB, 19, "A'ingae words fûe ‘one’ and khuangi ‘two’", "numeral"),
    (AINGAE, "khuangi", "2", "Números", HB, 19, "A'ingae words fûe ‘one’ and khuangi ‘two’", "numeral"),
    (AINGAE, "khuanifûe", "3", "Números", HB, 19, "sometimes the word khuanifûe ‘three’", "numeral"),
    (AINGAE, "khathûfayi", "4", "Números", HB, 19, "khathûfayi ‘four’", "numeral"),
    (AINGAE, "fûefayi", "5", "Números", HB, 19, "fûefayi ‘five’", "numeral"),
    (AINGAE, "khafaiseyi", "6", "Números", HB, 19, "khafaiseyi ‘six’", "numeral"),
    (AINGAE, "khafaise(yi)khuangi", "7", "Números", HB, 19, "khafaise(yi)khuangi ‘seven’", "numeral"),
    (AINGAE, "khafaise(yi)khuanifûe", "8", "Números", HB, 19, "khafaise(yi)khuanifûe ‘eight’", "numeral"),
    (AINGAE, "khafaise(yi)khathûfayi", "9", "Números", HB, 19, "khafaise(yi)khathûfayi ‘nine’", "numeral"),
    (AINGAE, "tive pa’tshi", "10", "Números", HB, 19, "tive pa’tshi ‘ten’", "numeral"),
    (AINGAE, "tsû’thepi pa’tshi", "20", "Números", HB, 19, "tsû’thepi pa’tshi ‘twenty’", "numeral"),
]

LANGS = {
    AWA: (
        "Lengua del pueblo ɨnkal Awá («gente de la selva»), representado por la Unidad Indígena del Pueblo Awá (UNIPA). "
        "El pueblo Awá se cuenta entre los siete pueblos indígenas de Nariño.",
        "La UNIPA elabora materiales bilingües (diccionario, conjugaciones, alfabeto y guías pedagógicas) para revitalizar el "
        "awapit y mantener viva la memoria ancestral. Contenido tomado de documentos de la UNIPA y del Ministerio de "
        "Educación.",
    ),
    INGA: (
        "Lengua de la comunidad inga del Valle del Sibundoy; es el dialecto más norteño del quechua.",
        "Su sistema de numeración oral es decimal y sigue vigente entre los hablantes en el cálculo cotidiano y el comercio. "
        "Hay comunidades ingas en el Valle del Sibundoy, Santiago y el resguardo de Yunguillo (Putumayo). "
        "Contenido tomado de estudios académicos y de cartillas del cabildo.",
    ),
    AINGAE: (
        "Lengua del pueblo Cofán, hablada en Putumayo y Nariño (Colombia), a lo largo de los ríos San Miguel, Guamués y "
        "Putumayo, y en Sucumbíos (Ecuador).",
        "Según UNESCO (2008) había 379 hablantes en Colombia y 600 en Ecuador, y la lengua se considera severamente en "
        "peligro en Colombia. Las fuentes registran una actitud positiva hacia la lengua. Contenido tomado de estudios "
        "lingüísticos.",
    ),
    NASA: (
        "Lengua del pueblo Nasa, presente en el departamento del Cauca (Tierradentro). Yuwe significa «boca», «palabra»: "
        "nasa yuwe es «la lengua de los nasa».",
        "Los propios nasa explican que Nasa significa «gente» y que piensan y se nombran desde su lengua. La lengua es "
        "central en ceremonias y en la transmisión entre generaciones. Contenido tomado de estudios sociolingüísticos y "
        "de la investigación de Antonio Pito.",
    ),
}

# (lengua, título, descripción)
CULTURAL: list[tuple[str, str, str]] = [
    (AWA, "ɨnkal Awá: gente de la selva",
     "Al llamarse ɨnkal Awá («gente de la selva»), el pueblo Awá describe su origen y su convivencia con otros habitantes de la "
     "selva y del universo, como la gente de río (Pi Awá), la gente de loma (Put Awá) y la gente del primer mundo (Ishkum Awá). "
     "Fuente: Proyecto Educativo Comunitario de la UNIPA (2019), p. 32."),
    (AWA, "El tejido de la higra y el canasto",
     "Cuando una higra se completa, las tejedoras dejan un hilo llamado pãnchit tit («cordón umbilical») para simbolizar que la vida "
     "no se acaba. Los mayores enseñan que en el canasto está escrita la cosmovisión Awá: sus agujeros son los «ojos de mirar el mundo "
     "Awá» (los ríos, las selvas, las lomas). Fuente: PEC de la UNIPA (2019), pp. 83-84."),
    (AWA, "Las lunas y el cuidado de la selva",
     "El calendario Awá distingue la luna clara (Kɨnaz Patapcha: creciente y llena) y la luna oscura (Tɨtnaz patapcha: menguante y nueva). "
     "Los mayores cuentan que en la luna clara árboles y personas están tiernos (Kuna) y en la oscura, maduros (Sam); por eso no se "
     "recomienda cortar madera en luna clara. Fuente: PEC de la UNIPA (2019), p. 102."),
    (INGA, "Un sistema de numeración decimal vigente",
     "El sistema numérico inga es decimal: las cantidades mayores a diez, cien y mil se construyen combinando los términos básicos. "
     "Es un sistema plenamente vigente entre los hablantes, que lo usan en la economía doméstica y en el comercio. "
     "Fuente: Chasoy, Montes, Hernández y Marmolejo, «La numeración en lengua inga», pp. 142-145."),
    (INGA, "Cuerdas con nudos y tablas de cálculo",
     "Para aprender y calcular se usan cuerdas de colores con nudos (amarillo, rojo, blanco y negro son los colores básicos), semillas y "
     "tablas de conteo. Cada cuerda representa unidades, decenas, centenas o miles. Fuente: Chasoy et al., p. 144."),
    (AINGAE, "Una lengua en peligro",
     "El a'ingae se habla en Putumayo y Nariño (Colombia) y en Sucumbíos (Ecuador). UNESCO registró 379 hablantes en Colombia y 600 en "
     "Ecuador en 2008; se considera severamente en peligro en Colombia. Fuente: Fischer y Hengeveld (2023), p. 2."),
    (AINGAE, "Los numerales se están perdiendo",
     "Según Fischer y Hengeveld, la mayoría de los hablantes usa fûe («uno») y khuangi («dos»), y a veces khuanifûe («tres»); desde el tres "
     "se cuenta casi siempre con préstamos del español. Los demás numerales vienen de Borman (1976). Fuente: Fischer y Hengeveld (2023), p. 19."),
    (NASA, "Nasa: «gente»",
     "Antonio Pito explica que para ellos la palabra Nasa significa «gente, aquí, con la gente, minga, la misma, los mismos, partes de la "
     "tierra», y que se llaman nasa porque hablan la lengua nasa y piensan como nasa. Fuente: Pito Nache (2001), p. 42."),
    (NASA, "Yuwe: boca, palabra, lengua",
     "Yuwe designa «labio», «boca» y «palabra». Cada lengua se nombra con el nombre del grupo más yuwe: nasa yuwe («lengua de los paeces»), "
     "mu yuwe («lengua de los guambianos»); los wakas (blancos) tienen su lengua, wakas yuwe. Fuente: Ramos y Rojas (2005), p. 13."),
    (NASA, "Los sa’t y la lengua en la ceremonia",
     "Entre los roles de las autoridades están los sa’t («caciques»), compañeros vitalicios. Quienes hablan en la ceremonia lo hacen en nasa "
     "yuwe, pues «la lengua es única para validar el pensamiento». Fuente: Ministerio de Cultura, Lenguas vivas, vol. IV, p. 83."),
]

# (nombre, región, descripción, lengua|None, fuente_doc)
TERRITORIES: list[tuple] = [
    ("Territorio del pueblo Awá (UNIPA)", "Nariño",
     "Territorio del pueblo ɨnkal Awá, representado por la UNIPA. El sau es el «espacio vital Awá». Sin ubicación geográfica precisa en las fuentes del corpus.",
     AWA),
    ("Valle del Sibundoy", "Putumayo",
     "Valle donde se habla el inga estudiado por Chasoy et al. Otras comunidades ingas: Santiago y el resguardo de Yunguillo.", INGA),
    ("Territorio a'ingae (Putumayo y Nariño)", "Putumayo y Nariño",
     "Zona de los ríos San Miguel, Guamués y Putumayo, donde se habla el a'ingae en Colombia; al otro lado, el río Aguarico en Sucumbíos (Ecuador).",
     AINGAE),
    ("Tierradentro y comunidades nasa del Cauca", "Cauca",
     "Territorio nasa del departamento del Cauca. Los cabildantes indígenas cumplen el mandato de los dioses en Tierradentro.", NASA),
    ("Pueblo Pasto", "Nariño",
     "Habita en resguardos coloniales, resguardos del Incora y predios individuales de los municipios de Aldana, Córdoba, Cuaspud, Cumbal, "
     "Guachucal, Ipiales, Mallama, Potosí, Santacruz y Túquerres.", None),
    ("Pueblo Quillacinga", "Nariño",
     "Se ubicó tradicionalmente en el municipio de Pasto y en La Florida, Tangua y La Cruz, y en asentamientos del área suburbana de Pasto.", None),
]

# (título, categoría, etiqueta de fecha, descripción, territorio, fuente_doc)
HERITAGE: list[tuple] = [
    ("El pueblo Pasto, «los hijos del sol»", "cultural", "Caracterización del Ministerio de Cultura",
     "Los pastos son agricultores (papa, ullucos, maíz) y reconocen un origen dual: los primeros hombres nacieron del matrimonio del cerro "
     "de Cumbal y la laguna de La Bolsa. Han perdido su lengua pero se reconocen como indígenas y trabajan en la revitalización cultural. "
     "El Censo DANE 2005 registró 129.801 personas autorreconocidas.",
     "Pueblo Pasto", "pasto-quillasinga__mincultura_pueblo-pastos"),
    ("El pueblo Quillacinga, «los hijos de la luna»", "historical", "1940-2009",
     "El etnónimo quillacinga desapareció en 1940 con el Decreto-ley 1421, que declaró inexistentes los resguardos. En 2009 el Ministerio "
     "del Interior reconoció a la comunidad Quillacinga de Jenoy (Resolución 0050) como pueblo indígena.",
     "Pueblo Quillacinga", "pasto-quillasinga__mincultura_pueblo-quillacinga"),
    ("Rastros de la lengua quillacinga", "linguistic", "Caracterización del Ministerio de Cultura",
     "Los quillacinga ya no hablan su lengua nativa: solo perviven rastros en algunos topónimos y apellidos, y entre los investigadores no "
     "hay consenso sobre sus características ni su familia lingüística.",
     "Pueblo Quillacinga", "pasto-quillasinga__mincultura_pueblo-quillacinga"),
    ("La higra y el canasto Awá", "cultural", "PEC UNIPA, 2019",
     "En el tejido de la higra y del canasto está escrita la historia y la cosmovisión del pueblo Awá.",
     "Territorio del pueblo Awá (UNIPA)", PEC),
    ("El calendario lunar Awá", "cultural", "PEC UNIPA, 2019",
     "Luna clara y luna oscura orientan cuándo cortar madera, tejer y concebir, según los mayores.",
     "Territorio del pueblo Awá (UNIPA)", PEC),
    ("La numeración oral inga", "linguistic", "Chasoy et al.",
     "Sistema decimal con términos básicos del 1 al 10, 100 (patsa) y 1000 (uaranga), con cuerdas de nudos para calcular.",
     "Valle del Sibundoy", NUM),
    ("Los numerales del a'ingae", "linguistic", "Fischer y Hengeveld, 2023",
     "Los numerales propios se están perdiendo y desde el tres se cuenta con préstamos del español.",
     "Territorio a'ingae (Putumayo y Nariño)", HB),
]

TYPE_LABEL = {
    "primary_linguistic_description": "Gramática", "primary_linguistic_data": "Material lingüístico",
    "primary_linguistic_data_partial": "Estudio lingüístico", "educational_guidance": "Guía pedagógica",
    "community_self_description": "Documento comunitario", "sociolinguistic_survey": "Encuesta sociolingüística",
    "sociolinguistic_policy": "Estudio sociolingüístico", "sociolinguistic_thesis": "Tesis",
    "sociolinguistic_article": "Artículo", "computational_linguistics_method": "Artículo",
    "descriptive_linguistic_analysis": "Estudio lingüístico", "draft_linguistic_analysis": "Borrador académico",
    "official_characterization": "Caracterización oficial", "historical_ethnographic_article": "Artículo",
    "historical_archaeological_study": "Estudio histórico", "historical_hypothesis": "Artículo",
}


# ------------------------------------------------------------------ verificación
def norm(s: str) -> str:
    return re.sub(r"[\W_]+", "", unicodedata.normalize("NFC", s).lower())


def load_pages() -> dict[tuple[str, int], str]:
    out = {}
    with open(PAGES, encoding="utf-8") as f:
        for line in f:
            p = json.loads(line)
            out[(p["document_id"], p["page"])] = p.get("text", "")
    return out


def resolve(pages, doc: str, page: int, quote: str) -> str | None:
    """Devuelve el id del documento cuya página contiene la cita (resuelve prefijos como el tomo I/2)."""
    q = norm(quote)
    for (d, pg), text in pages.items():
        if pg == page and d.startswith(doc) and q in norm(text):
            return d
    return None


def verify() -> list[dict]:
    pages = load_pages()
    items, errors = [], []
    for lang, word, meaning, cat, doc, page, quote, mode in V:
        did = resolve(pages, doc, page, quote)
        if did is None:
            errors.append(f"cita no encontrada: {lang} {word!r} ({doc} p.{page}): {quote!r}")
            continue
        # Tabla de numerales inga: la cita es el encabezado de la tabla y las palabras están en la misma página.
        if doc != NUM and norm(word) not in norm(quote):
            errors.append(f"palabra fuera de la cita: {word!r} en {quote!r}")
            continue
        if mode == "pair" and not any(norm(part) in norm(quote) for part in re.split(r"[,(]", meaning) if part.strip()):
            errors.append(f"significado fuera de la cita: {meaning!r} en {quote!r}")
            continue
        if mode == "numeral" and doc == NUM and norm(word) not in norm(pages[(did, page)]):
            errors.append(f"numeral no está en la página: {word!r}")
            continue
        items.append(dict(lang=lang, word=word, meaning=meaning, cat=cat, doc=did, page=page, quote=quote))
    # alfabeto Awá (transcrito contra la imagen; no está en pages.jsonl)
    if ALFABETO.exists():
        for e in json.loads(ALFABETO.read_text(encoding="utf-8"))["entries"]:
            items.append(dict(lang=AWA, word=e["awapit"], meaning=e["castellano"].lower(), cat="Alfabeto Awá",
                              doc="awapit__unipa_alfabeto-awa", page=1,
                              quote=f"{e['awapit']} = {e['castellano']} (lámina «Alfabeto Awá», transcripción contra la imagen)",
                              alphabet=True))
    if errors:
        raise SystemExit("VERIFICACIÓN FALLIDA:\n  " + "\n  ".join(errors))
    return items


def vocab_description(it: dict) -> str:
    src = "Alfabeto Awá (UNIPA), lámina; transcrita contra la imagen con asistencia de IA" if it.get("alphabet") else \
        f"{it['doc'].split('__')[1]}, p. {it['page']}"
    return f"Fuente: {src}. Cita: «{it['quote']}»."


# ------------------------------------------------------------------ lecciones
def build_lessons(items: list[dict]) -> dict[str, list[dict]]:
    rnd = random.Random(7)

    def questions(pool: list[dict], pick: list[dict], numeric: bool) -> list[dict]:
        qs = []
        for n, it in enumerate(pick, start=1):
            wrong = [p for p in pool if p["meaning"] != it["meaning"]]
            opts = [it["meaning"]] + [w["meaning"] for w in rnd.sample(wrong, min(3, len(wrong)))]
            rnd.shuffle(opts)
            qs.append(dict(
                prompt=f"¿Qué número es «{it['word']}»?" if numeric else f"¿Qué significa «{it['word']}»?",
                options=[(o, o == it["meaning"]) for o in opts], order=n,
            ))
        return qs

    by = lambda lang, cat=None: [i for i in items if i["lang"] == lang and (cat is None or i["cat"] == cat)]
    pick = lambda xs, k: rnd.sample(xs, min(k, len(xs)))
    awa_alpha, awa_pec = by(AWA, "Alfabeto Awá"), [i for i in by(AWA) if i["cat"] != "Alfabeto Awá"]
    inga, ain = by(INGA), by(AINGAE)
    nasa = by(NASA)
    nasa_words = [i for i in nasa if i["cat"] in ("Cuerpo", "Casa y trabajo", "Animales", "Palabras", "Plantas")]
    nasa_people = [i for i in nasa if i["cat"] in ("Pueblo", "Lengua", "Autoridad")]

    def lesson(title, desc, pool, pick_items, numeric=False):
        return dict(title=title, description=desc, questions=questions(pool, pick_items, numeric))

    return {
        AWA: [
            lesson("Palabras del alfabeto Awá", "Palabras de la lámina «Alfabeto Awá» (UNIPA) y su significado en castellano.",
                   awa_alpha, pick(awa_alpha, 8)),
            lesson("Gente de la selva", "Términos del pueblo Awá y del calendario lunar, según el PEC de la UNIPA.",
                   awa_pec, pick(awa_pec, 8)),
        ],
        INGA: [
            lesson("Contar del 1 al 5 en inga", "Los primeros numerales del inga del Valle del Sibundoy.",
                   inga, [i for i in inga if i["meaning"] in "12345" and len(i["meaning"]) == 1], True),
            lesson("Del 6 al 10, cien y mil", "Numerales mayores del inga.", inga,
                   [i for i in inga if i["meaning"] in ("6", "7", "8", "9", "10", "100", "1000")], True),
        ],
        AINGAE: [
            lesson("Contar del 1 al 5 en a'ingae", "Numerales del a'ingae según Fischer y Hengeveld (2023).",
                   ain, [i for i in ain if i["meaning"] in ("1", "2", "3", "4", "5")], True),
            lesson("Del 6 al 10 y el veinte", "Numerales mayores del a'ingae.", ain,
                   [i for i in ain if i["meaning"] in ("6", "7", "8", "9", "10", "20")], True),
        ],
        NASA: [
            lesson("Palabras en nasa yuwe", "Palabras de la vida diaria registradas en documentos del Ministerio de Cultura y de Antonio Pito.",
                   nasa_words, pick(nasa_words, 8)),
            lesson("Gente, lengua y autoridades", "Cómo se nombran el pueblo, la lengua y las autoridades nasa.",
                   nasa_people, pick(nasa_people, 6)),
        ],
    }


# ------------------------------------------------------------------ fuentes
def build_sources() -> list[dict]:
    reg = {e["document_id"] for e in json.loads(REGISTRY.read_text(encoding="utf-8"))["entries"]}
    out = []
    for d in json.loads(DOCS.read_text(encoding="utf-8")):
        if d["document_id"] not in reg:
            continue
        year = d.get("year") if isinstance(d.get("year"), int) else None
        authors = d.get("authors") or d.get("institution") or "Autor no indicado"
        ref = f"{authors}{f' ({year})' if year else ''}. {d['title']}. {d.get('institution') or ''}".strip()
        out.append(dict(
            doc=d["document_id"], title=d["title"][:240], author=authors[:180], year=year,
            type=TYPE_LABEL.get(d["evidence_class"], "Documento")[:80], reference=ref, url=d.get("source"),
            description=f"Documento del corpus de ÑAWI-Nariño sobre {d.get('community') or d.get('language')}. "
                        f"Licencia: {d.get('license') or 'no especificada'}.",
        ))
    return out


# ------------------------------------------------------------------ carga
def refresh_text() -> None:
    """Reescribe los textos (lenguas, palabras, fuentes) en su sitio, sin borrar nada."""
    items = verify()
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import Session

    from app import models  # noqa: F401
    from app.core.config import get_settings
    from app.models import Language, Source, Vocabulary

    url = re.sub(r"^postgresql://", "postgresql+psycopg://", get_settings().database_url or "")
    engine = create_engine(url, pool_pre_ping=True)
    changed = 0
    with Session(engine) as s, s.begin():
        for name, (short, cultural) in LANGS.items():
            lang = s.scalar(select(Language).where(Language.name == name))
            if lang and (lang.short_description, lang.cultural_description) != (short, cultural):
                lang.short_description, lang.cultural_description = short, cultural
                changed += 1
        langs = {l.name: l.id for l in s.scalars(select(Language))}
        for it in items:
            v = s.scalar(select(Vocabulary).where(Vocabulary.language_id == langs[it["lang"]], Vocabulary.word == it["word"]))
            if v and v.description != vocab_description(it):
                v.description = vocab_description(it)
                changed += 1
        for x in build_sources():
            src = s.scalar(select(Source).where(Source.title == x["title"]))
            if src and src.description != x["description"]:
                src.description = x["description"]
                changed += 1
    print(f"textos actualizados: {changed}")


def load(apply: bool) -> None:
    items = verify()
    sources = build_sources()
    lessons = build_lessons(items)
    print(f"verificado: {len(items)} palabras, {len(sources)} fuentes, "
          f"{sum(len(v) for v in lessons.values())} lecciones, {len(CULTURAL)} contenidos, {len(TERRITORIES)} territorios, {len(HERITAGE)} patrimonios")
    for lang, ls in lessons.items():
        print("  ", lang, [(l["title"], len(l["questions"])) for l in ls])
    if not apply:
        print("(simulación: no se escribió nada; usa --apply)")
        return

    from sqlalchemy import create_engine, delete, select
    from sqlalchemy.orm import Session

    from app import models  # noqa: F401
    from app.core.config import get_settings
    from app.models import (Activity, ActivityOption, ActivityQuestion, CulturalContent, Heritage, Language, Lesson,
                            Source, Territory, Toponym, Vocabulary)

    url = get_settings().database_url
    if not url:
        raise SystemExit("DATABASE_URL no está configurada")
    url = re.sub(r"^postgresql://", "postgresql+psycopg://", url)
    engine = create_engine(url, pool_pre_ping=True)
    with Session(engine) as s, s.begin():
        # 1) retirar los registros de demostración (las lecciones/actividades borran su progreso en cascada)
        for model in (Toponym, Heritage, Territory, Source, Lesson, Vocabulary, CulturalContent):
            s.execute(delete(model).where(model.is_mock.is_(True)))
        langs: dict[str, Language] = {}
        for name, (short, cultural) in LANGS.items():
            lang = s.scalar(select(Language).where(Language.name == name))
            if lang is None:
                lang = Language(name=name, short_description=short, cultural_description=cultural, is_mock=False)
                s.add(lang)
            lang.short_description, lang.cultural_description, lang.is_mock = short, cultural, False
            s.flush()
            langs[name] = lang
        # 2) fuentes, territorios, patrimonio
        src_by_doc = {}
        for x in sources:
            row = Source(title=x["title"], author=x["author"], year=x["year"], type=x["type"], reference=x["reference"],
                         url=x["url"], description=x["description"], is_mock=False)
            s.add(row); s.flush(); src_by_doc[x["doc"]] = row
        terr = {}
        for name, region, desc, lang in TERRITORIES:
            row = Territory(name=name, description=desc, region=region, latitude=None, longitude=None,
                            language_id=langs[lang].id if lang else None, is_mock=False)
            s.add(row); s.flush(); terr[name] = row
        for title, cat, label, desc, tname, doc in HERITAGE:
            s.add(Heritage(title=title, description=desc, category=cat, date_label=label, is_mock=False,
                           source_id=src_by_doc[doc].id if doc in src_by_doc else None, territory_id=terr[tname].id))
        # 3) vocabulario y contenido cultural
        for it in items:
            s.add(Vocabulary(language_id=langs[it["lang"]].id, word=it["word"], translation=it["meaning"],
                             category=it["cat"], description=vocab_description(it), is_mock=False))
        for lang, title, desc in CULTURAL:
            s.add(CulturalContent(language_id=langs[lang].id, title=title, description=desc, is_mock=False))
        # 4) lecciones y actividades
        for lang, ls in lessons.items():
            for order, l in enumerate(ls, start=1):
                lesson = Lesson(language_id=langs[lang].id, title=l["title"], description=l["description"], order=order, is_mock=False)
                s.add(lesson); s.flush()
                act = Activity(lesson_id=lesson.id, title=f"Práctica: {l['title']}", description="Elige la respuesta correcta.",
                               type="multiple_choice", order=1, is_mock=False)
                s.add(act); s.flush()
                for q in l["questions"]:
                    qq = ActivityQuestion(activity_id=act.id, prompt=q["prompt"], type="multiple_choice", order=q["order"], is_mock=False)
                    s.add(qq); s.flush()
                    s.add_all(ActivityOption(question_id=qq.id, label=o, is_correct=ok, is_mock=False) for o, ok in q["options"])
    print("Carga completada.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if "--refresh-text" in sys.argv:
        refresh_text()
    else:
        load(apply="--apply" in sys.argv)
