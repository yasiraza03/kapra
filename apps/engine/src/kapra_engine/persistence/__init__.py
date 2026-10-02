"""Persistence. SQLite today, behind a repository seam; Postgres/pgvector in V2
changes only the database URL and this package (see docs/decisions/0001)."""

from .repository import GenomeRepository, get_repository

__all__ = ["GenomeRepository", "get_repository"]
