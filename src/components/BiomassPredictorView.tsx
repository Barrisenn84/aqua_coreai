import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  Cpu,
  LineChart,
  Scale,
  Sparkles,
  Thermometer,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { calculateDynamicBiomassPrediction } from '../utils/aquacultureMath';

export const BiomassPredictorView: React.FC = () => {
  const { tanks, batches, sensorReadings, farm } = useAquaCore();

  const [selectedTankId, setSelectedTankId] = useState<string>('tank-04');
  const [targetWeightG, setTargetWeightG] = useState<number>(800);
  const [scheduledTruck, setScheduledTruck] = useState<boolean>(false);

  const selectedTank = tanks.find((t) => t.id === selectedTankId) || tanks[0];
  const selectedBatch = batches.find((b) => b.tankId === selectedTankId) || batches[0];
  const selectedReading = sensorReadings[selectedTankId] || sensorReadings[selectedTank.id];

  // Dynamic 3-variable regression prediction: FCR + TGD + Biometry
  const prediction = useMemo(() => {
    return calculateDynamicBiomassPrediction(
      selectedBatch,
      selectedReading,
      targetWeightG,
      28
    );
  }, [selectedBatch, selectedReading, targetWeightG]);

  const targetPoint = prediction.points.find((p) => p.isHarvestTarget) || prediction.points[14];
  const maxWeightInHorizon = Math.max(...prediction.points.map((p) => p.avgWeightG));
  const minWeightInHorizon = Math.min(...prediction.points.map((p) => p.avgWeightG));
  const weightRange = maxWeightInHorizon - minWeightInHorizon || 1;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pilar 2 • A Bola de Cristal do Lucro</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Preditor Dinâmico de Biomassa (FCR + TGD + Biometria)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              {prediction.accuracyScore}% PRECISÃO
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Acaba com a despesca "no feeling". O algoritmo cruza a conversão alimentar real, os graus-dias acumulados (TGD) e a biometria para cravar o dia exato do peso ideal.
          </p>
        </div>

        {/* Tank Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-mono pl-1">Lote:</span>
          <select
            value={selectedTankId}
            onChange={(e) => setSelectedTankId(e.target.value)}
            className="bg-slate-900 text-white text-xs font-mono font-bold py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {tanks.map((t) => {
              const b = batches.find((x) => x.tankId === t.id);
              return (
                <option key={t.id} value={t.id}>
                  {t.name} ({b?.species} • Atual: {b?.currentWeightG}g)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* The Disruptive Oracle Statement Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border-2 border-amber-500/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase font-mono bg-amber-500 text-slate-950 shadow-md">
                PROJEÇÃO ZOOTÉCNICA EM TEMPO REAL
              </span>
              <span className="text-xs font-mono text-slate-400">
                Modelo: Regressão Linear Dinâmica
              </span>
            </div>

            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              "{prediction.summaryQuote}"
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                Água: <strong className="text-white">{selectedReading.temperature.toFixed(1)}°C</strong> (TGD ótimo)
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                FCR Projetado: <strong className="text-emerald-400">{targetPoint?.projectedFcr || 1.38}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                Valor da Carga: <strong className="text-emerald-300">R$ {(prediction.projectedHarvestBiomassTons * 1000 * farm.fishSalePricePerKg).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong>
              </span>
            </div>
          </div>

          {/* Quick Schedule Freight CTA */}
          <div className="shrink-0 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">
              Logística de Transporte
            </span>
            <button
              onClick={() => setScheduledTruck(true)}
              disabled={scheduledTruck}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                scheduledTruck
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{scheduledTruck ? 'Caminhão Agendado ✓' : 'Agendar Despesca Frigorífico'}</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono block">
              Janela: {prediction.harvestTargetDateStr}
            </span>
          </div>
        </div>
      </div>

      {/* Target Weight Slider & Projection Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Calibrador de Meta de Colheita</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ajuste o peso alvo para recalcular imediatamente os dias de despesca e a tonelagem esperada.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="text-xs text-slate-400">Peso Alvo:</span>
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-amber-300 font-black text-sm">
              {targetWeightG} g
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <input
            type="range"
            min="650"
            max="1100"
            step="25"
            value={targetWeightG}
            onChange={(e) => setTargetWeightG(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>650g (Filé Pequeno)</span>
            <span>800g (Padrão Frigorífico Exportação)</span>
            <span>950g (Premium Ágio Máximo)</span>
            <span>1.100g (Peixe Inteiro Especial)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Weight Growth Curve (SVG Visualization) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Curva Projetada de Ganho de Peso (TGD Térmico Acumulado)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Horizonte de 28 Dias
          </span>
        </div>

        {/* SVG Chart */}
        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
          <div className="h-48 w-full relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 150">
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="700" y2="30" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
              <line x1="0" y1="75" x2="700" y2="75" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />

              {/* Area polygon */}
              {(() => {
                const pointsStr = prediction.points
                  .map((p, idx) => {
                    const x = (idx / (prediction.points.length - 1)) * 700;
                    const normalized = (p.avgWeightG - minWeightInHorizon) / weightRange;
                    const y = 140 - normalized * 115;
                    return `${x},${y}`;
                  })
                  .join(' ');
                return <polygon points={`0,145 ${pointsStr} 700,145`} fill="url(#growthGrad)" />;
              })()}

              {/* Growth Curve Polyline */}
              {(() => {
                const pointsStr = prediction.points
                  .map((p, idx) => {
                    const x = (idx / (prediction.points.length - 1)) * 700;
                    const normalized = (p.avgWeightG - minWeightInHorizon) / weightRange;
                    const y = 140 - normalized * 115;
                    return `${x},${y}`;
                  })
                  .join(' ');
                return <polyline fill="none" stroke="#06b6d4" strokeWidth="3" points={pointsStr} />;
              })()}

              {/* Target Harvest Pin */}
              {(() => {
                const targetIdx = prediction.points.findIndex((p) => p.isHarvestTarget);
                if (targetIdx === -1) return null;
                const x = (targetIdx / (prediction.points.length - 1)) * 700;
                const normalized = (targetPoint.avgWeightG - minWeightInHorizon) / weightRange;
                const y = 140 - normalized * 115;

                return (
                  <g>
                    <line x1={x} y1="0" x2={x} y2="145" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx={x} cy={y} r="8" fill="#f59e0b" className="animate-ping" opacity="0.7" />
                    <circle cx={x} cy={y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <text x={x} y={y - 12} fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      ★ Meta: {targetPoint.avgWeightG}g ({targetPoint.dateStr})
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
            <span>D+28</span>
          </div>
        </div>

        {/* Projection Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Dias a Frente</th>
                <th className="py-2.5 px-3">Peso Médio Estimado</th>
                <th className="py-2.5 px-3">Ganho Diário (GPD)</th>
                <th className="py-2.5 px-3">Biomassa Total</th>
                <th className="py-2.5 px-3">FCR Acumulado</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {prediction.points
                .filter((_, idx) => idx % 4 === 0 || idx === prediction.daysToTarget)
                .map((pt) => (
                  <tr
                    key={pt.dayOffset}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      pt.isHarvestTarget ? 'bg-amber-950/30 text-amber-300 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3">{pt.dateStr}</td>
                    <td className="py-2 px-3">D+{pt.dayOffset}</td>
                    <td className="py-2 px-3 font-bold text-cyan-300">{pt.avgWeightG} g</td>
                    <td className="py-2 px-3 text-emerald-400">+{pt.dailyWeightGainG} g/dia</td>
                    <td className="py-2 px-3 font-bold">{pt.biomassTons} t</td>
                    <td className="py-2 px-3">{pt.projectedFcr}</td>
                    <td className="py-2 px-3 text-right">
                      {pt.isHarvestTarget ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                          PONTO DE DESPESCA
                        </span>
                      ) : (
                        <span className="text-slate-500">Crescimento</span>
                      )}
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
