"""
main.py
───────
VyaparMitra AI — FastAPI application entrypoint.

Run locally
───────────
    uvicorn ai.main:app --reload --port 8000

Or with the helper script:
    python -m ai.main
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from ai.voice.routes import router as voice_router
from ai.knowledge.routes import router as knowledge_router
from ai.rag.routes import router as rag_router
from ai.gemma.routes import router as gemma_router
from ai.api_v2 import router as api_v2_router

# ─── Application factory ──────────────────────────────────────────────────────


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title="VyaparMitra AI",
        description=(
            "Production-ready AI backend for VyaparMitra. "
            "Provides voice transcription (Whisper), RAG, and more."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    origins = os.getenv("CORS_ORIGINS", "*").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(api_v2_router)
    app.include_router(voice_router)
    app.include_router(knowledge_router)
    app.include_router(rag_router)
    app.include_router(gemma_router)


    # ── Startup / Shutdown events ─────────────────────────────────────────────
    @app.on_event("startup")
    async def on_startup() -> None:
        logger.info("VyaparMitra AI backend starting up…")
        # Pre-load the Whisper model so the first request is not slow.
        preload = os.getenv("WHISPER_PRELOAD", "true").lower() == "true"
        if preload:
            from ai.voice.speech import transcriber
            transcriber.load()

        # Pre-load knowledge base (fast — just reads JSON from disk).
        from ai.knowledge.service import knowledge_base
        knowledge_base.load()

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        logger.info("VyaparMitra AI backend shutting down.")

    # ── Root probe ────────────────────────────────────────────────────────────
    @app.get("/", tags=["Root"])
    async def root() -> dict[str, str]:
        return {"service": "VyaparMitra AI", "status": "running"}

    return app


# ─── Entry point ──────────────────────────────────────────────────────────────

app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "ai.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("RELOAD", "true").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
    )




