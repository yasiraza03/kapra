"""Proves the Python domain models and the canonical JSON Schema agree.

This is how 'one source of truth' stays true across the TS/Python boundary:
a Pydantic Genome, once dumped, must validate against genome.schema.v1.json.
"""

from __future__ import annotations

from typing import Any

import jsonschema

from kapra_engine.domain import Genome


def test_sample_genome_matches_canonical_schema(
    sample_genome: Genome, genome_json_schema: dict[str, Any]
) -> None:
    payload = sample_genome.to_wire()
    # Raises jsonschema.ValidationError on any divergence.
    jsonschema.validate(instance=payload, schema=genome_json_schema)


def test_schema_const_version_matches_model(
    sample_genome: Genome, genome_json_schema: dict[str, Any]
) -> None:
    const = genome_json_schema["properties"]["schemaVersion"]["const"]
    assert sample_genome.schema_version == const
