"""VyaparMitra AI — voice package.

Provides Whisper-based speech-to-text transcription with support for
English, Kannada, and Hindi via mp3, wav, and m4a audio formats.
"""

from .service import VoiceService
from .speech import WhisperTranscriber

__all__ = ["VoiceService", "WhisperTranscriber"]
