import os
import sys
import re
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from unittest.mock import MagicMock

# Load .env file manually if exists
def load_env_file():
    for path in [".env", "backend/.env", "../.env", "/home/ubuntu/klipso_branding-logo/backend/.env"]:
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip('"').strip("'")
            except Exception:
                pass
            break

load_env_file()

# 1. Mock heavy/external dependencies before importing brandkit-ai
sys.modules['streamlit'] = MagicMock()
sys.modules['pinecone'] = MagicMock()
sys.modules['sentence_transformers'] = MagicMock()

# Add brandkit-ai to search path
sys.path.append('/home/ubuntu/repos/brandkit-ai')
sys.path.append('/home/ubuntu/klipso_branding-logo/brandkit-ai')

# Try importing brandkit-ai core functions
try:
    import app as brandkit_app
except ImportError:
    brandkit_app = None

# Initialize FastAPI App
app = FastAPI(title="Klipso Branding Web App API", version="3.0")

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class BriefRequest(BaseModel):
    company_name: str
    vision: str
    mission: str
    industry: str
    keywords: str
    target_audience: str

class BrandkitInputs(BaseModel):
    brand_name: str
    brand_description: str
    brand_industry: str
    company_keywords: List[str]
    brand_personality: str
    target_segment: str

# Helper to generate logos using DALL-E 3
async def generate_dalle_logo(inputs: BrandkitInputs) -> List[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("your-"):
        return []
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            prompt = (
                f"Sleek modern minimalist professional vector style logo concept for brand named '{inputs.brand_name}'. "
                f"Description: {inputs.brand_description}. "
                f"Industry: {inputs.brand_industry}. "
                f"Centered on a simple dark elegant background."
            )
            response = await client.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "dall-e-3",
                    "prompt": prompt,
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "standard"
                }
            )
            if response.status_code == 200:
                data = response.json().get("data", [])
                if data:
                    url = data[0].get("url")
                    if url:
                        return [url]
        except Exception:
            pass
    return []

# Helper: local Ollama query
async def query_local_ollama(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen3:8b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3
                    }
                }
            )
            if response.status_code == 200:
                return response.json().get("response", "").strip()
        except Exception:
            pass
    return ""

# Helper: Claude API query
async def query_claude(prompt: str) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return ""
    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-3-5-sonnet-20240620",
                    "max_tokens": 1500,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            if response.status_code == 200:
                content = response.json().get("content", [])
                if content:
                    return content[0].get("text", "").strip()
        except Exception:
            pass
    return ""

@app.post("/brief")
async def generate_brief(req: BriefRequest):
    prompt = f"""Dado estos datos de empresa:
Nombre de empresa: {req.company_name}
Visión: {req.vision}
Misión: {req.mission}
Industria: {req.industry}
Keywords: {req.keywords}
Audiencia Objetivo: {req.target_audience}

Genera exactamente:
1. Un brief creativo de 150 palabras.
2. Los siguientes campos listos para usar en un generador de marcas:
   - brand_name: nombre del producto/marca.
   - brand_description: descripción corta de 2 oraciones.
   - brand_industry: industria principal.
   - company_keywords: lista de exactamente 5 palabras clave de marca.
   - brand_personality: debe ser uno de estos exactamente: Competence, Excitement, Sincerity, Sophistication, o Ruggedness.
   - target_segment: segmento de clientes objetivo.

Responde ÚNICAMENTE con un JSON estricto sin formatear, sin bloques de código ```json o texto adicional. Las claves deben ser: "brief" (string) y "brandkit_inputs" (objeto con las claves mencionadas anteriormente).
"""
    
    # Try Claude first
    raw_response = await query_claude(prompt)
    
    # Fallback to Ollama if Claude fails/keys missing
    if not raw_response:
        raw_response = await query_local_ollama(prompt)
        
    # Standard high-fidelity deterministic fallback if both fail
    if not raw_response:
        words = req.keywords.split(",")
        keywords_list = [w.strip() for w in words][:5]
        while len(keywords_list) < 5:
            keywords_list.append("Innovative")
            
        mock_data = {
            "brief": f"Klipso is a pioneering company positioned to disrupt the {req.industry} sector. Driven by a mission to {req.mission} and a vision centered on {req.vision}, Klipso addresses the critical needs of {req.target_audience}. By leveraging modern identity systems and high-fidelity values, the brand establishes a compelling emotional connection, ensuring scalability, premium aesthetics, and long-term brand equity in a competitive marketplace.",
            "brandkit_inputs": {
                "brand_name": req.company_name,
                "brand_description": f"A premium branding solution designed to address the needs of {req.target_audience}. Empowering businesses through technical excellence and curated aesthetics.",
                "brand_industry": req.industry,
                "company_keywords": keywords_list,
                "brand_personality": "Sophistication",
                "target_segment": req.target_audience
            }
        }
        return mock_data

    # Parse output JSON safely
    try:
        # Clean potential markdown wrappers
        clean_json = raw_response.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
        
        parsed = json.loads(clean_json)
        if "brief" in parsed and "brandkit_inputs" in parsed:
            return parsed
    except Exception:
        pass

    # Regex fallback parser if JSON is slightly malformed
    try:
        brief_match = re.search(r'"brief"\s*:\s*"(.*?)"', raw_response, re.DOTALL)
        brand_name_match = re.search(r'"brand_name"\s*:\s*"(.*?)"', raw_response)
        desc_match = re.search(r'"brand_description"\s*:\s*"(.*?)"', raw_response)
        ind_match = re.search(r'"brand_industry"\s*:\s*"(.*?)"', raw_response)
        pers_match = re.search(r'"brand_personality"\s*:\s*"(.*?)"', raw_response)
        seg_match = re.search(r'"target_segment"\s*:\s*"(.*?)"', raw_response)
        
        brief = brief_match.group(1) if brief_match else "Creative brief description for the brand."
        brand_name = brand_name_match.group(1) if brand_name_match else req.company_name
        brand_desc = desc_match.group(1) if desc_match else f"Innovative solutions for {req.industry}."
        brand_ind = ind_match.group(1) if ind_match else req.industry
        brand_pers = pers_match.group(1) if pers_match else "Sophistication"
        brand_seg = seg_match.group(1) if seg_match else req.target_audience
        
        return {
            "brief": brief,
            "brandkit_inputs": {
                "brand_name": brand_name,
                "brand_description": brand_desc,
                "brand_industry": brand_ind,
                "company_keywords": [w.strip() for w in req.keywords.split(",")][:5],
                "brand_personality": brand_pers,
                "target_segment": brand_seg
            }
        }
    except Exception:
        pass

    # Final safe recovery return
    return {
        "brief": "Creative brief generated for the brand identity project.",
        "brandkit_inputs": {
            "brand_name": req.company_name,
            "brand_description": f"Pioneering brand focused on {req.industry} solutions.",
            "brand_industry": req.industry,
            "company_keywords": [w.strip() for w in req.keywords.split(",")][:5],
            "brand_personality": "Sophistication",
            "target_segment": req.target_audience
        }
    }

