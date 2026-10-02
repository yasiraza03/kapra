"""SQLAlchemy engine/session wiring. Lazy so tests can point at their own URL."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from kapra_engine.core import get_settings


class Base(DeclarativeBase):
    pass


class GenomeRow(Base):
    __tablename__ = "genomes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    wire: Mapped[dict[str, Any]] = mapped_column(JSON)


_engine = None
_SessionFactory: sessionmaker[Session] | None = None


def _ensure() -> sessionmaker[Session]:
    global _engine, _SessionFactory
    if _SessionFactory is not None:
        return _SessionFactory
    url = get_settings().database_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    _engine = create_engine(url, connect_args=connect_args, future=True)
    Base.metadata.create_all(_engine)
    _SessionFactory = sessionmaker(bind=_engine, expire_on_commit=False)
    return _SessionFactory


def session() -> Session:
    return _ensure()()
