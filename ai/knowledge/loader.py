"""
knowledge/loader.py
────────────────────
JSON loading and validation utilities for the schemes dataset.

Functions
─────────
  load_schemes(path)  →  List[Scheme]
      Read and validate schemes.json. Raises on schema errors.

  validate_raw(raw)   →  List[Scheme]
      Validate an already-parsed list of dicts (useful for tests/mocks).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List

# pyrefly: ignore [missing-import]
from loguru import logger
from pydantic import ValidationError

from .models import Scheme

# Default path — sits next to this file.
_DEFAULT_PATH = Path(__file__).parent / "schemes.json"


def load_schemes(path: str | Path = _DEFAULT_PATH) -> List[Scheme]:
    """Load and validate all schemes from a JSON file.

    Parameters
    ----------
    path:
        Absolute or relative path to the JSON dataset file.
        Defaults to ``ai/knowledge/schemes.json``.

    Returns
    -------
    List[Scheme]
        Validated scheme objects ready for querying.

    Raises
    ------
    FileNotFoundError
        If *path* does not exist on disk.
    ValueError
        If the file contains invalid JSON or fails schema validation.
    """
    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(
            f"Schemes dataset not found at '{path}'. "
            "Create ai/knowledge/schemes.json or pass a custom path."
        )

    logger.debug("Loading schemes from '{}'…", path)

    try:
        raw: Any = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in '{path}': {exc}") from exc

    if not isinstance(raw, list):
        raise ValueError(
            f"schemes.json must contain a JSON array at the top level, "
            f"got {type(raw).__name__}."
        )

    schemes = validate_raw(raw, source=str(path))
    logger.info("Loaded {} schemes from '{}'", len(schemes), path)
    return schemes


def validate_raw(
    raw: list[dict[str, Any]],
    *,
    source: str = "<in-memory>",
) -> List[Scheme]:
    """Validate a list of raw dicts against the :class:`~knowledge.models.Scheme` schema.

    Invalid entries are **logged and skipped** so that one bad record does
    not abort the entire dataset load.

    Parameters
    ----------
    raw:
        List of dicts, typically from ``json.loads()``.
    source:
        Human-readable label used in log messages (e.g., the file path).

    Returns
    -------
    List[Scheme]
        Successfully validated scheme objects.
    """
    schemes: List[Scheme] = []
    errors: int = 0

    for i, entry in enumerate(raw):
        try:
            schemes.append(Scheme.model_validate(entry))
        except ValidationError as exc:
            errors += 1
            logger.warning(
                "Skipping entry #{} in '{}' due to validation error:\n{}",
                i,
                source,
                exc,
            )

    if errors:
        logger.warning(
            "{} of {} entries in '{}' failed validation and were skipped.",
            errors,
            len(raw),
            source,
        )

    return schemes
