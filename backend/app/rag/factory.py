"""Construcción del motor del Explorador (selección de recuperador).

Modos (``RAG_RETRIEVER``):
  hashing  recuperador léxico/morfológico local (sin servicios externos)
  hybrid   bge-m3 (Ollama LOCAL) + BM25 exacto, con la configuración ya
           evaluada (alpha 0,5; min_score 0,3; relative_min 0,85)
  auto     (por defecto) hybrid si Ollama responde y tiene bge-m3; si no, hashing

Si el recuperador híbrido falla durante una consulta (p. ej. se apaga
Ollama), la consulta se responde con el recuperador de respaldo en vez de
fallar. La respuesta sigue siendo extractiva, con citas o abstención; no se
usa QA, reranker ni ningún modelo generativo.
"""

import json
import logging
import threading
import urllib.request
from pathlib import Path

from app.core.config import Settings
from app.rag.embedders_optional import OllamaEmbedder
from app.rag.generation import Answer, build_answer
from app.rag.generator import GenerationError, OllamaGenerator, OpenAICompatGenerator
from app.rag.hybrid import HybridRetriever
from app.rag.pipeline import RagPipeline
from app.rag.real_corpus import corpus_signature, iter_real_chunks
from app.rag.vectorstore import IndexedChunk, IndexMismatchError, VectorStore

log = logging.getLogger("explorer")

HYBRID_ALPHA, HYBRID_MIN_SCORE, HYBRID_RELATIVE_MIN = 0.5, 0.3, 0.85  # evaluados en la etapa 5


def ollama_has_model(host: str, model: str, timeout: float = 2.0) -> bool:
    try:
        with urllib.request.urlopen(f"{host.rstrip('/')}/api/tags", timeout=timeout) as r:
            return any(m["name"].split(":")[0] == model for m in json.loads(r.read())["models"])
    except Exception:
        return False


class ExplorerEngine:
    """Responde preguntas; ``mode`` indica el recuperador realmente activo."""

    def __init__(
        self,
        primary: RagPipeline,
        mode: str,
        fallback: RagPipeline | None = None,
        generator: OllamaGenerator | OpenAICompatGenerator | None = None,
    ) -> None:
        self.primary, self.fallback, self.mode, self.generator = primary, fallback, mode, generator
        self.chunks = len(primary.store.chunks)

    def generator_status(self) -> dict:
        """Estado del servicio generativo (independiente del recuperador)."""
        return self.generator.status() if self.generator else {"mode": "off"}

    def ask(self, question: str, language: str | None = None) -> Answer:
        try:
            hits, answer = self.primary.ask_with_hits(question, language=language)
        except Exception:  # noqa: BLE001 - un fallo del recuperador no debe tumbar la demo
            if self.fallback is None:
                raise
            log.exception("Recuperador %s falló; se usa el de respaldo (hashing)", self.mode)
            hits, answer = self.fallback.ask_with_hits(question, language=language)
        return self._explain(question, hits, answer)

    def _explain(self, question: str, hits: list, answer: Answer) -> Answer:
        """Capa de generación, separada de la recuperación. Abstención => no se llama al modelo."""
        if answer.abstained or self.generator is None:
            return answer
        used = hits[: len(answer.citations)]  # exactamente los fragmentos que se citan
        try:
            result = self.generator.generate(
                question, used, answer.evidence, answer.unmatched_terms, [c.excerpt for c in answer.citations]
            )
        except GenerationError as exc:
            log.warning("Generación no disponible (%s): %s", exc.kind, exc)
            reason = {
                "unavailable": "el modelo no está disponible",
                "timeout": "el modelo tardó demasiado",
                "invalid": "la explicación generada no pasó la verificación contra los fragmentos",
            }.get(exc.kind, "falló el modelo")
            answer.generation_mode = "extractive_fallback"
            answer.generation_note = f"{exc.kind}: {exc}"
            answer.notices.append(f"No se pudo generar la explicación ({reason}); se muestran los extractos con sus citas.")
            return answer
        answer.explanation = result.text
        answer.generation_mode = "generated"
        answer.generation_model, answer.generation_ms = result.model, result.ms
        return answer


def real_index_path(settings: Settings, embedder_name: str) -> Path:
    return settings.rag_index_dir / f"real-{embedder_name}.json"


