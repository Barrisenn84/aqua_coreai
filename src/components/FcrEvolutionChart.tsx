import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface FcrDataPoint {
  week: string;
  weekNum: number;
  fcrReal: number;
  fcrMeta: number;
  fcrAlert: number;
  feedKg: number;
  biomassGainKg: number;
  financialImpactReais: number;
  status: 'optimal' | 'warning' | 'alert';
}

const globalWeeklyFcrData: FcrDataPoint[] = [
  {
    week: 'Sem 1',
    weekNum: 1,
    fcrReal: 1.16,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 120,
    biomassGainKg: 103,
    financialImpactReais: 380,
    status: 'optimal',
  },
  {
    week: 'Sem 2',
    weekNum: 2,
    fcrReal: 1.21,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 195,
    biomassGainKg: 161,
    financialImpactReais: 560,
    status: 'optimal',
  },
  {
    week: 'Sem 3',
    weekNum: 3,
    fcrReal: 1.25,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 310,
    biomassGainKg: 248,
    financialImpactReais: 720,
    status: 'optimal',
  },
  {
    week: 'Sem 4',
    weekNum: 4,
    fcrReal: 1.29,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 460,
    biomassGainKg: 356,
    financialImpactReais: 890,
    status: 'optimal',
  },
  {
    week: 'Sem 5',
    weekNum: 5,
    fcrReal: 1.32,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 640,
    biomassGainKg: 485,
    financialImpactReais: 980,
    status: 'optimal',
  },
  {
    week: 'Sem 6',
    weekNum: 6,
    fcrReal: 1.34,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 890,
    biomassGainKg: 664,
    financialImpactReais: 1120,
    status: 'optimal',
  },
  {
    week: 'Sem 7 (Hoje)',
    weekNum: 7,
    fcrReal: 1.35,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 1200,
    biomassGainKg: 888,
    financialImpactReais: 1350,
    status: 'optimal',
  },
  {
    week: 'Sem 8 (Proj)',
    weekNum: 8,
    fcrReal: 1.36,
    fcrMeta: 1.35,
    fcrAlert: 1.45,
    feedKg: 1540,
    biomassGainKg: 1132,
    financialImpactReais: 1210,
    status: 'warning',
  },
];

const tankSpecificOffsets: Record<string, number> = {
  'tank-01': -0.02,
  'tank-02': -0.05,
  'tank-03': +0.01,
  'tank-04': +0.03, // Tanque com histórico de calor/aeração
  'tank-05': -0.01,
  'tank-06': 0.00,
  'tank-07': +0.02,
};

