import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Droplets,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Sliders,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const IoTSimulatorControls: React.FC = () => {
  const { isSimulating, toggleSimulation, triggerScenario, activeScenarioName, emergencyOverrideAllAerators } = useAquaCore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed bottom-20 md:bottom-4 right-3 sm:right-4 z-40 font-mono">
      {/* Expanded Controls Card */}
      {isOpen && (
        <div className="bg-slate-900/95 border border-slate-700/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md mb-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm text-xs animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Painel de Injeção IoT</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Simula anomalias físico-químicas em tempo real para acionar a cadeia de resposta do AQUA-CORE AI.
          </p>

          {activeScenarioName && (
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-[11px]">
              {activeScenarioName}
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Gatilhos de Emergência:
            </span>

            <button
              onClick={() => triggerScenario('hypoxia_dawn')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-800/80 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>Hipóxia Noturna (O2 &lt; 2.0 mg/L)</span>
              </span>
              <span className="text-[10px] text-red-400 font-bold">Tanque 04</span>
            </button>

            <button
              onClick={() => triggerScenario('ammonia_surge')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pico NH3 Tóxico (pH 8.65)</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold">Tanque 03</span>
            </button>

            <button
              onClick={() => triggerScenario('cold_front')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800/80 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Frente Fria Brusca (-4.5°C)</span>
              </span>
              <span className="text-[10px] text-blue-400 font-bold">Geral</span>
            </button>

            <button
              onClick={() => triggerScenario('recover_optimal')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restaurar Baseline Nominal</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Normal</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={toggleSimulation}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSimulating ? 'Pausar Telemetria' : 'Retomar Telemetria'}</span>
            </button>

            <button
              onClick={emergencyOverrideAllAerators}
              className="px-2 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-[10px] transition-colors cursor-pointer"
            >
              Ligar Todos Aeradores
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3.5 py-2 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-500/80 text-white shadow-xl shadow-slate-950/80 flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-cyan-500' : 'bg-slate-600'}`}></span>
        </span>
        <span className="text-xs font-bold text-slate-200">
          Simulador IoT
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>
    </div>
  );
};
