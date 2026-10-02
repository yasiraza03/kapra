"""Genome repository — the only place that knows how genomes are stored."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select

from kapra_engine.domain import Genome

from .db import GenomeRow, session


class GenomeRepository:
    def save(self, genome: Genome) -> str:
        wire = genome.to_wire()
        with session() as s:
            s.merge(GenomeRow(id=genome.id, created_at=genome.created_at, wire=wire))
            s.commit()
        return genome.id

    def get(self, genome_id: str) -> dict[str, Any] | None:
        """Return the stored genome as its canonical camelCase wire dict."""
        with session() as s:
            row = s.get(GenomeRow, genome_id)
            return dict(row.wire) if row is not None else None

    def list_recent(self, limit: int = 24) -> list[dict[str, Any]]:
        """Lightweight summaries for the archive — never the full genome.

        Full genomes embed preview images and spectra, so a listing deliberately
        returns only the headline readings.
        """
        with session() as s:
            stmt = select(GenomeRow).order_by(GenomeRow.created_at.desc()).limit(limit)
            rows = s.execute(stmt).scalars().all()
            return [_summarize(dict(r.wire)) for r in rows]


def _summarize(wire: dict[str, Any]) -> dict[str, Any]:
    genes: list[dict[str, Any]] = wire.get("genes", [])
    by_id = {g.get("geneId"): g for g in genes}

    def value(gene_id: str, key: str) -> Any:
        gene = by_id.get(gene_id)
        if not gene:
            return None
        return (gene.get("value") or {}).get(key)

    def confidence(gene_id: str) -> Any:
        gene = by_id.get(gene_id)
        return gene.get("confidence") if gene else None

    return {
        "id": wire.get("id"),
        "createdAt": wire.get("createdAt"),
        "geneCount": len(genes),
        "weaveFamily": value("weave", "family"),
        "weaveConfidence": confidence("weave"),
        "periodicityPx": value("weave", "periodicityPx"),
        "orientationDeg": value("weave", "orientationDeg"),
        "dominantHex": value("color", "dominantHex"),
        "evenness": value("color", "evenness"),
        "textureScale": value("texture", "scale"),
        "finish": value("sheen", "finish"),
    }


_repository: GenomeRepository | None = None


def get_repository() -> GenomeRepository:
    global _repository
    if _repository is None:
        _repository = GenomeRepository()
    return _repository
