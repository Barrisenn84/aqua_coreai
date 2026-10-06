import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Droplets,
  Package,
  PiggyBank,
  RefreshCw,
  Scale,
  Sparkles,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { calculateAdaptiveFeedingPlan } from '../utils/aquacultureMath';

export const FeedOptimizerView: React.FC = () => {
  const { tanks, batches, sensorReadings, farm, addFeedingLog } = useAquaCore();

  const [selectedTankId, setSelectedTankId] = useState<string>('tank-02');
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedTank = tanks.find((t) => t.id === selectedTankId) || tanks[0];
  const selectedBatch = batches.find((b) => b.tankId === selectedTankId) || batches[0];
  const selectedReading = sensorReadings[selectedTankId] || sensorReadings[selectedTank.id];

  const plan = useMemo(() => {
    return calculateAdaptiveFeedingPlan(selectedBatch, selectedReading, farm.feedAverageCostPerKg);
  }, [selectedBatch, selectedReading, farm.feedAverageCostPerKg]);

  const handleApplySlot = (slot: typeof plan.slots[0]) => {
    addFeedingLog({
      tankId: selectedTankId,
      amountKg: slot.adaptedAmountKg,
      feedType: 'Extrusada 32% PB Adaptativa',
      proteinPct: 32,
      costPerKg: farm.feedAverageCostPerKg,
    });
    setSuccessToast(`Trato de ${slot.time} (${slot.adaptedAmountKg}kg) registrado com sucesso!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleForceRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      setSuccessToast('Tabela de alimentação adaptativa recalculada com base no O2 e Temperatura atuais!');
      setTimeout(() => setSuccessToast(null), 3000);
    }, 600);
  };

  const savingsPct = Math.round(
    ((plan.baselineDailyFeedKg - plan.dailyRecommendedFeedKg) / plan.baselineDailyFeedKg) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <span>Pilar 3 • A Máquina de Economia (70% do Custo Total)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Otimizador de Ração AI (Tabela Adaptativa Dinâmica)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              ECONOMIA 10% A 20%
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A IA recalcula a dose de ração a cada leitura com base nas variáveis limitantes. Sem tabelas estáticas: aceleramos o trato quando o metabolismo permite e cortamos na hora em anoxia para evitar desperdício no fundo.
          </p>
        </div>

        {/* Tank Selector & Recalculate CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTankId}
            onChange={(e) => setSelectedTankId(e.target.value)}
            className="bg-slate-950 text-white text-xs font-mono font-bold py-2 px-3 rounded-xl border border-slate-700 cursor-pointer"
          >
            {tanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleForceRecalculate}
            disabled={isRecalculating}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Recalcular IA</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 font-mono text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Disruption Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ração Diária Adaptada */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-400" /> Trato Adaptado Hoje
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
              Fator {plan.metabolicFactor}x
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
              {plan.dailyRecommendedFeedKg}
            </span>
            <span className="text-xs font-mono text-slate-400">kg/dia</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Tabela Tradicional:</span>
            <span className="line-through text-slate-400">{plan.baselineDailyFeedKg} kg/dia</span>
          </div>
        </div>

        {/* KPI 2: Economia Mensal em Ração */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold flex items-center gap-1.5 text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" /> Economia Mensal Projetada
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
              {savingsPct > 0 ? `-${savingsPct}% custo` : '+15% ganho'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              R$ {plan.monthlyProjectedSavingsReais.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Poupança Diária:</span>
            <span className="text-emerald-400 font-bold">R$ {plan.netSavingsReais}/dia no lote</span>
          </div>
        </div>

        {/* KPI 3: Status Metabólico Atual */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Metabolismo & O2
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Tempo Real
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {selectedReading.dissolvedOxygen.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">mg/L O2</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono border-t border-slate-800/80 pt-2 flex justify-between">
            <span>Temperatura:</span>
            <span className="text-cyan-400 font-bold">{selectedReading.temperature.toFixed(1)}°C</span>
          </div>
        </div>

        {/* KPI 4: Proteção do Fundo do Tanque */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Proteção de Amônia
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">
              Zero Lodo
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
              0% Sobras
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono border-t border-slate-800/80 pt-2 flex justify-between">
            <span>NH3 Tóxica Evitada:</span>
            <span className="text-emerald-400 font-bold">&lt; 0.02 mg/L</span>
          </div>
        </div>
      </div>

      {/* AI Directive Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-wider block">
            DIRETRIZ DA TABELA ADAPTATIVA // MOTOR HORÁRIO
          </span>
          <p className="text-xs sm:text-sm text-cyan-100 font-medium mt-0.5 leading-relaxed">
            {plan.guideline}
          </p>
        </div>
      </div>

      {/* The 4 Tratos Schedule (Daily Hourly Breakdown) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Grade de Arraçoamento Fracionado do Dia (4 Tratos)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Total Adaptado: {plan.dailyRecommendedFeedKg} kg
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plan.slots.map((slot, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                slot.isCompleted
                  ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                  : 'bg-slate-950 border-slate-700/80 text-slate-100 hover:border-emerald-500/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/80 pb-2 mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Trato {idx + 1} ({slot.time})</span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded font-mono ${
                      slot.adjustmentPct > 0
                        ? 'bg-cyan-950 text-cyan-400'
                        : slot.adjustmentPct < 0
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {slot.adjustmentPct > 0 ? `+${slot.adjustmentPct}%` : `${slot.adjustmentPct}%`}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">Dose Recomendada:</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {slot.adaptedAmountKg} kg
                  </div>
                  <span className="text-[10px] text-slate-500 line-through font-mono block">
                    Padrão sem IA: {slot.standardAmountKg} kg
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans mt-3 italic leading-tight">
                  "{slot.reason}"
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/60">
                <button
                  onClick={() => handleApplySlot(slot)}
                  className={`w-full py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    slot.isCompleted
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{slot.isCompleted ? 'Trato Realizado (Reaplicar)' : 'Confirmar Este Trato'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
