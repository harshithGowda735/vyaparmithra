"""
embeddings/pipeline.py
───────────────────────
Builds the FAISS index by reading the Knowledge Base, formatting the schemes
into textual representations, generating embeddings, and saving to disk.
"""

from __future__ import annotations

import time
from typing import Any, Dict, List

from loguru import logger

from ai.knowledge.models import Scheme
from ai.knowledge.service import knowledge_base
from ai.embeddings.embedder import embedder
from ai.embeddings.faiss_index import VectorStore


def _format_scheme_for_embedding(scheme: Scheme) -> str:
    """Format a Scheme into a single string for the embedding model to process.
    
    We combine the name, eligibility, benefits, and loans to ensure the
    semantic search has enough context to match against user queries.
    """
    parts = [
        f"Scheme Name: {scheme.name}",
        f"Sector: {scheme.sector}",
        f"Eligibility: {scheme.eligibility}",
        f"Benefits: {scheme.benefits}",
    ]
    if scheme.loans:
        parts.append(f"Loans Available: {', '.join(scheme.loans)}")
        
    return "\n".join(parts)


def build_knowledge_index() -> VectorStore:
    """Read all schemes, generate embeddings, build the FAISS index, and persist it."""
    logger.info("Starting knowledge index build process...")
    t0 = time.perf_counter()

    # 1. Load the dataset
    knowledge_base._ensure_loaded()
    schemes = knowledge_base.all_schemes
    
    if not schemes:
        logger.warning("No schemes found in Knowledge Base. Index will be empty.")
        return VectorStore()

    # 2. Format texts and prepare metadata
    texts_to_encode: List[str] = []
    metadatas: List[Dict[str, Any]] = []
    
    for scheme in schemes:
        texts_to_encode.append(_format_scheme_for_embedding(scheme))
        # Store the dumped model in metadata so it's easily retrievable
        metadatas.append(scheme.model_dump())

    # 3. Generate embeddings
    logger.info("Generating embeddings for {} schemes...", len(texts_to_encode))
    # Eagerly load the model to ensure it doesn't log during the encode step
    embedder.load()
    embeddings = embedder.encode(texts_to_encode)
    
    # 4. Build and save the vector store
    store = VectorStore(dimension=embeddings.shape[1])
    store.add_vectors(embeddings, metadatas)
    store.save()
    
    elapsed = time.perf_counter() - t0
    logger.info("Successfully built and saved FAISS index in {:.2f}s.", elapsed)
    
    return store

if __name__ == "__main__":
    # Allow running this file directly to rebuild the index
    build_knowledge_index()
