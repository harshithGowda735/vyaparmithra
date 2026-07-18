<div align="center">
  <h1>💼 VyaparMitra AI</h1>
  <p><b>An intelligent, voice-enabled MSME Government Scheme Advisor built with Gemma, FAISS RAG, and FastAPI.</b></p>
</div>

---

## 🚀 Overview
**VyaparMitra AI** is a full-stack, AI-driven application designed to help MSME (Micro, Small, and Medium Enterprises) business owners in India effortlessly find and apply for government schemes. 

Instead of navigating complex government portals, users can simply **speak** their business profile (e.g., *"I run a turmeric processing unit with 2 lakh revenue and 12 employees, and I need a loan"*). VyaparMitra AI automatically transcribes the audio, extracts a structured business profile, retrieves the most relevant schemes using semantic search, and uses Google's Gemma model to explain eligibility and provide actionable next steps.

## ✨ Key Features
- 🎙️ **Voice-First Interaction:** Built-in audio recording in the browser, transcribed locally on the backend using OpenAI's Whisper model.
- 🧠 **Smart Business Profiling:** Uses heuristics and NLP to automatically detect industry, revenue, headcount, and specific business needs from raw text.
- 🔍 **RAG Pipeline (Retrieval-Augmented Generation):** Leverages `sentence-transformers` and `FAISS` to perform ultra-fast semantic searches across a database of government schemes.
- 🤖 **Gemma-Powered Consultation:** Integrates via OpenRouter with the latest Gemma models to generate concise, highly accurate advisory responses, eliminating hallucinations by grounding answers in the FAISS context.
- 📱 **Modern UI:** Built with React/Vite, featuring a glassmorphism design, real-time status updates, and graceful fallbacks for manual text entry.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, HTML/CSS (Vanilla)
- **Backend:** Python 3.10+, FastAPI, Uvicorn
- **AI / ML:** 
  - *Audio Transcription:* Whisper (CPU optimized)
  - *Vector Database:* FAISS (Facebook AI Similarity Search)
  - *Embeddings:* Sentence-Transformers (`all-MiniLM-L6-v2`)
  - *LLM Inference:* OpenRouter API (`google/gemma-4-31b-it:free`)

---

## 📂 Project Structure
```text
vyaparmithra/
├── ai/                      # FastAPI Backend
│   ├── api_v2.py            # Unified API routes & Profile extraction
│   ├── main.py              # Application entry point
│   ├── .env                 # Environment variables (OpenRouter keys)
│   ├── embeddings/          # FAISS indexing & embedding pipeline
│   ├── gemma/               # LLM integration & prompt engineering
│   ├── rag/                 # RAG logic connecting FAISS and Gemma
│   └── voice/               # Whisper audio transcription service
│
└── frontend/                # React Vite Frontend
    ├── src/                 # React components (App.jsx, main.jsx)
    ├── package.json         # Node dependencies
    └── vite.config.js       # Vite configuration
```

---

## 💻 Local Setup & Development

### 1. Start the Backend (FastAPI)
The backend handles audio processing, FAISS retrieval, and the OpenRouter connection.

```bash
cd ai

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Create your .env file
echo 'OPENROUTER_API_KEY="sk-or-v1-YOUR-KEY-HERE"' > .env

# Run the server
uvicorn main:app --reload --port 8000
```
*The API will be running at `http://127.0.0.1:8000`*

### 2. Start the Frontend (React / Vite)
Open a new terminal window to run the UI.

```bash
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The UI will be running at `http://localhost:3000` (or the port Vite provides).*

---

## 🚢 Deployment Guide

### Deploying the Frontend (Vercel)
1. Push your code to GitHub.
2. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
3. Import this repository.
4. Set the **Root Directory** to `frontend`.
5. Ensure the Framework Preset is set to **Vite**.
6. Click **Deploy**.

*(Don't forget to update the `API` constant in `App.jsx` to point to your live backend URL once deployed!)*

### Deploying the Backend (Railway / VPS)
*Note: Due to the Whisper model and PyTorch requirements, the backend requires at least 2GB of RAM. Standard free tiers (like Render's 512MB) may crash.*

1. **Railway.app:** Import the repository, set the Root Directory to `ai`, and add your `OPENROUTER_API_KEY` to the environment variables. Railway handles Python apps natively.
2. **Hugging Face Spaces (Free):** Create a Docker Space, point it to the `ai` folder, and write a simple `Dockerfile` to expose port `7860`.
3. **VPS (AWS/DigitalOcean):** Clone the repo on a cheap Linux VPS, install dependencies, and run via `gunicorn` or a systemd service.

---

*Built with ❤️ for MSMEs*
