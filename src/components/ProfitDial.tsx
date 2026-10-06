import React from 'react';
import { Coins, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface ProfitDialProps {
  score?: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  tankId?: string;
}

export const ProfitDial: React.FC<ProfitDialProps> = ({ score: customScore, size = 'md', tankId }) => {
  const { dre, globalFcr, farm, tanks, batches } = useAquaCore();

  // Selected tank or farm general
  const targetTank = tankId ? tanks.find((t) => t.id === tankId) : null;
  const targetBatch = tankId ? batches.find((b) => b.tankId === tankId) : null;

  // Calculate Financial Health Score (0 - 100)
  // Factors: EBITDA margin (weight 40%), FCR efficiency (weight 40%), and aerator state (20%)
  const fcrScore = Math.max(0, Math.min(100, (1.6 - globalFcr) / (1.6 - 1.2) * 100));
  const marginScore = Math.max(0, Math.min(100, (dre.netMarginPct / 35) * 100));
  const score = customScore !== undefined ? customScore : Math.round(fcrScore * 0.5 + marginScore * 0.5);

  const radius = size === 'sm' ? 52 : size === 'lg' ? 95 : 68;
  const stroke = size === 'sm' ? 7 : size === 'lg' ? 14 : 10;
  const normalizedRadius = radius - stroke - 3;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Dial displays 260 degrees arc
  const arcLength = circumference * (260 / 360);
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  const getScoreColor = (val: number) => {
    if (val >= 80) return { stroke: '#10b981', text: 'text-emerald-400', label: 'EXCELENTE', bg: 'from-emerald-950/40' };
    if (val >= 60) return { stroke: '#06b6d4', text: 'text-cyan-400', label: 'LUCRATIVO', bg: 'from-cyan-950/40' };
    if (val >= 40) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'ATENÇÃO', bg: 'from-amber-950/40' };
    return { stroke: '#ef4444', text: 'text-red-400', label: 'CRÍTICO', bg: 'from-red-950/40' };
  };

  const theme = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.bg} to-transparent opacity-30 pointer-events-none`}></div>

      {/* Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono mb-2">
        <span className="text-slate-400 uppercase font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The Profit Dial</span>
        </span>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${theme.text} bg-slate-950 border border-slate-800`}>
          {theme.label}
        </span>
      </div>

      {/* The Circular SVG Dial with Absolute Centered Readout */}
      <div
        className="relative flex items-center justify-center my-1"
        style={{ position: 'relative', width: '120px', height: '120px' }}
      >
        <svg
          height="120"
          width="120"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="rotate-[140deg] overflow-visible"
        >
          {/* Background track arc */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress fill arc */}
          <circle
            stroke={theme.stroke}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease',
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center Readout: position: absolute com transform: translate(-50%, -50%) perfeitamente centralizado e acima do gráfico */}
        <div
          className="flex flex-col items-center justify-center text-center font-mono pointer-events-none select-none"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          <span className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider leading-none mb-1">
            Saúde
          </span>
          <div className="flex items-baseline justify-center leading-none">
            <span className={`${size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-4xl' : 'text-3xl'} font-black tracking-tight ${theme.text}`}>
              {score}
            </span>
            <span className={`${size === 'sm' ? 'text-[11px]' : 'text-sm'} font-normal text-slate-400 ml-0.5`}>
              /100
            </span>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-1 leading-none">
            <TrendingUp className="w-2.5 h-2.5" />
            +{dre.netMarginPct}%
          </span>
        </div>
      </div>

      {/* Bottom Key Economics */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
        <div className="bg-slate-950/60 p-1.5 rounded-lg text-center border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase block">Custo Produção</span>
          <span className="font-bold text-slate-200">R$ {dre.costPerKgProduced.toFixed(2)}/kg</span>
        </div>
        <div className="bg-slate-950/60 p-1.5 rounded-lg text-center border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase block">Margem Líquida</span>
          <span className="font-bold text-emerald-400">R$ {(farm.fishSalePricePerKg - dre.costPerKgProduced).toFixed(2)}/kg</span>
        </div>
      </div>
    </div>
  );
};
