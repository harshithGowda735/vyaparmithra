"""VyaparMitra AI — knowledge base package.

Loads, validates, and exposes government scheme data for search.
"""

from .models import Scheme, SchemeSearchResult
from .service import KnowledgeBase, knowledge_base

__all__ = ["KnowledgeBase", "knowledge_base", "Scheme", "SchemeSearchResult"]
