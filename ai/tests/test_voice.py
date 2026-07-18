"""
tests/test_voice.py
────────────────────
Unit + integration tests for the VyaparMitra Voice Processing module.

Run with:
    pytest ai/tests/test_voice.py -v
"""

from __future__ import annotations

import io
import wave
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ─── Helpers ─────────────────────────────────────────────────────────────────


def _make_silent_wav(duration_s: float = 0.5, sample_rate: int = 16_000) -> bytes:
    """Return raw bytes of a valid silent WAV file."""
    n_frames = int(duration_s * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * n_frames)
    return buf.getvalue()


MOCK_WHISPER_RESULT: dict[str, Any] = {
    "text": "  Hello, this is a test.  ",
    "language": "en",
    "segments": [
        {
            "words": [
                {"word": "Hello", "probability": 0.98},
                {"word": "this", "probability": 0.95},
                {"word": "is", "probability": 0.97},
                {"word": "a", "probability": 0.99},
                {"word": "test", "probability": 0.96},
            ]
        }
    ],
}

MOCK_WHISPER_RESULT_KANNADA: dict[str, Any] = {
    "text": "ನಮಸ್ಕಾರ",
    "language": "kn",
    "segments": [
        {
            "words": [
                {"word": "ನಮಸ್ಕಾರ", "probability": 0.88},
            ]
        }
    ],
}


# ─── Unit tests: VoiceService._compute_confidence ─────────────────────────────


class TestComputeConfidence:
    def test_mean_of_word_probabilities(self) -> None:
        from ai.voice.service import VoiceService

        raw = {
            "segments": [
                {"words": [{"probability": 0.9}, {"probability": 0.8}]},
                {"words": [{"probability": 1.0}]},
            ]
        }
        conf = VoiceService._compute_confidence(raw)
        assert conf is not None
        assert abs(conf - (0.9 + 0.8 + 1.0) / 3) < 1e-6

    def test_no_segments_returns_none(self) -> None:
        from ai.voice.service import VoiceService

        assert VoiceService._compute_confidence({"segments": []}) is None

    def test_no_words_returns_none(self) -> None:
        from ai.voice.service import VoiceService

        raw = {"segments": [{"words": []}]}
        assert VoiceService._compute_confidence(raw) is None

    def test_confidence_clamped_to_unit_interval(self) -> None:
        from ai.voice.service import VoiceService

        raw = {"segments": [{"words": [{"probability": 1.5}]}]}
        conf = VoiceService._compute_confidence(raw)
        assert conf is not None
        assert conf <= 1.0


# ─── Unit tests: VoiceService._build_result ───────────────────────────────────


class TestBuildResult:
    def test_english_result(self) -> None:
        from ai.voice.service import VoiceService

        result = VoiceService._build_result(MOCK_WHISPER_RESULT)
        assert result.text == "Hello, this is a test."
        assert result.language == "English"
        assert result.confidence is not None
        assert 0.0 <= result.confidence <= 1.0

    def test_kannada_result(self) -> None:
        from ai.voice.service import VoiceService

        result = VoiceService._build_result(MOCK_WHISPER_RESULT_KANNADA)
        assert result.language == "Kannada"
        assert "ನಮಸ್ಕಾರ" in result.text

    def test_unknown_language_falls_back_to_title(self) -> None:
        from ai.voice.service import VoiceService

        raw = {"text": "Vanakkam", "language": "ta", "segments": []}
        result = VoiceService._build_result(raw)
        assert result.language == "Ta"  # title-cased unknown code


# ─── Unit tests: WhisperTranscriber validation ────────────────────────────────


class TestWhisperTranscriberValidation:
    def test_missing_file_raises(self, tmp_path: Path) -> None:
        from ai.voice.speech import WhisperTranscriber

        t = WhisperTranscriber.__new__(WhisperTranscriber)
        with pytest.raises(FileNotFoundError):
            t._validate_file(tmp_path / "ghost.wav")

    def test_unsupported_extension_raises(self, tmp_path: Path) -> None:
        from ai.voice.speech import WhisperTranscriber

        f = tmp_path / "audio.ogg"
        f.write_bytes(b"fake")
        t = WhisperTranscriber.__new__(WhisperTranscriber)
        with pytest.raises(ValueError, match="Unsupported audio format"):
            t._validate_file(f)

    def test_valid_wav_passes(self, tmp_path: Path) -> None:
        from ai.voice.speech import WhisperTranscriber

        f = tmp_path / "audio.wav"
        f.write_bytes(_make_silent_wav())
        t = WhisperTranscriber.__new__(WhisperTranscriber)
        t._validate_file(f)  # should not raise


# ─── Integration tests: FastAPI routes ────────────────────────────────────────


@pytest.fixture(scope="module")
def client() -> TestClient:
    """Return a synchronous TestClient with Whisper mocked out."""
    from ai.main import app

    with patch("ai.voice.service.VoiceService.transcribe_upload", new_callable=AsyncMock) as mock_tx:
        mock_tx.return_value = MagicMock(
            text="Hello, this is a test.",
            language="English",
            confidence=0.97,
            model_dump=lambda: {
                "text": "Hello, this is a test.",
                "language": "English",
                "confidence": 0.97,
            },
        )
        with TestClient(app) as c:
            yield c


class TestVoiceRoutes:
    def test_health_endpoint(self, client: TestClient) -> None:
        resp = client.get("/voice/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["module"] == "voice"

    def test_supported_languages_endpoint(self, client: TestClient) -> None:
        resp = client.get("/voice/supported-languages")
        assert resp.status_code == 200
        body = resp.json()
        assert "en" in body["languages"]
        assert "kn" in body["languages"]
        assert "hi" in body["languages"]
        assert ".wav" in body["allowed_formats"]

    def test_transcribe_unsupported_format(self, client: TestClient) -> None:
        resp = client.post(
            "/voice/transcribe",
            files={"file": ("audio.ogg", b"fake-ogg-data", "audio/ogg")},
        )
        assert resp.status_code == 400
        assert "Unsupported audio format" in resp.json()["detail"]

    def test_transcribe_invalid_language_hint(self, client: TestClient) -> None:
        resp = client.post(
            "/voice/transcribe",
            files={"file": ("audio.wav", _make_silent_wav(), "audio/wav")},
            params={"language": "zz"},
        )
        assert resp.status_code == 400
        assert "Unsupported language code" in resp.json()["detail"]

    @patch("ai.voice.service.VoiceService.transcribe_upload", new_callable=AsyncMock)
    def test_transcribe_wav_success(
        self, mock_tx: AsyncMock, client: TestClient
    ) -> None:
        from ai.voice.service import TranscriptionResult

        mock_tx.return_value = TranscriptionResult(
            text="Hello, this is a test.",
            language="English",
            confidence=0.97,
        )
        resp = client.post(
            "/voice/transcribe",
            files={"file": ("speech.wav", _make_silent_wav(), "audio/wav")},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "text" in body
        assert "language" in body
        assert "confidence" in body

    def test_root_endpoint(self, client: TestClient) -> None:
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json()["service"] == "VyaparMitra AI"
