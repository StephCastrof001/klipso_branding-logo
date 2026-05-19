import os
import sys
import json
import argparse
import collections
from PIL import Image
import requests

OLLAMA_MODEL = "qwen3:8b"

def get_dominant_colors(image_path, num_colors=3):
    if not image_path or not os.path.exists(image_path):
        return []
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize((100, 100))
        pixels = list(img.getdata())
        counter = collections.Counter(pixels)
        most_common = counter.most_common(num_colors)
        hex_colors = []
        for rgb, count in most_common:
            hex_color = '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])
            hex_colors.append(hex_color)
        return hex_colors
    except Exception as e:
        print(f"Warning: Could not extract colors from logo: {e}")
        return []

def query_ollama(prompt, model=OLLAMA_MODEL):
    try:
        url = "http://localhost:11434/api/generate"
        data = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.7
            }
        }
        response = requests.post(url, json=data, timeout=30)
        if response.status_code == 200:
            return json.loads(response.json().get("response", "{}"))
    except Exception as e:
        print(f"Ollama query failed: {e}")
    return None

def query_claude(prompt, api_key):
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=2048,
            temperature=0.7,
            messages=[
                {"role": "user", "content": prompt + "\nRespond ONLY with a valid JSON object matching the requested schema."}
            ]
        )
        text = response.content[0].text.strip()
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            return json.loads(text[start:end+1])
    except Exception as e:
        print(f"Claude query failed: {e}")
    return None

def deterministic_fallback(brief, logo_colors):
    brief_lower = brief.lower()
    
    primary = "#1E3A8A"
    secondary = "#3B82F6"
    accent = "#F59E0B"
    
    if logo_colors:
        primary = logo_colors[0]
        if len(logo_colors) > 1:
            secondary = logo_colors[1]
        if len(logo_colors) > 2:
            accent = logo_colors[2]
            
    if "tech" in brief_lower or "digital" in brief_lower or "cloud" in brief_lower:
        primary = primary or "#0F172A"
        secondary = secondary or "#38BDF8"
        accent = accent or "#818CF8"
    elif "nature" in brief_lower or "green" in brief_lower or "eco" in brief_lower or "organic" in brief_lower:
        primary = "#064E3B"
        secondary = "#10B981"
        accent = "#F59E0B"
    elif "premium" in brief_lower or "luxury" in brief_lower or "elegance" in brief_lower:
        primary = "#1A1A1A"
        secondary = "#D4AF37"
        accent = "#E5E5E5"
        
    heading_font = "Playfair Display" if "premium" in brief_lower or "luxury" in brief_lower else "Montserrat"
    body_font = "Lora" if "premium" in brief_lower else "Inter"
    accent_font = "Fira Code" if "tech" in brief_lower else "Great Vibes"
    
    return {
        "palettes": [
            {
                "name": "Primary Palette",
                "colors": [primary, secondary, "#F8FAFC", "#0F172A"],
                "description": "A solid foundational palette expressing trust, clarity, and brand vision."
            },
            {
                "name": "Secondary Palette",
                "colors": [secondary, accent, "#E2E8F0", "#1E293B"],
                "description": "Supporting tones to highlight interactive elements and accents."
            },
            {
                "name": "Accent Palette",
                "colors": [accent, "#EF4444", "#10B981", "#3B82F6"],
                "description": "Vibrant accent highlights to drive user focus and action."
            }
        ],
        "typography": {
            "heading": heading_font,
            "body": body_font,
            "accent": accent_font
        },
        "taglines": [
            f"Klipso: Elevating your vision to reality.",
            f"Unleash the power of modern branding.",
            f"Distinctly designed, professionally crafted."
        ],
        "identity_suggestions": {
            "brand_voice": "Professional, authoritative, yet innovative and highly accessible.",
            "logo_concept_analysis": "A sleek, geometric emblem that combines abstract shapes with a modern silhouette.",
            "personality_traits": ["Innovative", "Trustworthy", "Sophisticated"]
        }
    }

