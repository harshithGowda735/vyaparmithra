"""
voice/speech.py
───────────────
Low-level Whisper transcription wrapper for VyaparMitra.

Responsibilities
────────────────
• Load and cache an OpenAI Whisper model (via openai-whisper).
• Accept an audio file path (mp3 | wav | m4a).
• Run transcription with language detection or forced language hint.
• Return raw Whisper result segments so callers can compute confidence.

Supported languages (ISO 639-1)
────────────────────────────────
  en  →  English
  kn  →  Kannada
  hi  →  Hindi
"""

from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any

import whisper
from loguru import logger

# ─── Constants ────────────────────────────────────────────────────────────────

# Languages the product officially supports.
SUPPORTED_LANGUAGES: dict[str, str] = {
    "en": "English",
    "kn": "Kannada",
    "hi": "Hindi",
}

# Audio MIME / extension whitelist.
ALLOWED_EXTENSIONS: set[str] = {".mp3", ".wav", ".m4a"}

# Default Whisper model size.  Override via env var WHISPER_MODEL_SIZE.
# Options: tiny | base | small | medium | large | large-v2 | large-v3
_DEFAULT_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")

# Device preference.  Override via env var WHISPER_DEVICE (cpu | cuda).
_DEFAULT_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")


# ─── WhisperTranscriber ────────────────────────────────────────────────────────


class WhisperTranscriber:
    """Singleton-style wrapper around an OpenAI Whisper model.

    The model is loaded lazily on first use and then cached for the
    lifetime of the process.  This avoids repeated disk/GPU allocations
    on every request.

    Parameters
    ----------
    model_size:
        Whisper model variant.  Defaults to the ``WHISPER_MODEL_SIZE``
        environment variable, falling back to ``"small"``.
    device:
        Compute device (``"cpu"`` or ``"cuda"``).  Defaults to the
        ``WHISPER_DEVICE`` environment variable, falling back to ``"cpu"``.
    """

    _instance: "WhisperTranscriber | None" = None
    _model: Any = None  # whisper.Whisper (type hidden to avoid import at module level)

    # ── Construction ──────────────────────────────────────────────────────────

    def __new__(cls, *args: Any, **kwargs: Any) -> "WhisperTranscriber":
        """Return the shared singleton instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(
        self,
        model_size: str = _DEFAULT_MODEL_SIZE,
        device: str = _DEFAULT_DEVICE,
    ) -> None:
        # Guard: only initialise once even if __init__ is called again.
        if hasattr(self, "_initialized") and self._initialized:
            return

        self.model_size = model_size
        self.device = device
        self._initialized = False  # will be flipped after lazy load

    # ── Public API ────────────────────────────────────────────────────────────

    def load(self) -> None:
        """Eagerly load the Whisper model into memory.

        Safe to call multiple times — subsequent calls are no-ops.
        """
        if WhisperTranscriber._model is not None:
            return

        logger.info(
            "Loading Whisper model '{}' on device='{}'…",
            self.model_size,
            self.device,
        )
        t0 = time.perf_counter()
        WhisperTranscriber._model = whisper.load_model(
            self.model_size, device=self.device
        )
        elapsed = time.perf_counter() - t0
        logger.info("Whisper model loaded in {:.2f}s", elapsed)
        self._initialized = True

    def transcribe(
        self,
        audio_path: str | Path,
        *,
        language: str | None = None,
    ) -> dict[str, Any]:
        """Transcribe an audio file and return the raw Whisper result.

        Parameters
        ----------
        audio_path:
            Absolute or relative path to the audio file
            (``*.mp3``, ``*.wav``, ``*.m4a``).
        language:
            Optional ISO 639-1 language hint (``"en"``, ``"hi"``, ``"kn"``).
            When ``None`` Whisper detects the language automatically.

        Returns
        -------
        dict
            The raw dict returned by ``whisper.model.transcribe()``.
            Callers typically need ``result["text"]``, ``result["language"]``
            and ``result["segments"]``.

        Raises
        ------
        FileNotFoundError
            If *audio_path* does not exist on disk.
        ValueError
            If the file extension is not in ``ALLOWED_EXTENSIONS``.
        RuntimeError
            If transcription fails for any unexpected reason.
        """
        audio_path = Path(audio_path)
        self._validate_file(audio_path)
        self._ensure_loaded()

        transcribe_kwargs: dict[str, Any] = {
            "fp16": False,           # safer default — avoids half-precision issues on CPU
            "verbose": False,        # suppress per-segment stdout noise
            "word_timestamps": True, # enables per-word probability → confidence
        }

        if language is not None:
            if language not in SUPPORTED_LANGUAGES:
                logger.warning(
                    "Language '{}' is outside the officially supported set {}; "
                    "passing it through to Whisper anyway.",
                    language,
                    list(SUPPORTED_LANGUAGES),
                )
            transcribe_kwargs["language"] = language

        logger.debug("Transcribing '{}' (language hint={!r})…", audio_path.name, language)
        t0 = time.perf_counter()

        try:
            result: dict[str, Any] = WhisperTranscriber._model.transcribe(  # type: ignore[union-attr]
                str(audio_path),
                **transcribe_kwargs,
            )
        except Exception as exc:
            logger.exception("Whisper transcription failed for '{}': {}", audio_path, exc)
            raise RuntimeError(f"Transcription failed: {exc}") from exc

        elapsed = time.perf_counter() - t0
        logger.info(
            "Transcribed '{}' in {:.2f}s — detected language='{}'",
            audio_path.name,
            elapsed,
            result.get("language", "unknown"),
        )
        return result

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _ensure_loaded(self) -> None:
        """Lazy-load the model on first transcription call."""
        if WhisperTranscriber._model is None:
            self.load()

    @staticmethod
    def _validate_file(path: Path) -> None:
        """Raise if *path* doesn't exist or has an unsupported extension."""
        if not path.exists():
            raise FileNotFoundError(f"Audio file not found: {path}")
        if path.suffix.lower() not in ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Unsupported audio format '{path.suffix}'. "
                f"Allowed: {sorted(ALLOWED_EXTENSIONS)}"
            )


# ─── Module-level singleton ───────────────────────────────────────────────────

#: Global transcriber instance — import and reuse across the codebase.
transcriber = WhisperTranscriber()
