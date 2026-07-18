"""
knowledge/models.py
────────────────────
Pydantic models for the Government Schemes Knowledge Base.

Each field maps directly to a key in ``schemes.json``.
Validation is handled by Pydantic v2 field validators.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator


class Scheme(BaseModel):
    """Represents one government scheme / loan product in the knowledge base.

    All string fields are stripped of leading/trailing whitespace on load.
    """

    name: str = Field(..., description="Human-readable name of the scheme")
    sector: str = Field(
        ..., description="Industry sector (e.g. 'retail', 'manufacturing', 'all')"
    )
    employees: int = Field(
        ..., ge=0, description="Maximum number of employees eligible (inclusive)"
    )
    revenue_limits: float = Field(
        ..., ge=0, description="Maximum annual revenue in INR eligible (inclusive)"
    )
    eligibility: str = Field(..., description="Plain-text eligibility criteria")
    benefits: str = Field(..., description="Plain-text benefit description")
    documents: List[str] = Field(
        ..., description="List of required document names"
    )
    apply_url: HttpUrl = Field(
        ..., description="URL where the scheme application can be submitted"
    )
    loans: List[str] = Field(
        default_factory=list, description="Loan products available under this scheme"
    )

    # ── Validators ──────────────────────────────────────────────────────────────

    @field_validator("name", "sector", "eligibility", "benefits", mode="before")
    @classmethod
    def _strip_strings(cls, v: object) -> object:
        """Strip whitespace from string fields."""
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("sector", mode="before")
    @classmethod
    def _lowercase_sector(cls, v: object) -> object:
        """Normalise sector to lowercase for consistent comparison."""
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("documents", mode="before")
    @classmethod
    def _strip_documents(cls, v: object) -> object:
        """Strip whitespace from each document entry."""
        if isinstance(v, list):
            return [d.strip() if isinstance(d, str) else d for d in v]
        return v

    @model_validator(mode="after")
    def _validate_urls(self) -> "Scheme":
        """Ensure apply_url is not empty (HttpUrl already validates format)."""
        if not str(self.apply_url):
            raise ValueError("apply_url must not be empty")
        return self


class SchemeSearchResult(BaseModel):
    """Wraps a list of matching schemes and the query parameters used."""

    query: dict = Field(..., description="Search parameters that produced this result")
    total: int = Field(..., description="Number of matching schemes found")
    schemes: List[Scheme] = Field(..., description="List of matching schemes")