export const FcrEvolutionChart: React.FC = () => {
  const { tanks, batches, farm } = useAquaCore();
  const [selectedTankFilter, setSelectedTankFilter] = useState<string>('all');

  // Compute dataset based on tank selection
  const offset = selectedTankFilter === 'all' ? 0 : (tankSpecificOffsets[selectedTankFilter] || 0);

  const chartData = globalWeeklyFcrData.map((d) => {
    const rawFcr = Number((d.fcrReal + offset).toFixed(2));
    const deltaVsMeta = Number((rawFcr - d.fcrMeta).toFixed(2));
    const status: 'optimal' | 'warning' | 'alert' =
      rawFcr <= 1.35 ? 'optimal' : rawFcr <= 1.42 ? 'warning' : 'alert';

    return {
      ...d,
      fcrReal: rawFcr,
      deltaVsMeta,
      status,
    };
  });

  const currentPoint = chartData[chartData.length - 2]; // Current week (Sem 7)
  const projectedPoint = chartData[chartData.length - 1]; // Projected week (Sem 8)
  const isBelowMeta = currentPoint.fcrReal <= 1.35;
  const deviationVal = Number((currentPoint.fcrReal - 1.35).toFixed(2));

  // Custom Dark Tooltip for Mission-Critical UI
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const deviation = (data.fcrReal - 1.35).toFixed(2);
      const isGood = data.fcrReal <= 1.35;

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl font-mono text-xs z-50 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-white">{label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                isGood
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {isGood ? 'Meta Atingida' : 'Atenção Manejo'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>FCR Realizado:</span>
              <span className={`font-bold ${isGood ? 'text-cyan-400' : 'text-amber-400'}`}>
                {data.fcrReal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Meta Zootécnica:</span>
              <span className="text-emerald-400 font-bold">1.35</span>
            </div>

            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Desvio vs Meta:</span>
              <span
                className={`font-bold ${
                  Number(deviation) <= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {Number(deviation) <= 0 ? `${deviation}` : `+${deviation}`}
              </span>
            </div>

            <div className="border-t border-slate-800/80 pt-1.5 mt-1 flex justify-between items-center text-[10px] text-slate-400">
              <span>Ração Acumulada:</span>
              <span className="text-white font-bold">{data.feedKg} kg</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Ganho de Carne:</span>
              <span className="text-emerald-300 font-bold">{data.biomassGainKg} kg</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Evolução Semanal do FCR vs Meta Zootécnica (1.35)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              AUDITORIA NUTRICIONAL
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Detecção precoce de desperdício de ração e sobrealimentação antes de impactar o EBITDA e a margem líquida.
          </p>
        </div>

        {/* Tank / Lot Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400 text-xs">Viveiro:</span>
          <select
            value={selectedTankFilter}
            onChange={(e) => setSelectedTankFilter(e.target.value)}
            className="bg-slate-950 text-cyan-300 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">Fazenda River Life (Média Geral)</option>
            {tanks.map((t) => {
              const b = batches.find((x) => x.tankId === t.id);
              return (
                <option key={t.id} value={t.id}>
                  {t.name.replace(' - Escavado (0,158 ha)', '')} ({b?.batchCode || 'Lote'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* KPI Metric Strips for Early Nutrition Detection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>FCR Semana 7 (Atual)</span>
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-white font-mono">
              {currentPoint.fcrReal.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">kg ração/kg carne</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px]">
            {isBelowMeta ? (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Meta atingida (≤ 1.35)
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> Acima da meta (+{deviationVal})
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Meta Zootécnica</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-400 font-mono">
              1.35
            </span>
            <span className="text-[10px] text-slate-400">padrão Polo PB</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Faixa ótima: 1.25 - 1.40
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Economia de Ração</span>
            <TrendingDown className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-400 font-mono">
              R$ 1.840
            </span>
            <span className="text-[10px] text-slate-400">vs benchmark 1.45</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            -443 kg ração preservada
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Diagnóstico IA Nutricional</span>
            <Info className="w-3 h-3 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-black text-cyan-300 font-mono">
              MANEJO PERFEITO
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 truncate">
            Sem sobras nos bandejões (&lt;3%)
          </div>
        </div>
      </div>

      {/* The Recharts Line Chart */}
      <div className="pt-2">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={[1.05, 1.50]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v: number) => v.toFixed(2)}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{
                  paddingBottom: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />

              {/* Meta Zootécnica 1.35 Reference Line */}
              <ReferenceLine
                y={1.35}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'Meta: 1.35',
                  fill: '#10b981',
                  position: 'insideTopRight',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />

              {/* Limiar de Alerta 1.45 Reference Line */}
              <ReferenceLine
                y={1.45}
                stroke="#ef4444"
                strokeDasharray="2 2"
                strokeOpacity={0.7}
                strokeWidth={1.5}
                label={{
                  value: 'Alerta Risco: 1.45',
                  fill: '#ef4444',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />

              {/* Linha Realizada (Evolução semanal) */}
              <Line
                type="monotone"
                dataKey="fcrReal"
                name="FCR Realizado (Semanal)"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#06b6d4',
                  stroke: '#0e7490',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: '#22d3ee',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />

              {/* Linha da Meta 1.35 */}
              <Line
                type="monotone"
                dataKey="fcrMeta"
                name="Meta Zootécnica (1.35)"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Early Nutritional Deviation Guidance Banner */}
      <div className="bg-slate-950/80 border border-cyan-900/60 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-300">
        <div className="flex items-start sm:items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 text-cyan-400 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white">
              Regra de Ouro Nutricional (Polo Mogeiro – PB):
            </span>{' '}
            <span>
              Cada desvio de <strong className="text-amber-300">+0.10 no FCR</strong> consome{' '}
              <strong className="text-red-400">~R$ 3.520,00 adicionais</strong> em ração Samaria Starter para uma biomassa de 8.500 kg. O monitoramento semanal previne acúmulo de matéria orgânica anóxica no fundo do viveiro.
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 font-bold font-mono text-[11px] text-cyan-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          <span>Status:</span>
          <span className="text-emerald-400">Blindado contra desvios</span>
        </div>
      </div>
    </div>
  );
};
