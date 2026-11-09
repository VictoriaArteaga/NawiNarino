"""Embeddings.

``HashingEmbedder`` es local, determinista y sin dependencias: codifica
palabras y n-gramas de caracteres. Capta similitud léxica/morfológica, NO
semántica profunda. Para semántica real, implementar ``Embedder`` con un
modelo multilingüe y reindexar (el índice guarda el nombre del embedder y
rechaza mezclar vectores de modelos distintos).
"""

import hashlib
import math
import re
import unicodedata
from typing import Protocol

_TOKEN = re.compile(r"\w+", re.UNICODE)

STOPWORDS = frozenset(
    "a al algo como con cual cuales cuando de del donde el ella ellos en es "
    "esta este esto estos eso fue ha hay la las le lo los me mi mas muy no "
    "o para pero por que quien se si sin sobre su sus te tu un una unos "
    "y ya sabes dime decir puedes puede explica explicame cuentame dice dicen".split()
)


def fold(text: str) -> str:
    """Minúsculas y sin diacríticos, solo para comparar (no para mostrar)."""
    decomposed = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in decomposed if not unicodedata.combining(c))


def tokenize(text: str) -> list[str]:
    return _TOKEN.findall(fold(text))


def content_tokens(text: str) -> set[str]:
    return {t for t in tokenize(text) if t not in STOPWORDS and len(t) > 1}


class Embedder(Protocol):
    name: str
    dim: int

    def embed(self, text: str) -> list[float]: ...


class HashingEmbedder:
    def __init__(self, dim: int = 512) -> None:
        self.dim = dim
        self.name = f"hashing-v1-{dim}"

    def _features(self, text: str) -> list[str]:
        feats: list[str] = []
        for tok in tokenize(text):
            if tok in STOPWORDS:
                continue
            feats.append(f"w:{tok}")
            padded = f"^{tok}$"
            feats.extend(f"c:{padded[i:i + 3]}" for i in range(len(padded) - 2))
        return feats

    def embed(self, text: str) -> list[float]:
        vec = [0.0] * self.dim
        for feat in self._features(text):
            digest = hashlib.blake2b(feat.encode("utf-8"), digest_size=8).digest()
            value = int.from_bytes(digest, "big")
            vec[value % self.dim] += 1.0 if (value >> 63) & 1 else -1.0
        norm = math.sqrt(sum(x * x for x in vec))
        return [x / norm for x in vec] if norm else vec
