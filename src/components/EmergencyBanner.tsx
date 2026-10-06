import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  DollarSign,
  Droplet,
  Power,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const EmergencyBanner: React.FC = () => {
  const { alerts, tanks, emergencyTurnOnAerators, emergencyOverrideAllAerators, farm } = useAquaCore();
  const [lastOverriddenTank, setLastOverriddenTank] = useState<string | null>(null);

  // Focus on critical unresolved hypoxia alerts
  const criticalO2Alerts = alerts.filter(
    (a) => a.parameter === 'O2' && a.severity === 'critical' && !a.resolved
  );

  if (criticalO2Alerts.length === 0) {
    if (lastOverriddenTank) {
      return (
        <div className="bg-emerald-950/70 border-y border-emerald-600/50 px-4 py-3 shadow-lg shadow-emerald-950/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-200">
                  AERADORES ATIVADOS COM SUCESSO • PROTOCOLO DE RECUPERAÇÃO INICIADO
                </p>
                <p className="text-xs text-emerald-400/90 font-mono">
                  Oxigênio em elevação contínua. Proteção patrimonial efetivada no Tanque {lastOverriddenTank}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastOverriddenTank(null)}
              className="text-xs text-emerald-400 hover:text-emerald-200 font-mono underline"
            >
              Dispensar aviso
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Active Emergency
  const primaryAlert = criticalO2Alerts[0];
  const targetTank = tanks.find((t) => t.id === primaryAlert.tankId);
  const aeratorTotalKw = targetTank ? targetTank.aeratorCount * targetTank.aeratorPowerKw : 14.8;
  const hourlyCostReais = Number((aeratorTotalKw * farm.kwhCost).toFixed(2));

  const handleActivate = (tankId: string) => {
    emergencyTurnOnAerators(tankId);
    setLastOverriddenTank(targetTank?.name || 'Tanque');
  };

  return (
    <div className="relative overflow-hidden border-y-2 border-red-500 bg-gradient-to-r from-red-950 via-slate-950 to-red-950 text-white shadow-2xl shadow-red-950/80 animate-pulse-slow">
      {/* Subtle background emergency stripes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Alert Description & Telemetry Gauge */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/50 shrink-0 animate-bounce">
              <AlertOctagon className="w-7 h-7 text-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-600 text-white font-mono">
                  ALERTA DE EMERGÊNCIA CRÍTICA
                </span>
                <span className="text-xs font-mono text-red-300 font-bold">
                  {primaryAlert.tankName}
                </span>
                <span className="text-xs text-red-400/80">• {primaryAlert.timestamp}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-red-100 tracking-tight mt-0.5">
                Hipóxia Severa: O2 Dissolvido em{' '}
                <span className="text-red-400 font-mono underline decoration-red-500">
                  {primaryAlert.currentValue.toFixed(2)} mg/L
                </span>{' '}
                <span className="text-sm font-normal text-red-300">
                  (Limiar letal para {targetTank?.name || 'peixes'})
                </span>
              </h2>

              <p className="text-xs text-red-200/90 mt-1 max-w-2xl">
                O nível de oxigênio caiu 56% abaixo da baseline de segurança. Risco iminente de asfixia em massa nos próximos 45 minutos. Aeradores encontram-se atualmente <strong>DESLIGADOS</strong>.
              </p>
            </div>
          </div>

          {/* Real-time Economic Impact & Fast Override Button */}
          <div className="flex flex-wrap items-center gap-4 bg-red-950/60 p-3 rounded-xl border border-red-800/80">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-red-300 font-mono flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-red-400" />
                Patrimônio em Risco
              </span>
              <span className="text-base font-black text-red-100 font-mono">
                R$ {primaryAlert.potentialLossReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-red-400 font-mono flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                Custo de energia: R$ {hourlyCostReais}/h
              </span>
            </div>

            <button
              onClick={() => handleActivate(primaryAlert.tankId)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:shadow-red-600/60 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer border border-red-400/40"
            >
              <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300 animate-pulse" />
              <span>⚡ LIGAR AERADORES AGORA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
