"""
embeddings/embedder.py
───────────────────────
Wraps SentenceTransformers to convert text into dense vector embeddings.
"""

from __future__ import annotations

import os
from typing import Any, List, Union

from loguru import logger
import numpy as np

# We import SentenceTransformer lazily inside the class to speed up module import.

_DEFAULT_MODEL = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
_DEFAULT_DEVICE = os.getenv("EMBEDDING_DEVICE", "cpu")


class TextEmbedder:
    """Generates dense vector embeddings using SentenceTransformers.
    
    The model is loaded lazily on the first encoding call.
    """

    _instance: "TextEmbedder | None" = None

    def __new__(cls, *args: Any, **kwargs: Any) -> "TextEmbedder":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, model_name: str = _DEFAULT_MODEL, device: str = _DEFAULT_DEVICE):
        if getattr(self, "_initialized", False):
            return
            
        self.model_name = model_name
        self.device = device
        self._model: Any = None
        self._initialized = True

    def load(self) -> None:
        """Eagerly load the sentence transformer model."""
        if self._model is not None:
            return

        from sentence_transformers import SentenceTransformer

        logger.info("Loading SentenceTransformer '{}' on '{}'...", self.model_name, self.device)
        self._model = SentenceTransformer(self.model_name, device=self.device)
        logger.info("Embedding model loaded successfully.")

    def _ensure_loaded(self) -> None:
        if self._model is None:
            self.load()

    def encode(self, texts: Union[str, List[str]], batch_size: int = 32) -> np.ndarray:
        """Convert a string or list of strings into a numpy array of embeddings.
        
        Returns:
            np.ndarray of shape (num_texts, embedding_dimension).
            If a single string is passed, it still returns a 2D array (1, dim).
        """
        self._ensure_loaded()
        
        is_single = isinstance(texts, str)
        if is_single:
            texts = [texts]

        logger.debug("Encoding {} text(s)...", len(texts))
        
        embeddings = self._model.encode(
            texts,
            batch_size=batch_size,
            convert_to_numpy=True,
            show_progress_bar=False,
            normalize_embeddings=True # Normalise to length 1 for Cosine Similarity via Inner Product
        )
        
        # SentenceTransformers might return a 1D array if a single string was passed,
        # but we passed a list, so it will be 2D. Just to be safe:
        if embeddings.ndim == 1:
            embeddings = np.expand_dims(embeddings, axis=0)
            
        return embeddings


# Singleton instance
embedder = TextEmbedder()
