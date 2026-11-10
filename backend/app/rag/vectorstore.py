"""Almacén vectorial persistido en JSON (coseno, sin dependencias).

Suficiente para el corpus autorizado inicial. La interfaz pública
(``add``/``search``/``save``/``load``) permite sustituirlo por pgvector.
"""

import json
from pathlib import Path

from pydantic import BaseModel

from app.rag.metadata import ChunkMetadata


class IndexedChunk(BaseModel):
    metadata: ChunkMetadata
    text: str
    vector: list[float]


class IndexMismatchError(Exception):
    pass


class VectorStore:
    def __init__(self, embedder_name: str, dim: int) -> None:
        self.embedder_name = embedder_name
        self.dim = dim
        self.chunks: list[IndexedChunk] = []
        self.signature: str | None = None  # huella del corpus indexado (invalida cachés obsoletas)

    def add(self, chunk: IndexedChunk) -> None:
        if len(chunk.vector) != self.dim:
            raise IndexMismatchError("dimensión de vector distinta a la del índice")
        self.chunks.append(chunk)

    def search(
        self,
        query_vector: list[float],
        top_k: int = 5,
        language: str | None = None,
        content_type: str | None = None,
    ) -> list[tuple[IndexedChunk, float]]:
        scored: list[tuple[IndexedChunk, float]] = []
        for chunk in self.chunks:
            m = chunk.metadata
            if language and m.language != language:
                continue
            if content_type and m.content_type.value != content_type:
                continue
            score = sum(a * b for a, b in zip(query_vector, chunk.vector))
            scored.append((chunk, score))
        scored.sort(key=lambda item: item[1], reverse=True)
        return scored[:top_k]

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "embedder": self.embedder_name,
            "dim": self.dim,
            "signature": self.signature,
            "chunks": [c.model_dump(mode="json") for c in self.chunks],
        }
        path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    @classmethod
    def load(cls, path: Path, embedder_name: str, dim: int, signature: str | None = None) -> "VectorStore":
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload["embedder"] != embedder_name or payload["dim"] != dim:
            raise IndexMismatchError(
                f"índice creado con {payload['embedder']}; reindexar con "
                f"{embedder_name}"
            )
        if signature is not None and payload.get("signature") != signature:
            raise IndexMismatchError("el índice no corresponde al corpus actual; reconstruir")
        store = cls(embedder_name, dim)
        store.signature = payload.get("signature")
        store.chunks = [IndexedChunk.model_validate(c) for c in payload["chunks"]]
        return store
