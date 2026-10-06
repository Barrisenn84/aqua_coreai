import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Code,
  Compass,
  CornerDownLeft,
  Flame,
  Globe,
  Headphones,
  Info,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Video,
  Volume2,
  Zap,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';
import { WhatsAppMessageLevel } from '../models/aquacultureModels';

export const WhatsAppGhostUXView: React.FC = () => {
  const {
    whatsAppMessages,
    sendWhatsAppMessage,
    triggerDailyDigest,
    triggerGuardianEmergency,
    farm,
    totalBiomassKg,
    globalFcr,
    sensorReadings,
  } = useAquaCore();

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'webhook-bridge'>('chat');
  const [audioSimulating, setAudioSimulating] = useState<boolean>(false);
  const [backendHubHistory, setBackendHubHistory] = useState<any[]>([]);
  const [isHubTesting, setIsHubTesting] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchHubHistory = async () => {
    try {
      const res = await fetch('/api/messaging/history');
      if (res.ok) {
        const data = await res.json();
        setBackendHubHistory(data.history || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico do MessagingHub:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'webhook-bridge') {
      fetchHubHistory();
      const interval = setInterval(fetchHubHistory, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const testMessagingHubLevel = async (level: 'CRITICAL' | 'CONSULT' | 'INFO') => {
    setIsHubTesting(true);
    try {
      let payload: any = {};
      if (level === 'CRITICAL') {
        payload = {
          tankId: 'Tanque 01',
          tankName: 'Tanque 01',
          sensor: 'Oxigênio',
          value: 3.6,
          limit: 4.0,
          temp: 29.0,
          potentialLoss: 'R$ 8.900,00',
        };
      } else if (level === 'CONSULT') {
        payload = {
          lot: 'Lote_04 (Tanque 04)',
          species: 'Camarão Vannamei',
          temperature: 29.8,
          biomassKg: 8500,
          question: 'Compensa colher agora ou esperar?',
        };
      } else {
        payload = {
          farmName: 'Fazenda River Life (Polo de Mogeiro – PB)',
          totalBiomassTons: totalBiomassKg / 1000,
          avgFcr: globalFcr,
          survivalRate: 92,
        };
      }

      await fetch('/api/messaging/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '+5584988585211',
          level,
          payload,
        }),
      });

      await fetchHubHistory();
    } catch (e) {
      console.error('Erro ao testar MessagingHub:', e);
    } finally {
      setIsHubTesting(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [whatsAppMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;

    const text = inputPrompt.trim();
    setInputPrompt('');
    setIsSending(true);

    try {
      await sendWhatsAppMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputPrompt(question);
  };

  const simulateAudioNote = async () => {
    setAudioSimulating(true);
    const audioText = '🎤 [Áudio Transcrito via Whisper/Gemini]: "AQUA-CORE, notei a água do tanque 4 meio parada e os peixes na flor d\'água... Devo ligar o aerador agora?"';
    try {
      await sendWhatsAppMessage(audioText);
    } finally {
      setAudioSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ghost UX Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-mono">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                PILAR 1 & 3 • O Design Invisível (Ghost UX)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                WhatsApp Business API Meta v20.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              A Morte do App: <span className="text-emerald-400">A Interface é a Linguagem</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl mt-1 leading-relaxed">
              O produtor rural não precisa abrir dashboards complexos no campo. A inteligência
              central processa telemetria IoT via MQTT, roda o Gemini AI e fala com ele diretamente
              pelo WhatsApp em 3 níveis: <span className="text-amber-300 font-semibold">Informativo</span> (Daily Digest), <span className="text-cyan-300 font-semibold">Consultivo</span> (The Oracle) e <span className="text-red-400 font-semibold">Crítico</span> (The Guardian).
            </p>
          </div>

          {/* Quick Triggers Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulador WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveTab('webhook-bridge')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'webhook-bridge'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Orquestrador & Webhook</span>
            </button>
          </div>
        </div>

        {/* 3 Pillars Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">The Daily Digest</span>
                <span className="text-[10px] font-mono text-slate-400">07:00h Diário</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Briefing executivo com biomassa total, saúde do lote e recomendação de trato matinal.
              </p>
              <button
                onClick={triggerDailyDigest}
                className="mt-2 text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Simular Envio das 07h</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">The Oracle</span>
                <span className="text-[10px] font-mono text-slate-400">Sob Demanda</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Doses precisas calculadas pelo cruzamento de peso biométrico e temperatura da água.
              </p>
              <button
                onClick={() => handleQuickQuestion('Quanto de ração coloco no Lote B hoje?')}
                className="mt-2 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Perguntar Doses de Ração</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-red-500/30 rounded-xl p-3.5 flex items-start gap-3 bg-red-950/10">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400">The Guardian</span>
                <span className="text-[10px] font-mono text-red-300 font-bold bg-red-500/20 px-1.5 py-0.5 rounded">
                  Tempo Real
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Disparo autônomo imediato para hipóxia letal com loop de confirmação de 15 minutos.
              </p>
              <button
                onClick={() => triggerGuardianEmergency('tank-04')}
                className="mt-2 text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Simular Alerta Crítico O₂</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View: WhatsApp Chat vs Webhook Bridge */}
      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: WhatsApp Smartphone Device Frame */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-[#0b141a] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[680px]">
              {/* WhatsApp Header */}
              <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                      AC
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#202c33]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-slate-100">AQUA-CORE AI</h2>
                      <span className="inline-flex items-center" title="Conta Comercial Verificada">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      online • Sistema Nervoso Aquícola
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                  <span className="text-xs font-mono text-emerald-400 font-bold hidden sm:inline-block bg-[#111b21] px-2.5 py-1 rounded-full border border-emerald-800">
                    +55 84 98858-5211 (Collermhann)
                  </span>
                  <button className="hover:text-slate-200">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="hover:text-slate-200">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3.5"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, rgba(11, 20, 26, 1) 100%)`,
                }}
              >
                {/* E2E Encryption Banner */}
                <div className="flex justify-center">
                  <span className="bg-[#182229] text-[#ffd279] text-[10px] px-3 py-1 rounded-lg shadow-sm border border-[#2a3942] text-center max-w-sm flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    As mensagens desta conversa utilizam canal criptografado direto com a API Meta WhatsApp Cloud.
                  </span>
                </div>

                {whatsAppMessages.map((msg) => {
                  const isUser = msg.sender === 'producer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md relative ${
                          isUser
                            ? 'bg-[#005c4b] text-slate-100 rounded-tr-none'
                            : msg.level === 'critical'
                            ? 'bg-[#3b1219] border border-red-500/50 text-slate-100 rounded-tl-none shadow-red-950/50 shadow-lg'
                            : 'bg-[#202c33] text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {/* Header for AI messages */}
                        {!isUser && (
                          <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-white/10 text-[10px]">
                            <span className="font-bold flex items-center gap-1 text-emerald-400">
                              <Bot className="w-3 h-3" />
                              AQUA-CORE Engine
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono font-bold uppercase text-[9px] ${
                                msg.level === 'critical'
                                  ? 'bg-red-500 text-white'
                                  : msg.level === 'consultative'
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {msg.level === 'critical'
                                ? 'The Guardian'
                                : msg.level === 'consultative'
                                ? 'The Oracle'
                                : 'Daily Digest'}
                            </span>
                          </div>
                        )}

                        {/* Content text */}
                        <div className="text-[13px] whitespace-pre-line leading-relaxed font-sans select-text">
                          {msg.content}
                        </div>

                        {/* Message Meta Info */}
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-400 select-none">
                          <span className="font-mono">{msg.timestamp}</span>
                          {isUser && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="bg-[#202c33] px-3 py-2.5 border-t border-[#2a3942]">
                {/* Suggestions Chips Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 text-[11px]">
                  <span className="text-slate-400 text-[10px] shrink-0 font-mono">Sugestões:</span>
                  <button
                    onClick={() => handleQuickQuestion('Quanto de ração coloco no Lote B hoje?')}
                    className="px-2.5 py-1 rounded-full bg-[#111b21] hover:bg-[#2a3942] text-slate-300 border border-slate-700 shrink-0 cursor-pointer transition-all"
                  >
                    🍽️ Quanto de ração no Lote B?
                  </button>
                  <button
                    onClick={() => handleQuickQuestion('Qual a biomassa viva e FCR agora?')}
                    className="px-2.5 py-1 rounded-full bg-[#111b21] hover:bg-[#2a3942] text-slate-300 border border-slate-700 shrink-0 cursor-pointer transition-all"
                  >
                    ⚖️ Biomassa e FCR global
                  </button>
                  <button
                    onClick={() => handleQuickQuestion('Como está o oxigênio do tanque 4?')}
                    className="px-2.5 py-1 rounded-full bg-[#111b21] hover:bg-[#2a3942] text-slate-300 border border-slate-700 shrink-0 cursor-pointer transition-all"
                  >
                    🧪 Oxigênio do Tanque 04
                  </button>
                  <button
                    onClick={simulateAudioNote}
                    disabled={audioSimulating}
                    className="px-2.5 py-1 rounded-full bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-700/50 shrink-0 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Mic className="w-3 h-3 text-cyan-400" />
                    <span>Mandar Áudio</span>
                  </button>
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <div className="flex-1 bg-[#2a3942] rounded-xl px-3.5 py-2 flex items-center gap-2 border border-transparent focus-within:border-emerald-500/50">
                    <input
                      type="text"
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      placeholder="Converse em linguagem natural com o AQUA-CORE..."
                      className="bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputPrompt.trim() || isSending}
                    className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-emerald-950"
                    title="Enviar Mensagem (Enter)"
                  >
                    {isSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Ghost UX Architecture & Fast Triggers */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live Operational Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Status da Conectividade WhatsApp</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Gateway Meta / Cloud API:</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Conectado (200 OK)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Tempo de Resposta NLP:</span>
                  <span className="font-mono font-bold text-cyan-300">~ 380ms (Gemini Flash)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Telemetria IoT Pareada:</span>
                  <span className="font-mono font-bold text-slate-200">4 Caixas Pretas HaaS 4G</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Biomassa Ativa Monitorada:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {(totalBiomassKg / 1000).toFixed(2)} t
                  </span>
                </div>
              </div>
            </div>

            {/* Ghost UX Manual Test Triggers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Testador de Cenários de Mensageria</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clique nos botões abaixo para disparar os fluxos automáticos exatos que a IA
                executa em segundo plano:
              </p>

              <div className="space-y-2">
                <button
                  onClick={triggerDailyDigest}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">
                      Disparar "The Daily Digest"
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Enviado às 07:00 com resumo zootécnico e DRE
                    </span>
                  </div>
                  <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => handleSend({ preventDefault: () => {} } as React.FormEvent)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-500 transition-all flex items-center justify-between group cursor-pointer"
                  disabled={isSending}
                >
                  <div>
                    <span className="text-xs font-bold text-cyan-300 block">
                      Consultar "The Oracle"
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Calcula ração precisa baseada na temperatura do tanque
                    </span>
                  </div>
                  <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => triggerGuardianEmergency('tank-04')}
                  className="w-full text-left p-3 rounded-xl bg-red-950/30 border border-red-500/40 hover:border-red-500 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-red-400 block">
                      Disparar "The Guardian" (Emergência)
                    </span>
                    <span className="text-[10px] text-red-300/80">
                      Comando de sobrevivência imediato + monitoramento 15 min
                    </span>
                  </div>
                  <Flame className="w-4 h-4 text-red-400 animate-pulse group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quote on Zero Interface */}
            <div className="bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 text-xs text-slate-300">
              <span className="font-bold text-emerald-400 block mb-1">
                💬 Filosofia "Zero Interface":
              </span>
              "O melhor app é aquele que o produtor não precisa instalar nem abrir. O WhatsApp já está
              no bolso dele. A IA do AQUA-CORE cuida da matemática pesada e entrega apenas comandos
              de ouro."
            </div>
          </div>
        </div>
      ) : (
        /* Webhook & Meta Bridge Architecture Inspector */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <span>Orquestrador de Mensageria: Webhook & Ingestor</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Como os sensores IoT e as mensagens de WhatsApp trafegam pelo backend Node.js
                até o Gemini AI e retornam ao produtor via Meta WhatsApp API.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Meta Cloud API Ready
            </span>
          </div>

          {/* Architecture Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30">
              <span className="text-cyan-400 font-bold block mb-1">1. ENTRADA (Sensorial)</span>
              <p className="text-slate-300 text-[11px]">
                • ESP32 via MQTT (4G SIM7600)<br />
                • Mensagem WhatsApp (Texto/Áudio)<br />
                • Webhook HTTP POST
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/30">
              <span className="text-purple-400 font-bold block mb-1">2. SPINAL CORD (Node.js)</span>
              <p className="text-slate-300 text-[11px]">
                • Validação de Token Meta<br />
                • Cache Redis (&lt;2ms)<br />
                • Histórico 10 leituras Mongo
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/30">
              <span className="text-amber-400 font-bold block mb-1">3. COGNITION (Gemini)</span>
              <p className="text-slate-300 text-[11px]">
                • Classificação de Intenção<br />
                • Zootecnia (Emerson / TGD)<br />
                • Formatação WhatsApp Nativa
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block mb-1">4. SAÍDA (Meta/Twilio)</span>
              <p className="text-slate-300 text-[11px]">
                • WhatsApp Outbound Dispatch<br />
                • Alerta sonoro de emergência<br />
                • Agendamento loop 15 min
              </p>
            </div>
          </div>

          {/* Webhook JSON Payloads Inspection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span>Webhook Inbound Payload (Meta WhatsApp API)</span>
                <span className="text-emerald-400 font-bold">POST /api/whatsapp/webhook</span>
              </div>
              <pre className="text-slate-300">
{`{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_98234827162",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "551999842AQUA",
          "phone_number_id": "10492837482"
        },
        "contacts": [{
          "profile": { "name": "Produtor Fazenda Santa Helena" },
          "wa_id": "5519987654321"
        }],
        "messages": [{
          "from": "5519987654321",
          "id": "wamid.HBgLNTUxOTk4...==",
          "timestamp": "${Math.floor(Date.now() / 1000)}",
          "text": { "body": "Quanto de ração coloco no Lote B hoje?" },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}`}
              </pre>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span>Outbound Dispatch Payload (AQUA-CORE Engine)</span>
                <span className="text-cyan-400 font-bold">POST https://graph.facebook.com/v20.0/messages</span>
              </div>
              <pre className="text-emerald-400">
{`{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5519987654321",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "🔮 *THE ORACLE (Manejo Nutricional)*\\nLote: *Lote B (Tanque 02)*\\n\\n• *Dose recomendada hoje:* *12.4 kg* de ração 32% PB.\\n• *Justificativa:* Água a 27.8°C com O₂ em 5.8 mg/L. Metabolismo em alta (+14%).\\n\\n*Economia esperada:* Zero desperdício no fundo do tanque."
  }
}`}
              </pre>
            </div>
          </div>

          {/* MessagingHub Live Dispatch Engine & Real-Time Log */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>MessagingHub: Orquestrador em Tempo Real</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Execute e monitore os disparos ativos dos 3 níveis de comunicação da Infraestrutura Invisível.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => testMessagingHubLevel('CRITICAL')}
                  disabled={isHubTesting}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Testar Crítico (Guardian)</span>
                </button>

                <button
                  onClick={() => testMessagingHubLevel('CONSULT')}
                  disabled={isHubTesting}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Testar Consultivo (Oracle)</span>
                </button>

                <button
                  onClick={() => testMessagingHubLevel('INFO')}
                  disabled={isHubTesting}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Testar Diário (Digest)</span>
                </button>

                <button
                  onClick={fetchHubHistory}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Atualizar log"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dispatched Messages Feed */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {backendHubHistory.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Nenhum disparo registrado ainda. Clique nos botões acima ou acione o MQTT Ingestor para ver eventos em tempo real.
                </div>
              ) : (
                backendHubHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.level === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : item.level === 'CONSULT'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.level === 'CRITICAL'
                            ? '🚨 NÍVEL CRÍTICO'
                            : item.level === 'CONSULT'
                            ? '💡 NÍVEL CONSULTIVO'
                            : '🌅 DAILY DIGEST'}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          Para: {item.userId}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/30">
                        {item.channel}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
