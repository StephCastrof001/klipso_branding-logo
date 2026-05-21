import os
import sys
import re
import json
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI
import base64
from io import BytesIO
from PIL import Image

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

# Mock heavy/external dependencies before importing brandkit-ai
from unittest.mock import MagicMock
sys.modules['streamlit'] = MagicMock()
sys.modules['pinecone'] = MagicMock()
sys.modules['sentence_transformers'] = MagicMock()

# Initialize FastAPI App
app = FastAPI(title="Klipso Branding Web App API", version="4.0")

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BriefRequest(BaseModel):
    company_name: Optional[str] = None
    vision: str
    mission: str
    purpose: str
    values: List[str]
    industry: str
    keywords: str
    audience: Optional[str] = None
    target_audience: Optional[str] = None
    direction: Optional[str] = "minimal"

class BrandkitInputs(BaseModel):
    brand_name: str
    brand_description: str
    brand_industry: str
    company_keywords: List[str]
    brand_personality: str
    target_segment: str

class GenerateRequest(BaseModel):
    brandkit_inputs: Optional[BrandkitInputs] = None
    direction: Optional[str] = "minimal"
    brand_name: Optional[str] = None
    brand_description: Optional[str] = None
    brand_industry: Optional[str] = None
    company_keywords: Optional[List[str]] = None
    brand_personality: Optional[str] = None
    target_segment: Optional[str] = None

