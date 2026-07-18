"""
rag/retriever.py
────────────────
Retrieval engine for matching business descriptions to schemes.
"""

from __future__ import annotations

from typing import Any, Dict, List
from pydantic import BaseModel

from loguru import logger

from ai.embeddings.embedder import embedder
from ai.embeddings.faiss_index import VectorStore


class RetrievedScheme(BaseModel):
    """Output format for a retrieved scheme."""
    scheme: str
    score: float
    benefits: str
    documents: List[str]
    apply_url: str


class RetrievalEngine:
    """Handles semantic search against the FAISS index."""

    def __init__(self) -> None:
        self.store = VectorStore()
        self._loaded = False

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            logger.info("Loading RetrievalEngine VectorStore...")
            try:
                self.store.load()
                self._loaded = True
            except FileNotFoundError:
                logger.warning("FAISS index not found. Was the embedding pipeline run?")
                # We don't raise here so the API doesn't crash on boot,
                # but search will fail if it's still missing.
                
    def search(self, business_description: str, top_k: int = 5) -> List[RetrievedScheme]:
        """Convert description to embedding and retrieve top schemes.
        
        Args:
            business_description: Free-text description of the user's business.
            top_k: Number of schemes to return.
            
        Returns:
            List of RetrievedScheme models.
        """
        self._ensure_loaded()
        
        if self.store.count == 0:
            logger.warning("Retrieval attempted on empty index.")
            return []

        logger.debug("Generating embedding for query: '{}'", business_description)
        query_emb = embedder.encode(business_description)
        
        logger.debug("Searching FAISS index...")
        raw_results = self.store.search(query_emb, top_k=top_k)
        
        results: List[RetrievedScheme] = []
        for meta, score in raw_results:
            results.append(
                RetrievedScheme(
                    scheme=meta.get("name", "Unknown Scheme"),
                    score=round(score, 4),
                    benefits=meta.get("benefits", ""),
                    documents=meta.get("documents", []),
                    apply_url=str(meta.get("apply_url", ""))
                )
            )
            
        logger.info("Retrieved {} relevant schemes.", len(results))
        return results


# Module-level singleton
retrieval_engine = RetrievalEngine()
