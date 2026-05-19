# ⚙️ Klipso Brand Forge — Backend API Reference

This is the FastAPI backend engine that powers Klipso Brand Forge's strategic synthesis and logo generation pipeline. It integrates multiple state-of-the-art AI inference APIs with a triple-LLM fallback logic.

---

## 🛠️ Local Setup

Follow these commands to configure the backend server on your local environment:

### 1. Environment Activation
```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install required dependencies
pip install fastapi uvicorn google-generativeai httpx pillow pydantic pytest
```

### 2. Configure Environment Variables
Create a file named `.env` in the `backend/` root directory and define the following variables:
```env
# Required for Gemini 2.0 Strategic Synthesis & Imagen 3 Fallback
GOOGLE_API_KEY="your_google_gemini_api_key_here"

# Required for high-fidelity FLUX logos (Black Forest Labs)
TOGETHER_API_KEY="your_together_ai_api_key_here"

# Optional: Claude 3.5 Sonnet Fallback for Brief Generation
ANTHROPIC_API_KEY="your_anthropic_api_key_here"
```

### 3. Run Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Your local FastAPI instance will be available at `http://localhost:8000`. You can access the interactive OpenAPI docs at `http://localhost:8000/docs`.

---

## 🧪 Running Tests

A comprehensive integration and mock testing suite is located in `test_api.py`. To run the verification tests:
```bash
pytest test_api.py -v
```

This verifies:
1. `POST /brief` accepts values/purpose and returns a formatted JSON with brief and name suggestions.
2. `POST /generate` correctly processes brandkit inputs and yields hex palettes.
3. `POST /generate` returns the logos in a clean list format.

---

## 🔌 API Documentation & Endpoints

### 1. `POST /brief`
Transforms raw corporate parameters into a strategic creative brief and suggests 3 design-aligned name concepts.

* **Path**: `/brief`
* **Method**: `POST`
* **Content-Type**: `application/json`

#### Request Payload Schema
```json
{
  "company_name": "string (optional)",
  "vision": "string (required)",
  "mission": "string (required)",
  "purpose": "string (required)",
  "values": ["array of strings (required)"],
  "industry": "string (required)",
  "keywords": "string (required)",
  "target_audience": "string (optional)"
}
```

#### Example Response
```json
{
  "brief": "Brief creativo para Klipso: Enfocado en la industria SaaS. Con la visión de...",
  "name_suggestions": [
    {
      "name": "Klipso Forge",
      "rationale": "Combina la solidez del sector con la forja del branding interactivo."
    },
    {
      "name": "NovaBrand",
      "rationale": "Representa el renacimiento estético y el brillo de la nueva identidad."
    },
    {
      "name": "KlipsoNext",
      "rationale": "Evoca el salto hacia adelante en diseño inteligente y automatización."
    }
  ],
  "brandkit_inputs": {
    "brand_name": "Klipso",
    "brand_description": "Pioneering company in SaaS focused on high-end design solutions.",
    "brand_industry": "SaaS",
    "company_keywords": ["moderno", "limpio", "minimalista", "digital", "SaaS"],
    "brand_personality": "Sophistication",
    "target_segment": "startups y creadores de contenido"
  }
}
```

---

### 2. `POST /generate`
Synthesizes professional brand identities including color palettes with desc, font pairings, eslogans, and a custom FLUX-generated geometric vector logo (base64).

* **Path**: `/generate`
* **Method**: `POST`
* **Content-Type**: `application/json`

#### Request Payload Schema
```json
{
  "brandkit_inputs": {
    "brand_name": "string (required)",
    "brand_description": "string (required)",
    "brand_industry": "string (required)",
    "company_keywords": ["array of strings (required)"],
    "brand_personality": "string (required)",
    "target_segment": "string (required)"
  },
  "direction": "string (optional: minimal | bold | warm)"
}
```

#### Example Response
```json
{
  "palettes": [
    {
      "hex": "#0F172A",
      "name": "Primary Accent",
      "desc": "Reflects the core values, authority, and emotional stability of the brand."
    },
    {
      "hex": "#0EA5E9",
      "name": "Secondary Accent",
      "desc": "Brings balance, representing growth, modern technology, and clarity."
    },
    {
      "hex": "#F8FAFC",
      "name": "Active Highlight",
      "desc": "A vibrant touchpoint designed to guide user attention and highlight interactive elements."
    }
  ],
  "typography": [
    {
      "type": "Heading Font",
      "name": "Montserrat",
      "desc": "Used for hero titles and major visual typography to establish brand presence."
    },
    {
      "type": "Body Font",
      "name": "Inter",
      "desc": "Used for reading legibility across standard content and descriptions."
    },
    {
      "type": "Accent Font",
      "name": "Fira Code",
      "desc": "Used for labels, code segments, secondary CTAs, or highlighted captions."
    }
  ],
  "taglines": {
    "en": "Simplifying the future.",
    "es": "Simplificando el futuro."
  },
  "logos": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
  ]
}
```
