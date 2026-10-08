import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const AiSentinelBanner: React.FC = () => {
  const {
    sentinelReport,
    sentinelCountdownSeconds,
    isSentinelAuditing,
    setIsSentinelModalOpen,
    runSentinelAuditNow,
  } = useAquaCore();

  if (!sentinelReport) return null;

  const minutes = Math.floor(sentinelCountdownSeconds / 60);
  const seconds = sentinelCountdownSeconds % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = sentinelReport.criticalCount > 0;
  const isWarning = sentinelReport.warningCount > 0;

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-xl font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
      isCritical
        ? 'bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border-rose-500/80 shadow-rose-950/30'
        : isWarning
        ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/70 shadow-amber-950/30'
        : 'bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/50 border-cyan-500/70 shadow-cyan-950/30'
    }`}>
      {/* Lado Esquerdo: Identificação & Status */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
          isCritical
            ? 'bg-rose-950 border-rose-600 text-rose-400'
            : isWarning
            ? 'bg-amber-950 border-amber-600 text-amber-400'
            : 'bg-cyan-950 border-cyan-600 text-cyan-400'
        }`}>
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>

        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-white text-sm tracking-tight font-sans">
              Sentinela IA • Varredura a cada 15 min
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Score {sentinelReport.systemHealthScore}/100
            </span>
            {isCritical && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-slate-950 uppercase animate-pulse">
                {sentinelReport.criticalCount} Crítico
              </span>
            )}
            {isWarning && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {sentinelReport.warningCount} Atenção
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 max-w-xl truncate font-sans">
            {sentinelReport.executiveSummary}
          </p>
        </div>
      </div>

      {/* Lado Direito: Timer e Ações */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t border-slate-800/80 md:border-t-0">
        <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-300 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Próxima em: <strong className="text-cyan-300">{formattedCountdown}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runSentinelAuditNow()}
            disabled={isSentinelAuditing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Forçar varredura agora"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSentinelAuditing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsSentinelModalOpen(true)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1 text-xs ${
              isCritical
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
            }`}
          >
            <span>Ver Diagnóstico ({sentinelReport.totalAnomaliesCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
