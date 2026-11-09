import hashlib
import json
import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.rag.chunking import split_page
from app.rag.cleaning import clean_text
from app.rag.embeddings import HashingEmbedder
from app.rag.extraction import extract_pages
from app.rag.generation import ABSTENTION_MESSAGE
from app.rag.metadata import (
    DocumentMetadata,
    IndexingNotAllowedError,
    assert_indexable,
)
from app.rag.pipeline import RagPipeline
from app.rag.vectorstore import IndexMismatchError, VectorStore
from app.routers.explorer import get_pipeline

SYNTHETIC_MANIFEST = (
    Path(__file__).resolve().parents[1] / "rag_data" / "synthetic" / "manifest.json"
)


def base_meta(**over):
    data = {
        "document_id": "doc-1",
        "title": "Doc",
        "language": "lengua_x",
        "content_type": "linguistico",
        "source": "fuente",
        "license": "lic",
        "access_level": "internal_use_only",
    }
    data.update(over)
    return DocumentMetadata.model_validate(data)


@pytest.fixture(scope="module")
def pipeline() -> RagPipeline:
    p = RagPipeline()
    report = p.ingest(SYNTHETIC_MANIFEST)
    assert not report.rejected
    return p


# ---------- permisos / metadatos ----------


def test_unauthorized_document_is_rejected():
    with pytest.raises(IndexingNotAllowedError):
        assert_indexable(base_meta())


def test_authorized_document_needs_reference():
    with pytest.raises(IndexingNotAllowedError):
        assert_indexable(base_meta(indexing_authorized=True))
    assert_indexable(
        base_meta(indexing_authorized=True, authorization_ref="carta-2026-01")
    )


def test_community_document_needs_validation_even_if_authorized():
    meta = base_meta(
        access_level="community_permission_required",
        indexing_authorized=True,
        authorization_ref="x",
    )
    with pytest.raises(IndexingNotAllowedError):
        assert_indexable(meta)


def test_borman_blocked_even_with_authorization_flag():
    meta = base_meta(
        document_id="ainga-cofan__sil-borman_vocabulario-cofan-1976",
        indexing_authorized=True,
        authorization_ref="falsa",
    )
    with pytest.raises(IndexingNotAllowedError):
        assert_indexable(meta)


def test_synthetic_flags_must_be_consistent():
    with pytest.raises(ValueError):
        base_meta(access_level="synthetic")


def test_manifest_rejects_unauthorized_real_documents(tmp_path):
    (tmp_path / "a.md").write_text("Texto real de ejemplo.", encoding="utf-8")
    manifest = [
        {
            "file": "a.md",
            "metadata": base_meta().model_dump(mode="json"),
        }
    ]
    (tmp_path / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    p = RagPipeline()
    report = p.ingest(tmp_path / "manifest.json")
    assert "doc-1" in report.rejected and not report.indexed
    assert p.store.chunks == []


# ---------- extracción / limpieza / chunking ----------


def test_extract_markdown_pages():
    pages = extract_pages(SYNTHETIC_MANIFEST.parent / "guia_sintetica_gramatica.md")
    assert [n for n, _ in pages] == [1, 2]
    assert "verbo al final" in pages[0][1]
    assert "zumba lo" in pages[1][1]


def test_extract_pdf_pages(tmp_path):
    if shutil.which("pdftotext") is None:
        pytest.skip("pdftotext no disponible")
    objs = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] "
        "/Contents 4 0 R /Resources << /Font << /F1 7 0 R >> >> >>",
        None,
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] "
        "/Contents 6 0 R /Resources << /Font << /F1 7 0 R >> >> >>",
        None,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    streams = {4: "Primera pagina sintetica", 6: "Segunda pagina sintetica"}
    out = b"%PDF-1.4\n"
    for i, body in enumerate(objs, start=1):
        if body is None:
            s = f"BT /F1 12 Tf 10 50 Td ({streams[i]}) Tj ET"
            body = f"<< /Length {len(s)} >>\nstream\n{s}\nendstream"
        out += f"{i} 0 obj\n{body}\nendobj\n".encode()
    out += b"trailer\n<< /Root 1 0 R /Size 8 >>\n%%EOF\n"
    pdf = tmp_path / "t.pdf"
    pdf.write_bytes(out)
    pages = extract_pages(pdf)
    assert len(pages) == 2
    assert "Primera" in pages[0][1] and "Segunda" in pages[1][1]


def test_cleaning_preserves_diacritics_and_dehyphenates():
    raw = "Ñawi  ká ʼ glotal’ pala-\nbra\x00 \r\n  fin"
    out = clean_text(raw)
    assert "Ñawi" in out and "palabra" in out and "\x00" not in out
    assert "ʼ" in out  # no se descartan letras no latinas


