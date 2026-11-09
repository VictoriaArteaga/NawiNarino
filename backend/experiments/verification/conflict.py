"""Detección de contradicciones entre fuentes (EXPERIMENTAL, sin torch).

Entrada: los datos extraídos por QA (un tramo literal por documento) y el
estado simulado de cada fuente. Salida: un veredicto que NUNCA elige una
versión como cierta sin justificación:

  abstained          ningún dato extraído
  answered           una sola fuente
  corroborated       varias fuentes, mismo dato
  conflict           datos distintos y no hay base para decidir
  conflict_by_status datos distintos; solo un grupo tiene fuente validada y el
                     otro solo pendientes: se propone el validado, pero el
                     conflicto se señala y se muestran ambas versiones
"""

import re
import unicodedata
from dataclasses import dataclass, field

_ARTICLES = ("el ", "la ", "los ", "las ", "un ", "una ")


def normalize_value(text: str) -> str:
    t = unicodedata.normalize("NFC", text).strip().lower()
    t = t.strip("\"'“”«»‘’ .,;:!?")  # comillas y puntuación juntas, en cualquier orden
    t = t.lstrip("-").strip()
    for art in _ARTICLES:
        if t.startswith(art):
            t = t[len(art):]
            break
    return re.sub(r"\s+", " ", t).strip()


@dataclass(frozen=True)
class SourceValue:
    doc_id: str
    page: int
    span: str
    sim_status: str  # "validated" | "pending"
    chunk_id: str = ""


@dataclass
class Verdict:
    status: str
    chosen: str | None = None
    groups: dict[str, list[SourceValue]] = field(default_factory=dict)  # valor normalizado -> fuentes
    note: str = ""

    @property
    def flagged_conflict(self) -> bool:
        return self.status in ("conflict", "conflict_by_status")


def resolve(values: list[SourceValue]) -> Verdict:
    best: dict[str, SourceValue] = {}
    for v in values:  # un valor por documento (el primero = el de mayor puntaje)
        best.setdefault(v.doc_id, v)
    groups: dict[str, list[SourceValue]] = {}
    for v in best.values():
        groups.setdefault(normalize_value(v.span), []).append(v)
    groups.pop("", None)
    if not groups:
        return Verdict("abstained")
    if len(groups) == 1:
        (value, sources), = groups.items()
        return Verdict("answered" if len(sources) == 1 else "corroborated", value, groups)
    validated_groups = [g for g, s in groups.items() if any(x.sim_status == "validated" for x in s)]
    if len(validated_groups) == 1:
        return Verdict(
            "conflict_by_status", validated_groups[0], groups,
            "Fuentes en desacuerdo; se propone la versión de la fuente validada.",
        )
    return Verdict("conflict", None, groups, "Fuentes en desacuerdo sin base para decidir cuál es correcta.")
