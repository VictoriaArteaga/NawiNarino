"""Embedders OPCIONALES, solo para evaluación comparativa.

No están conectados a la configuración ni al endpoint: el embedder activo
sigue siendo ``HashingEmbedder``. ``OllamaEmbedder`` usa un servidor Ollama
LOCAL (los textos no salen del equipo) y solo la biblioteca estándar.
"""

import json
import math
import urllib.request


class OllamaEmbedder:
    def __init__(
        self,
        model: str = "bge-m3",
        host: str = "http://127.0.0.1:11434",
        dim: int | None = None,
        timeout: float = 60,
    ) -> None:
        self.model = model
        self.timeout = timeout
        self.host = host.rstrip("/")
        self._cache: dict[str, list[float]] = {}
        self.name = f"ollama-{model}"
        self.dim = dim or len(self.embed("dimensión"))

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        """Embeddings por lotes (mucho más rápido para indexar corpus grandes)."""
        body = json.dumps({"model": self.model, "input": texts}).encode("utf-8")
        request = urllib.request.Request(
            f"{self.host}/api/embed", data=body, headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(request, timeout=max(self.timeout, 300)) as response:
            vectors = json.loads(response.read())["embeddings"]
        out = []
        for v in vectors:
            norm = math.sqrt(sum(x * x for x in v)) or 1.0
            out.append([x / norm for x in v])
        return out

    def embed(self, text: str) -> list[float]:
        if text in self._cache:
            return self._cache[text]
        body = json.dumps({"model": self.model, "input": text}).encode("utf-8")
        request = urllib.request.Request(
            f"{self.host}/api/embed",
            data=body,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            vector = json.loads(response.read())["embeddings"][0]
        norm = math.sqrt(sum(x * x for x in vector)) or 1.0
        result = [x / norm for x in vector]
        self._cache[text] = result
        return result
