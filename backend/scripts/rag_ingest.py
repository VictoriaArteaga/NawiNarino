"""Indexa un manifiesto RAG, imprime el informe y guarda el índice.

Uso (desde backend/):
    python -m scripts.rag_ingest [manifiesto] [--out rag_data/index.json]
"""

import argparse
import sys
from pathlib import Path

from app.core.config import get_settings
from app.rag.pipeline import RagPipeline


def main() -> int:
    settings = get_settings()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", nargs="?", type=Path, default=settings.rag_manifest_path)
    parser.add_argument("--out", type=Path, default=Path("rag_data/index.json"))
    args = parser.parse_args()

    pipeline = RagPipeline()
    report = pipeline.ingest(args.manifest)
    for doc, n in report.indexed.items():
        print(f"INDEXADO  {doc}: {n} fragmentos")
    for doc, why in report.rejected.items():
        print(f"RECHAZADO {doc}: {why}")
    pipeline.store.save(args.out)
    print(f"Índice guardado en {args.out} ({len(pipeline.store.chunks)} fragmentos)")
    return 0 if report.indexed else 1


if __name__ == "__main__":
    sys.exit(main())
