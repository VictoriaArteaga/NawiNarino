def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_languages(client):
    response = client.get("/languages")

    assert response.status_code == 200
    assert response.json()[0]["name"] == "Test language"
    assert response.json()[0]["isMock"] is True


def test_get_language_includes_related_records(client):
    response = client.get("/languages/1")

    assert response.status_code == 200
    assert response.json()["culturalDescription"] == "Information pending validation."
    assert len(response.json()["vocabulary"]) == 1
    assert len(response.json()["culturalContents"]) == 1


def test_get_missing_language_returns_404(client):
    response = client.get("/languages/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Language not found"


def test_list_language_vocabulary(client):
    response = client.get("/languages/1/vocabulary")

    assert response.status_code == 200
    assert response.json()[0]["word"] == "Demonstration word"


def test_missing_language_vocabulary_returns_404(client):
    response = client.get("/languages/999/vocabulary")

    assert response.status_code == 404
    assert response.json()["detail"] == "Language not found"


def test_list_language_cultural_content(client):
    response = client.get("/languages/1/culture")

    assert response.status_code == 200
    assert response.json()[0]["title"] == "Demonstration content"
    assert response.json()[0]["isMock"] is True


def test_get_vocabulary_item(client):
    response = client.get("/vocabulary/1")

    assert response.status_code == 200
    assert response.json()["translation"] == "Translation pending validation"


def test_get_missing_vocabulary_item_returns_404(client):
    response = client.get("/vocabulary/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Vocabulary item not found"

