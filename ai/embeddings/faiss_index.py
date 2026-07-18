"""
embeddings/faiss_index.py
─────────────────────────
VectorStore class for managing a FAISS index and associated document metadata.
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import faiss
import numpy as np
from loguru import logger

_DEFAULT_INDEX_PATH = Path(__file__).parent / "faiss.index"
_DEFAULT_META_PATH = Path(__file__).parent / "faiss_meta.pkl"


class VectorStore:
    """Manages a FAISS index along with a metadata mapping.
    
    The metadata maps FAISS vector IDs (integers) to scheme data (dicts).
    """

    def __init__(
        self,
        dimension: int = 384,  # Default for all-MiniLM-L6-v2
        index_path: str | Path = _DEFAULT_INDEX_PATH,
        meta_path: str | Path = _DEFAULT_META_PATH,
    ):
        self.dimension = dimension
        self.index_path = Path(index_path)
        self.meta_path = Path(meta_path)
        
        # We use IndexFlatIP (Inner Product) since our embeddings are normalized.
        # This is equivalent to Cosine Similarity.
        self.index: faiss.Index = faiss.IndexFlatIP(self.dimension)
        self.metadata: Dict[int, Dict[str, Any]] = {}

    @property
    def count(self) -> int:
        """Returns the number of vectors in the index."""
        return self.index.ntotal

    def add_vectors(self, embeddings: np.ndarray, metadatas: List[Dict[str, Any]]) -> None:
        """Add embeddings and metadata to the index."""
        if len(embeddings) != len(metadatas):
            raise ValueError("Number of embeddings must match number of metadata dicts.")
        
        if embeddings.shape[1] != self.dimension:
            raise ValueError(f"Embeddings dimension {embeddings.shape[1]} != index dimension {self.dimension}")

        # ID of the new vectors will start at the current count
        start_id = self.count
        
        logger.debug("Adding {} vectors to FAISS index.", len(embeddings))
        self.index.add(embeddings.astype("float32"))
        
        for i, meta in enumerate(metadatas):
            self.metadata[start_id + i] = meta

    def search(
        self, query_embedding: np.ndarray, top_k: int = 5
    ) -> List[Tuple[Dict[str, Any], float]]:
        """Search the index for the most similar vectors.
        
        Args:
            query_embedding: 2D numpy array of shape (1, dimension).
            top_k: Number of results to return.
            
        Returns:
            List of (metadata_dict, similarity_score) tuples.
        """
        if self.count == 0:
            return []

        # Ensure query is 2D float32
        query_embedding = query_embedding.astype("float32")
        if query_embedding.ndim == 1:
            query_embedding = np.expand_dims(query_embedding, axis=0)

        # FAISS search returns distances (scores) and indices (IDs)
        scores, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and idx in self.metadata:
                results.append((self.metadata[idx], float(score)))
                
        return results

    def save(self) -> None:
        """Persist the index and metadata to disk."""
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.info("Saving FAISS index to '{}'", self.index_path)
        faiss.write_index(self.index, str(self.index_path))
        
        logger.info("Saving metadata to '{}'", self.meta_path)
        with open(self.meta_path, "wb") as f:
            pickle.dump(self.metadata, f)

    def load(self) -> None:
        """Load the index and metadata from disk."""
        if not self.index_path.exists():
            raise FileNotFoundError(f"Index not found at {self.index_path}")
        if not self.meta_path.exists():
            raise FileNotFoundError(f"Metadata not found at {self.meta_path}")

        logger.info("Loading FAISS index from '{}'", self.index_path)
        self.index = faiss.read_index(str(self.index_path))
        
        logger.info("Loading metadata from '{}'", self.meta_path)
        with open(self.meta_path, "rb") as f:
            self.metadata = pickle.load(f)
            
        if self.dimension != self.index.d:
            logger.warning(
                "Loaded index dimension ({}) does not match expected ({}). "
                "Updating expected dimension.", self.index.d, self.dimension
            )
            self.dimension = self.index.d
