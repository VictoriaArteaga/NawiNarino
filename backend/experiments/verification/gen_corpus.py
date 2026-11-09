"""Generador DETERMINISTA del corpus experimental (ficticio) y sus preguntas.

Produce dos conjuntos con documentos, formas y preguntas DISJUNTOS:
  - dev  (ajuste de parámetros)
  - test (evaluación final; se mide una sola vez con parámetros congelados)

Salida: backend/rag_data/synthetic_experiments/{dev,test}/
    manifest.json, <doc>.md, questions.json

Todo el contenido es inventado: la «Lengua de Contraste» no existe y las formas
no pertenecen a ninguna lengua real. Cada documento tiene un estado simulado
(`experiment.simulated_status`: validated | pending) que SOLO usa el
experimento; el pipeline de producción lo ignora (el acceso sigue siendo
`synthetic`).

    python -m experiments.verification.gen_corpus           # escribe
    python -m experiments.verification.gen_corpus --check   # verifica que no hay cambios
"""

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "rag_data" / "synthetic_experiments"
LANG = "Lengua de Contraste"

DOCS = {  # clave -> (título, año, estado simulado)
    "v1": ("Guía V1", 2024, "validated"),
    "v2": ("Guía V2", 2025, "validated"),
    "p1": ("Cuaderno P1", 2026, "pending"),
    "p2": ("Cuaderno P2", 2026, "pending"),
}
FAMILY_ORDER = ["numeral", "greeting", "gloss", "suffix", "culture", "poly"]

GREETING_FORMS = {  # slot -> (de, por)
    "mañana": ("de la mañana", "por la mañana"),
    "noche": ("de la noche", "por la noche"),
    "madrugada": ("de la madrugada", "en la madrugada"),
    "tarde": ("de la tarde", "por la tarde"),
    "mediodía": ("del mediodía", "al mediodía"),
    "anochecer": ("del anochecer", "al anochecer"),
}


@dataclass
class Unit:
    role: str  # single|agree|agree_mixed|conflict_same|conflict_pending|conflict_status|pending_only|absent|poly
    family: str
    slot: str
    values: dict[str, str] = field(default_factory=dict)  # doc -> valor
    extra: tuple[str, ...] = ()  # poly: (forma, sentido a, sentido b)


def U(role, family, slot, **values):
    return Unit(role, family, slot, dict(values))


DEV = [
    U("single", "numeral", "dos", v1="belu"), U("single", "numeral", "siete", v2="harpa"),
    U("agree", "numeral", "tres", v1="nomi", v2="nomi"),
    U("conflict_same", "numeral", "cuatro", v1="dari", v2="duri"),
    U("conflict_status", "numeral", "cinco", v2="pelo", p1="pila"),
    U("pending_only", "numeral", "seis", p1="tuxa"),
    U("absent", "numeral", "ocho"), U("absent", "numeral", "diez"),
    U("single", "greeting", "mañana", v1="fuse"),
    U("conflict_status", "greeting", "noche", v1="raku", p2="reku"),
    U("absent", "greeting", "madrugada"),
    U("single", "gloss", "casa", v1="zelo"), U("agree", "gloss", "río", v1="yumo", v2="yumo"),
    U("pending_only", "gloss", "lluvia", p2="quna"), U("absent", "gloss", "luna"),
    U("conflict_pending", "gloss", "piedra", p1="vaki", p2="vako"),
    U("agree_mixed", "suffix", "plural", v2="ra", p1="ra"),
    U("conflict_same", "suffix", "diminutivo", v1="ti", v2="to"),
    U("absent", "suffix", "singular"),
    U("single", "culture", "Luna Hueca", v1="la plaza de Orvelo"),
    U("conflict_pending", "culture", "Agua Quieta", p1="el cerro de Anuma", p2="la orilla de Anuma"),
    U("absent", "culture", "Viento Seco"),
    Unit("poly", "poly", "sa", {"v1": "sa"}, ("sa", "tarde", "orilla")),
]

