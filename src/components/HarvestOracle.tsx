import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  DollarSign,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { generateHarvestScenarios } from '../utils/aquacultureMath';

export const HarvestOracle: React.FC = () => {
  const { tanks, batches, sensorReadings, farm, updateFarmSettings } = useAquaCore();

  // Selectable tank (defaults to Tanque 04 or 02)
  const [selectedTankId, setSelectedTankId] = useState<string>('tank-04');
  const [customShrimpPrice, setCustomShrimpPrice] = useState<number>(
    farm.shrimpSalePricePerKg || farm.camarãoSalePricePerKg || farm.fishSalePricePerKg || 0
  );
  const [customFeedPrice, setCustomFeedPrice] = useState<number>(farm.feedAverageCostPerKg || 0);

  const selectedTank = tanks?.find((t) => t.id === selectedTankId) || tanks?.[0];
  const selectedBatch = batches?.find((b) => b.tankId === selectedTankId) || batches?.[0];
  const selectedReading = sensorReadings?.[selectedTankId] || sensorReadings?.[selectedTank?.id || ''];

  if (!selectedTank || !selectedBatch || !selectedReading) {
    return <div className="p-8 text-center text-slate-400">Carregando dados da produção...</div>;
  }

  const hasSalePrice = customShrimpPrice > 0;
  const hasFeedPrice = customFeedPrice > 0;

  // Scenarios are generated only when the required prices are known. The
  // imported Meu Pescado snapshot has no sale-price history, so we must ask
  // the operator instead of inventing a market quote.
  const scenarios = useMemo(() => {
    if (!hasSalePrice || !hasFeedPrice) return [];
    return generateHarvestScenarios(
      selectedBatch,
      selectedTank,
      selectedReading,
      farm.kwhCost || 0.72,
      customFeedPrice,
      customShrimpPrice
    );
  }, [selectedBatch, selectedTank, selectedReading, farm.kwhCost, customFeedPrice, customShrimpPrice, hasSalePrice, hasFeedPrice]);

  if (!hasSalePrice || !hasFeedPrice) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900/90 border border-amber-800/70 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
            <div>
              <h1 className="text-xl font-black text-white">Previsão de despesca aguardando dados comerciais</h1>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl">
                O Meu Pescado não forneceu histórico de preço de venda para este ciclo. Para não fabricar receita ou margem, informe abaixo o preço negociado e o custo médio da ração. A projeção será recalculada no mesmo instante.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-xl">
            <label className="text-xs text-slate-300 font-semibold">
              Preço de venda (R$/kg)
              <input
                type="number"
                min="0"
                step="0.01"
                value={customShrimpPrice || ''}
                onChange={(event) => setCustomShrimpPrice(Number(event.target.value) || 0)}
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                placeholder="Ex.: 18,50"
              />
            </label>
            <label className="text-xs text-slate-300 font-semibold">
              Custo médio da ração (R$/kg)
              <input
                type="number"
                min="0"
                step="0.01"
                value={customFeedPrice || ''}
                onChange={(event) => setCustomFeedPrice(Number(event.target.value) || 0)}
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                placeholder="Ex.: 38,85"
              />
            </label>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Biomassa e lotes importados: fonte Meu Pescado. Preços acima são informados pelo operador e não são cotação automática.</p>
        </div>
      </div>
    );
  }

  const todayScenario = scenarios[0] || {
    dayOffset: 0,
    projectedAvgWeightG: 12,
    projectedFcr: 1.25,
    netProfitReais: 0,
    isOptimalPoint: false,
    projectedBiomassKg: 0,
    accumulatedCostReais: 0,
  };
  const optimalScenario = scenarios.find((s) => s.isOptimalPoint) || scenarios[0] || todayScenario;
  const lateScenario = scenarios[scenarios.length - 1] || todayScenario;

  // Inflection curve calculation for SVG
  const maxNetProfit = Math.max(...scenarios.map((s) => s.netProfitReais));
  const minNetProfit = Math.min(...scenarios.map((s) => s.netProfitReais));
  const profitRange = maxNetProfit - minNetProfit || 1;

  return (
    <div className="space-y-6">
      {/* Header & Tank Selector */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>O Oráculo Financeiro • Maximum Economic Yield (MEY)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Projeção Preditiva de Colheita & Margem Máxima
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Cruza biomassa viva, curvas de crescimento térmico, conversão alimentar (FCR), custos de ração e tarifas energéticas para apontar o dia exato de colheita antes da saturação biológica.
          </p>
        </div>

        {/* Tank Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-mono pl-1">Tanque:</span>
          <select
            value={selectedTankId}
            onChange={(e) => setSelectedTankId(e.target.value)}
            className="bg-slate-900 text-white text-xs font-mono font-bold py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {tanks.map((t) => {
              const b = batches.find((x) => x.tankId === t.id);
              return (
                <option key={t.id} value={t.id}>
                  {t.name} ({b?.species} • D+{b?.cycleDay})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Resumo calculado do ciclo selecionado */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Resumo calculado do ciclo</h2>
          </div>
          <span className="text-xs text-cyan-300 font-bold bg-cyan-950/70 px-2.5 py-1 rounded-lg border border-cyan-800/60">Fonte: lote e biometria importados</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span className="text-[10px] text-slate-400 uppercase block">Tanques</span><span className="text-2xl font-black text-white">{tanks.length}</span><span className="text-[10px] text-slate-500 block mt-0.5">cadastrados</span></div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span className="text-[10px] text-slate-400 uppercase block">População atual</span><span className="text-2xl font-black text-cyan-400">{selectedBatch.currentCount.toLocaleString('pt-BR')} <span className="text-xs text-slate-400">un.</span></span><span className="text-[10px] text-slate-500 block mt-0.5">tanque selecionado</span></div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span className="text-[10px] text-slate-400 uppercase block">Biomassa atual</span><span className="text-2xl font-black text-emerald-400">{todayScenario.projectedBiomassKg.toLocaleString('pt-BR')} <span className="text-xs text-slate-400">kg</span></span><span className="text-[10px] text-slate-500 block mt-0.5">calculada do peso médio</span></div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-800/80 bg-amber-950/20"><span className="text-[10px] text-amber-400 uppercase font-bold block">Janela calculada</span><span className="text-2xl font-black text-amber-300">D+{optimalScenario.dayOffset}</span><span className="text-[10px] text-amber-200/70 block mt-0.5">{optimalScenario.targetDate}</span></div>
        </div>
        <div className="text-[11px] text-slate-400">Preço utilizado: R$ {customShrimpPrice.toFixed(2)}/kg · ração: R$ {customFeedPrice.toFixed(2)}/kg · tarifa: R$ {(farm.kwhCost || 0).toFixed(2)}/kWh. Ajuste os valores acima para simular outro cenário.</div>
      </div>

      {/* Disruption Comparison Card (Today vs Optimal vs Late) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scenario 1: Today */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Cenário A: Despesca Imediata</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Hoje</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black font-mono text-white">
                R$ {todayScenario.netProfitReais.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-slate-500 font-mono block mt-1">Lucro Líquido Realizável</span>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono border-t border-slate-800/80 pt-3 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Biomassa Total:</span>
                <span className="font-bold">{todayScenario.projectedBiomassKg.toLocaleString('pt-BR')} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Peso Médio:</span>
                <span className="font-bold">{todayScenario.projectedAvgWeightG} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preço Mercado:</span>
                <span className="font-bold">R$ {todayScenario.marketPricePerKg.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FCR Atual:</span>
                <span className="font-bold text-cyan-400">{todayScenario.projectedFcr}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            {todayScenario.verdict}
          </div>
        </div>

        {/* Scenario 2: Optimal Inflection Point (MEY) */}
        <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-amber-950/30 border-2 border-amber-500/80 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xl shadow-amber-950/40 ring-1 ring-amber-400/40">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black uppercase font-mono px-3 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            <span>PONTO ÓTIMO RECOMENDADO</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 font-bold uppercase">Cenário B: Ponto de Máxima Eficiência</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                {optimalScenario.targetDate} (D+{optimalScenario.dayOffset})
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black font-mono text-amber-300">
                R$ {optimalScenario.netProfitReais.toLocaleString('pt-BR')}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-xs">
                <span className="text-emerald-400 font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +R$ {optimalScenario.profitDeltaVsTodayReais.toLocaleString('pt-BR')}
                </span>
                <span className="text-slate-400">sobre colher hoje</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono border-t border-amber-800/40 pt-3 text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Biomassa Projetada:</span>
                <span className="font-bold text-amber-200">
                  {optimalScenario.projectedBiomassKg.toLocaleString('pt-BR')} kg (+
                  {(((optimalScenario.projectedBiomassKg - todayScenario.projectedBiomassKg) / todayScenario.projectedBiomassKg) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peso Médio Previsto:</span>
                <span className="font-bold text-amber-200">{optimalScenario.projectedAvgWeightG} g (Ágio Filé)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Custo Ração Adicional:</span>
                <span className="font-bold text-slate-300">R$ {optimalScenario.feedCostAdditionalReais.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">FCR Projetado:</span>
                <span className="font-bold text-emerald-400">{optimalScenario.projectedFcr}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-[11px] text-amber-200/90 font-medium">
            {optimalScenario.verdict}
          </div>
        </div>

        {/* Scenario 3: Late Harvest (Excess days) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Cenário C: Retardar em Demasia</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">D+30</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black font-mono text-slate-200">
                R$ {lateScenario.netProfitReais.toLocaleString('pt-BR')}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-red-400">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>
                  -R$ {(optimalScenario.netProfitReais - lateScenario.netProfitReais).toLocaleString('pt-BR')} vs Ponto Ótimo
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono border-t border-slate-800/80 pt-3 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Biomassa Máxima:</span>
                <span className="font-bold">{lateScenario.projectedBiomassKg.toLocaleString('pt-BR')} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Peso Médio:</span>
                <span className="font-bold">{lateScenario.projectedAvgWeightG} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Degradação de FCR:</span>
                <span className="font-bold text-red-400">{lateScenario.projectedFcr} (Ineficiente)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Custo Total Acumulado:</span>
                <span className="font-bold text-slate-400">R$ {lateScenario.accumulatedCostTotalReais.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            {lateScenario.verdict}
          </div>
        </div>
      </div>

      {/* AQUA-CORE Official Engineer Directive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3 text-xs font-mono text-cyan-400 font-bold uppercase">
          <Coins className="w-4 h-4" />
          <span>Diretriz do Engenheiro AQUA-CORE AI (Decisão de Ouro)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50">
            <span className="text-[10px] font-black uppercase text-cyan-400 font-mono tracking-wider block">
              AÇÃO RECOMENDADA
            </span>
            <p className="text-sm font-bold text-slate-100 mt-1">
              Agendar despesca do {selectedTank.name} para o dia {optimalScenario.targetDate} (D+{optimalScenario.dayOffset}).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider block">
              JUSTIFICATIVA TÉCNICA
            </span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O lote atinge {optimalScenario.projectedAvgWeightG}g no dia D+{optimalScenario.dayOffset}, desbloqueando a bonificação de camarão pesado com FCR em {optimalScenario.projectedFcr}. Após esse dia, cada 1 kg de ração adicionado produz menos receita do que seu custo.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
            <span className="text-[10px] font-black uppercase text-emerald-400 font-mono tracking-wider block">
              RESULTADO ESPERADO
            </span>
            <p className="text-sm font-bold text-emerald-300 mt-1">
              Maximização do lucro líquido em R$ {optimalScenario.netProfitReais.toLocaleString('pt-BR')} (+R$ {optimalScenario.profitDeltaVsTodayReais.toLocaleString('pt-BR')} sobre colheita imediata).
            </p>
          </div>
        </div>
      </div>

      {/* Inflection Curve Graphic & Full Scenario Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Curva de Rendimento Econômico Marginal (30 Dias)</span>
          </h2>

          {/* Interactive Sensitivity Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Preço Venda:</span>
              <input
                type="number"
                step="0.10"
                value={customShrimpPrice}
                onChange={(e) => setCustomShrimpPrice(Number(e.target.value))}
                className="w-16 bg-slate-900 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-slate-700 text-right focus:outline-none"
              />
              <span className="text-slate-500">R$/kg</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Custo Ração:</span>
              <input
                type="number"
                step="0.10"
                value={customFeedPrice}
                onChange={(e) => setCustomFeedPrice(Number(e.target.value))}
                className="w-16 bg-slate-900 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-slate-700 text-right focus:outline-none"
              />
              <span className="text-slate-500">R$/kg</span>
            </div>
          </div>
        </div>

        {/* SVG Inflection Chart */}
        <div className="w-full bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 mb-6">
          <div className="h-44 w-full relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 150">
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="25" x2="700" y2="25" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="75" x2="700" y2="75" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="125" x2="700" y2="125" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />

              {/* Area polygon */}
              {(() => {
                const points = scenarios.map((s, idx) => {
                  const x = (idx / (scenarios.length - 1)) * 700;
                  const normalized = (s.netProfitReais - minNetProfit) / profitRange;
                  const y = 140 - normalized * 110;
                  return `${x},${y}`;
                });
                const areaPoints = `0,145 ${points.join(' ')} 700,145`;
                return <polygon points={areaPoints} fill="url(#profitGrad)" />;
              })()}

              {/* Polyline */}
              {(() => {
                const points = scenarios.map((s, idx) => {
                  const x = (idx / (scenarios.length - 1)) * 700;
                  const normalized = (s.netProfitReais - minNetProfit) / profitRange;
                  const y = 140 - normalized * 110;
                  return `${x},${y}`;
                }).join(' ');
                return <polyline fill="none" stroke="#f59e0b" strokeWidth="3" points={points} />;
              })()}

              {/* Optimal Point marker & Pin */}
              {(() => {
                const optIdx = scenarios.findIndex((s) => s.isOptimalPoint);
                if (optIdx === -1) return null;
                const x = (optIdx / (scenarios.length - 1)) * 700;
                const normalized = (optimalScenario.netProfitReais - minNetProfit) / profitRange;
                const y = 140 - normalized * 110;

                return (
                  <g>
                    <line x1={x} y1="0" x2={x} y2="145" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx={x} cy={y} r="7" fill="#fbbf24" className="animate-ping" opacity="0.7" />
                    <circle cx={x} cy={y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <text x={x} y={y - 12} fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      ★ MEY: R$ {optimalScenario.netProfitReais.toLocaleString('pt-BR')} ({optimalScenario.targetDate})
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            <span>Hoje (D+0)</span>
            <span>D+7</span>
            <span>D+14</span>
            <span>D+21</span>
            <span>D+30 (Fim de Ciclo)</span>
          </div>
        </div>

        {/* Detailed Scenario Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Data / Offset</th>
                <th className="py-2.5 px-3">Peso Médio</th>
                <th className="py-2.5 px-3">Biomassa (kg)</th>
                <th className="py-2.5 px-3">Preço R$/kg</th>
                <th className="py-2.5 px-3">Receita Bruta</th>
                <th className="py-2.5 px-3">FCR Proj.</th>
                <th className="py-2.5 px-3">Lucro Líquido</th>
                <th className="py-2.5 px-3 text-right">Delta vs Hoje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scenarios.map((sc) => (
                <tr
                  key={sc.dayOffset}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    sc.isOptimalPoint ? 'bg-amber-950/20 font-bold text-amber-200' : 'text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-1.5">
                    {sc.isOptimalPoint && <span className="text-amber-400 font-bold">★</span>}
                    <span>{sc.label}</span>
                  </td>
                  <td className="py-2.5 px-3">{sc.projectedAvgWeightG} g</td>
                  <td className="py-2.5 px-3">{sc.projectedBiomassKg.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3">R$ {sc.marketPricePerKg.toFixed(2)}</td>
                  <td className="py-2.5 px-3">R$ {sc.grossRevenueReais.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3">
                    <span className={sc.projectedFcr > 1.5 ? 'text-red-400' : 'text-emerald-400'}>
                      {sc.projectedFcr}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold">R$ {sc.netProfitReais.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={
                        sc.profitDeltaVsTodayReais > 0
                          ? 'text-emerald-400'
                          : sc.profitDeltaVsTodayReais < 0
                          ? 'text-red-400'
                          : 'text-slate-500'
                      }
                    >
                      {sc.profitDeltaVsTodayReais > 0 ? '+' : ''}
                      R$ {sc.profitDeltaVsTodayReais.toLocaleString('pt-BR')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
