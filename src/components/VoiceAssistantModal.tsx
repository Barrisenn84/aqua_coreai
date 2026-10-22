import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, CheckCircle, Command, DollarSign, Droplets, Loader2, Mic, MicOff, RotateCcw, Send, Sparkles, Trash2, Utensils, Volume2, VolumeX, Warehouse, X } from 'lucide-react';

export interface VoiceTankPayload {
  name?: string;
  type?: 'escavado' | 'berçário' | 'geomembrana' | 'raceways';
  areaM2?: number;
  depthM?: number;
  aeratorCount?: number;
  aeratorPowerKw?: number;
  initialBatchCode?: string;
  initialShrimpCount?: number;
  initialWeightG?: number;
}

interface VoiceMessage { role: 'user' | 'assistant'; content: string; timestamp: number; }
interface VoiceWorkflow { type: 'tank_registration'; step: 'name' | 'type' | 'area' | 'depth' | 'aerators' | 'stocking' | 'weight' | 'confirm'; fields: VoiceTankPayload; }

export interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenVision: () => void;
  onOpenScanner?: () => void;
  onOpenFarmProfile?: () => void;
  onOpenReset?: () => void;
  onOpenBiometry?: () => void;
  onCreateTank?: (payload: VoiceTankPayload) => void;
  snapshot?: Record<string, unknown>;
}

