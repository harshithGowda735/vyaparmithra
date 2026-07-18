# VyaparMitra AI Backend

A modular, production-ready AI backend foundation built for the VyaparMitra hackathon project.

## Tech Stack
- **Python 3.12**
- **FastAPI** — web framework
- **Google Gemma 3 4B** — large language model (via HuggingFace)
- **HuggingFace Transformers** — model loading & inference
- **Sentence Transformers** — embedding generation
- **FAISS** — vector similarity search
- **Pandas / NumPy** — data processing
- **Uvicorn** — ASGI server
- **python-dotenv + pydantic-settings** — configuration

---

## Project Structure

```
ai/
│
├── config/            # Settings loader, logging configuration
│   ├── __init__.py
│   ├── settings.py    # Pydantic BaseSettings with .env support
│   └── logging.py     # Loguru-based logging setup
│
├── datasets/          # Dataset loading utilities
│   ├── __init__.py
│   └── loader.py      # CSV/JSON dataset loaders
│
├── embeddings/        # Embedding generation & FAISS index
│   ├── __init__.py
│   ├── embedder.py    # SentenceTransformer wrapper
│   └── faiss_index.py # FAISS index build/load/query
│
├── rag/               # Retrieval-Augmented Generation pipeline
│   ├── __init__.py
│   ├── retriever.py   # Document retriever using FAISS
│   ├── generator.py   # Answer generator using Gemma
│   └── pipeline.py    # Orchestrates retriever + generator
│
├── prompts/           # Prompt templates
│   ├── __init__.py
│   └── templates.py   # System and user prompt templates
│
├── gemma/             # Gemma model wrapper
│   ├── __init__.py
│   ├── model.py       # Model loading and inference
│   └── tokenizer.py   # Tokenizer utilities
│
├── services/          # FastAPI-compatible service layer
│   ├── __init__.py
│   └── rag_service.py # High-level RAG service
│
├── utils/             # Shared utilities
│   ├── __init__.py
│   ├── logger.py      # Global logger instance
│   ├── exceptions.py  # Custom exception hierarchy
│   └── helpers.py     # Misc helper functions
│
├── voice/             # Voice interface (future)
│   ├── __init__.py
│   ├── stt.py         # Speech-to-text stub
│   └── tts.py         # Text-to-speech stub
│
├── schemas/           # Pydantic request/response models
│   ├── __init__.py
│   ├── request.py
│   └── response.py
│
├── tests/             # Unit tests
│   ├── __init__.py
│   ├── test_config.py
│   ├── test_embeddings.py
│   ├── test_rag.py
│   └── test_gemma.py
│
├── requirements.txt
├── .env.example
└── README.md
```

---

## Getting Started

### 1. Clone & navigate
```bash
git clone <your-repo-url>
cd <repo>/ai
```

### 2. Create a virtual environment
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env with your HF_TOKEN and other settings
```

### 5. Run tests
```bash
pytest tests/ -v
```

### 6. Integrate with FastAPI
```python
from ai.services.rag_service import RagService

rag = RagService()
answer = rag.answer("What is the GST rate for textiles?")
```

---

## Architecture

```
User Query
    │
    ▼
[RagService]
    │
    ├──► [Embedder] ──► query vector
    │
    ├──► [FAISS Retriever] ──► top-k chunks
    │
    ├──► [PromptBuilder] ──► formatted prompt
    │
    └──► [Gemma Generator] ──► final answer
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `HF_TOKEN` | — | HuggingFace access token |
| `GEMMA_MODEL_NAME` | `google/gemma-3-4b-it` | Model ID on HuggingFace Hub |
| `EMBEDDING_MODEL_NAME` | `sentence-transformers/all-MiniLM-L6-v2` | Embedding model |
| `FAISS_INDEX_PATH` | `./ai/embeddings/faiss.index` | FAISS index file |
| `FAISS_META_PATH` | `./ai/embeddings/faiss_meta.pkl` | Metadata pickle |
| `DATASET_PATH` | `./ai/datasets/sample_data.csv` | Default dataset |
| `LOG_LEVEL` | `INFO` | Logging verbosity |
| `MAX_NEW_TOKENS` | `512` | Max generation tokens |
| `RETRIEVAL_TOP_K` | `5` | Documents to retrieve |

---

## License
MIT
