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


def test_learning_routes_return_mock_lessons_and_activities(client):
    lessons = client.get("/languages/1/lessons")
    activities = client.get("/lessons/1/activities")
    activity = client.get("/activities/1")

    assert lessons.status_code == 200
    assert lessons.json()[0]["isMock"] is True
    assert activities.status_code == 200
    assert activities.json()[0]["questions"][0]["options"][0]["isMock"] is True
    assert activity.status_code == 200


def test_submit_activity_records_and_updates_progress(client):
    payload = {"answers": [{"questionId": 1, "optionId": 1}]}

    first = client.post("/activities/1/submit", json=payload)
    second = client.post("/activities/1/submit", json=payload)
    progress = client.get("/progress")
    language_progress = client.get("/progress/local-demo-user/language/1")

    assert first.status_code == 200
    assert first.json() == {
        "activityId": 1,
        "isCorrect": True,
        "score": 100,
        "attempts": 1,
        "feedback": "Resultado de demostración.",
        "isMock": True,
    }
    assert second.json()["attempts"] == 2
    assert progress.json()["completedActivities"] == 1
    assert progress.json()["percentage"] == 100
    assert language_progress.json()["languageId"] == 1


def test_submit_activity_rejects_incomplete_or_foreign_answers(client):
    incomplete = client.post("/activities/1/submit", json={"answers": []})
    foreign_option = client.post(
        "/activities/1/submit",
        json={"answers": [{"questionId": 1, "optionId": 999}]},
    )

    assert incomplete.status_code == 422
    assert foreign_option.status_code == 422


def test_submit_incorrect_answer_records_zero_score(client):
    response = client.post(
        "/activities/1/submit",
        json={"answers": [{"questionId": 1, "optionId": 2}]},
    )
    progress = client.get("/progress")

    assert response.status_code == 200
    assert response.json()["isCorrect"] is False
    assert response.json()["score"] == 0
    assert progress.json()["activities"][0]["score"] == 0


def test_missing_learning_resources_return_404(client):
    assert client.get("/languages/999/lessons").status_code == 404
    assert client.get("/lessons/999").status_code == 404
    assert client.get("/activities/999").status_code == 404


def test_territory_heritage_toponym_and_source_routes(client):
    territories = client.get("/territories")
    language_territories = client.get("/languages/1/territories")
    territory = client.get("/territories/1")
    heritage = client.get("/heritage")
    toponyms = client.get("/toponyms?search=Demonstration")
    toponym = client.get("/toponyms/1")
    sources = client.get("/sources")
    source = client.get("/sources/1")

    assert territories.status_code == 200
    assert territories.json()[0]["isMock"] is True
    assert language_territories.status_code == 200
    assert language_territories.json()[0]["name"] == "Demonstration territory"
    assert territory.json()["latitude"] is None
    assert heritage.json()[0]["isMock"] is True
    assert toponyms.json()[0]["meaning"] == "Meaning pending validation"
    assert toponym.json()["source"]["isMock"] is True
    assert sources.json()[0]["reference"] == "Reference pending validation"
    assert source.json()["isMock"] is True


def test_missing_territory_heritage_toponym_and_source_return_404(client):
    assert client.get("/territories/999").status_code == 404
    assert client.get("/heritage/999").status_code == 404
    assert client.get("/toponyms/999").status_code == 404
    assert client.get("/sources/999").status_code == 404