def main():
    parser = argparse.ArgumentParser(description="Klipso Branding & Identity Generator Pipeline")
    parser.add_argument("--brief", type=str, required=True, help="Text describing the brand vision and details")
    parser.add_argument("--logo", type=str, required=True, help="Path to the logo image file")
    
    args = parser.parse_args()
    
    print(f"=== Starting Klipso Branding Pipeline ===")
    print(f"Brief: '{args.brief}'")
    print(f"Logo Path: '{args.logo}'")
    
    logo_colors = get_dominant_colors(args.logo, 3)
    if logo_colors:
        print(f"Extracted dominant colors from logo: {', '.join(logo_colors)}")
    else:
        print("No logo colors extracted (using default color palettes)")
        
    schema_desc = """
    Return a JSON object exactly matching this schema:
    {
      "palettes": [
        {
          "name": "Name of Palette (e.g. Primary)",
          "colors": ["HEX1", "HEX2", "HEX3", "HEX4"],
          "description": "Short explanation of the palette choices"
        }
      ],
      "typography": {
        "heading": "Heading Font Name (e.g. Inter, Playfair Display)",
        "body": "Body Font Name (e.g. Roboto, Lora)",
        "accent": "Accent/Code Font Name (e.g. JetBrains Mono)"
      },
      "taglines": ["Catchy tagline 1", "Catchy tagline 2", "Catchy tagline 3"],
      "identity_suggestions": {
        "brand_voice": "Brief description of the brand voice",
        "logo_concept_analysis": "Suggestions for the logo concept",
        "personality_traits": ["Trait 1", "Trait 2", "Trait 3"]
      }
    }
    """
    
    prompt = f"""
    You are an elite brand strategist and designer.
    Analyze the following brand brief:
    "{args.brief}"
    
    We have analyzed the brand logo image and extracted these dominant colors: {logo_colors if logo_colors else 'None'}.
    
    Generate exactly three beautiful, cohesive color palettes (Primary, Secondary, Accent), each containing 4-5 HEX colors.
    Also generate three high-impact taglines, professional typography suggestions (heading, body, accent fonts), and core brand identity suggestions.
    
    {schema_desc}
    """
    
    brand_identity = None
    
    api_key = os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("CLAUDE_API_KEY")
    if api_key:
        print("Attempting generation via Anthropic Claude API...")
        brand_identity = query_claude(prompt, api_key)
        
    if not brand_identity:
        print("Attempting generation via local Ollama...")
        brand_identity = query_ollama(prompt, OLLAMA_MODEL)
        
    if not brand_identity:
        print("Using high-fidelity deterministic fallback...")
        brand_identity = deterministic_fallback(args.brief, logo_colors)
        
    output_dir = os.path.expanduser("~/klipso_branding-logo/output")
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "brand_identity.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(brand_identity, f, indent=2, ensure_ascii=False)
        
    print(f"\n=== Brand Identity Generated Successfully! ===")
    print(f"Saved to: {output_file}\n")
    
    print(f"✨ BRAND VOICE: {brand_identity['identity_suggestions']['brand_voice']}")
    print(f"🎯 TAGLINES:")
    for tagline in brand_identity['taglines']:
        print(f"   - \"{tagline}\"")
        
    print(f"\n🎨 COLOR PALETTES:")
    for p in brand_identity['palettes']:
        print(f"   🔹 {p['name']}: {', '.join(p['colors'])}")
        print(f"      ↳ {p['description']}")
        
    print(f"\n✍️ TYPOGRAPHY:")
    print(f"   Heading: {brand_identity['typography']['heading']}")
    print(f"   Body:    {brand_identity['typography']['body']}")
    print(f"   Accent:  {brand_identity['typography']['accent']}")
    
    traits = ", ".join(brand_identity['identity_suggestions']['personality_traits'])
    print(f"\n⚡ PERSONALITY TRAITS: {traits}")
    print(f"=============================================")

if __name__ == "__main__":
    main()