@app.post("/generate")
async def generate_brand_identity(inputs: BrandkitInputs):
    # Combined description as brandkit-ai expects
    combined_input = (
        f"Brand Name: {inputs.brand_name}. "
        f"Description: {inputs.brand_description}. "
        f"Industry: {inputs.brand_industry}. "
        f"Keywords: {', '.join(inputs.company_keywords)}. "
        f"Personality: {inputs.brand_personality}. "
        f"Segment: {inputs.target_segment}."
    )

    # FIX 2: Ask the LLM to respond in strict, clean JSON format
    prompt = f"""Genera una propuesta de identidad de marca basada en estos datos:
Nombre de marca: {inputs.brand_name}
Descripción: {inputs.brand_description}
Industria: {inputs.brand_industry}
Keywords: {', '.join(inputs.company_keywords)}
Personalidad: {inputs.brand_personality}
Segmento de mercado: {inputs.target_segment}

Responde ÚNICAMENTE con un objeto JSON estricto sin formatear, sin bloques de código ```json o texto adicional. El formato de la respuesta debe ser:
{{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "fonts": {{
    "heading": "Nombre de la fuente para títulos (ej. Montserrat)",
    "body": "Nombre de la fuente para el cuerpo de texto (ej. Inter)",
    "accent": "Nombre de la fuente para acentos (ej. Fira Code)"
  }},
  "tagline": "Un eslogan original y sugerente para la marca"
}}
"""

    fallback_data = {
        "colors": ["#0F172A", "#0EA5E9", "#F43F5E"],
        "fonts": {
            "heading": "Montserrat",
            "body": "Inter",
            "accent": "Fira Code"
        },
        "tagline": "Empowering next-generation design."
    }

    brandkit_data = None

    # Try Claude
    raw_json = await query_claude(prompt)
    # Fallback to local Ollama
    if not raw_json:
        raw_json = await query_local_ollama(prompt)

    if raw_json:
        try:
            clean_json = raw_json.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            clean_json = clean_json.strip()

            parsed = json.loads(clean_json)
            if "colors" in parsed and "fonts" in parsed and "tagline" in parsed:
                if isinstance(parsed["colors"], list) and len(parsed["colors"]) >= 3:
                    brandkit_data = parsed
        except Exception:
            pass

    if not brandkit_data:
        brandkit_data = fallback_data

    # Extract clean values
    colors = brandkit_data["colors"]
    headings = brandkit_data["fonts"].get("heading", "Montserrat")
    body = brandkit_data["fonts"].get("body", "Inter")
    accent = brandkit_data["fonts"].get("accent", "Fira Code")
    tagline = brandkit_data["tagline"]

    # FIX 1: Generate logos via DALL-E 3 if OPENAI_API_KEY is present and not mock
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if openai_key and not openai_key.startswith("your-"):
        logo_urls = await generate_dalle_logo(inputs)
    else:
        logo_urls = []

    # Map palettes with rich rationale
    palettes = [
        {"hex": colors[0], "name": "Primary Accent", "desc": "Reflects the core values, authority, and emotional stability of the brand."},
        {"hex": colors[1], "name": "Secondary Accent", "desc": "Brings balance, representing growth, modern technology, and clarity."},
        {"hex": colors[2] if len(colors) > 2 else "#F43F5E", "name": "Active Highlight", "desc": "A vibrant touchpoint designed to guide user attention and highlight interactive elements."}
    ]

    return {
        "palettes": palettes,
        "typography": [
            {"type": "Heading Font", "name": headings, "desc": "Used for hero titles and major visual typography to establish brand presence."},
            {"type": "Body Font", "name": body, "desc": "Used for reading legibility across standard content and descriptions."},
            {"type": "Accent Font", "name": accent, "desc": "Used for labels, code segments, secondary CTAs, or highlighted captions."}
        ],
        "taglines": [tagline, f"{inputs.brand_name}: Redefining the standard.", "Simple. Elegant. Powerful."],
        "logos": logo_urls
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
