"""Generador por API (compatible con OpenAI / Groq). Hermético: servidor HTTP falso local."""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from app.core.config import Settings
from app.rag.factory import ExplorerEngine, build_engine
from app.rag.generator import OpenAICompatGenerator

Q = "¿Cuál es el saludo de la mañana en la Lengua de Prueba?"
GOOD = 'Según el fragmento [1], el saludo de la mañana es "zumba lo".'


def serve(status: int, body: dict):
    seen = {}

    class H(BaseHTTPRequestHandler):
        def do_POST(self):  # noqa: N802
            seen["path"], seen["auth"] = self.path, self.headers.get("Authorization")
            seen["body"] = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            data = json.dumps(body).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(data)

        def log_message(self, *a):
            pass

    srv = HTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_port}/v1", seen


@pytest.fixture(scope="module")
def base():
    return build_engine(Settings(rag_retriever="hashing", rag_generation="off"))


def run(base, status, body, key="k-123"):
    srv, url, seen = serve(status, body)
    try:
        gen = OpenAICompatGenerator(url, key, "llama-test", timeout=5)
        a = ExplorerEngine(base.primary, base.mode, base.fallback, gen).ask(Q)
        return a, gen, seen
    finally:
        srv.shutdown()


def test_api_generates_and_sends_key_server_side(base):
    a, gen, seen = run(base, 200, {"choices": [{"message": {"content": GOOD}}]})
    assert a.generation_mode == "generated" and a.explanation == GOOD and a.citations
    assert seen["path"] == "/v1/chat/completions" and seen["auth"] == "Bearer k-123"
    assert seen["body"]["model"] == "llama-test" and seen["body"]["messages"][0]["role"] == "system"
    assert gen.status() == {"mode": "api", "model": "llama-test", "available": True}


def test_rate_limit_falls_back_to_extractive_and_pauses(base):
    a, gen, _ = run(base, 429, {"error": "rate limit"})
    assert a.generation_mode == "extractive_fallback" and a.explanation is None and a.citations
    assert a.generation_note.startswith("unavailable") and gen.status()["available"] is False


def test_invalid_output_is_rejected_like_ollama(base):
    a, _, _ = run(base, 200, {"choices": [{"message": {"content": "Sin marcadores."}}]})
    assert a.generation_mode == "extractive_fallback" and a.explanation is None


def test_malformed_payload_and_missing_key(base):
    a, _, _ = run(base, 200, {"unexpected": True})
    assert a.generation_mode == "extractive_fallback"
    a, gen, _ = run(base, 200, {}, key="")
    assert a.generation_mode == "extractive_fallback" and gen.status()["reason"] == "falta la clave de la API"


def test_factory_selects_api_provider():
    e = build_engine(Settings(rag_retriever="hashing", rag_generation="auto", rag_gen_provider="api", rag_gen_api_key="x", rag_gen_model="m"))
    assert isinstance(e.generator, OpenAICompatGenerator) and e.generator_status()["mode"] == "api"
