"""
gemma/schemas.py
────────────────
Pydantic schemas for the Gemma integration.
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class SchemeResult(BaseModel):
    scheme: str
    benefits: str
    documents: List[str]
    apply_url: str
    
class ConsultantRequest(BaseModel):
    profile: str = Field(..., description="Business profile")
    schemes: List[SchemeResult] = Field(..., description="Retrieved Schemes")
    question: str = Field(..., description="Current Question")
    
class ConsultantResponse(BaseModel):
    eligible_schemes: List[str]
    confidence: float
    reason: str
    required_documents: List[str]
    benefits: List[str]
    eligibility_explanation: str
    priority: int
    application_url: str
    recommended_next_step: str
