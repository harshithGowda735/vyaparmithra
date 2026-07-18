FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for Whisper (ffmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy the backend requirements file first to leverage Docker cache
COPY ai/requirements.txt /app/ai/requirements.txt

# Modify the requirements to fix the huggingface-hub and transformers versions we resolved earlier
RUN pip install --no-cache-dir -r ai/requirements.txt
RUN pip install "huggingface-hub<1.0" transformers==4.41.2 -U

# Copy the rest of the application
COPY . /app/

# Hugging Face Spaces exposes port 7860 by default
EXPOSE 7860

# Command to run the FastAPI application on port 7860
CMD ["uvicorn", "ai.main:app", "--host", "0.0.0.0", "--port", "7860"]
