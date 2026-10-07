import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Scale,
  Sparkles,
  Calculator,
  Sliders,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Percent,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const MarketScenariosSimulator: React.FC = () => {
  const { farm, batches, tanks } = useAquaCore();

  // Dados reais agregados dos lotes povoados da fazenda (Meu Pescado)
  const totalStockedCount = useMemo(() => {
    return batches.reduce((acc, b) => acc + (b.currentCount || 0), 0) || 380000;
  }, [batches]);

  // Biomassa técnica atual no sistema (fase inicial de berçário = 3,53 kg)
  const currentBiomassTechnicalKg = useMemo(() => {
    return 3.53;
  }, []);

  // Estado dos controles de simulação
  const [selectedPricePerKg, setSelectedPricePerKg] = useState<number>(24.50); // Preço médio Polo Paraíba
  const [simulatedFcr, setSimulatedFcr] = useState<number>(1.30); // Meta de FCA padrão Vannamei
  const [targetWeightG, setTargetWeightG] = useState<number>(15.0); // Gramatura alvo comercial
  const [simulationMode, setSimulationMode] = useState<'harvest' | 'technical_current'>('harvest');
  const [survivalRatePct, setSurvivalRatePct] = useState<number>(95.0); // Sobrevivência projetada até despesca
  const [feedCostPerKg, setFeedCostPerKg] = useState<number>(farm.feedAverageCostPerKg || 4.20); // Custo médio de ração

  // Custos acumulados reais no ciclo (conforme sistema Meu Pescado)
  const initialStockingCostRs = 3800.00; // 4 aquisições de pós-larvas (1000 + 1000 + 1000 + 800)
  const initialFertilizationCostRs = 60.50; // Fertilizante DECOSOLO aplicado (16,50 + 16,50 + 16,50 + 11,00)
  const currentSpentInCultivationRs = initialStockingCostRs + initialFertilizationCostRs; // R$ 3.860,50

  // Cálculo da biomassa simulada
  const activeBiomassKg = useMemo(() => {
    if (simulationMode === 'technical_current') {
      return currentBiomassTechnicalKg;
    }
    // Modo de despesca: População * Sobrevivência * Peso médio / 1000
    const effectiveHarvestFish = totalStockedCount * (survivalRatePct / 100);
    return Number(((effectiveHarvestFish * targetWeightG) / 1000).toFixed(2));
  }, [simulationMode, currentBiomassTechnicalKg, totalStockedCount, survivalRatePct, targetWeightG]);

  // Cálculos financeiros do cenário
  const financials = useMemo(() => {
    // 1. Faturamento Bruto
    const grossRevenue = activeBiomassKg * selectedPricePerKg;

    // 2. Ração Necessária e Custo Estimado de Ração
    // Ganho de peso líquido projetado = biomassa final - biomassa inicial (3,53kg)
    const netWeightGainKg = Math.max(0, activeBiomassKg - currentBiomassTechnicalKg);
    const estimatedFeedKg = netWeightGainKg * simulatedFcr;
    const estimatedFeedCost = estimatedFeedKg * feedCostPerKg;

    // 3. Custos Operacionais Fixos Projetados (Energia aeradores + Mão de obra distribuída no ciclo de 75 dias)
    // 4 aeradores de 2.2kW nos viveiros povoados rodando 10h/dia a R$ 0,72/kWh
    const daysRemaining = simulationMode === 'harvest' ? 55 : 0;
    const energyCostProjected = daysRemaining > 0 ? (4 * 2.2 * 10 * 0.72 * daysRemaining) : 0;
    const otherVariableCosts = activeBiomassKg * 0.40; // Probióticos, despesca e gelo

    // 4. Custo Total do Ciclo
    const totalCycleCost = currentSpentInCultivationRs + estimatedFeedCost + energyCostProjected + otherVariableCosts;

    // 5. Lucro Líquido / EBITDA Projetado
    const projectedProfit = grossRevenue - totalCycleCost;
    const netMarginPct = grossRevenue > 0 ? (projectedProfit / grossRevenue) * 100 : 0;

    // 6. Indicadores de Break-Even (Ponto de Equilíbrio)
    const breakevenPricePerKg = activeBiomassKg > 0 ? totalCycleCost / activeBiomassKg : 0;
    const breakevenBiomassKg = selectedPricePerKg > 0 ? totalCycleCost / selectedPricePerKg : 0;
    const costPerKgProduced = activeBiomassKg > 0 ? totalCycleCost / activeBiomassKg : 0;

    return {
      grossRevenue,
      estimatedFeedKg,
      estimatedFeedCost,
      energyCostProjected,
      otherVariableCosts,
      totalCycleCost,
      projectedProfit,
      netMarginPct,
      breakevenPricePerKg,
      breakevenBiomassKg,
      costPerKgProduced,
    };
  }, [
    activeBiomassKg,
    selectedPricePerKg,
    currentBiomassTechnicalKg,
    simulatedFcr,
    feedCostPerKg,
    simulationMode,
    currentSpentInCultivationRs,
  ]);

  // Matriz de Sensibilidade: 5 faixas de preço x 3 faixas de FCR
  const sensitivityMatrix = useMemo(() => {
    const priceLevels = [18.00, 21.50, 24.50, 28.00, 32.00];
    const fcrLevels = [
      { label: 'Otimista (1.15)', value: 1.15 },
      { label: 'Meta Técnica (1.30)', value: 1.30 },
      { label: 'Estressado (1.55)', value: 1.55 },
    ];

    return priceLevels.map((p) => {
      const row = {
        price: p,
        scenarios: fcrLevels.map((f) => {
          const feedKg = (activeBiomassKg - currentBiomassTechnicalKg) * f.value;
          const feedCost = Math.max(0, feedKg * feedCostPerKg);
          const energy = simulationMode === 'harvest' ? (4 * 2.2 * 10 * 0.72 * 55) : 0;
          const totalCost = currentSpentInCultivationRs + feedCost + energy + (activeBiomassKg * 0.40);
          const revenue = activeBiomassKg * p;
          const profit = revenue - totalCost;
          const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
          return {
            fcr: f.value,
            profit,
            margin,
          };
        }),
      };
      return row;
    });
  }, [activeBiomassKg, currentBiomassTechnicalKg, feedCostPerKg, simulationMode, currentSpentInCultivationRs]);

  // Preset rápido de preços
  const pricePresets = [
    { label: 'Porta da Fazenda', price: 18.00, badge: 'Conservador' },
    { label: 'Atacado PE/PB', price: 21.50, badge: 'Regional' },
    { label: 'Média Polo PB', price: 24.50, badge: 'Cepea / SIF' },
    { label: 'Calibre 15-18g', price: 28.00, badge: 'Qualidade +' },
    { label: 'Premium Especial', price: 32.00, badge: 'Gourmet' },
  ];

  // Parecer de IA Comercial Dinâmico
  const aiCommercialOpinion = useMemo(() => {
    const isProfitable = financials.projectedProfit > 0;
    const fcrSens = ((activeBiomassKg * 0.10) * feedCostPerKg).toFixed(0);

    if (simulationMode === 'technical_current') {
      return {
        title: 'Diagnóstico Contábil de Fase Inicial (Pós-Larvas)',
        summary: `A biomassa técnica atual é de 3,53 kg com investimento realizado de R$ 3.860,50 (R$ 3.800 de larvas + R$ 60,50 de DECOSOLO). O sistema está em fase de berçário inicial. Alterne para o modo 'Despesca Comercial Projetada' para simular a liquidação comercial da safra.`,
        recommendation: 'Manter foco em sobrevivência e monitoramento de qualidade de água antes de fechar contratos antecipados.',
        alertLevel: 'info',
      };
    }

    if (financials.netMarginPct >= 50) {
      return {
        title: 'Excelente Margem Comercial • Janela de Alta Rentabilidade',
        summary: `No preço simulado de R$ ${selectedPricePerKg.toFixed(2)}/kg e FCA de ${simulatedFcr.toFixed(2)}, o lucro projetado é de R$ ${financials.projectedProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} (Margem Líquida de ${financials.netMarginPct.toFixed(1)}%). Cada redução de 0.1 no FCA adicionará cerca de R$ ${fcrSens} de lucro líquido na sua conta.`,
        recommendation: `Oportunidade ideal para travar contrato de venda futura no Market-Bridge a partir de R$ ${Math.max(22, selectedPricePerKg - 1.5).toFixed(2)}/kg, garantindo receita sólida e margem superior a 50%.`,
        alertLevel: 'success',
      };
    } else if (isProfitable) {
      return {
        title: 'Margem Moderada • Atenção ao Controle de Arraçoamento',
        summary: `Lucro projetado de R$ ${financials.projectedProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} com margem de ${financials.netMarginPct.toFixed(1)}%. Seu preço de equilíbrio (break-even) é de R$ ${financials.breakevenPricePerKg.toFixed(2)}/kg.`,
        recommendation: `Ajuste as bandejas de alimentação para aproximar o FCA de 1.15 a 1.25, o que agregará R$ ${fcrSens} de resultado positivo e aumentará a margem líquida.`,
        alertLevel: 'warning',
      };
    } else {
      return {
        title: 'Cenário de Alerta de Prejuízo • Preço Abaixo do Custo',
        summary: `O preço de R$ ${selectedPricePerKg.toFixed(2)}/kg está abaixo do custo de produção projetado de R$ ${financials.costPerKgProduced.toFixed(2)}/kg. Prejuízo estimado de R$ ${Math.abs(financials.projectedProfit).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.`,
        recommendation: `Não comercialize abaixo de R$ ${financials.breakevenPricePerKg.toFixed(2)}/kg. Busque compradores homologados no Market-Bridge com ágio para calibre comercial superior.`,
        alertLevel: 'critical',
      };
    }
  }, [financials, selectedPricePerKg, simulatedFcr, simulationMode, activeBiomassKg, feedCostPerKg]);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase font-mono bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950">
              MÓDULO EXECUTIVO
            </span>
            <span className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Cenários de Mercado & Sensibilidade Financeira
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            Simulador de Lucro Projetado vs. Faixas de Preço de Venda
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Simula em tempo real o faturamento bruto, custos com ração por FCA, margem EBITDA e ponto de equilíbrio com base nas 380.000 PLs povoadas na Fazenda River Life (Mogeiro - PB).
          </p>
        </div>

        {/* Alternador de Modo de Simulação */}
        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0 self-start lg:self-center font-mono text-xs">
          <button
            onClick={() => setSimulationMode('harvest')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              simulationMode === 'harvest'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Despesca Projetada ({activeBiomassKg > 100 ? `${(activeBiomassKg / 1000).toFixed(2)} t` : '5,4 t'})</span>
          </button>
          <button
            onClick={() => setSimulationMode('technical_current')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              simulationMode === 'technical_current'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Biomassa Atual (3,53 kg)</span>
          </button>
        </div>
      </div>

      {/* Grid de Controles Interativos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Painel de Controles: Faixa de Preço e Parâmetros Zootécnicos (7 colunas) */}
        <div className="lg:col-span-7 space-y-5 bg-slate-950/70 p-4 sm:p-5 rounded-xl border border-slate-800/80">
          {/* Controle 1: Faixa de Preço de Venda do Pescado (R$/kg) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Faixa de Preço de Venda do Camarão (R$/kg)</span>
              </label>
              <div className="flex items-baseline gap-1 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-lg">
                <span className="text-xs text-emerald-300 font-bold">R$</span>
                <span className="text-xl font-black text-emerald-300 font-mono">
                  {selectedPricePerKg.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">/kg</span>
              </div>
            </div>

            {/* Slider de Preço */}
            <div className="space-y-1">
              <input
                type="range"
                min="14.00"
                max="36.00"
                step="0.50"
                value={selectedPricePerKg}
                onChange={(e) => setSelectedPricePerKg(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>R$ 14,00 (Mínimo Estresse)</span>
                <span>R$ 25,00 (Média Regional)</span>
                <span>R$ 36,00 (Premium Especial)</span>
              </div>
            </div>

            {/* Presets Rápidos de Mercado */}
            <div className="flex flex-wrap gap-2 pt-1">
              {pricePresets.map((preset) => (
                <button
                  key={preset.price}
                  onClick={() => setSelectedPricePerKg(preset.price)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
                    selectedPricePerKg === preset.price
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/60 font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{preset.label}:</span>
                  <strong className="text-white">R$ {preset.price.toFixed(2)}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Controle 2: Fator de Conversão Alimentar (FCA / FCR) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Eficiência Alimentar (FCA / FCR Projetado)</span>
              </label>
              <div className="flex items-baseline gap-1 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-lg">
                <span className="text-xl font-black text-cyan-300 font-mono">
                  {simulatedFcr.toFixed(2)}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">: 1</span>
              </div>
            </div>

            {/* Presets de FCR */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSimulatedFcr(1.15)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  simulatedFcr === 1.15
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-slate-400">Otimista</div>
                <div className="text-sm font-bold text-white font-mono">FCA 1.15</div>
                <div className="text-[9px] text-cyan-400 mt-0.5">Bandejas 100% limpas</div>
              </button>

              <button
                onClick={() => setSimulatedFcr(1.30)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  simulatedFcr === 1.30
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-slate-400">Meta Padrão</div>
                <div className="text-sm font-bold text-white font-mono">FCA 1.30</div>
                <div className="text-[9px] text-emerald-400 mt-0.5">Padrão Polo Paraíba</div>
              </button>

              <button
                onClick={() => setSimulatedFcr(1.55)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  simulatedFcr === 1.55
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-slate-400">Conservador</div>
                <div className="text-sm font-bold text-white font-mono">FCA 1.55</div>
                <div className="text-[9px] text-amber-400 mt-0.5">Com sobras leves</div>
              </button>
            </div>

            {/* Slider de FCA */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min="1.00"
                max="2.00"
                step="0.05"
                value={simulatedFcr}
                onChange={(e) => setSimulatedFcr(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1.00 (Excepcional)</span>
                <span>1.30 (Benchmark)</span>
                <span>2.00 (Crítico)</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Controle 3: Parâmetros Zootécnicos de Despesca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Peso Médio na Despesca */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase font-mono flex items-center justify-between">
                <span>Gramatura Alvo</span>
                <span className="text-cyan-400 font-mono">{targetWeightG}g</span>
              </label>
              <div className="flex gap-2">
                {[12, 15, 18, 20].map((w) => (
                  <button
                    key={w}
                    onClick={() => setTargetWeightG(w)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                      targetWeightG === w
                        ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {w}g
                  </button>
                ))}
              </div>
            </div>

            {/* Sobrevivência Estimada */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase font-mono flex items-center justify-between">
                <span>Sobrevivência Projetada</span>
                <span className="text-emerald-400 font-mono">{survivalRatePct}%</span>
              </label>
              <div className="flex gap-2">
                {[85, 90, 95, 100].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSurvivalRatePct(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                      survivalRatePct === s
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Resultados Financeiros & Lucro Líquido (5 colunas) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Card Principal: Lucro Líquido Projetado */}
          <div className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
            financials.projectedProfit >= 0
              ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-cyan-950/60 border-emerald-500/70 shadow-emerald-950/50'
              : 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-red-950/60 border-rose-500/70 shadow-rose-950/50'
          } shadow-xl`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Lucro Líquido Projetado (EBITDA)</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${
                financials.projectedProfit >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {financials.netMarginPct.toFixed(1)}% MARGEM
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-400 font-mono">R$</span>
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                financials.projectedProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'
              }`}>
                {financials.projectedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Base: {activeBiomassKg.toLocaleString('pt-BR')} kg a R$ {selectedPricePerKg.toFixed(2)}/kg
            </p>
          </div>

          {/* DRE Sintético do Cenário */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> Faturamento Bruto:
              </span>
              <span className="font-black text-white text-sm">
                R$ {financials.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>(-) Ração Estimada ({financials.estimatedFeedKg.toFixed(0)} kg @ R$ {feedCostPerKg.toFixed(2)}):</span>
              <span className="font-bold text-amber-300">
                -R$ {financials.estimatedFeedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>(-) Pós-Larvas & Fertilizante (Investido):</span>
              <span className="font-bold text-amber-400">
                -R$ {currentSpentInCultivationRs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>(-) Energia & Custos Operacionais:</span>
              <span className="font-bold text-slate-300">
                -R$ {(financials.energyCostProjected + financials.otherVariableCosts).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-200 pt-2 border-t border-slate-800 font-bold">
              <span>(=) Custo Total do Ciclo:</span>
              <span className="font-black text-rose-300">
                R$ {financials.totalCycleCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Métricas de Break-Even (Ponto de Equilíbrio) */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Preço de Equilíbrio</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-cyan-300">
                  R$ {financials.breakevenPricePerKg.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">/kg</span>
              </div>
              <span className="text-[9px] text-slate-500 block">Preço mín. p/ lucro zero</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Custo Médio / kg</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-amber-300">
                  R$ {financials.costPerKgProduced.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">/kg</span>
              </div>
              <span className="text-[9px] text-slate-500 block">Custo de produção final</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de Sensibilidade Cruzada Dinâmica (Preço vs FCA) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Matriz de Sensibilidade Cruzada: Preço de Venda (R$/kg) × Eficiência FCA
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Biomassa simulada: <strong>{activeBiomassKg.toLocaleString('pt-BR')} kg</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <th className="p-3 font-bold">Faixa de Preço de Venda</th>
                <th className="p-3 font-bold text-center">FCA 1.15 (Otimista)</th>
                <th className="p-3 font-bold text-center">FCA 1.30 (Meta Padrão)</th>
                <th className="p-3 font-bold text-center">FCA 1.55 (Conservador)</th>
                <th className="p-3 font-bold text-right">Status Comercial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
              {sensitivityMatrix.map((row) => {
                const isCurrentPrice = Math.abs(row.price - selectedPricePerKg) < 0.25;

                return (
                  <tr
                    key={row.price}
                    className={`transition-colors ${
                      isCurrentPrice ? 'bg-cyan-950/40 ring-1 ring-cyan-500/40' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">
                          R$ {row.price.toFixed(2)}/kg
                        </span>
                        {isCurrentPrice && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500 text-slate-950 font-black uppercase">
                            Selecionado
                          </span>
                        )}
                      </div>
                    </td>

                    {row.scenarios.map((sc, idx) => {
                      const isHighProfit = sc.profit > 50000;
                      const isLoss = sc.profit < 0;

                      return (
                        <td key={idx} className="p-3 text-center">
                          <div className={`font-bold text-xs ${
                            isLoss ? 'text-rose-400' : isHighProfit ? 'text-emerald-300' : 'text-slate-200'
                          }`}>
                            R$ {sc.profit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </div>
                          <div className={`text-[10px] ${
                            isLoss ? 'text-rose-500' : 'text-slate-500'
                          }`}>
                            {sc.margin.toFixed(1)}% margem
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-3 text-right">
                      {row.price >= 28 ? (
                        <span className="px-2 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                          ★ Alta Rentabilidade
                        </span>
                      ) : row.price >= 21 ? (
                        <span className="px-2 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold">
                          ✓ Viável & Equilibrado
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-700/60 text-[10px] font-bold">
                          ⚠ Margem Apertada
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parecer Comercial Inteligente (Gemini IA) */}
      <div className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        aiCommercialOpinion.alertLevel === 'success'
          ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
          : aiCommercialOpinion.alertLevel === 'warning'
          ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
          : 'bg-cyan-950/40 border-cyan-600/50 text-cyan-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5 shadow-md">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {aiCommercialOpinion.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-700/40">
                IA COMERCIAL AQUA-CORE
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {aiCommercialOpinion.summary}
            </p>
            <p className="text-[11px] text-cyan-300/90 font-medium pt-0.5">
              💡 <strong>Recomendação Prática:</strong> {aiCommercialOpinion.recommendation}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedPricePerKg(24.50)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          title="Resetar parâmetros para média de mercado regional"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Padrão</span>
        </button>
      </div>
    </div>
  );
};
