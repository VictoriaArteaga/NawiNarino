"""Construye el índice vectorial (bge-m3 vía Ollama) del corpus REAL habilitado y lo guarda en caché.

Uso (desde backend/):
    python -m scripts.rag_build_index            # ≈1 fragmento/s en CPU: ~1 h 45 min para ≈6 300 fragmentos

Es REANUDABLE: los vectores ya calculados se guardan en un archivo parcial (.partial.jsonl) y, si se interrumpe,
al relanzar continúa donde quedó. Solo indexa documentos habilitados en rag_data/real/authorizations.json
(compuerta de autorización) y páginas de calidad «ok». El índice queda en rag_data/index_cache/ (no versionado);
si el corpus o los permisos cambian (cambia la huella), hay que reconstruirlo.
"""

import json
import sys
import time

from app.core.config import get_settings
from app.rag.embedders_optional import OllamaEmbedder
from app.rag.factory import real_index_path
from app.rag.real_corpus import corpus_signature, iter_real_chunks, iter_transcribed_chunks
from app.rag.vectorstore import IndexedChunk, VectorStore

BATCH = 8


def main() -> int:
    settings = get_settings()
    chunks = list(iter_real_chunks())
    if not chunks:
        print("BLOQUEADO: no hay documentos reales habilitados.")
        return 1
    sig = corpus_signature(chunks)
    transcribed_ids = {c.meta.chunk_id for c in iter_transcribed_chunks()}
    # firma del corpus sin los documentos transcritos: los vectores calculados antes de agregarlos siguen siendo válidos
    accepted_sigs = {sig, corpus_signature([c for c in chunks if c.meta.chunk_id not in transcribed_ids])}
    emb = OllamaEmbedder(settings.rag_dense_model, settings.rag_ollama_host, timeout=60)
    final = real_index_path(settings, emb.name)
    partial = final.with_suffix(".partial.jsonl")
    final.parent.mkdir(parents=True, exist_ok=True)

    done: dict[str, list[float]] = {}
    if partial.exists():
        for line in partial.read_text(encoding="utf-8").splitlines():
            rec = json.loads(line)
            if rec["sig"] in accepted_sigs:
                done[rec["id"]] = rec["v"]
    print(f"Fragmentos: {len(chunks)}; ya calculados: {len(done)}", flush=True)

    todo = [c for c in chunks if c.meta.chunk_id not in done]
    t0, n0 = time.perf_counter(), 0
    with partial.open("a", encoding="utf-8") as out:
        for i in range(0, len(todo), BATCH):
            batch = todo[i : i + BATCH]
            for c, v in zip(batch, emb.embed_many([c.text for c in batch])):
                v = [round(x, 6) for x in v]
                done[c.meta.chunk_id] = v
                out.write(json.dumps({"sig": sig, "id": c.meta.chunk_id, "v": v}) + "\n")
            out.flush()
            n0 += len(batch)
            if (n0 // BATCH) % 25 == 0:
                rate = n0 / (time.perf_counter() - t0)
                print(f"{len(done)}/{len(chunks)} ({rate:.2f} fragmentos/s; faltan ~{(len(todo) - n0) / rate / 60:.0f} min)", flush=True)

    store = VectorStore(emb.name, emb.dim)
    store.signature = sig
    for c in chunks:
        store.add(IndexedChunk(metadata=c.meta, text=c.text, vector=done[c.meta.chunk_id]))
    store.save(final)
    partial.unlink(missing_ok=True)
    print(f"Índice guardado: {final} ({final.stat().st_size / 1e6:.0f} MB, {len(chunks)} fragmentos, huella {sig})", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
