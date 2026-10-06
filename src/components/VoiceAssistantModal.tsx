import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  ArrowRight,
  CheckCircle,
  Zap,
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenVision: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenVision,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>('Clique no microfone ou fale seu comando...');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState<boolean>(true);
  const [executedAction, setExecutedAction] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Falar texto via Web Speech Synthesis (Dr. Camarão Falando)
  const speakText = (text: string) => {
    if (!audioFeedbackEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*_#`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 240);

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Síntese de voz não disponível:', e);
    }
  };

  // Inicializa reconhecimento de fala
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setLastFeedback('Reconhecimento de voz não suportado neste navegador. Utilize Google Chrome ou Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setLastFeedback('Dr. Camarão está ouvindo... Diga um comando como "Abrir Estoque" ou "Qualidade da Água".');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        processCommand(currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Erro de reconhecimento:', event.error);
      if (event.error === 'not-allowed') {
        setLastFeedback('Permissão do microfone negada. Autorize o microfone no navegador.');
      } else {
        setLastFeedback(`Microfone indisponível (${event.error}). Clique para tentar.`);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (_) {}

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [isOpen]);

  const processCommand = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setLastFeedback(`Processando: "${text}"...`);

    try {
      const res = await fetch('/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setExecutedAction(data.intent);
        setLastFeedback(data.spokenReply);
        speakText(data.spokenReply);

        if (data.action === 'navigate' && data.targetTab) {
          setTimeout(() => {
            onNavigateTab(data.targetTab);
            onClose();
          }, 1500);
        }
      }
    } catch {
      const fallback = 'Comando identificado pelo Dr. Camarão.';
      setLastFeedback(fallback);
      speakText(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setLastFeedback('Microfone pausado. Clique para ativar novamente.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (_) {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              Voz IA • Dr. Camarão Copilot
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                Ao Vivo
              </span>
            </h2>
            <p className="text-xs text-slate-400">Controle total por comando de voz e áudio falado no campo</p>
          </div>
        </div>

        {/* Círculo Central do Microfone */}
        <div className="flex flex-col items-center justify-center my-8">
          <button
            onClick={toggleListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-cyan-500/50 scale-105 animate-pulse'
                : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-400'
            }`}
          >
            {isListening ? (
              <Mic className="w-12 h-12 text-white" />
            ) : (
              <MicOff className="w-12 h-12" />
            )}
          </button>
          <span className="text-xs mt-3 font-semibold text-cyan-400">
            {isListening ? 'Ouvindo sua voz...' : 'Microfone Pausado (Clique para Falar)'}
          </span>
        </div>

        {/* Transcrição e Feedback */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>O que você disse:</span>
            {executedAction && (
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                <CheckCircle className="w-3 h-3" /> Ação executada
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200 font-medium min-h-[2.5rem]">
            {transcript || <span className="text-slate-500 italic">Aguardando fala...</span>}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{lastFeedback}</span>
          </div>
        </div>

        {/* Comandos Rápidos Sugeridos */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Command className="w-3.5 h-3.5 text-cyan-400" /> Exemplos de Comandos por Voz:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => processCommand('Abrir Estoque de Insumos')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
            >
              <span>"Abrir Estoque"</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
            <button
              onClick={() => processCommand('Ver Qualidade da Água e Balanço Iônico')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
            >
              <span>"Qualidade da Água"</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
            <button
              onClick={() => processCommand('Ver Alimentação e Bandejas')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
            >
              <span>"Manejo de Bandejas"</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
            <button
              onClick={() => processCommand('Ver Despesca e Romaneio')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
            >
              <span>"Ver Despescas"</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Rodapé com controle de áudio */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            {audioFeedbackEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Resposta por Áudio Falado: <strong>Ligada</strong></span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Resposta por Áudio: <strong>Muda</strong></span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenVision();
            }}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <Zap className="w-3.5 h-3.5" /> Abrir Foto IA
          </button>
        </div>
      </div>
    </div>
  );
};
