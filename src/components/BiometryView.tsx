import React, { useState } from 'react';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Plus,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface BiometryViewProps {
  onOpenNewBiometry: () => void;
}

export const BiometryView: React.FC<BiometryViewProps> = ({ onOpenNewBiometry }) => {
  const { biometries, batches, tanks, addFeedingLog, feedingLogs } = useAquaCore();

  const [feedingTankId, setFeedingTankId] = useState<string>('tank-02');
  const [feedKg, setFeedKg] = useState<number>(30);
  const [feedType, setFeedType] = useState<string>('Extrusada 32% PB - 4.0mm');
  const [feedCost, setFeedCost] = useState<number>(4.85);
  const [showFeedSuccess, setShowFeedSuccess] = useState<boolean>(false);

  const handleFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedingLog({
      tankId: feedingTankId,
      amountKg: feedKg,
      feedType,
      proteinPct: 32,
      costPerKg: feedCost,
    });
    setShowFeedSuccess(true);
    setTimeout(() => setShowFeedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase">
            <Scale className="w-4 h-4" />
            <span>Passo 2 • Registro Invisível & Manejo Nutricional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Auditoria de Biometrias & Conversão Alimentar (FCR)
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Acompanhamento contínuo de amostragem biométrica com cálculo automático de Ganho em Peso Diário (GPD) e alertas de desvio da curva padrão zootécnica.
          </p>
        </div>

        <button
          onClick={onOpenNewBiometry}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nova Biometria</span>
        </button>
      </div>

      {/* Banner Didático e Fácil de Entender */}
      <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">💡 Como funciona para qualquer um entender: </span>
          Fazer biometria é como colocar o camarão na balança do médico para ver quanto ele cresceu! A gente pega alguns camarões com a redinha, pesa na balança de precisão e descobre se eles estão gordinhos e comendo bem. Se estiverem crescendo rápido, significa que a comida e a água estão perfeitas!
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Biometry History with AI notes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            <span>Histórico de Amostragens & Diretrizes Automáticas</span>
          </h2>

          <div className="space-y-3">
            {biometries.map((bio) => {
              const tank = tanks.find((t) => t.id === bio.tankId);
              const batch = batches.find((b) => b.id === bio.batchId);

              return (
                <div
                  key={bio.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      <h3 className="font-bold text-sm text-slate-200">
                        {tank?.name || 'Tanque'}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {batch?.batchCode} ({batch?.species})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(bio.timestamp).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Peso Médio</span>
                      <span className="font-black text-cyan-400 text-base">{bio.avgWeightG} g</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Desvio vs Curva</span>
                      <span
                        className={`font-black text-base ${
                          bio.growthVsBenchmarkPct >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {bio.growthVsBenchmarkPct >= 0 ? '+' : ''}
                        {bio.growthVsBenchmarkPct}%
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Uniformidade</span>
                      <span className="font-black text-slate-200 text-base">{bio.uniformityPct}%</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Amostra</span>
                      <span className="font-black text-slate-200 text-base">{bio.sampleSize} un</span>
                    </div>
                  </div>

                  {/* AI Note Disruption */}
                  {bio.aiActionNote && (
                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-cyan-200 font-medium leading-relaxed">
                        {bio.aiActionNote}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Feeding Entry */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Lançamento Rápido de Ração</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <p className="text-xs text-slate-400 font-mono">
              Alimente o motor de FCR diário. Cada quilo de ração recalculada ajusta a conversão acumulada em tempo real.
            </p>

            {showFeedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ração computada e FCR do lote atualizado!</span>
              </div>
            )}

            <form onSubmit={handleFeedSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Tanque Alvo</label>
                <select
                  value={feedingTankId}
                  onChange={(e) => setFeedingTankId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  {tanks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Quantidade Fornecida (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={feedKg}
                  onChange={(e) => setFeedKg(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Tipo de Ração</label>
                <select
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="Extrusada 32% PB - 4.0mm">Extrusada 32% PB - 4.0mm (Crescimento)</option>
                  <option value="Extrusada 28% PB - 6.0mm Acabamento">Extrusada 28% PB - 6.0mm (Terminação)</option>
                  <option value="Extrusada 36% PB - 2.0mm Juvenil">Extrusada 36% PB - 2.0mm (Pós-larvas)</option>
                  <option value="Bioflocos Camarão 35% PB">Bioflocos Camarão 35% PB Microesferas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Custo Unitário (R$/kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={feedCost}
                  onChange={(e) => setFeedCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                + Registrar Arraçoamento
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
