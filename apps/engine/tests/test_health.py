from fastapi.testclient import TestClient

from kapra_engine.domain import GENOME_SCHEMA_VERSION
from kapra_engine.main import app

client = TestClient(app)


def test_health_ok() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["service"] == "kapra-engine"
    assert body["genomeSchemaVersion"] == GENOME_SCHEMA_VERSION


def test_openapi_available() -> None:
    res = client.get("/openapi.json")
    assert res.status_code == 200
    assert res.json()["info"]["title"] == "kapra engine"
