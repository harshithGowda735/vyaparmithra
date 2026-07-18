"""
voice/routes.py
───────────────
FastAPI router for the VyaparMitra Voice Processing module.

Endpoints
─────────
  POST /voice/transcribe
      Accepts a multipart audio file upload (mp3 | wav | m4a).
      Optional query parameter ``language`` for forced language hint.
      Returns JSON: { "text": "...", "language": "...", "confidence": 0.97 }

  GET  /voice/health
      Lightweight liveness probe — confirms the router is reachable.

  GET  /voice/supported-languages
      Returns the list of officially supported languages.

Usage — register in your FastAPI app
────────────────────────────────────
    from ai.voice.routes import router as voice_router
    app.include_router(voice_router)
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import BaseModel

from .service import TranscriptionResult, voice_service
from .speech import ALLOWED_EXTENSIONS, SUPPORTED_LANGUAGES

# ─── Router ───────────────────────────────────────────────────────────────────

router = APIRouter(
    prefix="/voice",
    tags=["Voice Processing"],
)

# ─── Pydantic response models ─────────────────────────────────────────────────


class HealthResponse(BaseModel):
    status: str
    module: str


class SupportedLanguagesResponse(BaseModel):
    languages: dict[str, str]
    """ISO 639-1 code → human-readable name."""
    allowed_formats: list[str]


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.post(
    "/transcribe",
    response_model=TranscriptionResult,
    status_code=status.HTTP_200_OK,
    summary="Transcribe an audio file to text",
    description=(
        "Upload an audio file (mp3, wav, or m4a) and receive a transcription "
        "powered by OpenAI Whisper. Supports English, Hindi, and Kannada. "
        "Optionally pass a `language` hint to skip auto-detection."
    ),
    responses={
        200: {
            "description": "Successful transcription",
            "content": {
                "application/json": {
                    "example": {
                        "text": "ನಮಸ್ಕಾರ, ನಾನು ವ್ಯಾಪಾರ ಮಿತ್ರ ಬಳಸುತ್ತಿದ್ದೇನೆ.",
                        "language": "Kannada",
                        "confidence": 0.9312,
                    }
                }
            },
        },
        400: {"description": "Unsupported file format or missing file"},
        422: {"description": "Validation error"},
        500: {"description": "Transcription failed on the server"},
    },
)
async def transcribe_audio(
    file: Annotated[
        UploadFile,
        File(description="Audio file to transcribe (mp3 | wav | m4a, max 25 MB)"),
    ],
    language: Annotated[
        str | None,
        Query(
            description=(
                "Optional ISO 639-1 language hint. "
                "Supported: 'en' (English), 'hi' (Hindi), 'kn' (Kannada). "
                "Omit to let Whisper auto-detect."
            ),
            min_length=2,
            max_length=5,
        ),
    ] = None,
) -> TranscriptionResult:
    """Transcribe an uploaded audio file using Whisper.

    - **file**: multipart audio upload (mp3 / wav / m4a)
    - **language**: optional ISO 639-1 code for forced language detection
    """
    # ── Validate file presence ────────────────────────────────────────────────
    if file is None or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file provided.",
        )

    # ── Validate file extension ───────────────────────────────────────────────
    from pathlib import Path

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported audio format '{suffix}'. "
                f"Allowed formats: {sorted(ALLOWED_EXTENSIONS)}"
            ),
        )

    # ── Validate language hint ────────────────────────────────────────────────
    if language is not None:
        lang_lower = language.lower()
        if lang_lower not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported language code '{language}'. "
                    f"Supported: {list(SUPPORTED_LANGUAGES.keys())}"
                ),
            )
        language = lang_lower

    # ── Transcribe ────────────────────────────────────────────────────────────
    logger.info(
        "Transcribe request — file='{}', size={}B, language_hint={!r}",
        file.filename,
        file.size,
        language,
    )

    try:
        result: TranscriptionResult = await voice_service.transcribe_upload(
            file, language=language
        )
    except FileNotFoundError as exc:
        logger.error("File not found during transcription: {}", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        logger.error("Validation error during transcription: {}", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        logger.exception("Transcription runtime error: {}", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {exc}",
        ) from exc

    logger.info(
        "Transcription complete — language='{}', confidence={}, chars={}",
        result.language,
        result.confidence,
        len(result.text),
    )
    return result


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Voice module health check",
    description="Returns a simple status message confirming the voice module is up.",
)
async def health_check() -> HealthResponse:
    """Liveness probe for the voice processing module."""
    return HealthResponse(status="ok", module="voice")


@router.get(
    "/supported-languages",
    response_model=SupportedLanguagesResponse,
    status_code=status.HTTP_200_OK,
    summary="List supported languages and audio formats",
    description=(
        "Returns the ISO 639-1 language codes and audio formats "
        "that the transcription endpoint accepts."
    ),
)
async def supported_languages() -> SupportedLanguagesResponse:
    """Return supported languages and allowed audio file extensions."""
    return SupportedLanguagesResponse(
        languages=SUPPORTED_LANGUAGES,
        allowed_formats=sorted(ALLOWED_EXTENSIONS),
    )
