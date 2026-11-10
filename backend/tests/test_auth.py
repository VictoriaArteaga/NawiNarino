from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import get_settings
from app.core.security import hash_password, verify_password

USER = {"name": "Ana Pérez", "email": "Ana@Example.com", "password": "clave1234"}
ANSWER = {"answers": [{"questionId": 1, "optionId": 1}]}


def register(client, **overrides):
    return client.post("/auth/register", json={**USER, **overrides})


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_password_hash_roundtrip():
    stored = hash_password("clave1234")
    assert "clave1234" not in stored
    assert verify_password("clave1234", stored)
    assert not verify_password("otra", stored)
    assert not verify_password("clave1234", "texto-no-valido")
    assert hash_password("clave1234") != stored  # sal distinta


def test_register_returns_token_and_normalizes_email(client):
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["tokenType"] == "bearer"
    assert body["user"]["email"] == "ana@example.com"
    assert body["user"]["name"] == "Ana Pérez"
    assert "password" not in str(body).lower()


def test_register_rejects_duplicate_email_case_insensitive(client):
    assert register(client).status_code == 201
    assert register(client, email="ana@example.com").status_code == 409


def test_register_validates_input(client):
    assert register(client, email="no-es-correo").status_code == 422
    assert register(client, password="corta1").status_code == 422
    assert register(client, password="solo-letras-aqui").status_code == 422
    assert register(client, password="123456789").status_code == 422
    assert register(client, name=" ").status_code == 422


def test_login_success_and_failures(client):
    register(client)

    ok = client.post("/auth/login", json={"email": "ANA@example.com", "password": "clave1234"})
    bad_password = client.post("/auth/login", json={"email": USER["email"], "password": "incorrecta1"})
    unknown = client.post("/auth/login", json={"email": "nadie@example.com", "password": "clave1234"})

    assert ok.status_code == 200
    assert ok.json()["accessToken"]
    assert bad_password.status_code == 401
    assert unknown.status_code == 401
    assert bad_password.json()["detail"] == unknown.json()["detail"]


def test_me_requires_valid_token(client):
    token = register(client).json()["accessToken"]

    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers=auth("basura")).status_code == 401
    me = client.get("/auth/me", headers=auth(token))
    assert me.status_code == 200
    assert me.json()["email"] == "ana@example.com"


def test_expired_token_is_rejected(client):
    settings = get_settings()
    expired = jwt.encode(
        {"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        settings.auth_secret,
        algorithm="HS256",
    )
    register(client)
    assert client.get("/auth/me", headers=auth(expired)).status_code == 401


def test_token_signed_with_other_secret_is_rejected(client):
    register(client)
    forged = jwt.encode(
        {"sub": "1", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        "x" * 40,
        algorithm="HS256",
    )
    assert client.get("/auth/me", headers=auth(forged)).status_code == 401


def test_progress_is_stored_per_authenticated_user(client):
    token = register(client).json()["accessToken"]
    other = register(client, email="otra@example.com").json()["accessToken"]

    submit = client.post("/activities/1/submit", json=ANSWER, headers=auth(token))
    mine = client.get("/progress", headers=auth(token)).json()
    theirs = client.get("/progress", headers=auth(other)).json()
    anonymous = client.get("/progress").json()

    assert submit.status_code == 200
    assert mine["userId"] == "1"
    assert mine["completedActivities"] == 1
    assert theirs["completedActivities"] == 0
    assert anonymous["userId"] == "local-demo-user"
    assert anonymous["completedActivities"] == 0


def test_cannot_read_progress_of_another_user(client):
    token = register(client).json()["accessToken"]

    assert client.get("/progress/1", headers=auth(token)).status_code == 200
    assert client.get("/progress/2", headers=auth(token)).status_code == 403
    assert client.get("/progress/1").status_code == 401
    assert client.get("/progress/1/language/1").status_code == 401
    assert client.get("/progress/local-demo-user").status_code == 200
