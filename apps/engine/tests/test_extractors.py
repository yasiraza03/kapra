"""Extractor + orchestrator behaviour, including MEASURED determinism."""

from __future__ import annotations

from typing import Any

import jsonschema

from kapra_engine.orchestrator import analyze_image


def test_pipeline_produces_all_genes(weave_png: bytes) -> None:
    genome = analyze_image(weave_png)
    ids = {g.gene_id for g in genome.genes}
    assert {"weave", "weave_family", "color", "texture", "sheen"} <= ids
    assert genome.timings is not None


def test_tiers_are_assigned_honestly(weave_png: bytes) -> None:
    """Thread measurement is MEASURED; naming the interlacing is ESTIMATED."""
    genome = analyze_image(weave_png)
    by_id = {g.gene_id: g for g in genome.genes}
    assert by_id["weave"].tier == "MEASURED"
    assert by_id["weave_family"].tier == "ESTIMATED"


def test_genome_validates_against_schema(
    weave_png: bytes, genome_json_schema: dict[str, Any]
) -> None:
    genome = analyze_image(weave_png)
    jsonschema.validate(instance=genome.to_wire(), schema=genome_json_schema)


def test_weave_reads_grating_orientation(weave_png: bytes) -> None:
    genome = analyze_image(weave_png)
    weave = next(g for g in genome.genes if g.gene_id == "weave")
    # A sin(x+y) grating is a 45-degree diagonal structure. Reading it correctly
    # proves the peak search is not hard-coded to the frequency axes, so cloth
    # photographed at an angle is handled too.
    assert abs(weave.value["orientationDeg"] - 45.0) < 10.0
    assert weave.value["threadPeriodPx"] > 0


def test_thread_period_matches_rendered_truth(plain_weave_png: bytes) -> None:
    """The headline MEASURED number must track reality, not just be stable."""
    genome = analyze_image(plain_weave_png)
    weave = next(g for g in genome.genes if g.gene_id == "weave")
    # conftest renders a 10px thread period; allow a 15% tolerance for rescaling.
    assert abs(weave.value["threadPeriodPx"] - 10.0) / 10.0 < 0.15


def test_weave_family_identifies_plain_interlacing(plain_weave_png: bytes) -> None:
    genome = analyze_image(plain_weave_png)
    family = next(g for g in genome.genes if g.gene_id == "weave_family")
    assert family.value["family"] == "plain"
    assert family.confidence > 0.4


def test_measured_layer_is_deterministic(weave_png: bytes) -> None:
    a = analyze_image(weave_png)
    b = analyze_image(weave_png)

    def gene(g: Any, gid: str) -> Any:
        return next(x for x in g.genes if x.gene_id == gid)

    assert gene(a, "weave").value["threadPeriodPx"] == gene(b, "weave").value["threadPeriodPx"]
    assert gene(a, "color").value["dominantHex"] == gene(b, "color").value["dominantHex"]
    assert gene(a, "texture").value["laplacianVar"] == gene(b, "texture").value["laplacianVar"]


def test_every_gene_carries_evidence(weave_png: bytes) -> None:
    genome = analyze_image(weave_png)
    for g in genome.genes:
        assert len(g.evidence) >= 1  # the honesty rule, enforced end-to-end
