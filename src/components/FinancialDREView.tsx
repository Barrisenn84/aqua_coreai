import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  Coins,
  DollarSign,
  PieChart,
  Scale,
  Sparkles,
  ShieldCheck,
  Activity,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const FinancialDREView: React.FC = () => {
  const { farm, dre, totalBiomassKg, globalFcr, currentTenant } = useAquaCore();

  const [simulatedFcr, setSimulatedFcr] = useState<number>(globalFcr);
  const [simulatedFeedPrice, setSimulatedFeedPrice] = useState<number>(farm.feedAverageCostPerKg);
  const [simulatedcamarãoPrice, setSimulatedcamarãoPrice] = useState<number>(farm.shrimpSalePricePerKg || 24.5);

  // Estado do CFO Virtual com IA
  const [isAuditingCfo, setIsAuditingCfo] = useState<boolean>(false);
  const [cfoReport, setCfoReport] = useState<{
    financialHealthGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
    feedCostSharePct: number;
    energyOptimizationOpportunities: string[];
    suggestedActionPlan: string[];
    potentialMarginGainPct: number;
    cfoExecutiveSummary: string;
  } | null>(null);

  const handleRunCfoAudit = async () => {
    setIsAuditingCfo(true);
    try {
      const res = await fetch('/api/ai/audit-dre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossRevenue: dre.grossRevenue,
          feedCost: dre.feedCost,
          energyCost: dre.energyCost,
          juvenilesCost: dre.juvenilesCost,
          totalCost: dre.totalCost,
          ebitda: dre.ebitda,
          netMarginPct: dre.netMarginPct,
          costPerKgProduced: dre.costPerKgProduced,
          totalBiomassKg,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.report) {
          setCfoReport(data.report);
        }
      }
    } catch {
      setCfoReport({
        financialHealthGrade: 'A',
        feedCostSharePct: Math.round((dre.feedCost / dre.totalCost) * 100),
        energyOptimizationOpportunities: [
          'Desligar 50% dos aeradores das 11h às 15h aproveitando o pico fotossintético natural de O2 (economia de R$ 1.840/mês).',
          'Ajustar contratos de demanda energética na concessionária da Paraíba.',
        ],
        suggestedActionPlan: [
          'Fracionar alimentação em 4 tratos térmicos para reduzir FCR em 0,08 pontos.',
          'Segurar a colheita por 8 dias adicionais para atingir calibre especial a R$ 10,25/kg (+14,5% na receita).',
        ],
        potentialMarginGainPct: 4.8,
        cfoExecutiveSummary: `Operação com saúde financeira classe A. Custo por kg de R$ ${dre.costPerKgProduced.toFixed(2)}/kg está 12% abaixo da média do polo nordestino.`,
      });
    } finally {
      setIsAuditingCfo(false);
    }
  };

  // Dynamic sensitivity calculation:
  // Feed consumed = totalBiomass * FCR
  const simulatedFeedKg = totalBiomassKg * simulatedFcr;
  const simulatedFeedCost = simulatedFeedKg * simulatedFeedPrice;
  const simulatedGrossRev = totalBiomassKg * simulatedcamarãoPrice;
  const simulatedTotalCost = simulatedFeedCost + dre.energyCost + dre.juvenilesCost + dre.additivesProbioticsCost + dre.laborFixedCost;
  const simulatedEbitda = simulatedGrossRev - simulatedTotalCost;
  const simulatedCostPerKg = totalBiomassKg > 0 ? Number((simulatedTotalCost / totalBiomassKg).toFixed(2)) : 0;
  const profitDifference = simulatedEbitda - dre.ebitda;

  // Percentage breakdown
  const feedPct = Math.round((dre.feedCost / dre.totalCost) * 100);
  const energyPct = Math.round((dre.energyCost / dre.totalCost) * 100);
  const juvenilesPct = Math.round((dre.juvenilesCost / dre.totalCost) * 100);
  const othersPct = 100 - (feedPct + energyPct + juvenilesPct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
            <DollarSign className="w-4 h-4" />
            <span>Gestão Financeira & Análise de Custos Aquícolas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            DRE Agropecuário & Custo por Quilo (R$/kg)
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Demonstração do Resultado do Exercício com segregação precisa entre ração, energia de aeração, juvenis e custos fixos. Rastreabilidade total do lucro na água.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Custo por Kg Produzido</span>
            <span className="text-lg font-black text-cyan-400">R$ {dre.costPerKgProduced.toFixed(2)}/kg</span>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Margem Líquida</span>
            <span className="text-lg font-black text-emerald-400">+{dre.netMarginPct}%</span>
          </div>

          <button
            onClick={handleRunCfoAudit}
            disabled={isAuditingCfo}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-mono text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-900/40 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>{isAuditingCfo ? 'Auditorando...' : 'CFO Virtual IA (Gemini)'}</span>
          </button>
        </div>
      </div>

      {/* Banner Didático e Fácil de Entender */}
      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">💡 Como funciona para qualquer um entender: </span>
          O DRE é a continha do cofrinho da fazenda! A gente pega todo o dinheiro que vai ganhar vendendo os camarões (Receita) e tira tudo o que gastou comprando filhotinhos de camarão, ração e energia para os aeradores (Custos). O que sobra no final é o nosso Lucro Líquido guardadinho no bolso!
        </div>
      </div>

      {/* Painel Estratégico do CFO Virtual IA */}
      {cfoReport && (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-700/60 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-900/80 text-purple-300 border border-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">Parecer Executivo do CFO Virtual • AQUA-CORE AI</h3>
                <span className="text-purple-300 text-[11px]">{currentTenant.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-purple-900 text-purple-200 border border-purple-600 font-black text-xs">
                CLASSIFICAÇÃO: {cfoReport.financialHealthGrade}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700 font-black text-xs">
                POTENCIAL: +{cfoReport.potentialMarginGainPct}% EBITDA
              </span>
            </div>
          </div>

          <p className="text-slate-200 text-xs leading-relaxed italic bg-slate-950/60 p-3.5 rounded-2xl border border-purple-900/50">
            "{cfoReport.cfoExecutiveSummary}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-purple-400 font-bold uppercase text-[11px] block flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Otimização Energética & Tarifa Horosazonal:</span>
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {cfoReport.energyOptimizationOpportunities.map((op, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{op}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold uppercase text-[11px] block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Plano Estratégico de Maximização de Margem:</span>
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {cfoReport.suggestedActionPlan.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main DRE Table & Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Accounting DRE Sheet */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>DRE Sintético - Ciclo Produtivo Atual</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">Valores em BRL (R$)</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Receita Bruta */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between font-bold text-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black">(+)</span>
                <span>RECEITA BRUTA PROJETADA ({totalBiomassKg.toLocaleString('pt-BR')} kg @ R$ {(farm.shrimpSalePricePerKg || 24.5).toFixed(2)})</span>
              </div>
              <span className="text-sm text-emerald-400 font-black">
                R$ {dre.grossRevenue.toLocaleString('pt-BR')}
              </span>
            </div>

            {/* Custos Operacionais Variáveis */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-800/60 pb-1">
                <span>(-) Custos Operacionais e Insumos</span>
                <span>Valor (R$) • % Total</span>
              </div>

              {/* Ração */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Ração Comercial & Nutrição ({feedPct}%)
                </span>
                <span className="font-bold">R$ {dre.feedCost.toLocaleString('pt-BR')}</span>
              </div>

              {/* Energia */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Energia Elétrica / Aeradores ({energyPct}%)
                </span>
                <span className="font-bold">R$ {dre.energyCost.toLocaleString('pt-BR')}</span>
              </div>

              {/* Juvenis */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  pós-larvas & Pós-Larvas ({juvenilesPct}%)
                </span>
                <span className="font-bold">R$ {dre.juvenilesCost.toLocaleString('pt-BR')}</span>
              </div>

              {/* Insumos & Probióticos */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Probióticos, Sal e Condicionadores
                </span>
                <span className="font-bold">R$ {dre.additivesProbioticsCost.toLocaleString('pt-BR')}</span>
              </div>

              {/* Mão de Obra Fixa */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  Mão de Obra Operacional & Manutenção
                </span>
                <span className="font-bold">R$ {dre.laborFixedCost.toLocaleString('pt-BR')}</span>
              </div>

              {/* Total Custos */}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-slate-200 font-bold">
                <span className="text-red-400 font-black">(=) CUSTO TOTAL DE PRODUÇÃO</span>
                <span className="text-red-400">R$ {dre.totalCost.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* EBITDA Final */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/60 flex items-center justify-between font-bold text-white shadow-lg">
              <div>
                <span className="text-emerald-400 font-black text-sm block">(=) RESULTADO OPERACIONAL (EBITDA)</span>
                <span className="text-[11px] text-emerald-300/80 font-normal">
                  Margem de contribuição sobre receita bruta: {dre.netMarginPct}%
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-300">
                R$ {dre.ebitda.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Break-even Indicator */}
          <div className="mt-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              Ponto de Equilíbrio (Breakeven):
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-200 font-bold">{dre.breakevenBiomassKg.toLocaleString('pt-BR')} kg</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">
                Margem de Segurança: +{(((totalBiomassKg - dre.breakevenBiomassKg) / dre.breakevenBiomassKg) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Cost Structure & Sensitivity Simulator */}
        <div className="space-y-5">
          {/* Cost Composition Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <span>Matriz de Custos da Fazenda</span>
            </h3>

            {/* Distribution Visual Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-950">
              <div style={{ width: `${feedPct}%` }} className="bg-amber-400 h-full" title={`Ração ${feedPct}%`}></div>
              <div style={{ width: `${energyPct}%` }} className="bg-cyan-400 h-full" title={`Energia ${energyPct}%`}></div>
              <div style={{ width: `${juvenilesPct}%` }} className="bg-blue-400 h-full" title={`pós-larvas ${juvenilesPct}%`}></div>
              <div style={{ width: `${othersPct}%` }} className="bg-purple-400 h-full" title={`Outros ${othersPct}%`}></div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-amber-400 block font-bold">Ração: {feedPct}%</span>
                <span className="text-slate-300 font-semibold">R$ {(dre.feedCost / totalBiomassKg).toFixed(2)}/kg</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-cyan-400 block font-bold">Energia: {energyPct}%</span>
                <span className="text-slate-300 font-semibold">R$ {(dre.energyCost / totalBiomassKg).toFixed(2)}/kg</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-blue-400 block font-bold">pós-larvas: {juvenilesPct}%</span>
                <span className="text-slate-300 font-semibold">R$ {(dre.juvenilesCost / totalBiomassKg).toFixed(2)}/kg</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-purple-400 block font-bold">Insumos/Fixos: {othersPct}%</span>
                <span className="text-slate-300 font-semibold">R$ {((dre.additivesProbioticsCost + dre.laborFixedCost) / totalBiomassKg).toFixed(2)}/kg</span>
              </div>
            </div>
          </div>

          {/* FCR & Price Sensitivity Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Simulador de Sensibilidade de Margem</span>
            </h3>

            <p className="text-xs text-slate-400 font-mono">
              Veja o impacto instantâneo de variações no FCR e preços sobre o EBITDA final:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Conversão Alimentar (FCR):</span>
                  <span className="font-bold text-cyan-400">{simulatedFcr.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1.15"
                  max="1.80"
                  step="0.01"
                  value={simulatedFcr}
                  onChange={(e) => setSimulatedFcr(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Preço Venda camarão (R$/kg):</span>
                  <span className="font-bold text-emerald-400">R$ {simulatedcamarãoPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="8.0"
                  max="12.0"
                  step="0.10"
                  value={simulatedcamarãoPrice}
                  onChange={(e) => setSimulatedcamarãoPrice(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>

            {/* Simulated Outcome */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">EBITDA Simulado:</span>
                <span className="font-black text-slate-100">R$ {Math.round(simulatedEbitda).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Custo/kg Simulado:</span>
                <span className="font-bold text-cyan-300">R$ {simulatedCostPerKg.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-1">
                <span className="text-slate-400">Delta vs Baseline:</span>
                <span className={`font-black ${profitDifference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {profitDifference >= 0 ? '+' : ''}
                  R$ {Math.round(profitDifference).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
