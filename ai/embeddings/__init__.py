"""
VyaparMitra AI — embeddings package.

Handles generating text embeddings using Sentence Transformers
and indexing/querying them via FAISS.
"""

from .embedder import TextEmbedder
from .faiss_index import VectorStore
from .pipeline import build_knowledge_index

__all__ = ["TextEmbedder", "VectorStore", "build_knowledge_index"]
