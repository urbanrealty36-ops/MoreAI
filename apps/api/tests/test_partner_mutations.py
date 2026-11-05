from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"
PARTNER_ID = "00000000-0000-0000-0000-000000000010"
LOCATION_ID = "00000000-0000-0000-0000-000000000020"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_partner_owner_can_create_branch_and_audit(monkeypatch):
    from moreai_api.routers import partner

    async def rows(table, query):
        if table == "partner_members":
            return [
                {
                    "partner_id": PARTNER_ID,
                    "location_id": None,
                    "role_key": "partner_owner",
                    "status": "active",
                }
            ]
        return []

    inserted = []

    async def insert(table, payload):
        inserted.append((table, payload))
        if table == "partner_locations":
            return [{"id": LOCATION_ID, **payload}]
        return [{"id": "audit-1"}]

    monkeypatch.setattr(partner, "select_rows", rows)
    monkeypatch.setattr(partner, "insert_rows", insert)

    response = client.post("/api/v1/partner/branches", json={"name": "Cabang Bogor"})

    assert response.status_code == 201
    assert response.json()["item"]["partner_id"] == PARTNER_ID
    assert inserted[0][1]["partner_id"] == PARTNER_ID
    assert inserted[1][1]["action"] == "partner.branch.created"


def test_partner_staff_cannot_create_branch(monkeypatch):
    from moreai_api.routers import partner

    async def rows(table, query):
        if table == "partner_members":
            return [
                {
                    "partner_id": PARTNER_ID,
                    "location_id": LOCATION_ID,
                    "role_key": "partner_staff",
                    "status": "active",
                }
            ]
        return []

    async def insert(*args, **kwargs):
        raise AssertionError("Unauthorized mutation must not write")

    monkeypatch.setattr(partner, "select_rows", rows)
    monkeypatch.setattr(partner, "insert_rows", insert)

    response = client.post("/api/v1/partner/branches", json={"name": "Cabang Terlarang"})

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "PARTNER_OPERATION_FORBIDDEN"


def test_location_manager_campaign_list_is_location_scoped(monkeypatch):
    from moreai_api.routers import partner

    async def rows(table, query):
        if table == "partner_members":
            return [
                {
                    "partner_id": PARTNER_ID,
                    "location_id": LOCATION_ID,
                    "role_key": "location_manager",
                    "status": "active",
                }
            ]
        if table == "partner_campaigns":
            return [
                {"id": "campaign-1", "partner_id": PARTNER_ID, "location_id": LOCATION_ID},
                {
                    "id": "campaign-2",
                    "partner_id": PARTNER_ID,
                    "location_id": "00000000-0000-0000-0000-000000000021",
                },
            ]
        return []

    monkeypatch.setattr(partner, "select_rows", rows)

    response = client.get("/api/v1/partner/campaigns")

    assert response.status_code == 200
    assert [item["id"] for item in response.json()["items"]] == ["campaign-1"]


def test_partner_campaign_create_always_starts_as_draft(monkeypatch):
    from moreai_api.routers import partner

    async def rows(table, query):
        if table == "partner_members":
            return [
                {
                    "partner_id": PARTNER_ID,
                    "location_id": None,
                    "role_key": "partner_admin",
                    "status": "active",
                }
            ]
        return []

    inserted = []

    async def insert(table, payload):
        inserted.append((table, payload))
        if table == "partner_campaigns":
            return [{"id": "campaign-1", "status": "draft", **payload}]
        return [{"id": "audit-1"}]

    monkeypatch.setattr(partner, "select_rows", rows)
    monkeypatch.setattr(partner, "insert_rows", insert)

    response = client.post(
        "/api/v1/partner/campaigns",
        json={"name": "Promo Perdana", "config": {"channel": "wifi"}},
    )

    assert response.status_code == 201
    assert response.json()["item"]["status"] == "draft"
    assert inserted[0][1]["partner_id"] == PARTNER_ID
