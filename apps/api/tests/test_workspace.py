from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"
CONVERSATION_ID = "00000000-0000-0000-0000-000000000002"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_create_conversation_persists_for_authenticated_user(monkeypatch):
    from moreai_api.routers import workspace

    async def insert(table, payload):
        assert table == "conversations"
        assert payload["user_id"] == USER_ID
        return [{"id": CONVERSATION_ID, **payload, "created_at": "2026-11-03T00:00:00Z"}]

    monkeypatch.setattr(workspace, "insert_rows", insert)
    response = client.post("/api/v1/workspace/conversations", json={"title": "Riset"})
    assert response.status_code == 201
    assert response.json()["conversation"]["id"] == CONVERSATION_ID


def test_conversation_history_is_owner_scoped(monkeypatch):
    from moreai_api.routers import workspace

    async def rows(table, query):
        assert table == "conversations"
        assert f"user_id=eq.{USER_ID}" in query
        return []

    monkeypatch.setattr(workspace, "select_rows", rows)
    response = client.get(f"/api/v1/workspace/conversations/{CONVERSATION_ID}/messages")
    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "CONVERSATION_NOT_FOUND"


def test_send_message_persists_user_and_assistant_messages(monkeypatch):
    from moreai_api.routers import workspace
    from moreai_api.routers.llm import GenerateResponse

    saved = []

    async def rows(table, query):
        if table == "conversations":
            return [
                {
                    "id": CONVERSATION_ID,
                    "user_id": USER_ID,
                    "workspace_id": None,
                    "title": "Percakapan baru",
                    "status": "active",
                    "metadata": {},
                }
            ]
        if table == "conversation_messages":
            return []
        return []

    async def insert(table, payload):
        assert table == "conversation_messages"
        saved.append(payload)
        return [{"id": f"message-{len(saved)}", **payload, "created_at": "2026-11-03T00:00:00Z"}]

    async def update(table, query, payload):
        assert table == "conversations"
        return [{"id": CONVERSATION_ID, **payload}]

    async def generate(payload, user_id, key):
        assert user_id == USER_ID
        assert key.startswith(f"chat:{CONVERSATION_ID}:")
        return GenerateResponse(
            text="Jawaban tersimpan",
            model="test-model",
            provider="test-provider",
            request_id="request-001",
            usage={"input_tokens": 5, "output_tokens": 7},
        )

    monkeypatch.setattr(workspace, "select_rows", rows)
    monkeypatch.setattr(workspace, "insert_rows", insert)
    monkeypatch.setattr(workspace, "update_rows", update)
    monkeypatch.setattr(workspace, "_generate", generate)

    response = client.post(
        f"/api/v1/workspace/conversations/{CONVERSATION_ID}/messages",
        headers={"Idempotency-Key": "chat-message-001"},
        json={"content": "Jelaskan arsitektur"},
    )
    assert response.status_code == 200
    assert len(saved) == 2
    assert saved[0]["role"] == "user"
    assert saved[1]["role"] == "assistant"
    assert response.json()["assistant_message"]["content"] == "Jawaban tersimpan"


def test_chat_requires_idempotency_key():
    response = client.post(
        f"/api/v1/workspace/conversations/{CONVERSATION_ID}/messages",
        json={"content": "Halo"},
    )
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"


def test_memory_and_subscription_report_schema_unavailable():
    memory = client.get("/api/v1/workspace/memory")
    subscription = client.get("/api/v1/workspace/subscription")
    assert memory.status_code == 503
    assert memory.json()["detail"]["code"] == "MEMORY_SCHEMA_NOT_PROVISIONED"
    assert subscription.status_code == 503
    assert subscription.json()["detail"]["code"] == "SUBSCRIPTION_SCHEMA_NOT_PROVISIONED"


def test_workspace_file_listing_uses_real_artifact_schema(monkeypatch):
    from moreai_api.routers import workspace

    async def rows(table, query):
        assert table == "artifacts"
        assert "storage_path" in query
        assert "file_name" not in query
        return [
            {
                "id": "artifact-1",
                "storage_path": "users/private/report.pdf",
                "mime_type": "application/pdf",
                "size_bytes": 1024,
                "checksum_sha256": "a" * 64,
                "created_at": "2026-11-03T00:00:00Z",
            }
        ]

    monkeypatch.setattr(workspace, "select_rows", rows)
    response = client.get("/api/v1/workspace/files")
    assert response.status_code == 200
    assert response.json()["items"][0]["file_name"] == "report.pdf"


def test_workspace_file_download_is_owner_scoped_and_short_lived(monkeypatch):
    from moreai_api.routers import workspace

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "signedURL": "/storage/v1/object/sign/workspace/users/private/report.pdf?token=opaque"
            }

    class FakeAsyncClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def post(self, url, headers, json):
            assert "/object/sign/workspace/users/private/report.pdf" in url
            assert json == {"expiresIn": 300}
            assert headers["apikey"] == "server-secret"
            return FakeResponse()

    async def rows(table, query):
        assert table == "artifacts"
        assert f"user_id=eq.{USER_ID}" in query
        return [{"id": "artifact-1", "storage_path": "users/private/report.pdf"}]

    monkeypatch.setattr(workspace, "select_rows", rows)
    monkeypatch.setattr(workspace.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(workspace.settings, "supabase_secret_key", "server-secret")
    monkeypatch.setattr(workspace.settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(workspace.settings, "workspace_artifacts_bucket", "workspace")
    response = client.get("/api/v1/workspace/files/00000000-0000-0000-0000-000000000004/download")
    assert response.status_code == 200
    assert response.json()["expires_in"] == 300
    assert response.json()["file_name"] == "report.pdf"
    assert response.json()["url"].endswith("&download=")


def test_workspace_file_download_does_not_expose_storage_when_bucket_unconfigured(monkeypatch):
    from moreai_api.routers import workspace

    async def rows(table, query):
        return [{"id": "artifact-1", "storage_path": "users/private/report.pdf"}]

    monkeypatch.setattr(workspace, "select_rows", rows)
    monkeypatch.setattr(workspace.settings, "supabase_secret_key", "server-secret")
    monkeypatch.setattr(workspace.settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(workspace.settings, "workspace_artifacts_bucket", None)
    response = client.get("/api/v1/workspace/files/00000000-0000-0000-0000-000000000004/download")
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "STORAGE_SIGNING_UNAVAILABLE"