# Helper to query LLM via OpenAI
async def query_llm(prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return ""
    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
    return ""

# Helper to query Claude
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
        except Exception as e:
            print(f"Claude error: {e}")
    return ""

# Helper to query local Ollama
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
        except Exception as e:
            print(f"Ollama error: {e}")
    return ""

# Helper: generate DALL-E logo concepts
async def generate_imagen_logo(prompt: str) -> List[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return []
    try:
        client = OpenAI(api_key=api_key)
        response = client.images.generate(
            model="dall-e-3",
            prompt=f"Professional minimalist logo: {prompt}",
            n=1,
            size="1024x1024",
            response_format="b64_json"
        )
        b64_data = response.data[0].b64_json
        return [f"data:image/png;base64,{b64_data}"]
    except Exception as e:
        print(f"DALL-E error: {e}")
    return []

# Helper: generate Together FLUX logo (using "together")
async def generate_flux_logo(inputs: BrandkitInputs, direction: str, colors: List[str]) -> List[str]:
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key or api_key.startswith("your-") or "placeholder" in api_key.lower():
        print("Together API Key not configured or placeholder. Falling back to DALL-E.")
        return await generate_imagen_logo(f"Sleek modern minimalist professional logo, style {direction}, colors: {', '.join(colors)}")
        
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # Geometric visual logo design construction (no text, only shapes)
            prompt = (
                f"Sleek modern minimalist professional vector logo icon for a brand named '{inputs.brand_name}'. "
                f"Industry: {inputs.brand_industry}. "
                f"Description: {inputs.brand_description}. "
                f"Style direction: {direction} design (sleek, high-quality, elegant). "
                f"Colors to use: {', '.join(colors)}. "
                f"Strictly DO NOT include any letters, text, names, words, characters, or typography in the logo. "
                f"Only output a clean, standalone visual icon or symbol composed of modern, elegant vector shapes. "
                f"Centered on a clean solid dark background."
            )
            
            response = await client.post(
                "https://api.together.xyz/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "black-forest-labs/FLUX.1-schnell",
                    "prompt": prompt,
                    "width": 768,
                    "height": 768,
                    "steps": 4,
                    "n": 1,
                    "response_format": "base64"
                }
            )
            
            if response.status_code == 200:
                data = response.json().get("data", [])
                if data:
                    b64_json_string = data[0].get("b64_json")
                    if b64_json_string:
                        img_bytes = base64.b64decode(b64_json_string)
                        img = Image.open(BytesIO(img_bytes))
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        out_buffer = BytesIO()
                        img.save(out_buffer, format='JPEG', quality=90)
                        jpg_b64 = base64.b64encode(out_buffer.getvalue()).decode('utf-8')
                        return [f"data:image/jpeg;base64,{jpg_b64}"]
            else:
                print(f"Together API returned status code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error calling Together FLUX API: {e}")
            
    return await generate_imagen_logo(f"Sleek modern minimalist professional logo, style {direction}, colors: {', '.join(colors)}")

@app.post("/brief")
async def generate_brief(req: BriefRequest):
    prompt = f"""Dado estos datos de empresa:
Nombre de empresa (opcional): {req.company_name or 'No especificado (sugerir uno nuevo)'}
Visión: {req.vision}
Misión: {req.mission}
Propósito: {req.purpose}
Valores: {', '.join(req.values)}
Industria: {req.industry}
Keywords: {req.keywords}
Audiencia Objetivo: {req.audience or req.target_audience or 'General'}

Genera un JSON estrictamente válido que contenga:
1. "brief": Brief de marca estratégico de 150-200 palabras. Estructura: párrafo 1 (qué hace única esta empresa y contra qué va), párrafo 2 (cómo los valores se traducen en comportamiento de marca), párrafo 3 (promesa concreta al usuario). Sin jerga corporativa. Usa lenguaje directo del sector. PROHIBIDO usar: ecosistema líder, soluciones innovadoras, de alto impacto, de vanguardia.
2. "name_suggestions": Lista de exactamente 3 nombres. Criterios: cortos (máx 2 palabras), memorables en LATAM, sin anglicismos genéricos (hub/forge/nova/next). Preferir fusiones español+tech o palabras que evoquen acción concreta. Formato: {{"name": "Nombre", "rationale": "Explicación del concepto en 1 oración"}}.
3. "brandkit_inputs": Un objeto con:
   - "brand_name": Si se especificó el Nombre de Empresa arriba, utilízalo. Si no se especificó, utiliza la primera opción de la lista "name_suggestions".
   - "brand_description": Descripción de marca corta de 2 oraciones.
   - "brand_industry": "{req.industry}"
   - "company_keywords": Una lista de exactamente 5 palabras clave de marca.
   - "brand_personality": Debe ser estrictamente uno de estos: Competence, Excitement, Sincerity, Sophistication, o Ruggedness.
   - "target_segment": "{req.audience or req.target_audience or 'General'}"

Responde ÚNICAMENTE con el objeto JSON estricto, sin bloques de código ```json o explicaciones adicionales.
"""
    
    raw_response = None
    # Try Gemini first
    raw_response = await query_llm(prompt)
    if raw_response:
        print("Using OpenAI for brief generation...")
        
    # Try Claude
    if not raw_response:
        raw_response = await query_claude(prompt)
        if raw_response:
            print("Using Claude for brief generation...")
            
    # Try local Ollama
    if not raw_response:
        raw_response = await query_local_ollama(prompt)
        if raw_response:
            print("Using Ollama for brief generation...")

    # Fallbacks and parsers
    parsed = None
    if raw_response:
        try:
            clean_json = raw_response.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            clean_json = clean_json.strip()
            parsed = json.loads(clean_json)
        except Exception:
            pass

    if not parsed or "brief" not in parsed or "brandkit_inputs" not in parsed:
        # High fidelity deterministic fallback
        words = [w.strip() for w in req.keywords.split(",")]
        keywords_list = words[:5]
        while len(keywords_list) < 5:
            keywords_list.append("Innovative")
            
        mock_suggestions = [
            {"name": req.company_name or f"{req.industry.split()[0]}Forge", "rationale": "Combina la solidez del sector con la forja del branding interactivo."},
            {"name": "NovaBrand", "rationale": "Representa el renacimiento estético y el brillo de la nueva identidad visual."},
            {"name": "KlipsoNext", "rationale": "Evoca el salto hacia adelante en diseño inteligente y automatización premium."}
        ]
        default_name = req.company_name or mock_suggestions[0]["name"]
        
        parsed = {
            "brief": f"Brief creativo para {default_name}: Enfocado en la industria {req.industry}. Con la visión clara de {req.vision} y la misión de {req.mission}, impulsamos un propósito clave: {req.purpose}. Basado en valores fundamentales como {', '.join(req.values)}, construimos una identidad de marca coherente, de alto impacto y orientada a {req.audience or req.target_audience or 'startups latam'}.",
            "name_suggestions": mock_suggestions,
            "brandkit_inputs": {
                "brand_name": default_name,
                "brand_description": f"Pioneering company in {req.industry} focused on high-end design solutions.",
                "brand_industry": req.industry,
                "company_keywords": keywords_list,
                "brand_personality": "Sophistication",
                "target_segment": req.audience or req.target_audience or "General"
            }
        }
        
    # Generate logo_prompt with OpenAI
    first_name = req.company_name if req.company_name else parsed.get("name_suggestions", [{}])[0].get("name", parsed.get("brandkit_inputs", {}).get("brand_name", req.industry))

    direction = req.direction or "minimal"
    style_map = {
        "minimal": "minimalist geometric, flat vector, 1-2 core elements, 40% negative space, 2-3px line weight",
        "bold": "bold high-contrast, strong geometric shapes, single focal point, 3 colors max, thick strokes",
        "warm": "friendly rounded shapes, humanist proportions, warm color palette, approachable and human"
    }
    style_desc = style_map.get(direction, style_map["minimal"])

    logo_prompt_formula = (
        f"Professional SVG logo for {first_name}, {req.industry}. "
        f"Style: {style_desc}. "
        f"Concept: single abstract symbol representing {req.purpose[:50]}. "
        f"Typography: clean wordmark below icon, modern sans-serif. "
        f"White background, must be scalable to 16px favicon. "
        f"Negative: no gradients, no shadows, no texture, no grain, no rough edges, "
        f"no photorealism, no clipart, no mockup, no watermark, no complex shading, no decorative elements."
    )
    # Use LLM to refine the logo prompt (or use formula directly as fallback)
    llm_logo_prompt = await query_llm(
        f"Mejora y refina este prompt de logo para hacerlo mas preciso y evocador, "
        f"manteniendo la formula base. Responde SOLO con el prompt mejorado, sin explicaciones:\n{logo_prompt_formula}"
    )
    parsed["logo_prompt"] = llm_logo_prompt if llm_logo_prompt else logo_prompt_formula

    return parsed

@app.post("/generate")
async def generate_brand_identity(req: GenerateRequest):
    # Parse inputs from nested or flat body
    inputs = req.brandkit_inputs
    if not inputs:
        inputs = BrandkitInputs(
            brand_name=req.brand_name or "Klipso",
            brand_description=req.brand_description or "Innovative brand solutions.",
            brand_industry=req.brand_industry or "Tech",
            company_keywords=req.company_keywords or ["modern", "tech"],
            brand_personality=req.brand_personality or "Sophistication",
            target_segment=req.target_segment or "General"
        )
    direction = req.direction or "minimal"

    prompt = f"""Genera una propuesta de identidad de marca basada en estos datos:
Nombre de marca: {inputs.brand_name}
Descripción: {inputs.brand_description}
Industria: {inputs.brand_industry}
Keywords: {', '.join(inputs.company_keywords)}
Personalidad: {inputs.brand_personality}
Segmento de mercado: {inputs.target_segment}
Dirección estético: {direction} (Aplica esto para la selección de colores y tipografías:
  - 'minimal': Colores neutros, limpios (grises, pizarras, blancos) y tipografías sans-serif elegantes (ej. Inter, Montserrat).
  - 'bold': Colores de alto contraste, vibrantes (rojo brillante, neones, negro profundo) y tipografías display o gruesas.
  - 'warm': Colores terrosos, cálidos (marrones, beige, crema) y tipografías serif o redondeadas.)

Responde ÚNICAMENTE con un objeto JSON estricto sin formatear, sin bloques de código ```json o texto adicional. El formato de la respuesta debe ser:
{{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "fonts": {{
    "heading": "Nombre de la fuente para títulos (ej. Montserrat)",
    "body": "Nombre de la fuente para el cuerpo de texto (ej. Inter)",
    "accent": "Nombre de la fuente para acentos (ej. Fira Code)"
  }},
  "taglines": {{
    "en": "An elegant tagline in English",
    "es": "Un eslogan original e inspirador en Español"
  }}
}}
"""

    # Determine styles based on direction for default/fallback fallback
    if direction == "bold":
        fallback_colors = ["#000000", "#FF3B30", "#34C759"]
        fallback_fonts = {"heading": "Impact", "body": "Helvetica Neue", "accent": "Courier Bold"}
        fallback_taglines = {"en": "Bold design, bolder impact.", "es": "Diseño audaz, impacto gigante."}
    elif direction == "warm":
        fallback_colors = ["#4A3B32", "#D2B48C", "#FFFDD0"]
        fallback_fonts = {"heading": "Playfair Display", "body": "Georgia", "accent": "Palatino"}
        fallback_taglines = {"en": "Warmth in every pixel.", "es": "Calidez en cada detalle."}
    else: # minimal
        fallback_colors = ["#0F172A", "#0EA5E9", "#F8FAFC"]
        fallback_fonts = {"heading": "Montserrat", "body": "Inter", "accent": "Fira Code"}
        fallback_taglines = {"en": "Simplifying the future.", "es": "Simplificando el futuro."}

    parsed = None
    raw_json = await query_llm(prompt)
    if not raw_json:
        raw_json = await query_claude(prompt)
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
        except Exception:
            pass

    if not parsed or "colors" not in parsed or "fonts" not in parsed or "taglines" not in parsed:
        parsed = {
            "colors": fallback_colors,
            "fonts": fallback_fonts,
            "taglines": fallback_taglines
        }

    colors = parsed["colors"]
    headings = parsed["fonts"].get("heading", fallback_fonts["heading"])
    body = parsed["fonts"].get("body", fallback_fonts["body"])
    accent = parsed["fonts"].get("accent", fallback_fonts["accent"])
    taglines = parsed["taglines"]

    # Map palettes with rich rationale
    palettes = [
        {"hex": colors[0], "name": "Primary Accent", "desc": "Reflects the core values, authority, and emotional stability of the brand."},
        {"hex": colors[1] if len(colors) > 1 else "#0EA5E9", "name": "Secondary Accent", "desc": "Brings balance, representing growth, modern technology, and clarity."},
        {"hex": colors[2] if len(colors) > 2 else "#F43F5E", "name": "Active Highlight", "desc": "A vibrant touchpoint designed to guide user attention and highlight interactive elements."}
    ]

    # Generate logos via Together AI Flux with fallback
    logos = await generate_flux_logo(inputs, direction, colors)

    return {
        "palettes": palettes,
        "typography": [
            {"type": "Heading Font", "name": headings, "desc": "Used for hero titles and major visual typography to establish brand presence."},
            {"type": "Body Font", "name": body, "desc": "Used for reading legibility across standard content and descriptions."},
            {"type": "Accent Font", "name": accent, "desc": "Used for labels, code segments, secondary CTAs, or highlighted captions."}
        ],
        "taglines": taglines,
        "logos": logos
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