TEST = [
    U("single", "numeral", "uno", v1="kemba"), U("single", "numeral", "nueve", v2="saku"),
    U("agree", "numeral", "once", v1="lowa", v2="lowa"),
    U("conflict_same", "numeral", "doce", v1="fano", v2="funo"),
    U("conflict_status", "numeral", "trece", v2="gelu", p2="galu"),
    U("pending_only", "numeral", "catorce", p2="mupi"),
    U("absent", "numeral", "quince"), U("absent", "numeral", "veinte"),
    U("single", "greeting", "tarde", v2="nuko"),
    U("conflict_status", "greeting", "mediodía", v1="ibar", p1="ibur"),
    U("absent", "greeting", "anochecer"),
    U("single", "gloss", "fuego", v2="orte"), U("agree", "gloss", "sal", v1="pexo", v2="pexo"),
    U("pending_only", "gloss", "maíz", p1="zuli"), U("absent", "gloss", "viento"),
    U("conflict_pending", "gloss", "camino", p1="tanu", p2="tenu"),
    U("conflict_same", "gloss", "nube", v1="wari", v2="wera"),
    U("agree_mixed", "suffix", "colectivo", v1="mu", p2="mu"),
    U("conflict_same", "suffix", "aumentativo", v1="on", v2="un"),
    U("single", "suffix", "posesivo", v2="ke"), U("absent", "suffix", "femenino"),
    U("single", "culture", "Sombra Larga", v2="la cima de Ulven"),
    U("conflict_status", "culture", "Maíz Dormido", v1="el río de Casteno", p1="el cerro de Casteno"),
    U("absent", "culture", "Río Alto"),
    Unit("poly", "poly", "ka", {"v2": "ka"}, ("ka", "humo", "sombra")),
]

ROLE_BEHAVIOR = {
    "single": "answer", "pending_only": "answer", "agree": "answer", "agree_mixed": "answer",
    "conflict_same": "conflict", "conflict_pending": "conflict", "conflict_status": "conflict_status",
    "absent": "abstain", "poly": "answer_any",
}


def sentence(u: Unit, val: str) -> str:
    f = u.family
    if f == "numeral":
        return f'El numeral ficticio para {u.slot} es "{val}".'
    if f == "greeting":
        return f'El saludo ficticio {GREETING_FORMS[u.slot][0]} es "{val}".'
    if f == "gloss":
        return f'La palabra ficticia para {u.slot} es "{val}".'
    if f == "suffix":
        return f"El sufijo ficticio -{val} marca el {u.slot} de los sustantivos."
    if f == "culture":
        return f"La Fiesta de {u.slot} se celebra en {val}."
    form, a, b = u.extra
    return f'La forma "{form}" tiene dos significados registrados: "{a}" y "{b}".'


def phrasings(u: Unit) -> list[str]:
    f, s = u.family, u.slot
    if f == "numeral":
        return [f"¿Cuál es el numeral para {s} en la {LANG}?", f"¿Cómo se dice {s} en la {LANG}?"]
    if f == "greeting":
        return [f"¿Cuál es el saludo {GREETING_FORMS[s][0]} en la {LANG}?", f"¿Con qué expresión se saluda {GREETING_FORMS[s][1]}?"]
    if f == "gloss":
        return [f"¿Cuál es la palabra para {s} en la {LANG}?", f"¿Qué palabra designa {s} en la {LANG}?"]
    if f == "suffix":
        return [f"¿Qué sufijo marca el {s} en la {LANG}?", f"¿Cuál es el sufijo del {s}?"]
    if f == "culture":
        return [f"¿Dónde se celebra la Fiesta de {s}?", f"¿En qué lugar tiene lugar la Fiesta de {s}?"]
    return [f"¿Qué significa {s}?", f"¿Cuál es el significado de {s}?"]


