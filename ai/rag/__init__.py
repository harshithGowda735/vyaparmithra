"""
VyaparMitra AI — RAG package.

Provides the Retrieval Engine for matching free-text business descriptions
to relevant government schemes using FAISS semantic search.
"""

from .retriever import RetrievalEngine, retrieval_engine

__all__ = ["RetrievalEngine", "retrieval_engine"]
