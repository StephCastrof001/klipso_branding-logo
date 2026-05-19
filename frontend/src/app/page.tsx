"use client";

import { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Layers, 
  Type, 
  Smile, 
  Copy, 
  RefreshCw, 
  Download, 
  Eye, 
  Award,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form Screen 1 State
  const [companyData, setCompanyData] = useState({
    company_name: "Klipso",
    vision: "Redefinir la forma en que los diseñadores crean identidades de marca interactivas y dinámicas.",
    mission: "Empoderar a startups y creadores mediante un motor de marca inteligente con estética premium.",
    industry: "Tecnología de Marketing",
    keywords: "diseño, automatización, premium, minimalismo, interactivo",
    target_audience: "Startups de base tecnológica y agencias boutique de diseño"
  });

  // Brief Screen 2 State (editable)
  const [briefText, setBriefText] = useState("");
  const [brandkitInputs, setBrandkitInputs] = useState({
    brand_name: "",
    brand_description: "",
    brand_industry: "",
    company_keywords: [] as string[],
    brand_personality: "Sophistication",
    target_segment: ""
  });

  // Results Screen 3 State
  const [results, setResults] = useState<{
    palettes: Array<{ hex: string; name: string; desc: string }>;
    typography: Array<{ type: string; name: string; desc: string }>;
    taglines: string[];
    logos: string[];
  } | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Step 1 -> Step 2 Call
  const handleGenerateBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyData)
      });
      if (res.ok) {
        const data = await res.json();
        setBriefText(data.brief);
        setBrandkitInputs(data.brandkit_inputs);
        setStep(2);
      } else {
        alert("Error al generar el brief creativo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el backend.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3 Call
  const handleGenerateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandkitInputs)
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setStep(3);
      } else {
        alert("Error al generar la identidad de marca.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-height-screen py-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            KLIPSO <span className="text-cyan-400">FORGE</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 bg-slate-900/60 py-1.5 px-3.5 rounded-full border border-slate-800">
          <span className={step >= 1 ? "text-cyan-400" : ""}>DATOS</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step >= 2 ? "text-cyan-400" : ""}>BRIEF</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step >= 3 ? "text-cyan-400" : ""}>IDENTIDAD</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        {loading && (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-6 my-12 animate-pulse border border-cyan-500/20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gradient mb-2">Orquestando tu Identidad...</h3>
              <p className="text-sm text-slate-400">Consultando a Claude y sintetizando tokens de diseño premium.</p>
            </div>
          </div>
        )}

        {!loading && step === 1 && (
          <section className="animate-fadeIn">
            <div className="mb-8 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">Brand Strategy Workspace</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gradient tracking-tight leading-none mb-3">
                Forja la Identidad Visual de tu Empresa.
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                Ingresa los pilares de tu marca. El motor creativo generará un brief profesional que podrás refinar antes de forjar la paleta, tipografías y logotipo.
              </p>
            </div>

            <form onSubmit={handleGenerateBrief} className="glass-panel rounded-3xl p-8 md:p-10 flex flex-col gap-6 shadow-2xl border border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Nombre de Empresa</label>
                  <input 
                    type="text" 
                    value={companyData.company_name} 
                    onChange={e => setCompanyData({...companyData, company_name: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="Ej. Klipso"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Industria Principal</label>
                  <input 
                    type="text" 
                    value={companyData.industry} 
                    onChange={e => setCompanyData({...companyData, industry: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="Ej. Tecnología de Marketing"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Visión de Marca</label>
                  <textarea 
                    value={companyData.vision} 
                    onChange={e => setCompanyData({...companyData, vision: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none h-20 resize-none"
                    placeholder="¿Cuál es el sueño a largo plazo de tu empresa?"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Misión de Marca</label>
                  <textarea 
                    value={companyData.mission} 
                    onChange={e => setCompanyData({...companyData, mission: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none h-20 resize-none"
                    placeholder="¿Cómo piensas cambiar el mercado en tu día a día?"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Palabras Clave (separadas por coma)</label>
                  <input 
                    type="text" 
                    value={companyData.keywords} 
                    onChange={e => setCompanyData({...companyData, keywords: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="Ej. diseño, automático, premium, minimalista"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Audiencia Objetivo</label>
                  <input 
                    type="text" 
                    value={companyData.target_audience} 
                    onChange={e => setCompanyData({...companyData, target_audience: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="Ej. Startups de base tecnológica"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-gradient rounded-xl py-4 px-6 font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-4 text-white shadow-xl shadow-cyan-500/20"
              >
                <span>Elaborar Brief Creativo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </section>
        )}

        {!loading && step === 2 && (
          <section className="animate-fadeIn">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">Step 2: Creative & Strategy Synthesis</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gradient tracking-tight mb-2">Refina tu Brief y Campos Mapeados</h1>
              <p className="text-slate-400 text-sm">
                Claude ha procesado tus pilares de marca. Edita el brief creativo o ajusta los parámetros de diseño a continuación para calibrar los outputs estéticos.
              </p>
            </div>

            <form onSubmit={handleGenerateIdentity} className="flex flex-col gap-6">
              {/* Creative Brief Frame */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Brief Creativo de Marca</h3>
                  <span className="text-xs text-slate-500">Editado por IA</span>
                </div>
                <textarea 
                  value={briefText} 
                  onChange={e => setBriefText(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-4 text-sm leading-relaxed transition-all outline-none h-48 resize-none"
                  required
                />
              </div>

              {/* Brandkit Mapped Inputs Fields */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col gap-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-2 border-b border-slate-800 pb-3">Entradas del Brandkit (Mapeadas)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Nombre de Producto/Marca</label>
                    <input 
                      type="text" 
                      value={brandkitInputs.brand_name} 
                      onChange={e => setBrandkitInputs({...brandkitInputs, brand_name: e.target.value})}
                      className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Personalidad de Marca</label>
                    <select 
                      value={brandkitInputs.brand_personality} 
                      onChange={e => setBrandkitInputs({...brandkitInputs, brand_personality: e.target.value})}
                      className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none cursor-pointer text-white"
                      required
                    >
                      <option value="Competence">Competence</option>
                      <option value="Excitement">Excitement</option>
                      <option value="Sincerity">Sincerity</option>
                      <option value="Sophistication">Sophistication</option>
                      <option value="Ruggedness">Ruggedness</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Descripción Corta (2 Oraciones)</label>
                    <input 
                      type="text" 
                      value={brandkitInputs.brand_description} 
                      onChange={e => setBrandkitInputs({...brandkitInputs, brand_description: e.target.value})}
                      className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Industria Principal</label>
                    <input 
                      type="text" 
                      value={brandkitInputs.brand_industry} 
                      onChange={e => setBrandkitInputs({...brandkitInputs, brand_industry: e.target.value})}
                      className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Segmento de Mercado Objetivo</label>
                    <input 
                      type="text" 
                      value={brandkitInputs.target_segment} 
                      onChange={e => setBrandkitInputs({...brandkitInputs, target_segment: e.target.value})}
                      className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="bg-slate-900 border border-slate-800 rounded-xl py-4 px-6 font-bold text-sm tracking-wider text-slate-400 hover:text-white transition-all w-1/3"
                >
                  Regresar
                </button>
                <button 
                  type="submit" 
                  className="btn-gradient rounded-xl py-4 px-6 font-bold text-sm tracking-wider flex items-center justify-center gap-2 text-white shadow-xl shadow-cyan-500/20 flex-1"
                >
                  <span>Generar Identidad de Marca</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          </section>
        )}

        {!loading && step === 3 && results && (
          <section className="animate-fadeIn flex flex-col gap-8">
            <div className="mb-4 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">Step 3: Identity Generation Complete</span>
                <h1 className="text-4xl font-extrabold text-gradient tracking-tight leading-none">Tu Identidad de Marca Forjada</h1>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-bold tracking-wider uppercase text-cyan-400 py-2.5 px-4 rounded-xl transition-all self-center md:self-auto flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Forjar Otra Marca</span>
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-8">
              {/* Color Palettes Section */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-lg tracking-wider">Paleta de Colores Curada</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.palettes.map((color, idx) => (
                    <div key={idx} className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                      <div 
                        className="w-full h-24 rounded-xl shadow-inner relative group overflow-hidden cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => handleCopy(color.hex, `color-${idx}`)}
                      >
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-all text-xs font-bold text-white uppercase tracking-wider">
                          {copiedText === `color-${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar HEX</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-white">{color.name}</span>
                          <span className="font-mono text-xs font-semibold text-cyan-400">{color.hex}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{color.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography & Taglines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Typography Frame */}
                <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-extrabold text-lg tracking-wider">Tipografías Recomendadas</h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {results.typography.map((font, idx) => (
                      <div key={idx} className="glass-card rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{font.type}</span>
                          <span className="font-mono text-xs font-semibold text-cyan-400">{font.name}</span>
                        </div>
                        <div className="my-2 border-t border-slate-800/40 pb-2">
                          {/* Live preview using styled inline-fonts */}
                          <span 
                            style={{ 
                              fontFamily: font.name.includes("Montserrat") ? "Montserrat" : font.name.includes("Playfair") ? "Playfair Display" : font.name.includes("Inter") ? "Inter" : "sans-serif",
                              fontWeight: font.type.includes("Heading") ? "800" : "400"
                            }} 
                            className="text-2xl text-white tracking-wide"
                          >
                            Aa Bb Cc {font.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal">{font.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Taglines Frame */}
                <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Smile className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-extrabold text-lg tracking-wider">Líneas de Eslogan Curadas</h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {results.taglines.map((tagline, idx) => (
                      <div key={idx} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold italic text-slate-200">
                          "{tagline}"
                        </span>
                        <button 
                          onClick={() => handleCopy(tagline, `tagline-${idx}`)}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-950 transition-all text-slate-400 hover:text-cyan-400"
                          title="Copy Tagline"
                        >
                          {copiedText === `tagline-${idx}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logos Section */}
              {results.logos && results.logos.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-extrabold text-lg tracking-wider">Conceptos de Logotipo Generados</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {results.logos.map((logoUrl, idx) => (
                      <div key={idx} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-slate-800">
                        <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center group overflow-hidden">
                          <img 
                            src={logoUrl} 
                            alt={`Logo Concept ${idx + 1}`}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all">
                            <a 
                              href={logoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                              title="Ver en Grande"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 flex items-center justify-between bg-slate-950/80 border-t border-slate-900">
                          <span className="font-bold text-xs tracking-wider uppercase text-slate-400">Concepto #{idx + 1}</span>
                          <a 
                            href={logoUrl} 
                            download={`logo-concept-${idx + 1}.jpg`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-cyan-400 hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-900/60 text-center text-xs text-slate-500">
        © 2026 Klipso Brand Forge. Powered by advanced Claude & Ollama synthesis engines. All rights reserved.
      </footer>
    </main>
  );
}