def build_split(split: str, units: list[Unit]) -> tuple[dict, dict[str, str], list[dict]]:
    # 1) frases por documento y familia
    per_doc: dict[str, dict[str, list[str]]] = {k: {f: [] for f in FAMILY_ORDER} for k in DOCS}
    placed: dict[tuple[int, str], str] = {}
    for i, u in enumerate(units):
        for doc, val in u.values.items():
            per_doc[doc][u.family].append(sentence(u, val))
            placed[(i, doc)] = sentence(u, val)
    # 2) páginas: una por familia no vacía
    docs_md: dict[str, str] = {}
    page_of: dict[tuple[str, str], int] = {}  # (doc, frase) -> página
    for doc, fams in per_doc.items():
        parts, page = [], 0
        for fam in FAMILY_ORDER:
            sents = fams[fam]
            if not sents:
                continue
            page += 1
            body = "\n\n".join(sents)
            head = "[[advertencia]] AVISO: documento ficticio para pruebas; no describe ninguna lengua real.\n\n" if page == 1 else ""
            parts.append(f"[[pagina {page}]]\n{head}{body}\n")
            for s in sents:
                page_of[(doc, s)] = page
        docs_md[f"{doc}.md"] = "\n".join(parts)
    # 3) manifiesto
    manifest = []
    for doc, (title, year, status) in DOCS.items():
        manifest.append({
            "file": f"{doc}.md",
            "metadata": {
                "document_id": f"synthetic__{split}-{doc}",
                "title": f"{title} de la {LANG} ({split}; documento ficticio)",
                "language": "lengua_contraste",
                "content_type": "linguistico",
                "source": "Generado para experimentos de verificación de ÑAWI-Nariño; contenido inventado",
                "author": "Equipo técnico ÑAWI-Nariño (sintético)",
                "year": year,
                "license": "Uso interno de pruebas; contenido ficticio",
                "access_level": "synthetic",
                "validation_status": "synthetic",
            },
            "experiment": {"simulated_status": status},
        })
    # 4) preguntas
    questions: list[dict] = []
    for i, u in enumerate(units):
        behavior = ROLE_BEHAVIOR[u.role]
        support = sorted({(f"{split}-{d}", page_of[(d, placed[(i, d)])]) for d in u.values})
        if u.role == "poly":
            gold = [u.extra[1], u.extra[2]]
        else:
            gold = sorted(set(u.values.values()))
        validated = [v for d, v in u.values.items() if DOCS[d][2] == "validated"]
        for k, q in enumerate(phrasings(u), start=1):
            questions.append({
                "id": f"{split}-{i:02d}-{k}", "split": split, "role": u.role, "family": u.family,
                "slot": u.slot, "q": q, "behavior": behavior, "gold_values": gold,
                "validated_value": validated[0] if u.role == "conflict_status" else None,
                "values_by_doc": {f"{split}-{d}": v for d, v in u.values.items()},
                "support": [list(s) for s in support],
            })
    for j, q in enumerate(["¿Cómo se dice?", "Cuéntame más"], start=1):
        questions.append({"id": f"{split}-u{j}", "split": split, "role": "underspecified", "family": "-", "slot": "-", "q": q,
                          "behavior": "abstain", "gold_values": [], "validated_value": None, "values_by_doc": {}, "support": []})
    for j, q in enumerate(["¿Cuál es la capital de Colombia?", "¿Cómo se dice agua en awapit?"], start=1):
        questions.append({"id": f"{split}-o{j}", "split": split, "role": "out_of_corpus", "family": "-", "slot": "-", "q": q,
                          "behavior": "abstain", "gold_values": [], "validated_value": None, "values_by_doc": {}, "support": []})
    return manifest, docs_md, questions


def render() -> dict[Path, str]:
    files: dict[Path, str] = {}
    for split, units in (("dev", DEV), ("test", TEST)):
        manifest, docs_md, questions = build_split(split, units)
        base = OUT / split
        files[base / "manifest.json"] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
        files[base / "questions.json"] = json.dumps(
            {"_note": "Generado por experiments/verification/gen_corpus.py (FICTICIO). No editar a mano.", "questions": questions},
            ensure_ascii=False, indent=1,
        ) + "\n"
        for name, text in docs_md.items():
            files[base / name] = text
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    files = render()
    if args.check:
        stale = [str(p) for p, t in files.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        print("OK: sin cambios" if not stale else "DESACTUALIZADO:\n" + "\n".join(stale))
        return 1 if stale else 0
    for path, text in files.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8", newline="\n")
    print(f"Escritos {len(files)} archivos en {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
