"""
gemma/routes.py
───────────────
FastAPI router for the VyaparMitra Gemma integration.

Endpoints
─────────
  POST /gemma/consult
      Accepts a business profile, retrieved schemes, and a question, 
      returning MSME business consulting advice from Gemma.
"""

from fastapi import APIRouter, HTTPException, status
from loguru import logger

from .schemas import ConsultantRequest, ConsultantResponse
from .consultant import gemma_consultant

router = APIRouter(
    prefix="/gemma",
    tags=["Consultant"],
)

@router.post(
    "/consult",
    response_model=ConsultantResponse,
    status_code=status.HTTP_200_OK,
    summary="Get consulting advice from Gemma",
    description="Calls the HuggingFace Inference API to get JSON-formatted business consulting advice.",
)
async def consult(body: ConsultantRequest) -> ConsultantResponse:
    """Consult the Gemma MSME Business Consultant."""
    logger.info("Gemma consulting request received.")
    
    try:
        response = gemma_consultant.process(body)
        return response
    except Exception as exc:
        logger.exception(f"Consultation failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )
