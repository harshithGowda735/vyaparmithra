from __future__ import annotations

import re
import time
from datetime import datetime
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Query, Depends
from pydantic import BaseModel, Field

# Import existing singletons and services
from ai.voice.service import voice_service
from ai.rag.retriever import retrieval_engine, RetrievedScheme
from ai.gemma.consultant import gemma_consultant
from ai.gemma.schemas import ConsultantRequest, SchemeResult, ConsultantResponse
from ai.knowledge.service import knowledge_base

# Create router
router = APIRouter(prefix="", tags=["API V2"])

# ----- Utility function to generate React-compatible envelope -----
def make_response(success: bool, message: str, data: Any = None, status_code: int = 200) -> Dict[str, Any]:
    return {
        "success": success,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "status": status_code
    }

# ----- Extractor Helper -----
def extract_profile_heuristics(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    
    # 1. Industry extraction
    industry = "General"
    if "turmeric" in text_lower or "processing" in text_lower:
        industry = "Food Processing"
    elif "agriculture" in text_lower or "farm" in text_lower or "crop" in text_lower:
        industry = "Agriculture"
    elif "retail" in text_lower or "shop" in text_lower or "store" in text_lower:
        industry = "Retail"
    elif "manufactur" in text_lower or "factory" in text_lower or "unit" in text_lower:
        industry = "Manufacturing"
    elif "service" in text_lower or "software" in text_lower or "tech" in text_lower:
        industry = "Services"
        
    # 2. Revenue extraction
    revenue = "Unknown"
    rev_match = re.search(r'(\d+)\s*(lakh|lacs|crore|cr|thousand|k|percent)?\s*(?:revenue|turnover|income|earnings|lakh|lacs|crore|cr)?', text_lower)
    if rev_match:
        val = rev_match.group(1)
        unit = rev_match.group(2) or ""
        revenue = f"{val} {unit}".strip()
    else:
        rev_match_alt = re.search(r'(?:revenue|turnover|income|earnings|worth|make)\s*(?:is|of|about)?\s*([\d\w\s]+)', text_lower)
        if rev_match_alt:
            revenue = rev_match_alt.group(1).strip()
            
    # 3. Employees extraction
    employees = 1
    emp_match = re.search(r'(\d+)\s*(?:employees|staff|workers|people|headcount|member|person)', text_lower)
    if emp_match:
        try:
            employees = int(emp_match.group(1))
        except ValueError:
            pass
    else:
        # Fallback to scanning for small numbers
        numbers = re.findall(r'\b\d+\b', text_lower)
        for num in numbers:
            try:
                val = int(num)
                if 1 < val < 100:
                    employees = val
                    break
            except ValueError:
                pass
                
    # 4. Need extraction
    need = "General consulting"
    if "loan" in text_lower or "credit" in text_lower or "borrow" in text_lower:
        need = "Loan / Financial Assistance"
    elif "subsidy" in text_lower or "grant" in text_lower:
        need = "Subsidy / Grant"
    elif "machinery" in text_lower or "equipment" in text_lower:
        need = "Machinery Purchase"
    elif "training" in text_lower or "skill" in text_lower:
        need = "Skill Development / Training"
        
    return {
        "industry": industry,
        "revenue": revenue,
        "employees": employees,
        "need": need
    }

# ----- Pydantic Request schemas -----
class ProfileRequest(BaseModel):
    text: str

class RetrieveRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class GenerateRequest(BaseModel):
    profile: str
    schemes: List[SchemeResult]
    question: str

class SchemesRequest(BaseModel):
    sector: Optional[str] = None
    employees: Optional[int] = None
    revenue: Optional[float] = None

# ----- Endpoints -----

@router.post("/voice")
async def post_voice(audio: UploadFile = File(...)):
    """Transcribe voice file using Whisper and return transcription."""
    try:
        result = await voice_service.transcribe_upload(audio)
        data = {
            "text": result.text,
            "language": result.language,
            "confidence": result.confidence or 1.0
        }
        return make_response(True, "Speech-to-Text completed", data)
    except Exception as e:
        return make_response(False, f"Voice transcription failed: {str(e)}", None, 500)

@router.post("/business-profile")
async def post_business_profile(body: ProfileRequest):
    """Extract structured business profile from text."""
    try:
        profile = extract_profile_heuristics(body.text)
        return make_response(True, "Business profile extracted", profile)
    except Exception as e:
        return make_response(False, f"Extraction failed: {str(e)}", None, 400)

@router.post("/retrieve")
async def post_retrieve(body: RetrieveRequest):
    """Semantic search FAISS index for matching schemes."""
    try:
        results = retrieval_engine.search(body.query, top_k=body.top_k)
        data = [
            {
                "scheme": r.scheme,
                "score": r.score,
                "benefits": r.benefits,
                "documents": r.documents,
                "apply_url": r.apply_url
            }
            for r in results
        ]
        return make_response(True, f"Retrieved top {len(data)} schemes", data)
    except Exception as e:
        return make_response(False, f"Retrieval failed: {str(e)}", None, 500)

@router.post("/generate")
async def post_generate(body: GenerateRequest):
    """Query Gemma consultant using profile, retrieved schemes and question."""
    try:
        req = ConsultantRequest(
            profile=body.profile,
            schemes=body.schemes,
            question=body.question
        )
        res: ConsultantResponse = gemma_consultant.process(req)
        return make_response(True, "Gemma consultation response generated", res.model_dump())
    except Exception as e:
        return make_response(False, f"Gemma generation failed: {str(e)}", None, 500)

@router.post("/schemes")
async def post_schemes(body: SchemesRequest):
    """Get all cached schemes, optionally filtered."""
    try:
        # Load KB if not loaded
        knowledge_base._ensure_loaded()
        
        # Apply filters if provided
        schemes = knowledge_base.search(
            sector=body.sector,
            num_employees=body.employees,
            annual_revenue=body.revenue
        ).schemes
        
        data = [s.model_dump() for s in schemes]
        return make_response(True, f"Retrieved {len(data)} schemes", data)
    except Exception as e:
        return make_response(False, f"Failed to retrieve schemes: {str(e)}", None, 500)

@router.post("/rag")
async def post_rag(audio: UploadFile = File(...), top_k: int = 5):
    """Run full RAG pipeline end-to-end: audio -> transcription -> extraction -> retrieve -> gemma."""
    try:
        # 1. Voice transcription
        t_res = await voice_service.transcribe_upload(audio)
        voice_data = {
            "text": t_res.text,
            "language": t_res.language,
            "confidence": t_res.confidence or 1.0
        }
        
        # 2. Profile extraction
        profile_data = extract_profile_heuristics(t_res.text)
        
        # 3. FAISS Retrieval
        retrieved_schemes = retrieval_engine.search(t_res.text, top_k=top_k)
        schemes_data = [
            {
                "scheme": r.scheme,
                "score": r.score,
                "benefits": r.benefits,
                "documents": r.documents,
                "apply_url": r.apply_url
            }
            for r in retrieved_schemes
        ]
        
        # 4. Gemma advice
        # Build prompt using gemma_consultant's _build_prompt method
        gemma_schemes = [
            SchemeResult(
                scheme=r.scheme,
                benefits=r.benefits,
                documents=r.documents,
                apply_url=r.apply_url
            )
            for r in retrieved_schemes
        ]
        
        req = ConsultantRequest(
            profile=f"Industry: {profile_data['industry']}, Revenue: {profile_data['revenue']}, Employees: {profile_data['employees']}, Need: {profile_data['need']}",
            schemes=gemma_schemes,
            question=f"Suggest best eligible schemes for my {profile_data['industry']} business. Need: {profile_data['need']}"
        )
        
        gemma_res: ConsultantResponse = gemma_consultant.process(req)
        
        combined_data = {
            "voice": voice_data,
            "business_profile": profile_data,
            "retrieved_schemes": schemes_data,
            "gemma": gemma_res.model_dump()
        }
        
        return make_response(True, "Full pipeline execution successful", combined_data)
        
    except Exception as e:
        return make_response(False, f"Full RAG pipeline failed: {str(e)}", None, 500)
