"""Soporte de la pregunta en la evidencia (determinista, solo etiqueta; NO abstiene).

Un fragmento puede ser del mismo TEMA que la pregunta sin contener el DATO
pedido («¿Cómo se dice dos…?» recupera la página de numerales, que no tiene «dos»).
La similitud de recuperación no distingue ambos casos, así que se comprueba
aparte: cada término de contenido de la pregunta debe aparecer en los
fragmentos citados o en la metadata de su documento (título y lengua).

  direct   todos los términos de la pregunta están en la evidencia
  related  falta al menos uno: se muestran los fragmentos, pero NO como respuesta

Por qué etiqueta y no abstención: medido en 5 conjuntos sintéticos con ambos
recuperadores, retirar la respuesta corrige todas las respuestas sin dato
(18/18 con el híbrido, 27/27 con hashing) pero descarta ~20 % de las respuestas
correctas (reformulaciones y sinónimos: 23 y 22 casos). Ver
backend/docs/rag-evidence-support.md. Etiquetar no descarta nada.

Límites: coincidencia léxica exacta (sin diacríticos ni mayúsculas). Una
reformulación con sinónimos aparecerá como «related» aunque sea correcta; es
el costo aceptado por no presentar fragmentos del tema como respuesta verificada.
"""

import re
import unicodedata

from app.rag.embeddings import STOPWORDS, tokenize
from app.rag.retrieval import Hit

# Lista cerrada y fijada ANTES de medir: palabras genéricas de pregunta que no
# identifican el dato pedido.
GENERIC_QUESTION_WORDS = frozenset(
    "significa significado significados pasa ocurre hace hacen existe existen llama denomina designa".split()
)
_WORD = re.compile(r"\w+", re.UNICODE)


def _fold(word: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", word.lower()) if not unicodedata.combining(c))


def unmatched_terms(question: str, hits: list[Hit]) -> list[str]:
    """Palabras de la pregunta (forma original) que no están en la evidencia citada."""
    evidence: set[str] = set()
    for hit in hits:
        m = hit.chunk.metadata
        evidence |= set(tokenize(f"{hit.chunk.text} {m.title} {m.language.replace('_', ' ')}"))
    missing: list[str] = []
    for word in _WORD.findall(question):
        folded = _fold(word)
        if len(folded) <= 1 or folded in STOPWORDS or folded in GENERIC_QUESTION_WORDS:
            continue
        if folded not in evidence and word.lower() not in missing:
            missing.append(word.lower())
    return missing
