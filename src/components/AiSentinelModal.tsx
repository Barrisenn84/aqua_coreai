import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
  Package,
  Layers,
  Activity,
  CloudSun,
  DollarSign,
  Database,
  ArrowRight,
  Clock,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { SentinelAuditItem } from '../types/aquacore';

export const AiSentinelModal: React.FC = () => {
  const {
    sentinelReport,
    sentinelCountdownSeconds,
    isSentinelAuditing,
    isSentinelModalOpen,
    setIsSentinelModalOpen,
    runSentinelAuditNow,
    resolveSentinelAction,
  } = useAquaCore();

  const [activeCategory, setActiveCategory] = useState<string>('TODOS');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isSentinelModalOpen || !sentinelReport) return null;

  const minutes = Math.floor(sentinelCountdownSeconds / 60);
  const seconds = sentinelCountdownSeconds % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const filteredItems = activeCategory === 'TODOS'
    ? sentinelReport.items
    : sentinelReport.items.filter((item) => item.category === activeCategory);

  const categories = [
    { id: 'TODOS', label: 'Tudo', icon: Layers, count: sentinelReport.items.length },
    { id: 'ESTOQUE', label: 'Estoque & Insumos', icon: Package, count: sentinelReport.items.filter((i) => i.category === 'ESTOQUE').length },
    { id: 'RACAO_NUTRICAO', label: 'Arraçoamento', icon: Activity, count: sentinelReport.items.filter((i) => i.category === 'RACAO_NUTRICAO').length },
    { id: 'BIOMETRIA', label: 'Biometrias', icon: TrendingUp, count: sentinelReport.items.filter((i) => i.category === 'BIOMETRIA').length },
    { id: 'QUALIDADE_AGUA', label: 'Água & Aeração', icon: Zap, count: sentinelReport.items.filter((i) => i.category === 'QUALIDADE_AGUA').length },
    { id: 'CLIMA_LUA', label: 'Clima & Lua', icon: CloudSun, count: sentinelReport.items.filter((i) => i.category === 'CLIMA_LUA').length },
    { id: 'FINANCEIRO', label: 'Financeiro & Mercado', icon: DollarSign, count: sentinelReport.items.filter((i) => i.category === 'FINANCEIRO').length },
    { id: 'SISTEMA_DADOS', label: 'Integridade', icon: Database, count: sentinelReport.items.filter((i) => i.category === 'SISTEMA_DADOS').length },
  ];

  const handleResolve = async (item: SentinelAuditItem) => {
    if (!item.autoFixAvailable || !item.fixActionType) return;
    setResolvingId(item.id);
    try {
      const res = await resolveSentinelAction(item.id, item.fixActionType, item.fixPayload);
      if (res) {
        setSuccessNotice(`Ação executada: ${item.recommendedAction}`);
        setTimeout(() => setSuccessNotice(null), 4000);
      }
    } finally {
      setResolvingId(null);
    }
  };

  const getSeverityBadge = (severity: SentinelAuditItem['severity']) => {
    switch (severity) {
      case 'CRITICO':
        return <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold text-[10px]">CRÍTICO</span>;
      case 'ATENCAO':
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold text-[10px]">ATENÇÃO</span>;
      case 'AJUSTE':
        return <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold text-[10px]">AJUSTE</span>;
      case 'OTIMO':
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px]">CONFORME ✓</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${
              sentinelReport.overallStatus === 'CRITICO'
                ? 'bg-rose-950/80 border-rose-600 text-rose-400'
                : sentinelReport.overallStatus === 'ATENCAO'
                ? 'bg-amber-950/80 border-amber-600 text-amber-400'
                : 'bg-emerald-950/80 border-emerald-600 text-emerald-400'
            }`}>
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Sentinela Autônomo AQUA-CORE IA</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                    CICLO 15 MIN
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Varredura contínua de integridade, estoque, nutrição e correlações da Fazenda River Life (Mogeiro - PB)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runSentinelAuditNow()}
              disabled={isSentinelAuditing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all cursor-pointer font-mono"
              title="Disparar nova varredura de auditoria imediatamente"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSentinelAuditing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSentinelAuditing ? 'Varrendo...' : 'Forçar Varredura'}</span>
            </button>

            <button
              onClick={() => setIsSentinelModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Status & Contagem Regressiva */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">
                Última Varredura: <strong className="text-white">{sentinelReport.timestamp}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Próxima varredura em: <strong>{formattedCountdown}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Score de Saúde Sistêmica:</span>
              <span className={`text-sm font-black px-2 py-0.5 rounded border ${
                sentinelReport.systemHealthScore >= 90
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : sentinelReport.systemHealthScore >= 70
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-rose-950 text-rose-300 border-rose-600'
              }`}>
                {sentinelReport.systemHealthScore}/100
              </span>
            </div>

            <span className="text-slate-500">•</span>

            <span className="text-slate-300">
              <strong className="text-amber-400">{sentinelReport.totalAnomaliesCount}</strong> pontos correlacionados
            </span>
          </div>
        </div>

        {/* Toast de Sucesso ao Resolver Ação */}
        {successNotice && (
          <div className="bg-emerald-950 border-b border-emerald-700/80 px-5 py-2.5 text-xs text-emerald-200 font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Parecer da IA Executiva */}
        <div className="p-4 bg-gradient-to-r from-purple-950/30 via-slate-900 to-cyan-950/30 border-b border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-600/50 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-purple-300 uppercase">
                Parecer de Integração da IA (Gemini 2.5 Flash)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Correlação Multissetorial</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {sentinelReport.executiveSummary}
            </p>
          </div>
        </div>

        {/* Abas de Navegação dos Subsistemas */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-950/50 flex gap-2 overflow-x-auto no-scrollbar font-mono text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`pb-2.5 px-3 border-b-2 font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de Diagnósticos com Correlação Cruzada */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <p>Nenhuma anomalia detectada nesta categoria.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.resolved
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : item.severity === 'CRITICO'
                    ? 'bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/20'
                    : item.severity === 'ATENCAO'
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : item.severity === 'AJUSTE'
                    ? 'bg-cyan-950/20 border-cyan-800/60'
                    : 'bg-emerald-950/20 border-emerald-800/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Categoria: {item.category}
                  </span>
                </div>

                <div className="mt-2.5 space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {item.description}
                  </p>

                  {/* Detalhe de Correlação Cruzada */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-cyan-300/90 flex items-start gap-2">
                    <span className="font-bold text-cyan-400 uppercase shrink-0">🔗 Correlação Sistêmica:</span>
                    <span>{item.correlation}</span>
                  </div>

                  {/* Ação Recomendada & Botão 1-Clique */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono">
                    <div className="text-slate-300">
                      <strong className="text-emerald-400">💡 Ação Recomendada:</strong> {item.recommendedAction}
                    </div>

                    {item.autoFixAvailable && !item.resolved && (
                      <button
                        onClick={() => handleResolve(item)}
                        disabled={resolvingId === item.id}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{resolvingId === item.id ? 'Executando...' : 'Executar Ajuste Automático ✓'}</span>
                      </button>
                    )}

                    {item.resolved && (
                      <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolvido
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            AQUA-CORE AI v2.5 • Monitoramento Autônomo 24/7 sem interrupções
          </span>

          <button
            onClick={() => setIsSentinelModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
