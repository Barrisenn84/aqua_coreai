import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Scale,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { Biometry } from '../types/aquacore';

interface BiometryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTankId?: string;
}

export const BiometryModal: React.FC<BiometryModalProps> = ({
  isOpen,
  onClose,
  defaultTankId,
}) => {
  const { tanks, batches, addBiometry } = useAquaCore();

  const [tankId, setTankId] = useState<string>(defaultTankId || 'tank-02');
  const [avgWeightG, setAvgWeightG] = useState<number>(685);
  const [sampleSize, setSampleSize] = useState<number>(150);
  const [mortalityCount, setMortalityCount] = useState<number>(3);
  const [uniformityPct, setUniformityPct] = useState<number>(88);
  const [lastLoggedResult, setLastLoggedResult] = useState<Biometry | null>(null);

  if (!isOpen) return null;

  const selectedTank = tanks.find((t) => t.id === tankId);
  const selectedBatch = batches.find((b) => b.tankId === tankId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addBiometry({
      tankId,
      avgWeightG,
      sampleSize,
      mortalityCount,
      uniformityPct,
    });
    setLastLoggedResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Registro de Biometria Semanal
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Validação de Curva de Crescimento & Arraçoamento Invisível
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {!lastLoggedResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tank / Batch Selection */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  Tanque / Lote de Origem
                </label>
                <select
                  value={tankId}
                  onChange={(e) => {
                    setTankId(e.target.value);
                    const b = batches.find((x) => x.tankId === e.target.value);
                    if (b) setAvgWeightG(b.currentWeightG);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {tanks.map((t) => {
                    const b = batches.find((x) => x.tankId === t.id);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} ({b?.batchCode} • {b?.species} • Peso Atual: {b?.currentWeightG}g)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Weight and Sample Count Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                    Peso Médio da Amostra (gramas)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={avgWeightG}
                      onChange={(e) => setAvgWeightG(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                      g/camarão
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Referência anterior: {selectedBatch?.currentWeightG}g
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                    Tamanho da Amostra (unidades)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Recomendado: 100 a 200 camarãos para CV &lt; 5%
                  </span>
                </div>
              </div>

              {/* Mortality and Uniformity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                    Mortalidade Observada (últimos 7 dias)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mortalityCount}
                    onChange={(e) => setMortalityCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    camarãos recolhidos nos controles diários
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                    Uniformidade do Lote (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={uniformityPct}
                      onChange={(e) => setUniformityPct(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    &gt; 80% indica excelente uniformidade de calibre
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Validar Biometria & Gerar Diretriz de Arraçoamento</span>
                </button>
              </div>
            </form>
          ) : (
            /* Result Disruption Card */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/60 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-200">
                    Biometria Processada com Sucesso no AQUA-CORE!
                  </h3>
                  <p className="text-xs text-emerald-300/80 font-mono mt-0.5">
                    Crescimento confrontado em tempo real com curva térmica da espécie ({selectedBatch?.species}).
                  </p>
                </div>
              </div>

              {/* The Disruption Statement */}
              <div className="p-4 rounded-2xl bg-cyan-950/50 border-2 border-cyan-500/70 shadow-xl shadow-cyan-950/40 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Diretriz do Engenheiro AQUA-CORE (Zero Friction)</span>
                </div>

                <p className="text-sm font-semibold text-slate-100 leading-relaxed font-sans">
                  "{lastLoggedResult.aiActionNote}"
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyan-800/50 text-center font-mono">
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Novo Peso Médio</span>
                    <span className="text-sm font-bold text-cyan-300">{lastLoggedResult.avgWeightG} g</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Desvio Curva</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {lastLoggedResult.growthVsBenchmarkPct > 0 ? '+' : ''}
                      {lastLoggedResult.growthVsBenchmarkPct}%
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">FCR Projetado</span>
                    <span className="text-sm font-bold text-blue-300">{lastLoggedResult.fcrCurrent}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setLastLoggedResult(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Registrar Outro Tanque
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  Concluir & Aplicar Manejo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