def test_chunks_never_cross_pages_and_respect_size():
    pages = extract_pages(SYNTHETIC_MANIFEST.parent / "relato_sintetico_territorio.md")
    for _, text in pages:
        for chunk in split_page(text, max_chars=120):
            assert 0 < len(chunk) <= 120
    long = "Una oración larga. " * 100
    assert all(len(c) <= 300 for c in split_page(long, 300))


def test_source_files_are_not_modified():
    files = sorted(SYNTHETIC_MANIFEST.parent.glob("*"))
    before = {f: hashlib.sha256(f.read_bytes()).hexdigest() for f in files}
    RagPipeline().ingest(SYNTHETIC_MANIFEST)
    after = {f: hashlib.sha256(f.read_bytes()).hexdigest() for f in files}
    assert before == after


# ---------- recuperación y trazabilidad ----------


def test_chunk_metadata_is_complete(pipeline):
    for chunk in pipeline.store.chunks:
        m = chunk.metadata
        assert m.document_id and m.title and m.language and m.source
        assert m.license and m.page >= 1 and m.chunk_id.startswith(m.document_id)
        assert m.access_level.value == "synthetic" and m.is_synthetic


@pytest.mark.parametrize(
    "question,doc,page",
    [
        ("¿En qué orden pone el verbo la Lengua de Prueba?", "guia-gramatica", 1),
        ("¿Cuál es el saludo de la mañana?", "guia-gramatica", 2),
        ("¿Qué fiesta celebran en el Valle Ficticio?", "relato-territorio", 1),
        ("¿Qué cultivan cerca del río Imaginario?", "relato-territorio", 2),
    ],
)
def test_retrieval_traces_to_document_and_page(pipeline, question, doc, page):
    answer = pipeline.ask(question)
    assert not answer.abstained
    top = answer.citations[0]
    assert doc in top.document_id and top.page == page
    assert f"[{top.ref}]" in answer.answer


def test_answer_only_uses_retrieved_text(pipeline):
    answer = pipeline.ask("¿Cómo se dice uno en la Lengua de Prueba?")
    assert not answer.abstained
    body = answer.answer.removeprefix("Según las fuentes del corpus: ")
    for c in answer.citations:
        assert c.excerpt in body
        source = " ".join(
            ch.text for ch in pipeline.store.chunks if ch.metadata.chunk_id == c.chunk_id
        )
        # cada tramo del extracto (separado por « […] ») es texto literal
        assert all(part.strip() in source for part in c.excerpt.split("[…]"))
    assert 'es "kep"' in answer.answer
    assert any("sintético" in n for n in answer.notices)


@pytest.mark.parametrize(
    "question",
    [
        "¿Cómo se dice agua en awapit?",
        "¿Cuántos hablantes tiene el inga?",
        "xyzzy qwerty",
        "¿?",
    ],
)
def test_abstains_without_evidence(pipeline, question):
    answer = pipeline.ask(question)
    assert answer.abstained and answer.citations == []
    assert answer.answer == ABSTENTION_MESSAGE


def test_language_filter(pipeline):
    assert pipeline.ask("¿Cuál es el saludo de la mañana?", language="awapit").abstained
    assert not pipeline.ask(
        "¿Cuál es el saludo de la mañana?", language="lengua_prueba"
    ).abstained


# ---------- almacén ----------


def test_store_roundtrip_and_embedder_mismatch(pipeline, tmp_path):
    path = tmp_path / "index.json"
    pipeline.store.save(path)
    e = HashingEmbedder()
    loaded = VectorStore.load(path, e.name, e.dim)
    assert len(loaded.chunks) == len(pipeline.store.chunks)
    with pytest.raises(IndexMismatchError):
        VectorStore.load(path, "otro-modelo", e.dim)


def test_embedder_is_deterministic_and_normalized():
    e = HashingEmbedder()
    v1, v2 = e.embed("saludo de la mañana"), e.embed("saludo de la mañana")
    assert v1 == v2
    assert abs(sum(x * x for x in v1) - 1) < 1e-9


# ---------- API ----------


def test_ask_endpoint():
    get_pipeline.cache_clear()
    with TestClient(app) as client:
        ok = client.post("/explorer/ask", json={"question": "¿Qué fiesta celebran en el Valle Ficticio?"})
        assert ok.status_code == 200
        body = ok.json()
        assert body["abstained"] is False
        assert body["citations"][0]["page"] == 1
        assert body["citations"][0]["isSynthetic"] is True
        none = client.post("/explorer/ask", json={"question": "¿Cómo se dice casa en cofán?"})
        assert none.json()["abstained"] is True
        assert client.post("/explorer/ask", json={"question": "a"}).status_code == 422


def test_weakly_related_chunks_are_not_cited(pipeline):
    answer = pipeline.ask("¿Qué fiesta celebran en el Valle Ficticio?")
    assert [c.page for c in answer.citations] == [1]
    assert "relato-territorio" in answer.citations[0].document_id
