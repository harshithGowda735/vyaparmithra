"""
knowledge/service.py
─────────────────────
KnowledgeBase service — the single public interface for the knowledge module.

Responsibilities
────────────────
• Load and cache schemes from JSON on first access.
• Expose typed search methods:
    - search_by_sector(sector)
    - search_by_employees(max_employees)
    - search_by_revenue(max_revenue)
    - search(sector, employees, revenue)  ← combined filter

All search methods return a :class:`~knowledge.models.SchemeSearchResult`.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional

from loguru import logger

from .loader import load_schemes
from .models import Scheme, SchemeSearchResult

# ─── Default dataset path ─────────────────────────────────────────────────────

_DEFAULT_PATH = Path(__file__).parent / "schemes.json"


# ─── KnowledgeBase ────────────────────────────────────────────────────────────


class KnowledgeBase:
    """In-memory knowledge base for government schemes.

    The dataset is loaded lazily on first search call, or eagerly via
    :meth:`load`.  Once loaded it is cached for the lifetime of the instance.

    Parameters
    ----------
    dataset_path:
        Path to the JSON dataset file.  Defaults to
        ``ai/knowledge/schemes.json``.  Can be overridden via the
        ``KNOWLEDGE_DATASET_PATH`` environment variable.
    """

    def __init__(self, dataset_path: str | Path | None = None) -> None:
        self._path: Path = Path(
            dataset_path
            or os.getenv("KNOWLEDGE_DATASET_PATH", str(_DEFAULT_PATH))
        )
        self._schemes: List[Scheme] = []
        self._loaded: bool = False

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    def load(self) -> None:
        """Eagerly load (or reload) the scheme dataset from disk.

        Safe to call multiple times; subsequent calls refresh the cache.
        """
        self._schemes = load_schemes(self._path)
        self._loaded = True
        logger.info("KnowledgeBase ready — {} schemes cached.", len(self._schemes))

    def _ensure_loaded(self) -> None:
        """Lazy-load on first query."""
        if not self._loaded:
            self.load()

    @property
    def all_schemes(self) -> List[Scheme]:
        """Return every scheme in the knowledge base."""
        self._ensure_loaded()
        return list(self._schemes)

    # ── Search methods ────────────────────────────────────────────────────────

    def search_by_sector(self, sector: str) -> SchemeSearchResult:
        """Return schemes whose ``sector`` matches *sector* (case-insensitive).

        A scheme with ``sector == "all"`` always matches.

        Parameters
        ----------
        sector:
            Sector name to filter by (e.g. ``"retail"``, ``"manufacturing"``).
        """
        self._ensure_loaded()
        needle = sector.strip().lower()
        matches = [
            s for s in self._schemes
            if s.sector == needle or s.sector == "all"
        ]
        logger.debug("search_by_sector('{}') → {} match(es)", sector, len(matches))
        return SchemeSearchResult(
            query={"sector": sector},
            total=len(matches),
            schemes=matches,
        )

    def search_by_employees(self, num_employees: int) -> SchemeSearchResult:
        """Return schemes whose employee limit is >= *num_employees*.

        Parameters
        ----------
        num_employees:
            The business's current headcount.  Schemes with
            ``employees >= num_employees`` are returned.
        """
        self._ensure_loaded()
        if num_employees < 0:
            raise ValueError("num_employees must be non-negative")
        matches = [s for s in self._schemes if s.employees >= num_employees]
        logger.debug(
            "search_by_employees({}) → {} match(es)", num_employees, len(matches)
        )
        return SchemeSearchResult(
            query={"employees": num_employees},
            total=len(matches),
            schemes=matches,
        )

    def search_by_revenue(self, annual_revenue: float) -> SchemeSearchResult:
        """Return schemes whose revenue limit is >= *annual_revenue*.

        Parameters
        ----------
        annual_revenue:
            The business's annual turnover in INR.  Schemes with
            ``revenue_limits >= annual_revenue`` are returned.
        """
        self._ensure_loaded()
        if annual_revenue < 0:
            raise ValueError("annual_revenue must be non-negative")
        matches = [s for s in self._schemes if s.revenue_limits >= annual_revenue]
        logger.debug(
            "search_by_revenue({}) → {} match(es)", annual_revenue, len(matches)
        )
        return SchemeSearchResult(
            query={"revenue_limits": annual_revenue},
            total=len(matches),
            schemes=matches,
        )

    def search(
        self,
        *,
        sector: Optional[str] = None,
        num_employees: Optional[int] = None,
        annual_revenue: Optional[float] = None,
    ) -> SchemeSearchResult:
        """Combined filter across sector, employees, and revenue.

        All provided filters are applied with AND logic (intersection).
        Omitting a filter means *no restriction* on that dimension.

        Parameters
        ----------
        sector:
            Optional sector name (case-insensitive).  ``"all"`` schemes always
            match.
        num_employees:
            Optional headcount.  Schemes whose limit >= this value are kept.
        annual_revenue:
            Optional annual revenue in INR.  Schemes whose limit >= this value
            are kept.

        Returns
        -------
        SchemeSearchResult
        """
        self._ensure_loaded()

        query: dict = {}
        results = list(self._schemes)

        if sector is not None:
            needle = sector.strip().lower()
            query["sector"] = sector
            results = [
                s for s in results
                if s.sector == needle or s.sector == "all"
            ]

        if num_employees is not None:
            if num_employees < 0:
                raise ValueError("num_employees must be non-negative")
            query["employees"] = num_employees
            results = [s for s in results if s.employees >= num_employees]

        if annual_revenue is not None:
            if annual_revenue < 0:
                raise ValueError("annual_revenue must be non-negative")
            query["revenue_limits"] = annual_revenue
            results = [s for s in results if s.revenue_limits >= annual_revenue]

        logger.debug("search({}) → {} match(es)", query, len(results))
        return SchemeSearchResult(
            query=query,
            total=len(results),
            schemes=results,
        )


# ─── Module-level singleton ───────────────────────────────────────────────────

#: Import and reuse this across routes without re-loading the JSON.
knowledge_base = KnowledgeBase()
