"""
rag/routes.py
─────────────
FastAPI router for the VyaparMitra RAG (Retrieval) module.

Endpoints
─────────
  POST /rag/retrieve
      Accepts a free-text business description and returns top relevant schemes.
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException, status
from loguru import logger
from pydantic import BaseModel, Field

from .retriever import RetrievedScheme, retrieval_engine

# ─── Router ───────────────────────────────────────────────────────────────────

router = APIRouter(
    prefix="/rag",
    tags=["Retrieval Engine"],
)

# ─── Models ───────────────────────────────────────────────────────────────────


class RetrieveRequest(BaseModel):
    description: str = Field(
        ...,
        description="Free-text description of the business and its needs.",
        example="I own a turmeric processing unit in Maharashtra. Revenue is 2 lakh. I have 12 employees. I need a loan to buy new machinery."
    )
    top_k: int = Field(5, ge=1, le=20, description="Number of results to return")


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.post(
    "/retrieve",
    response_model=List[RetrievedScheme],
    status_code=status.HTTP_200_OK,
    summary="Retrieve relevant schemes for a business description",
    description=(
        "Converts the provided business description into a semantic embedding "
        "and searches the FAISS index for the most relevant government schemes."
    ),
)
async def retrieve_schemes(body: RetrieveRequest) -> List[RetrievedScheme]:
    """Retrieve top-K matching schemes."""
    logger.info("Retrieval request received. top_k={}, length={}", body.top_k, len(body.description))
    
    if not body.description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business description cannot be empty."
        )

    try:
        results = retrieval_engine.search(body.description, top_k=body.top_k)
        if not results:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="FAISS index is not available or is empty. Please run the embedding pipeline."
            )
        return results
    except Exception as exc:
        logger.exception("Retrieval failed: {}", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        ) from exc
