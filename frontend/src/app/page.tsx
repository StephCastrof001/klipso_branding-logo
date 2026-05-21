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
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [loadingIdentity, setLoadingIdentity] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Step 1: Inputs
  const [companyData, setCompanyData] = useState({
    company_name: "",
    vision: "",
    mission: "",
    purpose: "",
    values: "",
    industry: "",
    keywords: "",
    target_audience: ""
  });

  // Step 2: Brief & Suggestions (Visible after `/brief`)
  const [briefText, setBriefText] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState<Array<{ name: string; rationale: string }>>([]);
  const [brandkitInputs, setBrandkitInputs] = useState({
    brand_name: "",
    brand_description: "",
    brand_industry: "",
    company_keywords: [] as string[],
    brand_personality: "Sophistication",
    target_segment: ""
  });
  const [styleDirection, setStyleDirection] = useState("minimal");
  const [logoPrompt, setLogoPrompt] = useState("");

  // Step 3: Brand Identity (Visible after `/generate`)
  const [results, setResults] = useState<{
    palettes: Array<{ hex: string; name: string; desc: string }>;
    typography: Array<{ type: string; name: string; desc: string }>;
    taglines: { en: string; es: string };
    logos: string[];
  } | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleGenerateBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBrief(true);
    try {
      const valuesArray = companyData.values
        ? companyData.values.split(",").map(v => v.trim()).filter(Boolean)
        : ["Excelencia", "Innovación"];
        
      const res = await fetch("http://localhost:8000/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyData,
          values: valuesArray,
          direction: styleDirection
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBriefText(data.brief);
        setNameSuggestions(data.name_suggestions || []);
        setBrandkitInputs(data.brandkit_inputs);
        setLogoPrompt(data.logo_prompt || "");
        // If user didn't specify name, set it from first suggestion
        if (!companyData.company_name && data.name_suggestions?.length > 0) {
          setBrandkitInputs(prev => ({
            ...prev,
            brand_name: data.name_suggestions[0].name
          }));
        }
      } else {
        alert("Error al generar el brief creativo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el backend.");
    } finally {
      setLoadingBrief(false);
    }
  };

  const handleGenerateIdentity = async () => {
    setLoadingIdentity(true);
    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandkit_inputs: brandkitInputs,
          direction: styleDirection
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        alert("Error al generar la identidad de marca.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el backend.");
    } finally {
      setLoadingIdentity(false);
    }
  };

  return (
    <main className="min-height-screen py-10 px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            KLIPSO <span className="text-cyan-400">FORGE</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 bg-slate-900/60 py-1.5 px-3.5 rounded-full border border-slate-800">
          <span className="text-cyan-400">SINGLE-SCREEN BRAND WORKSPACE</span>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1 block">Brand strategy workspace</span>
            <h1 className="text-3xl font-extrabold text-gradient tracking-tight leading-none mb-2">
              Forja tu Identidad.
            </h1>
            <p className="text-slate-400 text-xs">
              Ingresa los pilares de tu marca. El motor creativo procesará tu brief y generará paleta de colores, tipografías y logotipos vectoriales limpios.
            </p>
          </div>

          <form onSubmit={handleGenerateBrief} className="glass-panel rounded-3xl p-6 flex flex-col gap-5 border border-slate-800 shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nombre (Opcional)</label>
                  <input 
                    type="text" 
                    value={companyData.company_name} 
                    onChange={e => setCompanyData({...companyData, company_name: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white transition-all outline-none"
                    placeholder="Ej. Klipso"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Industria Principal</label>
                  <input 
                    type="text" 
                    value={companyData.industry} 
                    onChange={e => setCompanyData({...companyData, industry: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white transition-all outline-none"
                    placeholder="Ej. SaaS"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Propósito de la Marca</label>
                <input 
                  type="text" 
                  value={companyData.purpose} 
                  onChange={e => setCompanyData({...companyData, purpose: e.target.value})}
                  className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white transition-all outline-none"
                  placeholder="¿Por qué existe la marca más allá de ganar dinero?"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valores de la Marca (separados por coma)</label>
                <input 
                  type="text" 
                  value={companyData.values} 
                  onChange={e => setCompanyData({...companyData, values: e.target.value})}
                  className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white transition-all outline-none"
                  placeholder="Ej. Transparencia, Innovación, Diseño"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visión de Marca</label>
                <textarea 
                  value={companyData.vision} 
                  onChange={e => setCompanyData({...companyData, vision: e.target.value})}
                  className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2 text-xs text-white transition-all outline-none h-14 resize-none"
                  placeholder="¿Cuál es el sueño a largo plazo de tu empresa?"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Misión de Marca</label>
                <textarea 
                  value={companyData.mission} 
                  onChange={e => setCompanyData({...companyData, mission: e.target.value})}
                  className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2 text-xs text-white transition-all outline-none h-14 resize-none"
                  placeholder="¿Cómo piensas cambiar el mercado hoy?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Palabras Clave (por coma)</label>
                  <input 
                    type="text" 
                    value={companyData.keywords} 
                    onChange={e => setCompanyData({...companyData, keywords: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white transition-all outline-none"
                    placeholder="Ej. moderno, limpio"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audiencia Objetivo</label>
                  <input 
                    type="text" 
                    value={companyData.target_audience} 
                    onChange={e => setCompanyData({...companyData, target_audience: e.target.value})}
                    className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white transition-all outline-none"
                    placeholder="Ej. Startups de latam"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loadingBrief}
              className="btn-gradient rounded-xl py-3 px-6 font-bold text-xs tracking-wider flex items-center justify-center gap-2 mt-2 text-white shadow-xl shadow-cyan-500/20 disabled:opacity-50"
            >
              {loadingBrief ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando brief...</span>
                </>
              ) : (
                <>
                  <span>1. Elaborar Brief Creativo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column: Brief & Identity Results (lg:col-span-7) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* If brief is not yet generated, show premium guide placeholder */}
          {!briefText && !loadingBrief && (
            <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center gap-6 min-h-[450px]">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                <Layers className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-gradient font-extrabold text-xl mb-2">Workspace Creativo Listo</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Completa los pilares de tu marca en el panel de la izquierda y haz clic en "Elaborar Brief Creativo" para iniciar el flujo de diseño premium impulsado por AI.
                </p>
              </div>
            </div>
          )}

          {/* Loading Brief Loader */}
          {loadingBrief && (
            <div className="glass-panel rounded-3xl p-12 text-center border border-cyan-500/20 flex flex-col items-center justify-center gap-6 min-h-[450px] animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <div>
                <h3 className="text-gradient font-extrabold text-lg mb-2">Conectando con el LLM...</h3>
                <p className="text-xs text-slate-400">Claude & Gemini están estructurando tu propuesta de brief y marca.</p>
              </div>
            </div>
          )}

          {/* Step 2 Panel: Creative & Strategy Synthesis (Visible after brief generation) */}
          {briefText && !loadingBrief && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Brief Creativo de Marca</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">Editable</span>
                </div>
                <textarea 
                  value={briefText} 
                  onChange={e => setBriefText(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-xs text-slate-300 leading-relaxed transition-all outline-none h-32 resize-none"
                  required
                />

                {/* Name suggestions */}
                {nameSuggestions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Nombres Sugeridos con Rationale</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {nameSuggestions.map((sug, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setBrandkitInputs(prev => ({ ...prev, brand_name: sug.name }))}
                          className={`glass-card rounded-xl p-3 border cursor-pointer hover:border-cyan-500/50 transition-all ${brandkitInputs.brand_name === sug.name ? 'border-cyan-500 bg-cyan-950/10' : 'border-slate-800'}`}
                        >
                          <div className="font-bold text-xs text-white mb-1">{sug.name}</div>
                          <div className="text-[10px] text-slate-400 leading-normal">{sug.rationale}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logo Prompt */}
                {logoPrompt && (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Logo Prompt</h4>
                      <button
                        type="button"
                        onClick={() => handleCopy(logoPrompt, "logo-prompt")}
                        className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-cyan-400 transition-colors border border-slate-700 hover:border-cyan-500/50 rounded-lg px-2 py-1"
                      >
                        {copiedText === "logo-prompt" ? (
                          <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copiado</span></>
                        ) : (
                          <><Copy className="w-3 h-3" /><span>Copiar</span></>
                        )}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={logoPrompt}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 leading-relaxed outline-none h-28 resize-none cursor-text select-all"
                    />
                  </div>
                )}

                {/* Editable Inputs for Brandkit */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Configuración final del Brandkit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Nombre de Marca</label>
                      <input 
                        type="text" 
                        value={brandkitInputs.brand_name} 
                        onChange={e => setBrandkitInputs({...brandkitInputs, brand_name: e.target.value})}
                        className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Personalidad</label>
                      <select 
                        value={brandkitInputs.brand_personality} 
                        onChange={e => setBrandkitInputs({...brandkitInputs, brand_personality: e.target.value})}
                        className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                        required
                      >
                        <option value="Competence">Competence</option>
                        <option value="Excitement">Excitement</option>
                        <option value="Sincerity">Sincerity</option>
                        <option value="Sophistication">Sophistication</option>
                        <option value="Ruggedness">Ruggedness</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Dirección Estética</label>
                      <select 
                        value={styleDirection} 
                        onChange={e => setStyleDirection(e.target.value)}
                        className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                        required
                      >
                        <option value="minimal">Minimal (Slate, Sans-serif)</option>
                        <option value="bold">Bold (High contrast, Display)</option>
                        <option value="warm">Warm (Earthy, Serif)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleGenerateIdentity}
                  disabled={loadingIdentity}
                  className="btn-gradient rounded-xl py-3 px-6 font-bold text-xs tracking-wider flex items-center justify-center gap-2 mt-2 text-white shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                  {loadingIdentity ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sintetizando tokens de diseño...</span>
                    </>
                  ) : (
                    <>
                      <span>2. Forjar Identidad de Marca</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    </>
                  )}
                </button>
              </div>

              {/* Step 3: Identity Results */}
              {loadingIdentity && (
                <div className="glass-panel rounded-3xl p-12 text-center border border-indigo-500/20 flex flex-col items-center justify-center gap-6 min-h-[300px] animate-pulse">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin"></div>
                    <Layers className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-gradient font-extrabold text-lg mb-2">Generando Logos y Paletas...</h3>
                    <p className="text-xs text-slate-400">Together AI FLUX está procesando la representación geométrica limpia de tu logo.</p>
                  </div>
                </div>
              )}

              {results && !loadingIdentity && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  {/* Colors & Palette */}
                  <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Paleta de Colores</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {results.palettes.map((color, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => handleCopy(color.hex, `color-${idx}`)}
                          className="glass-card rounded-xl p-3 flex flex-col gap-3 group cursor-pointer hover:border-cyan-500/30 transition-all border border-slate-800"
                        >
                          <div 
                            style={{ backgroundColor: color.hex }} 
                            className="aspect-video w-full rounded-lg shadow-inner relative group-hover:scale-[1.02] transition-all"
                          >
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-all rounded-lg">
                              {copiedText === `color-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[10px] text-white truncate max-w-[80px]">{color.name}</span>
                              <span className="font-mono text-[9px] font-semibold text-cyan-400">{color.hex}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-relaxed">{color.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography & Taglines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Typography */}
                    <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Type className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Tipografía</h3>
                      </div>
                      <div className="flex flex-col gap-3">
                        {results.typography.map((font, idx) => (
                          <div key={idx} className="glass-card rounded-xl p-3 border border-slate-850 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{font.type}</span>
                              <span className="font-mono text-[10px] font-semibold text-cyan-400">{font.name}</span>
                            </div>
                            <div className="my-1 border-t border-slate-900 pb-1">
                              <span 
                                style={{ 
                                  fontFamily: font.name.includes("Montserrat") ? "Montserrat" : font.name.includes("Playfair") ? "Playfair Display" : font.name.includes("Inter") ? "Inter" : "sans-serif",
                                  fontWeight: font.type.includes("Heading") ? "800" : "400"
                                }} 
                                className="text-lg text-white tracking-wide"
                              >
                                Aa Bb {font.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Taglines */}
                    <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Smile className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Líneas de Eslogan</h3>
                      </div>
                      <div className="flex flex-col gap-3">
                        {results.taglines && (
                          <>
                            <div className="glass-card rounded-xl p-3 border border-slate-850 flex items-center justify-between gap-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">English Tagline</span>
                                <span className="text-xs font-semibold italic text-slate-200">"{results.taglines.en}"</span>
                              </div>
                              <button 
                                onClick={() => handleCopy(results.taglines.en, "tag-en")}
                                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                              >
                                {copiedText === "tag-en" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="glass-card rounded-xl p-3 border border-slate-850 flex items-center justify-between gap-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Español Tagline</span>
                                <span className="text-xs font-semibold italic text-slate-200">"{results.taglines.es}"</span>
                              </div>
                              <button 
                                onClick={() => handleCopy(results.taglines.es, "tag-es")}
                                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                              >
                                {copiedText === "tag-es" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Logos Section */}
                  {results.logos && results.logos.length > 0 && (
                    <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Award className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Identidad Geométrica de Logotipo</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto w-full">
                        {results.logos.map((logoUrl, idx) => (
                          <div key={idx} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-slate-800">
                            <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center group overflow-hidden">
                              <img 
                                src={logoUrl} 
                                alt={`Geometric Logo ${idx + 1}`}
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.01]"
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
                            <div className="p-3.5 flex items-center justify-between bg-slate-950/80 border-t border-slate-900">
                              <span className="font-bold text-[10px] tracking-wider uppercase text-slate-400">Concepto Vector #{idx + 1}</span>
                              <a 
                                href={logoUrl} 
                                download={`${brandkitInputs.brand_name.toLowerCase()}-logo.jpg`}
                                className="text-xs font-bold text-cyan-400 hover:text-white transition-all flex items-center gap-1.5 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/40 hover:border-cyan-400/50"
                              >
                                <Download className="w-3.5 h-3.5 animate-bounce" />
                                <span>Descargar JPG</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-900/60 text-center text-[10px] text-slate-500">
        © 2026 Klipso Brand Forge. Powered by together Flux & Gemini Imagen synthesis engines. All rights reserved.
      </footer>
    </main>
  );
}
