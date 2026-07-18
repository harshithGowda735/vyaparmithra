"""
knowledge/routes.py
────────────────────
FastAPI router for the VyaparMitra Knowledge Base module.

Endpoints
─────────
  GET  /knowledge/schemes              – List all schemes
  GET  /knowledge/schemes/sector       – Filter by sector
  GET  /knowledge/schemes/employees    – Filter by employee count
  GET  /knowledge/schemes/revenue      – Filter by annual revenue
  POST /knowledge/schemes/search       – Combined multi-filter search
  GET  /knowledge/health               – Liveness probe

Register in main.py
────────────────────
  from ai.knowledge.routes import router as knowledge_router
  app.include_router(knowledge_router)
"""

from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, HTTPException, Query, status
from loguru import logger
from pydantic import BaseModel, Field

from .models import SchemeSearchResult
from .service import knowledge_base

# ─── Router ───────────────────────────────────────────────────────────────────

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge Base"],
)

# ─── Request / Response helpers ───────────────────────────────────────────────


class SearchRequest(BaseModel):
    """Request body for the combined search endpoint."""

    sector: Optional[str] = Field(None, description="Sector name filter (case-insensitive)")
    num_employees: Optional[int] = Field(None, ge=0, description="Business headcount")
    annual_revenue: Optional[float] = Field(None, ge=0, description="Annual revenue in INR")


class HealthResponse(BaseModel):
    status: str
    module: str
    schemes_loaded: int


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Knowledge module health check",
)
async def health_check() -> HealthResponse:
    """Liveness probe — also reports how many schemes are cached."""
    knowledge_base._ensure_loaded()
    return HealthResponse(
        status="ok",
        module="knowledge",
        schemes_loaded=len(knowledge_base.all_schemes),
    )


@router.get(
    "/schemes",
    response_model=SchemeSearchResult,
    status_code=status.HTTP_200_OK,
    summary="List all government schemes",
    description="Returns the full list of schemes loaded from the dataset.",
)
async def list_all_schemes() -> SchemeSearchResult:
    """Return every scheme in the knowledge base."""
    schemes = knowledge_base.all_schemes
    return SchemeSearchResult(query={}, total=len(schemes), schemes=schemes)


@router.get(
    "/schemes/sector",
    response_model=SchemeSearchResult,
    status_code=status.HTTP_200_OK,
    summary="Search schemes by sector",
    description=(
        "Filter schemes by industry sector. "
        "Schemes tagged as **'all'** always appear in results regardless of sector."
    ),
)
async def search_by_sector(
    sector: Annotated[
        str,
        Query(description="Sector name, e.g. 'retail', 'manufacturing', 'handicrafts'"),
    ],
) -> SchemeSearchResult:
    try:
        return knowledge_base.search_by_sector(sector)
    except Exception as exc:
        logger.exception("search_by_sector error: {}", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/schemes/employees",
    response_model=SchemeSearchResult,
    status_code=status.HTTP_200_OK,
    summary="Search schemes by employee count",
    description=(
        "Returns schemes whose employee limit is **≥ num_employees**. "
        "Useful to find schemes a business with a given headcount qualifies for."
    ),
)
async def search_by_employees(
    num_employees: Annotated[
        int,
        Query(ge=0, description="Current number of employees in the business"),
    ],
) -> SchemeSearchResult:
    try:
        return knowledge_base.search_by_employees(num_employees)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("search_by_employees error: {}", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/schemes/revenue",
    response_model=SchemeSearchResult,
    status_code=status.HTTP_200_OK,
    summary="Search schemes by annual revenue",
    description=(
        "Returns schemes whose revenue limit is **≥ annual_revenue** (in INR). "
        "Useful to find schemes a business with a given turnover qualifies for."
    ),
)
async def search_by_revenue(
    annual_revenue: Annotated[
        float,
        Query(ge=0, description="Annual business revenue in INR"),
    ],
) -> SchemeSearchResult:
    try:
        return knowledge_base.search_by_revenue(annual_revenue)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("search_by_revenue error: {}", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/schemes/search",
    response_model=SchemeSearchResult,
    status_code=status.HTTP_200_OK,
    summary="Combined multi-filter scheme search",
    description=(
        "Apply any combination of sector, employee count, and revenue filters. "
        "All provided filters are combined with AND logic. "
        "Omitting a field means no restriction on that dimension."
    ),
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": {
                        "query": {"sector": "retail", "employees": 5, "revenue_limits": 300000},
                        "total": 2,
                        "schemes": [],
                    }
                }
            }
        }
    },
)
async def combined_search(body: SearchRequest) -> SchemeSearchResult:
    try:
        return knowledge_base.search(
            sector=body.sector,
            num_employees=body.num_employees,
            annual_revenue=body.annual_revenue,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("combined_search error: {}", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
