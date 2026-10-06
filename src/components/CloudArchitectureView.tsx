import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  Globe,
  Layers,
  Radio,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const CloudArchitectureView: React.FC = () => {
  const { farm, tanks, isSimulating } = useAquaCore();

  const [iotStatus, setIotStatus] = useState<any>({
    totalPacketsReceived: 1240,
    tanksMonitored: 5,
    cacheStats: { hits: 4520, misses: 12, hitRate: '99.7%', keysCount: 5 },
    brokerStatus: 'CONNECTED (MQTT 3.1.1 QoS 1)',
    pubSubStatus: 'READY (Google Cloud Pub/Sub)',
  });

  const [livePackets, setLivePackets] = useState<
    { id: string; time: string; topic: string; payload: string; latency: string }[]
  >([]);

  // Fetch telemetry status and simulate live MQTT packets
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/iot/status');
        if (res.ok) {
          const data = await res.json();
          setIotStatus(data);
        }
      } catch (e) {
        // use local
      }
    };

    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
      // append live packet
      const randomTank = tanks[Math.floor(Math.random() * tanks.length)];
      const o2 = (Math.random() * 2 + 4.5).toFixed(2);
      const temp = (Math.random() * 2 + 27.5).toFixed(1);
      const newPacket = {
        id: `pkt-${Date.now()}`,
        time: new Date().toLocaleTimeString('pt-BR'),
        topic: `aquacore/farm-01/tanks/${randomTank?.id || 'tank-04'}/telemetry`,
        payload: `{"O2":${o2},"temp":${temp},"pH":7.55,"status":"QoS_1"}`,
        latency: `${(Math.random() * 1.5 + 0.4).toFixed(2)} ms`,
      };
      setLivePackets((prev) => [newPacket, ...prev.slice(0, 7)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [tanks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
            <Cloud className="w-4 h-4" />
            <span>High-Level Blueprint • 3 Camadas Independentes & GCP Stack</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Arquitetura de Alta Disponibilidade AQUA-CORE
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Desacoplamento em 3 camadas: se o aplicativo cair, os sensores continuam transmitindo via MQTT, o cache em memória absorve a telemetria e o cérebro da IA continua emitindo pareceres.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-bold">GCP Cloud Run: AUTO-SCALING 1..1000</span>
        </div>
      </div>

      {/* The 3-Tier Architecture Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier 1: Camada de Ingestão (The Senses) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/60 transition-all">
          <div className="absolute top-0 right-0 bg-cyan-950 border-b border-l border-cyan-800/80 px-3 py-1 rounded-bl-xl text-[10px] font-mono font-bold text-cyan-300">
            CAMADA 1 • THE SENSES
          </div>

          <div>
            <div className="flex items-center gap-2.5 text-cyan-400 mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 flex items-center justify-center border border-cyan-800">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Camada de Ingestão</h3>
                <span className="text-[10px] font-mono text-slate-400">IoT Gateway & MQTT Broker</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              Coletores de campo transmitem telemetria físico-química via protocolo MQTT de baixo overhead para o ingestor Node.js.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Protocolo:</span>
                <span className="text-cyan-400 font-bold">MQTT 3.1.1 (QoS 1)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Fila Crítica:</span>
                <span className="text-slate-200 font-bold">Google Cloud Pub/Sub</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Topologia:</span>
                <span className="text-emerald-400 font-bold">5 Tanques em Stream</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Status Ingestor:</span>
            <span className="text-emerald-400 font-bold">ONLINE (0% Packet Loss)</span>
          </div>
        </div>

        {/* Tier 2: Camada de Processamento (The Spinal Cord) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/60 transition-all">
          <div className="absolute top-0 right-0 bg-blue-950 border-b border-l border-blue-800/80 px-3 py-1 rounded-bl-xl text-[10px] font-mono font-bold text-blue-300">
            CAMADA 2 • SPINAL CORD
          </div>

          <div>
            <div className="flex items-center gap-2.5 text-blue-400 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-950 flex items-center justify-center border border-blue-800">
                <Server className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Processamento & Cache</h3>
                <span className="text-[10px] font-mono text-slate-400">Node.js + Redis + MongoDB</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              O produtor não pode esperar disco quando peixes estão morrendo. A última leitura é mantida em cache Redis com resposta inferior a 2 milissegundos.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Cache Telemetria:</span>
                <span className="text-emerald-400 font-bold">Redis (&lt; 2ms latência)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Hit Rate do Cache:</span>
                <span className="text-cyan-400 font-bold">{iotStatus.cacheStats?.hitRate || '99.6%'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Persistência:</span>
                <span className="text-slate-200 font-bold">MongoDB Atlas / Firestore</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Runtime Host:</span>
            <span className="text-blue-400 font-bold">Cloud Run (Managed Serverless)</span>
          </div>
        </div>

        {/* Tier 3: Camada de Cognição (The Brain) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/60 transition-all">
          <div className="absolute top-0 right-0 bg-purple-950 border-b border-l border-purple-800/80 px-3 py-1 rounded-bl-xl text-[10px] font-mono font-bold text-purple-300">
            CAMADA 3 • THE BRAIN
          </div>

          <div>
            <div className="flex items-center gap-2.5 text-purple-400 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-950 flex items-center justify-center border border-purple-800">
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Camada de Cognição</h3>
                <span className="text-[10px] font-mono text-slate-400">Gemini 3.8 Flash Neural Bridge</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              O "Pulo do Gato": O backend envia à IA não apenas o dado pontual, mas o histórico de 10 leituras + contexto de lote para avaliar tendências térmicas e de asfixia.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Contexto IA:</span>
                <span className="text-purple-400 font-bold">10 Leituras + Lote + Espécie</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Modelo:</span>
                <span className="text-slate-200 font-bold">models/gemini-3.8-flash</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Input Zero:</span>
                <span className="text-emerald-400 font-bold">Multimodal OCR Ativo</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Raciocínio:</span>
            <span className="text-purple-400 font-bold">Strict Chain of Thought (6 Passos)</span>
          </div>
        </div>
      </div>

      {/* Live MQTT Packet Stream Inspector & Terminal Log */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Live Stream de Pacotes MQTT & Cache In-Memory
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Topic: aquacore/farm-01/tanks/+/telemetry • QoS 1
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {livePackets.length === 0 ? (
            <div className="py-4 text-center text-slate-500">
              Escutando tópicos MQTT em tempo real...
            </div>
          ) : (
            livePackets.map((pkt) => (
              <div
                key={pkt.id}
                className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">{pkt.time}</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800/60">
                    {pkt.topic}
                  </span>
                </div>
                <div className="text-slate-300 font-mono truncate max-w-md">
                  {pkt.payload}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-400 font-bold">Redis Cache: {pkt.latency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
