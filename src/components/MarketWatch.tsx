import React, { useState } from 'react';
import { CheckCircle2, Clock, MapPin, RefreshCw, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export interface RegionalQuote {
  category: string;
  regionalPricePerKg: number | null;
  trendPct7d: number | null;
  marketChannel: string;
  source: string;
  description: string;
}

const emptyQuotes: RegionalQuote[] = ['Grade grande', 'Grade média', 'Grade pequena'].map((category) => ({
  category,
  regionalPricePerKg: null,
  trendPct7d: null,
  marketChannel: 'Nenhum comprador cadastrado',
  source: 'Sem cotação importada',
  description: 'Consulte uma referência pública ou registre uma oferta negociada com fonte e data.',
}));

export const MarketWatch: React.FC = () => {
  const { farm, totalBiomassKg, updateFarmSettings } = useAquaCore();
  const [activeSpecies, setActiveSpecies] = useState<'comercial' | 'exportacao'>('comercial');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Fonte ainda não consultada');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<RegionalQuote[]>([]);

  const systemPrice = farm.shrimpSalePricePerKg || farm.camarãoSalePricePerKg || farm.fishSalePricePerKg || 0;
  const currentQuotes = liveQuotes.length > 0 ? liveQuotes : emptyQuotes;
  const benchmarkQuote = currentQuotes[0];
  const hasSystemPrice = systemPrice > 0;
  const hasBenchmarkPrice = typeof benchmarkQuote?.regionalPricePerKg === 'number' && benchmarkQuote.regionalPricePerKg > 0;
  const spreadPerKg = hasSystemPrice && hasBenchmarkPrice ? benchmarkQuote.regionalPricePerKg! - systemPrice : null;
  const spreadPct = spreadPerKg !== null && systemPrice > 0 ? Number(((spreadPerKg / systemPrice) * 100).toFixed(1)) : null;
  const totalBiomassPotentialImpact = spreadPerKg === null ? null : Number((totalBiomassKg * spreadPerKg).toFixed(2));

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetch('/api/market/live-shrimp')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Fonte indisponível')))
      .then((payload) => {
        const quotes: RegionalQuote[] = (payload.quotes || []).map((quote: { category: string; averagePricePerKg: number }) => ({
          category: quote.category,
          regionalPricePerKg: Number(quote.averagePricePerKg),
          trendPct7d: null,
          marketChannel: 'CEASA Pernambuco · atacado',
          source: `${payload.source} (${payload.sourceDate || 'data não informada'})`,
          description: 'Referência atacadista; não substitui uma cotação negociada na fazenda.',
        }));
        setLiveQuotes(quotes);
        setLastUpdated(payload.retrievedAt ? new Date(payload.retrievedAt).toLocaleString('pt-BR') : 'Fonte consultada agora');
      })
      .catch(() => {
        setLiveQuotes([]);
        setLastUpdated('Fonte indisponível; nenhuma cotação exibida');
      })
      .finally(() => setIsRefreshing(false));
  };

  const handleApplyRegionalPrice = (targetPrice: number) => {
    if (!Number.isFinite(targetPrice) || targetPrice <= 0) return;
    updateFarmSettings({ shrimpSalePricePerKg: targetPrice, camarãoSalePricePerKg: targetPrice, fishSalePricePerKg: targetPrice });
    setSuccessNotice(`Preço do camarão atualizado para R$ ${targetPrice.toFixed(2)}/kg. DRE e valuation recalculados.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-cyan-800/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden font-mono">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2"><span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/70"><TrendingUp className="w-4 h-4" /></span><div className="flex items-center gap-2"><h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">Market Watch • Cotações do Nordeste & Paraíba</h3><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${liveQuotes.length > 0 ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60' : 'bg-amber-950 text-amber-300 border-amber-800/60'}`}>{liveQuotes.length > 0 ? 'FONTE CONSULTADA' : 'SEM COTAÇÃO VALIDADA'}</span></div></div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" /><span>Polo Paraíba / Nordeste</span><span className="text-slate-600">•</span><Clock className="w-3.5 h-3.5 text-slate-500" /><span>Fonte: {lastUpdated}</span></p>
        </div>
        <div className="flex items-center gap-2"><div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800"><button onClick={() => setActiveSpecies('comercial')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeSpecies === 'comercial' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>🦐 Camarão Comercial</button><button onClick={() => setActiveSpecies('exportacao')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeSpecies === 'exportacao' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>✨ Grade Exportação</button></div><button onClick={handleRefresh} disabled={isRefreshing} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-300" title="Consultar a fonte pública de referência"><RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} /></button></div>
      </div>
      {successNotice && <div className="mt-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs"><CheckCircle2 className="w-4 h-4 inline mr-2" />{successNotice}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800"><span className="text-[10px] text-slate-400 uppercase tracking-wider block">Preço cadastrado na fazenda</span><div className="mt-2 text-3xl font-black text-white">{hasSystemPrice ? `R$ ${systemPrice.toFixed(2)}` : 'Não informado'} <span className="text-xs text-slate-400">/ kg</span></div><p className="text-[11px] text-slate-400 mt-2">Usado no DRE somente depois de registrar preço, unidade, fonte e data.</p></div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-900/60"><span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Referência atacadista (CEASA-PE)</span><div className="mt-2 text-3xl font-black text-cyan-300">{hasBenchmarkPrice ? `R$ ${benchmarkQuote.regionalPricePerKg!.toFixed(2)}` : 'Não disponível'} <span className="text-xs text-slate-400">/ kg</span></div><p className="text-[11px] text-slate-400 mt-2 truncate">{benchmarkQuote.category} · {activeSpecies === 'exportacao' ? 'comparação indicativa' : 'atacado'}</p></div>
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800"><span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">Diferença e impacto</span><div className="mt-2 text-3xl font-black text-slate-200">{spreadPerKg === null ? 'Não calculado' : `${spreadPerKg >= 0 ? '+' : '-'}R$ ${Math.abs(spreadPerKg).toFixed(2)}`} <span className="text-xs text-slate-400">/ kg</span></div><p className="mt-2 text-[11px] text-slate-400">{totalBiomassPotentialImpact === null ? 'Cadastre preço e fonte para comparar.' : `Impacto indicativo na biomassa (${totalBiomassKg.toLocaleString('pt-BR')} kg): R$ ${Math.abs(totalBiomassPotentialImpact).toLocaleString('pt-BR')}`}</p></div>
      </div>

      <div className="mt-4 bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden"><div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold uppercase"><span>Grade & canal de comercialização</span><span>Fonte e ação</span></div><div className="divide-y divide-slate-800/80 text-xs">{currentQuotes.map((quote, index) => { const hasPrice = typeof quote.regionalPricePerKg === 'number' && quote.regionalPricePerKg > 0; const diff = hasPrice && hasSystemPrice ? quote.regionalPricePerKg! - systemPrice : null; return <div key={`${quote.category}-${index}`} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="space-y-0.5"><div className="flex items-center gap-2"><span className="font-bold text-white text-sm">{quote.category}</span><span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{quote.marketChannel}</span></div><p className="text-[11px] text-slate-400">{quote.description} <span className="text-slate-500">• Fonte: {quote.source}</span></p></div><div className="flex items-center justify-between sm:justify-end gap-4 shrink-0"><div className="flex items-center gap-1 font-bold text-xs text-slate-500">{quote.trendPct7d === null ? 'Sem histórico' : quote.trendPct7d >= 0 ? <><TrendingUp className="w-3.5 h-3.5 text-emerald-400" />+{quote.trendPct7d}%</> : <><TrendingDown className="w-3.5 h-3.5 text-red-400" />{quote.trendPct7d}%</>}</div><div className="text-right"><div className="font-black text-white text-base">{hasPrice ? `R$ ${quote.regionalPricePerKg!.toFixed(2)}` : 'Não disponível'}<span className="text-[10px] text-slate-400 font-normal"> /kg</span></div><div className="text-[10px] font-mono text-slate-500">{diff === null ? 'Sem comparação' : `${diff >= 0 ? '+' : '-'}R$ ${Math.abs(diff).toFixed(2)} vs sistema`}</div></div>{hasPrice ? <button onClick={() => handleApplyRegionalPrice(quote.regionalPricePerKg!)} className="px-3.5 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[11px]">Aplicar</button> : <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-700 font-bold text-[11px]">Aguardando fonte</span>}</div></div>; })}</div></div>
      <div className="mt-3.5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-2.5 text-xs text-slate-300"><Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" /><div><span className="font-bold text-cyan-300">Inteligência de Mercado AquaCore: </span>{spreadPerKg === null ? 'não há base suficiente para calcular margem ou lucro. Consulte uma fonte, confirme o calibre e registre uma oferta negociada antes de usar o preço no DRE.' : `comparação indicativa de ${spreadPct}% com a referência selecionada; confirme a negociação antes de aplicar.`}</div></div>
    </div>
  );
};
