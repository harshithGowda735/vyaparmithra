"""
voice/service.py
────────────────
High-level VoiceService for VyaparMitra.

Responsibilities
────────────────
• Accept an ``UploadFile`` (from FastAPI) or a raw file path.
• Save uploaded bytes to a temporary location on disk.
• Delegate raw transcription to ``WhisperTranscriber``.
• Compute an aggregate confidence score from per-word probabilities.
• Map Whisper's ISO 639-1 language code to a human-readable label.
• Return a typed ``TranscriptionResult`` Pydantic model.

Confidence calculation
──────────────────────
Whisper exposes per-word ``probability`` values when ``word_timestamps=True``.
We compute the arithmetic mean of all word probabilities across all segments.
If no word-level data is available (very short clips, non-speech, etc.) we fall
back to ``None`` so callers know the confidence is unavailable.
"""

from __future__ import annotations

import os
import tempfile
import uuid
from pathlib import Path
from typing import Any

from fastapi import UploadFile
from loguru import logger
from pydantic import BaseModel, Field

from .speech import ALLOWED_EXTENSIONS, SUPPORTED_LANGUAGES, WhisperTranscriber

# ─── Response schema ──────────────────────────────────────────────────────────


class TranscriptionResult(BaseModel):
    """Structured transcription response returned by :class:`VoiceService`."""

    text: str = Field(
        ...,
        description="Full transcript text produced by Whisper.",
    )
    language: str = Field(
        ...,
        description=(
            "Human-readable language name detected / used during transcription "
            "(e.g. 'English', 'Hindi', 'Kannada')."
        ),
    )
    confidence: float | None = Field(
        None,
        ge=0.0,
        le=1.0,
        description=(
            "Mean per-word probability in [0, 1]. "
            "``null`` when word-level data is unavailable."
        ),
    )


# ─── VoiceService ─────────────────────────────────────────────────────────────


class VoiceService:
    """Orchestrates audio upload → Whisper transcription → structured result.

    Parameters
    ----------
    transcriber:
        A :class:`~voice.speech.WhisperTranscriber` instance.
        Defaults to the module-level singleton so callers don't need to
        manage model lifecycle.
    tmp_dir:
        Directory used for temporary audio files.  Defaults to the OS
        temporary directory.  Can be overridden for testing.
    """

    def __init__(
        self,
        transcriber: WhisperTranscriber | None = None,
        tmp_dir: str | Path | None = None,
    ) -> None:
        from .speech import transcriber as _default_transcriber  # local import avoids circularity

        self._transcriber = transcriber or _default_transcriber
        self._tmp_dir = Path(tmp_dir) if tmp_dir else Path(tempfile.gettempdir())

    # ── Public API ────────────────────────────────────────────────────────────

    async def transcribe_upload(
        self,
        upload: UploadFile,
        *,
        language: str | None = None,
    ) -> TranscriptionResult:
        """Transcribe an ``UploadFile`` received from a FastAPI route.

        Parameters
        ----------
        upload:
            The multipart file object from FastAPI.
        language:
            Optional ISO 639-1 language code hint (``"en"``, ``"hi"``, ``"kn"``).

        Returns
        -------
        TranscriptionResult
            Typed result with ``text``, ``language``, and ``confidence``.
        """
        suffix = Path(upload.filename or "audio.wav").suffix.lower()
        tmp_path = self._tmp_dir / f"vm_voice_{uuid.uuid4().hex}{suffix}"

        try:
            await self._save_upload(upload, tmp_path)
            return self.transcribe_file(tmp_path, language=language)
        finally:
            self._cleanup(tmp_path)

    def transcribe_file(
        self,
        path: str | Path,
        *,
        language: str | None = None,
    ) -> TranscriptionResult:
        """Transcribe a file already saved on disk.

        Parameters
        ----------
        path:
            Absolute path to an audio file (``*.mp3``, ``*.wav``, ``*.m4a``).
        language:
            Optional ISO 639-1 language code hint.

        Returns
        -------
        TranscriptionResult
        """
        raw = self._transcriber.transcribe(path, language=language)
        return self._build_result(raw)

    # ── Internal helpers ──────────────────────────────────────────────────────

    @staticmethod
    async def _save_upload(upload: UploadFile, dest: Path) -> None:
        """Stream uploaded bytes to *dest* on disk."""
        dest.parent.mkdir(parents=True, exist_ok=True)
        contents = await upload.read()
        dest.write_bytes(contents)
        logger.debug("Saved upload to '{}' ({} bytes)", dest, len(contents))

    @staticmethod
    def _cleanup(path: Path) -> None:
        """Delete a temporary file, logging but swallowing errors."""
        try:
            if path.exists():
                os.remove(path)
                logger.debug("Deleted temporary file '{}'", path)
        except OSError as exc:
            logger.warning("Could not delete temp file '{}': {}", path, exc)

    @staticmethod
    def _build_result(raw: dict[str, Any]) -> TranscriptionResult:
        """Convert raw Whisper output into a :class:`TranscriptionResult`."""
        text: str = (raw.get("text") or "").strip()

        # ── Language mapping ──────────────────────────────────────────────────
        detected_code: str = raw.get("language") or "en"
        language_label: str = SUPPORTED_LANGUAGES.get(
            detected_code,
            detected_code.title(),  # unknown → capitalise the code e.g. "Ta" for Tamil
        )

        # ── Confidence (mean word probability) ────────────────────────────────
        confidence: float | None = VoiceService._compute_confidence(raw)

        return TranscriptionResult(
            text=text,
            language=language_label,
            confidence=confidence,
        )

    @staticmethod
    def _compute_confidence(raw: dict[str, Any]) -> float | None:
        """Compute mean per-word probability across all Whisper segments.

        Whisper stores per-word data in::

            result["segments"][i]["words"][j]["probability"]

        Returns ``None`` if no word-level data exists (e.g., silent audio,
        model built without word timestamps).
        """
        probs: list[float] = []
        for segment in raw.get("segments") or []:
            for word in segment.get("words") or []:
                prob = word.get("probability")
                if prob is not None:
                    probs.append(float(prob))

        if not probs:
            return None

        mean_confidence = sum(probs) / len(probs)
        # Clamp to [0, 1] for safety — Whisper values should already be in range.
        return max(0.0, min(1.0, round(mean_confidence, 6)))


# ─── Module-level singleton ───────────────────────────────────────────────────

#: Default service instance — import directly in routes.
voice_service = VoiceService()
