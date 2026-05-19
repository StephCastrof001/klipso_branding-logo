import os
import sys
# Asegurar que el directorio backend está en el sys.path para importación correcta de main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app

client = TestClient(app)

@pytest.fixture
def mock_external_calls():
    # Mockear query_gemini, query_claude, query_local_ollama y generate_imagen_logo
    with patch("main.query_gemini", new_callable=AsyncMock) as mock_gemini, \
         patch("main.query_claude", new_callable=AsyncMock) as mock_claude, \
         patch("main.query_local_ollama", new_callable=AsyncMock) as mock_ollama, \
         patch("main.generate_imagen_logo", new_callable=AsyncMock) as mock_imagen, \
         patch("main.generate_flux_logo", new_callable=AsyncMock) as mock_flux:
         
        # Valores de respuesta por defecto
        mock_gemini.return_value = '{"brief": "Mocked brief from Gemini.", "name_suggestions": [{"name": "Klipso", "rationale": "Perfect fit"}], "brandkit_inputs": {"brand_name": "Klipso", "brand_description": "Mocked description.", "brand_industry": "SaaS", "company_keywords": ["tech", "modern"], "brand_personality": "Sophistication", "target_segment": "startups"}}'
        mock_claude.return_value = ""
        mock_ollama.return_value = ""
        mock_imagen.return_value = ["data:image/png;base64,mockb64data"]
        mock_flux.return_value = ["data:image/jpeg;base64,mockb64data"]
        
        yield {
            "gemini": mock_gemini,
            "claude": mock_claude,
            "ollama": mock_ollama,
            "imagen": mock_imagen,
            "flux": mock_flux
        }

def test_generate_brief_200_and_has_brief(mock_external_calls):
    payload = {
        "company_name": "Klipso",
        "vision": "democratizar diseño",
        "mission": "branding accesible",
        "purpose": "Hacer diseño instantáneo",
        "values": ["innovacion", "agilidad"],
        "industry": "SaaS",
        "keywords": "moderno,tech,limpio",
        "target_audience": "startups"
    }
    response = client.post("/brief", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "brief" in data
    assert "brandkit_inputs" in data
    assert data["brief"] == "Mocked brief from Gemini."

def test_generate_brand_identity_palettes(mock_external_calls):
    mock_external_calls["gemini"].return_value = '{"colors": ["#0F172A", "#0EA5E9", "#F43F5E"], "fonts": {"heading": "Montserrat", "body": "Inter", "accent": "Fira Code"}, "taglines": {"en": "Innovation Redefined", "es": "Innovación redefinida"}, "logo_concept": "minimalist abstract logo"}'
    
    payload = {
        "brand_name": "Klipso",
        "brand_description": "Mocked description.",
        "brand_industry": "SaaS",
        "company_keywords": ["tech", "modern"],
        "brand_personality": "Sophistication",
        "target_segment": "startups"
    }
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "palettes" in data
    assert len(data["palettes"]) == 3
    assert data["palettes"][0]["hex"] == "#0F172A"

def test_generate_brand_identity_logos_as_list(mock_external_calls):
    mock_external_calls["gemini"].return_value = '{"colors": ["#0F172A", "#0EA5E9", "#F43F5E"], "fonts": {"heading": "Montserrat", "body": "Inter", "accent": "Fira Code"}, "taglines": {"en": "Innovation Redefined", "es": "Innovación redefinida"}, "logo_concept": "minimalist abstract logo"}'
    
    payload = {
        "brand_name": "Klipso",
        "brand_description": "Mocked description.",
        "brand_industry": "SaaS",
        "company_keywords": ["tech", "modern"],
        "brand_personality": "Sophistication",
        "target_segment": "startups"
    }
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "logos" in data
    assert isinstance(data["logos"], list)
    assert len(data["logos"]) == 1
    assert data["logos"][0] == "data:image/jpeg;base64,mockb64data"