def fill_real_store(p: RagPipeline, settings: Settings, require_cache: bool) -> None:
    """Llena el pipeline con el corpus real habilitado (compuerta de autorización + filtros de calidad).

    Con embeddings externos (bge-m3) el índice se carga de caché (``scripts.rag_build_index``); si falta o
    está obsoleto y ``require_cache``, falla para que el motor use el recuperador de respaldo en vez de
    bloquear el arranque minutos.
    """
    chunks = list(iter_real_chunks())
    if not chunks:
        raise RuntimeError("No hay documentos reales habilitados en rag_data/real/authorizations.json")
    sig = corpus_signature(chunks)
    cache = real_index_path(settings, p.embedder.name)
    if require_cache:
        try:
            p.use_store(VectorStore.load(cache, p.embedder.name, p.embedder.dim, sig))
            return
        except (OSError, IndexMismatchError, KeyError, ValueError) as exc:
            raise RuntimeError(f"Índice real de {p.embedder.name} no disponible ({exc}); ejecuta: python -m scripts.rag_build_index") from exc
    for c in chunks:  # hashing: rápido, se construye en memoria
        p.store.add(IndexedChunk(metadata=c.meta, text=c.text, vector=p.embedder.embed(c.text)))
    p.store.signature = sig


def _hashing(settings: Settings) -> RagPipeline:
    p = RagPipeline(top_k=settings.rag_top_k, min_score=settings.rag_min_score)
    if settings.rag_corpus == "real":
        fill_real_store(p, settings, require_cache=False)
        return p
    report = p.ingest(settings.rag_manifest_path)
    if report.rejected:
        log.warning("Documentos rechazados por la compuerta de permisos: %s", report.rejected)
    return p


def _hybrid(settings: Settings) -> RagPipeline:
    emb = OllamaEmbedder(settings.rag_dense_model, settings.rag_ollama_host, timeout=30)
    p = RagPipeline(emb, top_k=settings.rag_top_k)
    if settings.rag_corpus == "real":
        fill_real_store(p, settings, require_cache=True)
    else:
        p.ingest(settings.rag_manifest_path)
    p.retriever = HybridRetriever(
        p.store, emb, "bm25", alpha=HYBRID_ALPHA, top_k=settings.rag_top_k,
        min_score=HYBRID_MIN_SCORE, relative_min=HYBRID_RELATIVE_MIN,
    )
    return p


def _generator(settings: Settings) -> OllamaGenerator | OpenAICompatGenerator | None:
    if settings.rag_generation == "off":
        return None
    if settings.rag_gen_provider == "api":
        api = OpenAICompatGenerator(
            settings.rag_gen_api_url, settings.rag_gen_api_key, settings.rag_gen_model,
            settings.rag_gen_temperature, min(settings.rag_gen_timeout, 30), settings.rag_gen_num_predict,
            settings.rag_gen_max_context_chars,
        )
        if not api.status().get("available"):
            log.warning("Generación por API: %s", api.status().get("reason"))
        return api
    g = OllamaGenerator(
        settings.rag_ollama_host, settings.rag_gen_model, settings.rag_gen_temperature, settings.rag_gen_timeout,
        settings.rag_gen_num_predict, settings.rag_gen_num_ctx, settings.rag_gen_max_context_chars,
    )
    status = g.status()
    if status.get("available"):
        threading.Thread(target=g.warm, daemon=True, name="gen-warmup").start()  # no bloquea el arranque
    else:
        log.warning("Generación: %s", status.get("reason", "modelo no disponible"))
    return g


def build_engine(settings: Settings) -> ExplorerEngine:
    engine = _build_retrieval(settings)
    engine.generator = _generator(settings)
    return engine


def _build_retrieval(settings: Settings) -> ExplorerEngine:
    mode = settings.rag_retriever
    if mode == "hashing":
        return ExplorerEngine(_hashing(settings), "hashing")
    if mode == "auto" and not ollama_has_model(settings.rag_ollama_host, settings.rag_dense_model):
        log.warning("Ollama/%s no disponible: se usa el recuperador hashing", settings.rag_dense_model)
        return ExplorerEngine(_hashing(settings), "hashing")
    try:
        hybrid = _hybrid(settings)
    except Exception:  # noqa: BLE001
        if mode == "hybrid":
            raise
        log.exception("No se pudo construir el recuperador híbrido: se usa hashing")
        return ExplorerEngine(_hashing(settings), "hashing")
    return ExplorerEngine(hybrid, "hybrid", fallback=_hashing(settings))


__all__ = ["ExplorerEngine", "build_engine", "build_answer"]