const welcomeMessage: VoiceMessage = { role: 'assistant', content: 'Olá! Sou o Dr. Camarão. Podemos conversar normalmente, consultar a fazenda ou cadastrar um tanque passo a passo. O que você precisa?', timestamp: Date.now() };
const workflowLabels: Record<VoiceWorkflow['step'], string> = { name: 'nome do tanque', type: 'tipo de estrutura', area: 'área em m² ou hectares', depth: 'profundidade média', aerators: 'quantidade de aeradores', stocking: 'povoamento inicial', weight: 'peso médio inicial', confirm: 'confirmação' };

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, onNavigateTab, onOpenVision, onOpenScanner, onOpenFarmProfile, onOpenReset, onOpenBiometry, onCreateTank, snapshot }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([welcomeMessage]);
  const [workflow, setWorkflow] = useState<VoiceWorkflow | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true);
  const [executedAction, setExecutedAction] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakText = (text: string) => {
    if (!audioFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`~>]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 500);
      const utterance = new SpeechSynthesisUtterance(clean); utterance.lang = 'pt-BR'; utterance.rate = 1.02; utterance.pitch = 1; window.speechSynthesis.speak(utterance);
    } catch (error) { console.warn('[VoiceAssistant] Síntese de voz indisponível:', error); }
  };

  const stopListening = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (_) { /* já encerrado */ } recognitionRef.current = null; }
    setIsListening(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognition));
    if (!isOpen) { stopListening(); window.speechSynthesis?.cancel(); }
    return () => stopListening();
  }, [isOpen]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);

  const processCommand = async (text: string) => {
    const cleanText = text.trim(); if (!cleanText || isProcessing) return;
    stopListening(); setTranscript(cleanText); setInputText(''); setIsProcessing(true); setExecutedAction(null);
    const userMessage: VoiceMessage = { role: 'user', content: cleanText, timestamp: Date.now() };
    const nextMessages = [...messages, userMessage]; setMessages(nextMessages);
    try {
      const res = await fetch('/api/voice/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: cleanText, context: { history: nextMessages.slice(-8).map(({ role, content }) => ({ role, content })), workflow, snapshot } }) });
      if (!res.ok) throw new Error(`voice command ${res.status}`);
      const data = await res.json(); const reply = data.spokenReply || 'Entendi. Pode me dizer um pouco mais sobre o que deseja fazer?';
      setMessages((current) => [...current, { role: 'assistant', content: reply, timestamp: Date.now() }]); setWorkflow(data.workflow || null); setExecutedAction(data.intent || null); speakText(reply);
      if (data.action === 'create_tank' && data.actionPayload) { onCreateTank?.(data.actionPayload); setMessages((current) => [...current, { role: 'assistant', content: 'Cadastro concluído. O novo tanque já está disponível em Operação & Lotes.', timestamp: Date.now() }]); }
      if (data.action === 'navigate' && data.targetTab) window.setTimeout(() => { onNavigateTab(data.targetTab); onClose(); }, 700);
      if (data.action === 'trigger_action' && data.triggerType) window.setTimeout(() => { onClose(); if (data.triggerType === 'open_vision') onOpenVision(); if (data.triggerType === 'open_scanner') onOpenScanner?.(); if (data.triggerType === 'open_farm_profile') onOpenFarmProfile?.(); if (data.triggerType === 'trigger_reset') onOpenReset?.(); if (data.triggerType === 'open_biometry') onOpenBiometry?.(); }, 700);
    } catch (error) {
      console.warn('[VoiceAssistant] Falha ao processar comando:', error);
      const fallback = 'Não consegui consultar o servidor agora. Você pode tentar novamente ou continuar digitando; não executei nenhuma alteração.';
      setMessages((current) => [...current, { role: 'assistant', content: fallback, timestamp: Date.now() }]); speakText(fallback);
    } finally { setIsProcessing(false); }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; if (!SpeechRecognition) return;
    try {
      if (recognitionRef.current) recognitionRef.current.abort();
      const recognition = new SpeechRecognition(); recognition.lang = 'pt-BR'; recognition.continuous = false; recognition.interimResults = true; recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => { let current = ''; for (let index = event.resultIndex; index < event.results.length; index += 1) current += event.results[index][0].transcript; setTranscript(current); if (event.results[event.results.length - 1].isFinal) processCommand(current); };
      recognition.onerror = (event: any) => { setIsListening(false); if (event.error === 'not-allowed') setMessages((current) => [...current, { role: 'assistant', content: 'O navegador bloqueou o microfone. Autorize-o no cadeado da barra de endereço ou use o campo de texto.', timestamp: Date.now() }]); };
      recognition.onend = () => setIsListening(false); recognitionRef.current = recognition; recognition.start();
    } catch (error) { console.warn('[VoiceAssistant] Não foi possível iniciar o microfone:', error); setIsListening(false); }
  };

  const clearConversation = () => { stopListening(); setWorkflow(null); setTranscript(''); setExecutedAction(null); setMessages([{ ...welcomeMessage, timestamp: Date.now() }]); };
  const quickCommand = (command: string) => processCommand(command);
  if (!isOpen) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
    <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full shadow-2xl relative text-slate-100 max-h-[95vh] flex flex-col my-auto overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/60"><div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0"><Mic className={isListening ? 'w-6 h-6 animate-pulse text-emerald-400' : 'w-6 h-6'} /></div><div className="min-w-0 flex-1"><h2 className="text-lg font-bold flex items-center gap-2 text-white">Voz IA · Dr. Camarão <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-mono">CONVERSA</span></h2><p className="text-xs text-slate-400">Fale ou digite. Eu mantenho o contexto e peço uma informação por vez.</p></div><button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" aria-label="Fechar"><X className="w-5 h-5" /></button></div>
      <div className="flex items-center justify-between gap-3 px-5 py-2 border-b border-slate-800/80 bg-slate-900/80">{workflow ? <span className="text-[11px] text-amber-300 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />Cadastro guiado · próxima pergunta: <strong>{workflowLabels[workflow.step]}</strong></span> : <span className="text-[11px] text-slate-400">Conversa livre · ações só são executadas após confirmação</span>}<button onClick={clearConversation} className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1" title="Começar nova conversa"><Trash2 className="w-3.5 h-3.5" /> Limpar</button></div>
      <div className="px-5 pt-4 flex flex-col min-h-0"><div className="h-52 sm:h-60 overflow-y-auto space-y-3 pr-1" aria-live="polite">{messages.map((message, index) => <div key={`${message.timestamp}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'bg-cyan-600 text-white rounded-br-md' : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-md'}`}><div className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">{message.role === 'user' ? 'Você' : 'Dr. Camarão'}</div>{message.content}</div></div>)}{isProcessing && <div className="flex justify-start"><div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm text-cyan-300 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> analisando contexto…</div></div>}<div ref={messagesEndRef} /></div>
        <div className="flex flex-col items-center justify-center py-3"><button onClick={isListening ? stopListening : startListening} disabled={!isSupported || isProcessing} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${isListening ? 'bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-cyan-500/50 animate-pulse ring-4 ring-cyan-400/20' : 'bg-slate-800 border-2 border-slate-700 hover:border-cyan-500'} disabled:opacity-50`} aria-label={isListening ? 'Parar de ouvir' : 'Falar com o Dr. Camarão'}>{isProcessing ? <Loader2 className="w-8 h-8 animate-spin text-cyan-300" /> : isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-slate-400" />}</button><span className="text-[11px] mt-2 text-cyan-300">{!isSupported ? 'Microfone indisponível · use texto' : isListening ? 'Ouvindo… fale agora' : 'Clique para falar'}</span></div>
        <form onSubmit={(event) => { event.preventDefault(); processCommand(inputText); }} className="flex gap-2 mb-4"><input value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder={workflow ? `Responda: ${workflowLabels[workflow.step]}…` : "Ex.: 'cadastre um tanque' ou 'como está a água?'"} className="flex-1 bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" /><button type="submit" disabled={!inputText.trim() || isProcessing} className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /><span className="hidden sm:inline">Enviar</span></button></form></div>
      <div className="px-5 pb-4 space-y-3"><div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><Command className="w-3 h-3 text-cyan-400" /> Atalhos para começar</div><div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs"><QuickButton icon={<Warehouse className="w-3.5 h-3.5 text-orange-400" />} label="Estoque" onClick={() => quickCommand('Abrir Estoque de Insumos')} /><QuickButton icon={<Droplets className="w-3.5 h-3.5 text-cyan-400" />} label="Água & O₂" onClick={() => quickCommand('Ver Qualidade da Água e Balanço Iônico')} /><QuickButton icon={<Utensils className="w-3.5 h-3.5 text-amber-400" />} label="Bandejas" onClick={() => quickCommand('Ver Alimentação e Bandejas')} /><QuickButton icon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />} label="DRE Lucro" onClick={() => quickCommand('Abrir DRE e Lucros')} /><QuickButton icon={<Camera className="w-3.5 h-3.5 text-teal-400" />} label="Foto IA" onClick={() => { onClose(); onOpenVision(); }} tone="teal" /><QuickButton icon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />} label="Zerar / Reset" onClick={() => { onClose(); onOpenReset?.(); }} tone="amber" /></div><div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400"><button onClick={() => setAudioFeedbackEnabled((value) => !value)} className="flex items-center gap-1.5 hover:text-white">{audioFeedbackEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />} Voz falada: <strong className={audioFeedbackEnabled ? 'text-emerald-400' : 'text-slate-500'}>{audioFeedbackEnabled ? 'ligada' : 'desligada'}</strong></button>{executedAction && <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]"><CheckCircle className="w-3 h-3" /> {executedAction}</span>}</div></div>
    </div>
  </div>;
};

const QuickButton = ({ icon, label, onClick, tone }: { icon: React.ReactNode; label: string; onClick: () => void; tone?: 'teal' | 'amber' }) => <button onClick={onClick} className={`p-2 bg-slate-800/60 hover:bg-slate-800 border rounded-lg text-left text-slate-300 flex items-center justify-between transition-colors ${tone === 'teal' ? 'border-teal-700/60 hover:border-teal-500/70 text-teal-200' : tone === 'amber' ? 'border-amber-700/60 hover:border-amber-500/70 text-amber-200' : 'border-slate-700/60 hover:border-cyan-500/50'}`}><span className="flex items-center gap-1.5 truncate">{icon}{label}</span><ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" /></button>;
