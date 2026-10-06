import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Battery,
  Camera,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Droplets,
  Layers,
  Power,
  RotateCcw,
  Scale,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wifi,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { ProfitDial } from './ProfitDial';
import { calculateBiomassKg, calculateToxicAmmonia } from '../utils/aquacultureMath';

interface FlutterMobileCompanionProps {
  onOpenScanner: () => void;
  onOpenBiometry: (tankId: string) => void;
}

export const FlutterMobileCompanion: React.FC<FlutterMobileCompanionProps> = ({
  onOpenScanner,
  onOpenBiometry,
}) => {
  const {
    tanks,
    batches,
    sensorReadings,
    farm,
    alerts,
    toggleAerator,
    emergencyTurnOnAerators,
  } = useAquaCore();

  const [selectedTankId, setSelectedTankId] = useState<string>('tank-04');
  const [deviceFrame, setDeviceFrame] = useState<'ios' | 'android'>('android');

  const selectedTank = tanks.find((t) => t.id === selectedTankId) || tanks[0];
  const selectedBatch = batches.find((b) => b.tankId === selectedTankId) || batches[0];
  const selectedReading = sensorReadings[selectedTankId] || sensorReadings[selectedTank.id];

  const toxicNh3 = calculateToxicAmmonia(selectedReading.ammoniaTotal, selectedReading.ph, selectedReading.temperature);
  const biomassKg = calculateBiomassKg(selectedBatch.currentCount, selectedBatch.currentWeightG);
  const isHypoxia = selectedReading.dissolvedOxygen < 3.2;

  // Active Critical Alerts across any tank
  const criticalO2Alert = alerts.find((a) => a.parameter === 'O2' && a.severity === 'critical' && !a.resolved);

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
            <Smartphone className="w-4 h-4" />
            <span>Pilar 3 • Frontend Disruptivo Flutter (iOS & Android)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Simulador do App Nativo Flutter
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Experiência mobile com os 3 pilares absolutos: <strong>The Red Alert System</strong> pulsante no topo, <strong>The Profit Dial</strong> circular em tempo real e <strong>Input Zero</strong> com scanner por câmera.
          </p>
        </div>

        {/* Frame Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setDeviceFrame('android')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              deviceFrame === 'android' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Google Pixel (Android)
          </button>
          <button
            onClick={() => setDeviceFrame('ios')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              deviceFrame === 'ios' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Apple iPhone (iOS)
          </button>
        </div>
      </div>

      {/* Main Centered Mobile Device Mockup */}
      <div className="flex justify-center py-4">
        <div className="w-full max-w-[390px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 relative overflow-hidden">
          {/* Hardware Notch / Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950"></div>
          </div>

          {/* Internal Mobile Screen */}
          <div className="bg-slate-950 rounded-[36px] overflow-hidden flex flex-col min-h-[720px] max-h-[780px] border border-slate-900 text-slate-100 font-sans relative">
            {/* Status Bar */}
            <div className="pt-3 px-6 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-400 z-20">
              <span className="font-bold">11:20</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px]">5G</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* PILAR 1: THE RED ALERT SYSTEM (Pulsing Top Banner) */}
            {criticalO2Alert ? (
              <div className="bg-red-600 text-white px-4 py-2.5 shadow-lg shadow-red-950 animate-pulse flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 shrink-0 animate-bounce" />
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase font-mono block">
                      RED ALERT // HIPÓXIA ({criticalO2Alert.currentValue.toFixed(1)} mg/L)
                    </span>
                    <span className="text-[9px] font-mono opacity-90 block">
                      {criticalO2Alert.tankName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => emergencyTurnOnAerators(criticalO2Alert.tankId)}
                  className="px-2.5 py-1 rounded bg-white text-red-600 font-black text-[10px] font-mono shadow-md cursor-pointer hover:bg-red-50"
                >
                  LIGAR
                </button>
              </div>
            ) : (
              <div className="bg-emerald-950/70 border-b border-emerald-800/60 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> TELEMETRIA SEGURA (QoS 1)
                </span>
                <span>IOT STREAM</span>
              </div>
            )}

            {/* Scrollable Screen Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-16">
              {/* App Brand Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>AQUA-CORE</span>
                    <span className="text-cyan-400 text-xs font-mono font-bold">FLUTTER</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Fazenda Santa Fé • Represa Ilha Solteira
                  </p>
                </div>

                {/* Tank Selector on Mobile */}
                <select
                  value={selectedTankId}
                  onChange={(e) => setSelectedTankId(e.target.value)}
                  className="bg-slate-900 text-cyan-300 text-[10px] font-mono font-bold py-1 px-2 rounded-lg border border-slate-700 cursor-pointer"
                >
                  {tanks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name.split('-')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* PILAR 2: THE PROFIT DIAL */}
              <ProfitDial size="md" tankId={selectedTankId} />

              {/* Instant Telemetry Grid for Selected Tank */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div
                  className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                    isHypoxia
                      ? 'bg-red-950/80 border-red-700 text-red-300'
                      : 'bg-slate-900/90 border-slate-800 text-cyan-300'
                  }`}
                >
                  <span className="text-[10px] opacity-75">Oxigênio O2</span>
                  <div className="text-xl font-black my-0.5">
                    {selectedReading.dissolvedOxygen.toFixed(2)}{' '}
                    <span className="text-[9px] font-normal">mg/L</span>
                  </div>
                  <span className="text-[9px]">
                    {isHypoxia ? 'ASFIXIA IMINENTE' : 'Saturação Ótima'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400">Temperatura</span>
                  <div className="text-xl font-black my-0.5">
                    {selectedReading.temperature.toFixed(1)}°C
                  </div>
                  <span className="text-[9px] text-cyan-400 font-mono">Metabolismo 100%</span>
                </div>
              </div>

              {/* PILAR 3: INPUT ZERO QUICK ACTIONS */}
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Manejo Input Zero (Sem Digitação)</span>
                  </span>
                </div>

                {/* Action 1: Feed Bag Scanner */}
                <button
                  onClick={onOpenScanner}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase font-mono shadow-md shadow-cyan-600/30 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Fotografar Saco de Ração</span>
                  </span>
                  <span className="text-[9px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 font-bold">
                    IA OCR
                  </span>
                </button>

                {/* Action 2: Stepped Biometry */}
                <button
                  onClick={() => onOpenBiometry(selectedTankId)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase font-mono flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-400" />
                    <span>Validar Biometria Semanal</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {selectedBatch.currentWeightG}g
                  </span>
                </button>

                {/* Aerator switch on mobile */}
                <button
                  onClick={() => toggleAerator(selectedTank.id)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs font-mono flex items-center justify-between border cursor-pointer ${
                    selectedTank.aeratorActive
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Power className="w-4 h-4 text-emerald-400" />
                    <span>Aeradores {selectedTank.name.split('-')[0]}</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold">
                    {selectedTank.aeratorActive ? 'ATIVADOS (ON)' : 'PARADOS (OFF)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Flutter Mobile Bottom Navigation Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-900/95 border-t border-slate-800/80 px-6 py-2 flex items-center justify-between text-slate-400 text-[10px] font-mono z-20 backdrop-blur-md">
              <div className="flex flex-col items-center text-cyan-400">
                <Activity className="w-4 h-4" />
                <span className="mt-0.5">Status</span>
              </div>
              <div
                onClick={onOpenScanner}
                className="flex flex-col items-center hover:text-white cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span className="mt-0.5">Scanner</span>
              </div>
              <div
                onClick={() => onOpenBiometry(selectedTankId)}
                className="flex flex-col items-center hover:text-white cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span className="mt-0.5">Biometria</span>
              </div>
              <div className="flex flex-col items-center hover:text-white cursor-pointer">
                <DollarSign className="w-4 h-4" />
                <span className="mt-0.5">DRE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
