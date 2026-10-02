"""Extractor + orchestrator behaviour, including MEASURED determinism."""

from __future__ import annotations

from typing import Any

import jsonschema

from kapra_engine.orchestrator import analyze_image


def test_pipeline_produces_all_measured_genes(weave_png: bytes) -> None:
    genome = analyze_image(weave_png)
    ids = {g.gene_id for g in genome.genes}
    assert {"weave", "color", "texture", "sheen"} <= ids
    assert genome.timings is not None


def test_genome_validates_against_schema(
    weave_png: bytes, genome_json_schema: dict[str, Any]
) -> None:
    genome = analyze_image(weave_png)
    jsonschema.validate(instance=genome.to_wire(), schema=genome_json_schema)


def test_weave_reads_diagonal_orientation(weave_png: bytes) -> None:
    genome = analyze_image(weave_png)
    weave = next(g for g in genome.genes if g.gene_id == "weave")
    # A sin(x+y) grating is a 45-degree diagonal structure -> twill-like.
    assert weave.value["family"] == "twill"
    assert abs(weave.value["orientationDeg"] - 45.0) < 10.0


def test_measured_layer_is_deterministic(weave_png: bytes) -> None:
    a = analyze_image(weave_png)
    b = analyze_image(weave_png)

    def gene(g: Any, gid: str) -> Any:
        return next(x for x in g.genes if x.gene_id == gid)

    assert gene(a, "weave").value["periodicityPx"] == gene(b, "weave").value["periodicityPx"]
    assert gene(a, "color").value["dominantHex"] == gene(b, "color").value["dominantHex"]
    assert gene(a, "texture").value["laplacianVar"] == gene(b, "texture").value["laplacianVar"]


def test_every_gene_carries_evidence(weave_png: bytes) -> None:
    genome = analyze_image(weave_png)
    for g in genome.genes:
        assert len(g.evidence) >= 1  # the honesty rule, enforced end-to-end
