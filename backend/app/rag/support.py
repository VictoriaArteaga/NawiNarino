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

# Preguntas de «búsqueda de palabra» (traducción o significado de un término).
_LOOKUP = re.compile(r"\b(como se dice|se dice|que significa|significado de|traduccion|traducir|palabra para|como se llama|que palabra)\b")
# Nombres de lenguas/idiomas: no son la palabra buscada.
LANGUAGE_WORDS = frozenset(
    "awapit awa awá pit nasa yuwe nasayuwe inga ingae aingae cofan cofán pasto pastos quillasinga quillacinga lengua idioma lenguas".split()
)
VOCABULARY_CLASS_PREFIX = "primary_linguistic_data"  # diccionarios, alfabetos, listas de conjugación


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


def lookup_gap(question: str, hits: list[Hit]) -> list[str]:
    """Palabras buscadas («¿cómo se dice X?») que NO figuran en ninguna fuente de vocabulario citada.

    Un texto que solo habla del tema (p. ej. del agua en el territorio) no es una entrada de vocabulario: no
    prueba cómo se dice «agua». Solo se aplica cuando se conoce la clase de evidencia de los fragmentos (corpus
    real); sin ella (corpus de demo) no se aplica, para no cambiar su comportamiento.
    """
    if not _LOOKUP.search(" ".join(_fold(w) for w in _WORD.findall(question))):
        return []
    known = [h for h in hits if h.chunk.metadata.evidence_class]
    if not known:
        return []
    vocab_tokens: set[str] = set()
    for h in known:
        if h.chunk.metadata.evidence_class.startswith(VOCABULARY_CLASS_PREFIX):
            vocab_tokens |= set(tokenize(h.chunk.text))
    gap: list[str] = []
    for word in _WORD.findall(question):
        folded = _fold(word)
        if len(folded) <= 1 or folded in STOPWORDS or folded in GENERIC_QUESTION_WORDS or folded in LANGUAGE_WORDS:
            continue
        if folded not in vocab_tokens and word.lower() not in gap:
            gap.append(word.lower())
    return gap
