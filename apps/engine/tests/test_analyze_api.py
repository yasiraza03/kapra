"""The /analyze + /genome endpoints end to end (against a temp SQLite db)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from kapra_engine.main import app

client = TestClient(app)


def test_analyze_roundtrip(weave_png: bytes) -> None:
    res = client.post(
        "/analyze",
        files={"file": ("swatch.png", weave_png, "image/png")},
    )
    assert res.status_code == 200, res.text
    genome = res.json()
    assert genome["schemaVersion"] == "1.0.0"
    assert len(genome["genes"]) >= 4
    gid = genome["id"]

    fetched = client.get(f"/genome/{gid}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == gid


def test_rejects_non_image() -> None:
    res = client.post(
        "/analyze",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert res.status_code == 415


def test_rejects_empty_upload() -> None:
    res = client.post(
        "/analyze",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert res.status_code == 400


def test_unknown_genome_404() -> None:
    assert client.get("/genome/gen_does_not_exist").status_code == 404


def test_archive_lists_summaries_not_full_genomes(weave_png: bytes) -> None:
    posted = client.post("/analyze", files={"file": ("swatch.png", weave_png, "image/png")})
    assert posted.status_code == 200
    gid = posted.json()["id"]

    res = client.get("/genomes?limit=10")
    assert res.status_code == 200
    items = res.json()["items"]
    assert any(it["id"] == gid for it in items)

    entry = next(it for it in items if it["id"] == gid)
    # headline readings present...
    assert entry["weaveFamily"] is not None
    assert entry["dominantHex"].startswith("#")
    # ...but never the heavy payloads
    assert "genes" not in entry
    assert "source" not in entry
