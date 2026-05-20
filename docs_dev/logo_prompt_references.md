# 🎨 AI Logo Prompt Reference Book & Formulas

This reference guide compiles canonical formulas, prompt templates, style directions, and negative prompts extracted from curated AI logo prompt repositories. These patterns are optimized for high-fidelity generators like **FLUX (Together AI)**, **Gemini 2.0 (Imagen 3)**, and **Midjourney**.

---

## 📁 Repository 1: Awesome AI Logo Generator Prompts (Cliprise)
* **Source URL:** [cliprise/awesome-ai-logo-generator-prompts](https://github.com/cliprise/awesome-ai-logo-generator-prompts)
* **Focus:** AI logo design prompts, workflows, and style directions.

### 📐 Canonical Prompt Formula
The ideal structures for logo generation consists of describing style, category, symbols, attributes, color palette, composition, and production constraints:

```text
Create a [style] logo concept for [business/category] called [brand name or placeholder].
Use [symbol/icon idea] to represent [brand attribute].
Style: [minimal, geometric, premium, playful, bold, elegant, futuristic, handmade].
Color palette: [colors].
Composition: [icon only, wordmark, icon above wordmark, badge, monogram].
Constraints: [flat vector-like, simple shapes, scalable, no mockup, no background texture, no tiny details].
```

#### Canonical Example
> "Create a clean modern logo concept for a productivity app called FlowNest. Use a simple geometric nest icon made from three curved lines to represent focus, organization and calm work. Style: minimal, friendly, premium SaaS brand. Color palette: deep navy, soft blue and white. Composition: icon above simple wordmark placeholder. Constraints: flat vector-like design, scalable, no mockup, no background texture, no tiny details."

---

### 🎨 Prompt Templates by Brand Aesthetic

#### 1. Minimal Style Logo (Warm / Clean)
* **Formula:**
  ```text
  Create a minimal logo concept for [brand name], a [business type]. Use [simple symbol idea] to represent [brand meaning]. Style: clean, modern, minimal, premium. Color palette: [colors]. Composition: [layout]. Constraints: flat vector-like, scalable, no mockup, no background texture, no tiny details.
  ```
* **Example:**
  ```text
  Create a minimal logo concept for VitaCalm, a wellness brand. Use a simple abstract leaf and circle icon to represent balance and natural health. Style: soft, trustworthy, premium wellness. Color palette: sage green, cream and warm gray. Constraints: flat vector-like, scalable, no medical cross, no mockup, no background texture.
  ```

#### 2. Bold Style Logo
* **Formula:**
  ```text
  Create a bold modern logo concept for [brand name], a [business type]. Use a simple [symbol] combined with [secondary element/shape] to represent [attributes]. Style: confident, modern, vibrant, professional. Color palette: [colors]. Constraints: flat vector-like, scalable, no realistic textures, no mockup, no background texture.
  ```
* **Example:**
  ```text
  Create a bold modern logo concept for a digital marketing agency called SignalCraft. Use a simple signal wave icon combined with a spark shape to represent growth and creative performance. Style: confident, modern, conversion-focused, professional. Color palette: dark navy, orange and white. Constraints: flat vector-like, scalable, no charts, no mockup, no background texture.
  ```

#### 3. Playful Style Logo
* **Formula:**
  ```text
  Create a playful modern logo concept for [brand name], a [business type]. Use a simple [symbol] with rounded shapes and friendly personality. Style: warm, approachable, clean, memorable. Color palette: [colors]. Constraints: simple silhouette, no tiny details, no mockup, no background texture.
  ```

#### 4. Luxury / Premium Style Logo
* **Formula:**
  ```text
  Create a refined luxury logo concept for [brand name], a [business type]. Use a subtle [symbol] mark with elegant balance. Style: quiet luxury, premium, minimal, editorial. Color palette: [colors]. Composition: thin icon with wordmark placeholder. Constraints: no ornate clutter, no mockup, no background texture.
  ```

---

### 🚫 Negative Prompts & Constraints
To avoid common AI rendering issues (such as text hallucinations, fake templates, or low quality 3D shadows), append these parameters:

#### Global Logo Negative Prompt
```text
no mockup, no wall sign, no business card, no background texture, no 3D render, no tiny details, no fake text, no unreadable letters, no complex gradients, no realistic shadows, no photographic scene, no copied brand style, no trademarked symbols
```

#### App Icon Negative Constraints
```text
no wordmark, no tiny details, no thin lines, no complex texture, no fake text, no 3D mockup
```

#### Luxury / Editorial Negative Constraints
```text
no ornate clutter, no excessive flourish, no gold foil mockup, no fake background texture, no unreadable serif letters
```

---

## 📁 Color Palette Ideas

Use color to guide brand perception.

| Brand feel | Palette direction |
|---|---|
| Premium technology | navy, electric blue, white |
| AI startup | black, deep purple, cyan |
| Wellness | sage green, cream, soft beige |
| Luxury | black, ivory, champagne gold |
| Fitness | black, red, white |
| Coffee | espresso brown, cream, forest green |
| Creator brand | violet, pink, white |
| Finance | navy, emerald, white |
| Outdoor | forest green, burnt orange, cream |
| Restaurant | charcoal, warm orange, cream |
| Kids brand | soft orange, sky blue, cream |
| Real estate | navy, gold, white |

---

## 📁 Repository 2: Awesome AI Image Prompts (Nano Banana)
* **Source URL:** [devanshug2307/Awesome-AI-Image-Prompts](https://github.com/devanshug2307/Awesome-AI-Image-Prompts)
* **Focus:** Curated premium prompt parameters, brutalist layouts, and Material Design guidelines.

### 📐 Monogram Redesign Pattern (Midjourney & Flux)
For transforming modern brands into calligraphic monograms:

```text
A flat, minimalist vector design featuring a highly stylized single letter monogram with the official brand logo below it, representing [BRAND NAME].

**MAIN ELEMENT (THE MONOGRAM):**
The center of the design features ONLY the single first letter of "[BRAND NAME]". The style is "Ornamental Vector Typography" with high calligraphic artistry, mimicking bespoke luxury monograms. This is not a standard font; it is a highly customized, artistic glyph with elegant flourishes, exaggerated swashes, or ornamental serifs. The lines are clean, precise, and perfectly smooth vector graphics.

**SECONDARY ELEMENT (BRAND IDENTIFIER):**
Directly below the main stylized letter, positioned centrally, include the actual, original official logomark or logotype of "[BRAND NAME]" rendered significantly smaller.

**FINISH & TEXTURE (STRICT):**
Absolutely zero texture, zero embossing, zero shadows, and zero gradients anywhere in the image. It must look like a perfectly flat digital illustration or screen print.

**COLOR PALETTE (AI-DRIVEN & HIGH CONTRAST):**
1. Background: A single, solid, flat color block chosen by the AI to represent the vibe of [BRAND NAME].
2. Main Monogram Color: A single, solid, flat color that creates a sharp, high contrast against the background.
3. Secondary Logo Color: Monochrome, solid white or solid dark gray chosen based on readability.
```

---

### ⚡ Brutal Minimalism & Duotone Icon Prompts
Ideal for high-impact clean glyphs or modern app badges:

```text
A single, isolated, strict duotone flat vector icon representing the face of [CHARACTER/BRAND SYMBOL].

**CONTENT SCOPE:**
The design must represent ONLY the head, face, or icon of [SYMBOL]. Absolutely no shoulders, torso, or realistic lighting.

**DYNAMIC DUOTONE COLOR PALETTE (MATERIAL DESIGN):**
The entire image must use strictly ONLY TWO solid, flat colors chosen from a "Google Material Design" aesthetic—moderate hues, matte finish, avoiding overly harsh saturation.
1. Background Theme Color: A moderate, pleasing solid flat color covering the entire canvas.
2. Foreground Theme Color: A second solid flat color used for the icon shape and the text.

**STYLE & TECHNIQUE (BRUTAL MINIMALISM):**
The style is brutal geometric minimalism with high abstraction. Reduce features to their most basic, blocky, angular shapes. Use large, solid masses of the Foreground Theme Color. Internal details must be formed solely by bold, blocky "cuts" of the Background Theme Color negative space. No borders, containers, or shadows.
```

---

## 📁 Repository 3: Awesome Nano Banana Cases (Jimmy Lv)
* **Source URL:** [jimmylv/awesome-nano-banana](https://github.com/jimmylv/awesome-nano-banana)
* **Focus:** Google Imagen 3 Pro prompting rules, low-poly 3D brand assets, and structural parameters.

### 📐 3D Clay-Style Brand Prompts (Imagen 3 / GPT-4o)
Excellent for warm, modern corporate illustrations and landing page visual assets:

```text
a soft 3D cartoon-style sculpture of [brand product], made of smooth clay-like textures and vibrant pastel colors, placed in a minimalist isometric scene that complements the product’s nature, clean composition, gentle lighting, subtle shadows, with the product’s logo and a 3-word slogan displayed clearly below.
```

### 📐 Futuristic Holographic Glass Mark Pattern (Flux / Midjourney)
Ideal for bold, futuristic tech branding and cards:

```text
A futuristic trading card with a dark, moody neon aesthetic and soft sci-fi lighting. The card features a semi-transparent, rounded rectangle with slightly muted glowing edges, appearing as if made of holographic glass. At the center is a large glowing logo of [logo], with no additional text or label, illuminated with a smooth gradient of [colors], but not overly bright. The reflections on the card surface should be subtle, with a slight glossy finish catching ambient light.
```

---

## 💡 Top Guidelines & Modifiers for AI Logo Generators

When adapting these references to **FLUX (Together AI)**, **Gemini 2.0 Flash**, and **Imagen 3**, follow these rules:

1. **Precision Keywords for Vector Aesthetics**: Use modifiers like `flat vector-like`, `minimalistic glyph`, `solid color block`, and `geometric silhouette`.
2. **Text Prevention**: Unless using high-parameter typography-supporting models (like Flux Dev/Schnell or GPT-4o), keep text out of the prompt by specifying `no wordmark, no typography, no text, no unreadable letters`.
3. **Materials & Render Control**: For flat graphics, strictly enforce `no mockup, flat vector-like, 2D outline, screen-print friendly, matte finish`. For premium 3D graphics, use `soft diffuse lighting, clay texture, low poly, matte surface`.
