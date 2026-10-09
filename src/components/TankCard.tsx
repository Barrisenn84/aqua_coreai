import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Droplets,
  Flame,
  Info,
  Power,
  Sparkles,
  Thermometer,
  Zap,
} from 'lucide-react';
import { Batch, SensorReading, Tank } from '../types/aquacore';
import { calculateBiomassKg, calculateToxicAmmonia } from '../utils/aquacultureMath';
import { useAquaCore } from '../context/AquaCoreContext';

interface TankCardProps {
  tank: Tank;
  batch?: Batch;
  reading?: SensorReading;
  onOpenAudit: (tankId: string) => void;
  onOpenBiometry: (tankId: string) => void;
}

export const TankCard: React.FC<TankCardProps> = ({
  tank,
  batch,
  reading,
  onOpenAudit,
  onOpenBiometry,
}) => {
  const { toggleAerator, farm } = useAquaCore();

  const safeReading: SensorReading = reading || {
    id: `safe-${tank.id}`,
    tankId: tank.id,
    timestamp: new Date().toISOString(),
    dissolvedOxygen: 5.6,
    temperature: 28.0,
    ph: 7.8,
    ammoniaTotal: 0.2,
    ammoniaToxic: 0.01,
  };

  const currentCount = batch?.currentCount || 0;
  const currentWeightG = batch?.currentWeightG || 0.01;
  const biomassKg = batch ? calculateBiomassKg(currentCount, currentWeightG) : 0;
  const shrimpPrice = farm.shrimpSalePricePerKg || farm.camarãoSalePricePerKg || farm.fishSalePricePerKg || 24.50;
  const biomassValue = biomassKg * shrimpPrice;
  const aeratorTotalKw = (tank.aeratorCount || 0) * (tank.aeratorPowerKw || 0);
  const aeratorHourlyCost = aeratorTotalKw * (farm.kwhCost || 0.72);

  const toxicNh3 = calculateToxicAmmonia(safeReading.ammoniaTotal, safeReading.ph, safeReading.temperature);

  // Oxygen safety levels
  const isO2Critical = safeReading.dissolvedOxygen < 3.2;
  const isO2Warning = safeReading.dissolvedOxygen >= 3.2 && safeReading.dissolvedOxygen < 4.8;
  const isO2Optimal = safeReading.dissolvedOxygen >= 4.8;

  // Ammonia safety
  const isNh3Critical = toxicNh3 > 0.05;
  const isNh3Warning = toxicNh3 > 0.02 && toxicNh3 <= 0.05;

  const o2Color = isO2Critical
    ? 'text-red-400 bg-red-950/60 border-red-800'
    : isO2Warning
    ? 'text-amber-400 bg-amber-950/60 border-amber-800'
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-800';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        isO2Critical
          ? 'bg-slate-900/95 border-red-500/80 shadow-xl shadow-red-950/50 ring-1 ring-red-500/40'
          : isNh3Critical || tank.status === 'warning'
          ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-950/30'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isO2Critical
                    ? 'bg-red-500 animate-ping'
                    : isNh3Critical || tank.status === 'warning'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              ></span>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-none">
                {tank.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {batch?.species || 'Litopenaeus vannamei'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/50 text-cyan-400 border border-cyan-800/40">
                {tank.type} • {tank.volumeM3}m³
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {batch ? `${batch.batchCode} (D+${batch.cycleDay})` : 'Tanque Livre'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono tracking-wider border ${
                isO2Critical
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  : isNh3Critical
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {isO2Critical ? 'CRÍTICO' : isNh3Critical ? 'ALERTA NH3' : 'ÓTIMO'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-1">
              R$ {biomassValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Telemetry Readout Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/40">
        {/* Dissolved Oxygen */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${o2Color}`}>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="opacity-80 flex items-center gap-1">
              <Droplets className="w-3 h-3" /> O2
            </span>
            <span className="text-[9px] opacity-75">mg/L</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono my-1 tracking-tight">
            {safeReading.dissolvedOxygen.toFixed(2)}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isO2Critical ? 'bg-red-500' : isO2Warning ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (safeReading.dissolvedOxygen / 7.0) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Temperature */}
        <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-cyan-400" /> Temp
            </span>
            <span className="text-[9px]">°C</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono my-1 text-slate-100">
            {safeReading.temperature.toFixed(1)}°
          </div>
          <span className="text-[9px] font-mono text-cyan-400">
            {safeReading.temperature >= 27 && safeReading.temperature <= 30 ? 'Zona Ótima' : 'Atenção Térmica'}
          </span>
        </div>

        {/* pH */}
        <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>pH</span>
            <span className="text-[9px]">unidade</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono my-1 text-slate-100">
            {safeReading.ph.toFixed(2)}
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            {safeReading.ph > 8.2 ? 'Alcalino (Risco NH3)' : 'Faixa Segura'}
          </span>
        </div>

        {/* Emerson Toxic Ammonia (NH3) */}
        <div
          className={`p-2.5 rounded-xl border flex flex-col justify-between ${
            isNh3Critical
              ? 'bg-amber-950/50 border-amber-700 text-amber-300'
              : 'border-slate-800 bg-slate-900/60 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> NH3 Livre
            </span>
            <span className="text-[9px]">mg/L</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono my-1">
            {toxicNh3.toFixed(3)}
          </div>
          <span
            className={`text-[9px] font-mono ${
              isNh3Critical ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            {isNh3Critical ? 'TÓXICO (>0.05)' : 'Normal (<0.02)'}
          </span>
        </div>
      </div>

      {/* Zootechnical Metrics Strip */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-500">Biomassa: </span>
          <span className="font-bold text-slate-200">{biomassKg.toLocaleString('pt-BR')} kg</span>
        </div>
        <div>
          <span className="text-slate-500">Peso Médio: </span>
          <span className="font-bold text-cyan-400">{batch ? `${batch.currentWeightG} g` : 'Sem lote'}</span>
        </div>
        <div>
          <span className="text-slate-500">População: </span>
          <span className="font-bold text-slate-200">{batch ? `${batch.currentCount.toLocaleString('pt-BR')} un` : 'Livre'}</span>
        </div>
      </div>

      {/* Action Footer: Aerator Switch & Quick Audit */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
        {/* Aerator Toggle Button */}
        <button
          onClick={() => toggleAerator(tank.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border ${
            tank.aeratorActive
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/70 shadow-sm shadow-emerald-950'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
          title={`${tank.aeratorActive ? 'Desligar' : 'Ligar'} aeradores (${tank.aeratorCount} un x ${tank.aeratorPowerKw} kW)`}
        >
          <Power
            className={`w-3.5 h-3.5 ${
              tank.aeratorActive ? 'text-emerald-400 animate-spin-slow' : 'text-slate-500'
            }`}
          />
          <span>
            {tank.aeratorActive ? 'AERADORES ON' : 'AERADORES OFF'}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            ({aeratorTotalKw}kW • R$ {aeratorHourlyCost.toFixed(2)}/h)
          </span>
        </button>

        {/* Buttons to audit and log biometry */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenBiometry(tank.id)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Registrar amostragem semanal de peso"
          >
            Biometria
          </button>

          <button
            onClick={() => onOpenAudit(tank.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600/90 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-600/30 transition-all flex items-center gap-1 cursor-pointer font-mono"
            title="Processar auditoria completa no Terminal AQUA-CORE AI"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Auditar IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
