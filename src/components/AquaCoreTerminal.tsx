import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  DollarSign,
  Droplets,
  Flame,
  Layers,
  Send,
  ShieldAlert,
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { AquaCoreDiagnosticResult } from '../types/aquacore';
import { requestAquaCoreAnalysis } from '../services/geminiService';

interface AquaCoreTerminalProps {
  initialTankId?: string;
}

export const AquaCoreTerminal: React.FC<AquaCoreTerminalProps> = ({ initialTankId }) => {
  const { tanks, batches, sensorReadings, farm, activeTankId, setActiveTankId } = useAquaCore();

  const [selectedTankId, setSelectedTankId] = useState<string>(initialTankId || activeTankId || 'tank-04');
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<AquaCoreDiagnosticResult | null>(null);

  const currentTank = tanks.find((t) => t.id === selectedTankId) || tanks[0];
  const currentBatch = batches.find((b) => b.tankId === selectedTankId) || batches[0];
  const currentReading = sensorReadings[selectedTankId] || sensorReadings[currentTank.id];

  // Run initial diagnostic on mount or tank change
  const handleRunDiagnostic = async (customQuery?: string) => {
    setLoading(true);
    try {
      const result = await requestAquaCoreAnalysis({
        tank: currentTank,
        batch: currentBatch,
        reading: currentReading,
        customPrompt: customQuery,
        contextMode: 'cot_audit',
      });
      setDiagnosticResult(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunDiagnostic();
  }, [selectedTankId]);

  const handlePreset = (presetText: string) => {
    setUserInput(presetText);
    handleRunDiagnostic(presetText);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    handleRunDiagnostic(userInput);
  };

  return (
    <div className="space-y-6">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Engenharia de Produção Aquícola & Analista Preditivo de Elite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Terminal Técnico AQUA-CORE AI</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
              CHAIN OF THOUGHT ENGINE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Processamento em cadeia estrita: Dado → Baseline Técnica → Desvio → Análise de Risco → Ação Corretiva Imediata → Projeção de Impacto Financeiro.
          </p>
        </div>

        {/* Tank Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-mono pl-1">Auditar Tanque:</span>
          <select
            value={selectedTankId}
            onChange={(e) => {
              setSelectedTankId(e.target.value);
              setActiveTankId(e.target.value);
            }}
            className="bg-slate-900 text-white text-xs font-mono font-bold py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            {tanks.map((t) => {
              const b = batches.find((x) => x.tankId === t.id);
              return (
                <option key={t.id} value={t.id}>
                  {t.name} ({b?.species} • O2: {sensorReadings[t.id]?.dissolvedOxygen.toFixed(1)} mg/L)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Preset Case Buttons */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
          Casos Rápidos de Campo (Auditoria de Engenharia):
        </span>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() =>
              handlePreset('Tanque 01 com Oxigênio em 3.6 mg/L (limite dinâmico 4.0 mg/L por temp 29.8°C). Avaliar risco de mortalidade de PLs.')
            }
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 transition-all flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>🚨 Alerta Crítico O₂ (3.6 mg/L em PLs)</span>
          </button>

          <button
            onClick={() =>
              handlePreset('Compensa realizar a despesca imediata na Grade Padrão (R$ 8,90/kg) ou segurar 10 dias para Grade Especial (R$ 10,25/kg)?')
            }
            className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 transition-all flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>💰 Consultoria Mercado (Padrão vs Especial)</span>
          </button>

          <button
            onClick={() =>
              handlePreset('Tanque 04 com pH 8.35, temperatura 29.8°C e amônia total em 1.15 mg/L em Camarão Vannamei no Polo de Mogeiro.')
            }
            className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/80 transition-all flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <Flame className="w-3.5 h-3.5 text-blue-400" />
            <span>🧪 Amônia e Estresse Osmótico</span>
          </button>

          <button
            onClick={() =>
              handlePreset('Resumo matinal Fazenda River Life: 34°C sensação térmica, chuva prevista 0,8mm e vento 16km/h.')
            }
            className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 transition-all flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>☀️ Daily Digest Mogeiro / PB</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">AQUA-CORE-EXEC // AUDITORIA_TELEMETRIA</span>
            <span className="text-slate-500">[{currentTank.name}]</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CORE PRONTO
            </span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-5 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 font-mono">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-purple-300">
                Processando Chain of Thought Aquícola...
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Calculando Emerson NH3, balanço de oxigenação, coeficientes térmicos e rentabilidade marginal.
              </p>
            </div>
          ) : diagnosticResult ? (
            <div className="space-y-6 animate-fade-in">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {diagnosticResult.quickMetrics.map((qm, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border font-mono ${
                      qm.status === 'crit'
                        ? 'bg-red-950/40 border-red-700/60 text-red-300'
                        : qm.status === 'warn'
                        ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase text-slate-400 block">{qm.label}</span>
                    <span className="text-base font-black tracking-tight">{qm.value}</span>
                  </div>
                ))}
              </div>

              {/* Chain of Thought Breakdown (The 6 Steps) */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cadeia Operacional de Raciocínio (Chain of Thought):</span>
                </span>

                <div className="space-y-2.5 font-mono text-xs">
                  {diagnosticResult.chainOfThought.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                        step.severity === 'danger'
                          ? 'bg-red-950/30 border-red-800/80 text-red-200'
                          : step.severity === 'warning'
                          ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                          : step.severity === 'success'
                          ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase shrink-0 font-mono ${
                          step.severity === 'danger'
                            ? 'bg-red-500 text-white'
                            : step.severity === 'warning'
                            ? 'bg-amber-500 text-slate-950'
                            : step.severity === 'success'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {step.step}
                      </span>
                      <div>
                        <strong className="block font-bold text-slate-100 text-xs mb-0.5">
                          {step.title}
                        </strong>
                        <p className="leading-relaxed opacity-95">{step.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Format Output: Ação -> Justificativa -> Resultado Esperado */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/70 border-2 border-purple-500/70 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>Decisão de Ouro do Engenheiro AQUA-CORE</span>
                </div>

                <div className="space-y-3 font-sans">
                  {/* Ação */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-purple-800/50">
                    <span className="text-[11px] font-black uppercase text-purple-400 font-mono tracking-wider block">
                      AÇÃO CORRETIVA IMEDIATA
                    </span>
                    <p className="text-base font-black text-white mt-1">
                      {diagnosticResult.action}
                    </p>
                  </div>

                  {/* Justificativa */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-black uppercase text-slate-400 font-mono tracking-wider block">
                      JUSTIFICATIVA TÉCNICA
                    </span>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {diagnosticResult.justification}
                    </p>
                  </div>

                  {/* Resultado Esperado */}
                  <div className="bg-emerald-950/50 p-3.5 rounded-xl border border-emerald-700/60">
                    <span className="text-[11px] font-black uppercase text-emerald-400 font-mono tracking-wider block">
                      RESULTADO ESPERADO & IMPACTO FINANCEIRO
                    </span>
                    <p className="text-sm font-bold text-emerald-300 mt-1">
                      {diagnosticResult.expectedResult}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Interactive Prompt Form */}
          <form onSubmit={handleFormSubmit} className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Envie dados brutos de sensores ou consulte o Engenheiro de Produção:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ex: Tanque 4 com O2 em 2.2 mg/L, pH 7.8 e ração suspensa..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Processar CoT</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
