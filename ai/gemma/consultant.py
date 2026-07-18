"""
gemma/consultant.py
───────────────────
GemmaConsultant class that calls HuggingFace Inference API and returns a structured JSON response.
"""

import json
from loguru import logger
from huggingface_hub import InferenceClient

from .schemas import ConsultantRequest, ConsultantResponse


class GemmaConsultant:
    """Interact with a Gemma model via HuggingFace Inference API."""

    def __init__(self, api_key: str, model_id: str = "google/gemma-2b-it") -> None:
        self.client = InferenceClient(model=model_id, token=api_key)
        self.model_id = model_id
        logger.info(f"GemmaConsultant initialized for model {self.model_id}")

    def _build_prompt(self, req: ConsultantRequest) -> str:
        """Create a clear instruction prompt for the model.
        The model is asked to output ONLY the JSON object described
        in ``ConsultantResponse`` – no extra prose.
        """
        schemes_json = json.dumps([s.model_dump() for s in req.schemes], ensure_ascii=False, indent=2)
        
        prompt = (
            "You are an MSME Business Consultant. Given the following information,\n"
            "provide ONLY a JSON response with the fields defined in the response schema.\n"
            "Do NOT include any explanatory text before or after the JSON.\n\n"
            f"Business Profile:\n{req.profile}\n\n"
            f"Retrieved Schemes (as JSON):\n{schemes_json}\n\n"
            f"Current Question:\n{req.question}\n\n"
            "Return JSON with keys:\n"
            "- eligible_schemes (list of strings)\n"
            "- confidence (float 0.0 to 1.0)\n"
            "- reason (short string)\n"
            "- required_documents (list of strings)\n"
            "- benefits (list of strings)\n"
            "- eligibility_explanation (string)\n"
            "- priority (integer)\n"
            "- application_url (string)\n"
            "- recommended_next_step (string)\n\n"
            "Respond with ONLY the JSON object."
        )
        return prompt

    def process(self, request: ConsultantRequest) -> ConsultantResponse:
        """Main entry point – builds prompt, calls model, parses JSON into response model."""
        import requests
        
        prompt = self._build_prompt(request)
        
        try:
            logger.info(f"Calling Inference API for {self.model_id}...")
            
            # If the model ends with :free, assume it's OpenRouter, otherwise HF Serverless
            is_openrouter = ":free" in self.model_id.lower() or "openrouter" in self.model_id.lower()
            
            if is_openrouter:
                url = "https://openrouter.ai/api/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.client.token}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "VyaparMitra AI"
                }
                payload = {
                    "model": self.model_id,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 1000
                }
            else:
                url = f"https://api-inference.huggingface.co/models/{self.model_id}"
                headers = {
                    "Authorization": f"Bearer {self.client.token}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 1000,
                        "temperature": 0.1,
                        "return_full_text": False
                    }
                }
            import time
            
            response = None
            max_retries = 3
            current_model = self.model_id
            
            for attempt in range(max_retries):
                if is_openrouter:
                    payload["model"] = current_model
                    
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                
                if response.status_code == 429:
                    logger.warning(f"Rate limited on {current_model}. Attempt {attempt+1}/{max_retries}...")
                    if is_openrouter and attempt == 1:
                        # Fallback to another widely available free model
                        logger.warning("Falling back to google/gemma-4-26b-a4b-it:free")
                        current_model = "google/gemma-4-26b-a4b-it:free"
                    time.sleep(2)
                    continue
                else:
                    response.raise_for_status()
                    break
            else:
                response.raise_for_status() # If we exhausted retries and still failed
            
            res_json = response.json()
            
            if is_openrouter:
                raw_output = res_json["choices"][0]["message"]["content"].strip()
            else:
                # HF Serverless format
                if isinstance(res_json, list) and len(res_json) > 0 and "generated_text" in res_json[0]:
                    raw_output = res_json[0]["generated_text"].strip()
                else:
                    raw_output = str(res_json).strip()
            
            import re
            
            # Find the first { and last } to extract pure JSON, ignoring conversational text
            json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
            if json_match:
                raw_output = json_match.group(0)
                
            raw_output = raw_output.strip()
            logger.debug(f"Raw output from Model (extracted JSON): {raw_output}")
            
            data = json.loads(raw_output)
            
            if isinstance(data, list) and data and isinstance(data[0], dict):
                data = data[0]
                    
            return ConsultantResponse(**data)
            
        except json.JSONDecodeError as exc:
            logger.error(f"Failed to parse model output as JSON: {exc}. Output was: {raw_output}")
            raise ValueError(f"Model did not return valid JSON: {raw_output}")
        except Exception as exc:
            logger.error(f"Error calling API: {exc}")
            raise

# Initialize globally with the provided token from environment variables
import os
from dotenv import load_dotenv

# Load variables from .env file in the ai directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv("OPENROUTER_API_KEY", "")
gemma_consultant = GemmaConsultant(
    api_key=api_key, 
    model_id="google/gemma-4-31b-it:free"
)
