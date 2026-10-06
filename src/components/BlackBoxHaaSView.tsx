import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Battery,
  BatteryCharging,
  Box,
  CheckCircle2,
  Cpu,
  Droplet,
  Droplets,
  HardDrive,
  Info,
  Layers,
  Power,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Signal,
  Smartphone,
  Sparkles,
  Sun,
  Thermometer,
  Wrench,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { IBlackBoxHardware } from '../models/aquacultureModels';

export const BlackBoxHaaSView: React.FC = () => {
  const { blackBoxes, toggleBlackBoxPower, recalibrateProbe, sensorReadings } = useAquaCore();
  const [selectedBoxId, setSelectedBoxId] = useState<string>('bb-esp32-04'); // default on emergency box
  const [activeTab, setActiveTab] = useState<'fleet' | 'anatomy' | 'onboarding'>('fleet');
  const [calibratingProbe, setCalibratingProbe] = useState<string | null>(null);

  const selectedBox: IBlackBoxHardware =
    blackBoxes.find((b) => b.deviceId === selectedBoxId) || blackBoxes[0];

  const handleRecalibrate = (
    probeType: 'dissolved_oxygen' | 'temperature' | 'ph'
  ) => {
    setCalibratingProbe(probeType);
    setTimeout(() => {
      recalibrateProbe(selectedBoxId, probeType);
      setCalibratingProbe(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 font-mono">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                PILAR 2 • Hardware-as-a-Service (HaaS)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                Plug-and-Play Zero Instalação
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              A "Caixa Preta": <span className="text-cyan-400">Infraestrutura Invisível</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl mt-1 leading-relaxed">
              O produtor não compra sensores ou fios. Ele recebe a <strong>Caixa Preta HaaS</strong>:{' '}
              microcontrolador <strong>ESP32</strong>, modem celular <strong>SIM7600 (4G/LTE)</strong> independente de WiFi, painel solar fotovoltaico com bateria de lítio e sondas industriais imersíveis de O₂, temperatura e pH.
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'fleet'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Frota HaaS Ativa</span>
            </button>
            <button
              onClick={() => setActiveTab('anatomy')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'anatomy'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Anatomia do Hardware</span>
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'onboarding'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>A Disrupção (Zero Instalação)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Fleet List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-300 flex items-center justify-between">
              <span>Dispositivos em Campo ({blackBoxes.length} Caixas Pretas)</span>
              <span className="text-[11px] font-mono text-cyan-400">Transmissão 4G LTE</span>
            </h2>

            <div className="space-y-3">
              {blackBoxes.map((box) => {
                const isSelected = box.deviceId === selectedBoxId;
                const isEmergency = box.deviceId === 'bb-esp32-04';

                return (
                  <div
                    key={box.deviceId}
                    onClick={() => setSelectedBoxId(box.deviceId)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/40'
                        : isEmergency
                        ? 'bg-red-950/20 border-red-500/40 hover:border-red-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-100">{box.deviceName}</h3>
                          {box.online ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ONLINE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-700 text-slate-400">
                              OFFLINE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          Modem: {box.cellularModem} • ICCID: ...{box.simIccid.slice(-6)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <Signal className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-300">{box.signalStrengthDbm} dBm</span>
                      </div>
                    </div>

                    {/* Sensor Readings Pills */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px]">
                      <div className="bg-slate-950/70 p-2 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">O₂ Dissolvido</span>
                        <span
                          className={`font-mono font-bold text-xs ${
                            box.probes.dissolvedOxygen.currentValue < 3.2
                              ? 'text-red-400 animate-pulse'
                              : 'text-cyan-300'
                          }`}
                        >
                          {box.probes.dissolvedOxygen.currentValue} mg/L
                        </span>
                      </div>

                      <div className="bg-slate-950/70 p-2 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">Temperatura</span>
                        <span className="font-mono font-bold text-xs text-amber-300">
                          {box.probes.temperature.currentValue} °C
                        </span>
                      </div>

                      <div className="bg-slate-950/70 p-2 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">pH Água</span>
                        <span className="font-mono font-bold text-xs text-emerald-300">
                          {box.probes.ph.currentValue}
                        </span>
                      </div>
                    </div>

                    {/* Battery & Solar status */}
                    <div className="flex items-center justify-between mt-2.5 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Sun className="w-3 h-3" />
                        Solar: +{box.solarGeneratingWatts}W
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <BatteryCharging className="w-3.5 h-3.5" />
                        {box.batteryPct}% ({box.batteryVoltageV}V)
                      </span>
                      <span>Último sync: {box.lastTelemetryTimestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Device Deep Diagnostic */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedBox.deviceName}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {selectedBox.mcu}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID do Dispositivo: {selectedBox.deviceId} • Firmware: {selectedBox.firmwareVersion}
                  </p>
                </div>

                <button
                  onClick={() => toggleBlackBoxPower(selectedBox.deviceId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedBox.online
                      ? 'bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-900/80'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{selectedBox.online ? 'Desligar Caixa' : 'Ligar Caixa'}</span>
                </button>
              </div>

              {/* Hardware Health Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Sinal 4G LTE</span>
                    <Signal className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {selectedBox.signalStrengthDbm} dBm
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Qualidade: {selectedBox.signalQualityPct}% (Ótimo)
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Bateria Lítio</span>
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {selectedBox.batteryPct}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Tensão: {selectedBox.batteryVoltageV}V LiFePO4
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Geração Solar</span>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-base font-bold font-mono text-amber-300">
                    {selectedBox.solarGeneratingWatts} W
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Painel 20W Monocristalino
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Cadência MQTT</span>
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    a cada {selectedBox.transmissionIntervalSec}s
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    QoS 1 (Zero perda)
                  </span>
                </div>
              </div>

              {/* Industrial Probes Status & Recalibration */}
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sondas Industriais Submersíveis</span>
              </h3>

              <div className="space-y-3">
                {/* DO Probe */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      O₂
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {selectedBox.probes.dissolvedOxygen.name}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {selectedBox.probes.dissolvedOxygen.model}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Última calibração: {selectedBox.probes.dissolvedOxygen.calibrationDate} • Imersão IP68
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold font-mono ${
                        selectedBox.probes.dissolvedOxygen.currentValue < 3.2
                          ? 'text-red-400 animate-pulse'
                          : 'text-cyan-300'
                      }`}
                    >
                      {selectedBox.probes.dissolvedOxygen.currentValue} mg/L
                    </span>
                    <button
                      onClick={() => handleRecalibrate('dissolved_oxygen')}
                      disabled={calibratingProbe === 'dissolved_oxygen'}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <RotateCcw
                        className={`w-3 h-3 ${
                          calibratingProbe === 'dissolved_oxygen' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Calibrar</span>
                    </button>
                  </div>
                </div>

                {/* Temperature Probe */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      °C
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {selectedBox.probes.temperature.name}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {selectedBox.probes.temperature.model}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Última calibração: {selectedBox.probes.temperature.calibrationDate} • Aço Inox 316
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold font-mono text-amber-300">
                      {selectedBox.probes.temperature.currentValue} °C
                    </span>
                    <button
                      onClick={() => handleRecalibrate('temperature')}
                      disabled={calibratingProbe === 'temperature'}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <RotateCcw
                        className={`w-3 h-3 ${
                          calibratingProbe === 'temperature' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Calibrar</span>
                    </button>
                  </div>
                </div>

                {/* pH Probe */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      pH
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {selectedBox.probes.ph.name}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {selectedBox.probes.ph.model}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Última calibração: {selectedBox.probes.ph.calibrationDate} • Gel Composto Selado
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold font-mono text-emerald-300">
                      {selectedBox.probes.ph.currentValue} pH
                    </span>
                    <button
                      onClick={() => handleRecalibrate('ph')}
                      disabled={calibratingProbe === 'ph'}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <RotateCcw
                        className={`w-3 h-3 ${
                          calibratingProbe === 'ph' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Calibrar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anatomy View */}
      {activeTab === 'anatomy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Especificação da Caixa Preta Industrial</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Construção robusta com grau de proteção IP67, projetada para suportar sol, chuva,
                salinidade e umidade tropical severa de viveiros de piscicultura.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Hardware HaaS v2.4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">ESP32 Dual-Core</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                240MHz, ultrabaixo consumo no modo deep-sleep, criptografia de hardware TLS 1.3 nativa para tráfego MQTT seguro.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-3">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Módulo SIM7600 4G</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Conectividade celular 4G/LTE Cat-1 com antena helicoidal externa. Não depende do WiFi do produtor ou cabeamento na fazenda.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-3">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Painel Solar 20W + BMS</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Célula fotovoltaica monocristalina + bateria LiFePO4 de 20Ah com mais de 2.000 ciclos de recarga. Autonomia de 14 dias sem sol.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Trio de Sondas IP68</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sonda óptica galvanizada de O₂ (zero desgaste de membrana), sensor digital DS18B20 em aço 316 e eletrodo de pH industrial selado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Zero Instalação */}
      {activeTab === 'onboarding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>A Experiência Disruptiva: "Jogue na Água e Pronto"</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Como o AQUA-CORE elimina toda a fricção de instalação de TI no agronegócio:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-black text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-100 mb-1">Jogue a Sonda no Tanque</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As sondas possuem peso de lastro próprio. O produtor simplesmente joga o cabo na água do viveiro ou tanque-rede na profundidade ideal de 1 metro.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-100 mb-1">Deixe a Caixa no Sol</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fixe a caixa preta na estaca ou flutuador. O mini painel solar carrega a bateria automaticamente e liga o microcontrolador ESP32 sem cabos ou tomadas.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-sm text-emerald-300 mb-1">A IA Fala no WhatsApp</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Em menos de 60 segundos após o primeiro boot, o modem 4G se conecta à torre e o produtor recebe um "Olá!" automático no WhatsApp com as primeiras leituras.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
