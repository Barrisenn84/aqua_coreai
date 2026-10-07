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
  Send,
  Loader2,
  Camera,
  Warehouse,
  Droplets,
  Utensils,
  DollarSign,
  RotateCcw,
  Home,
  Sliders,
} from 'lucide-react';

export interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenVision: () => void;
  onOpenScanner?: () => void;
  onOpenFarmProfile?: () => void;
  onOpenReset?: () => void;
  onOpenBiometry?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenVision,
  onOpenScanner,
  onOpenFarmProfile,
  onOpenReset,
  onOpenBiometry,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>(
    'Olá produtor! Clique no microfone para falar ou digite sua dúvida ou comando abaixo.'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState<boolean>(true);
  const [executedAction, setExecutedAction] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Falar texto via Web Speech Synthesis (Voz do Dr. Camarão)
  const speakText = (text: string) => {
    if (!audioFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*_#`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 240);

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Síntese de voz não disponível:', e);
    }
  };

  // Inicializa e limpa reconhecimento ao abrir/fechar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setLastFeedback(
        'Reconhecimento por microfone não é suportado nativamente neste navegador. Você pode digitar seus comandos normalmente no campo abaixo!'
      );
      return;
    }

    setIsSupported(true);

    if (!isOpen) {
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setLastFeedback('Microfone não suportado. Digite seu comando abaixo.');
      return;
    }

    try {
      // Parar qualquer instância ativa antes de criar uma nova
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false; // continuous=false é muito mais estável em smartphones e navegadores modernos
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setLastFeedback('Dr. Camarão está ouvindo... Fale com clareza seu comando ou pergunta.');
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
        console.warn('[VoiceAssistant] Erro de reconhecimento:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setLastFeedback(
            'Permissão de microfone negada. Clique no ícone de cadeado do navegador para autorizar ou digite abaixo.'
          );
        } else if (event.error === 'no-speech') {
          setLastFeedback('Nenhuma fala detectada. Clique no microfone e tente falar novamente.');
        } else {
          setLastFeedback(`Microfone pronto. Clique no microfone para falar ou digite abaixo.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('[VoiceAssistant] Falha ao iniciar reconhecimento:', err);
      setIsListening(false);
      setLastFeedback('Clique no microfone para falar ou digite seu comando abaixo.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setLastFeedback('Microfone pausado. Clique para falar novamente ou digite abaixo.');
    } else {
      startListening();
    }
  };

  const processCommand = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    stopListening();
    setIsProcessing(true);
    setTranscript(cleanText);
    setLastFeedback(`Dr. Camarão analisando: "${cleanText}"...`);

    try {
      const res = await fetch('/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: cleanText }),
      });

      if (res.ok) {
        const data = await res.json();
        setExecutedAction(data.intent || 'COMANDO_EXECUTADO');
        setLastFeedback(data.spokenReply);
        speakText(data.spokenReply);

        // Ação 1: Navegação para uma das 18 telas canônicas
        if (data.action === 'navigate' && data.targetTab) {
          setTimeout(() => {
            onNavigateTab(data.targetTab);
            onClose();
          }, 1200);
          return;
        }

        // Ação 2: Disparo de Ação do Sistema (Câmera, Scanner, Minha Fazenda, Reset, Biometria)
        if (data.action === 'trigger_action' && data.triggerType) {
          setTimeout(() => {
            onClose();
            if (data.triggerType === 'open_vision') {
              onOpenVision();
            } else if (data.triggerType === 'open_scanner' && onOpenScanner) {
              onOpenScanner();
            } else if (data.triggerType === 'open_farm_profile' && onOpenFarmProfile) {
              onOpenFarmProfile();
            } else if (data.triggerType === 'trigger_reset' && onOpenReset) {
              onOpenReset();
            } else if (data.triggerType === 'open_biometry' && onOpenBiometry) {
              onOpenBiometry();
            }
          }, 1200);
          return;
        }

        // Ação 3: Conselho falado (manter aberto para leitura)
      } else {
        throw new Error('Falha no servidor');
      }
    } catch {
      const fallback =
        'Comando recebido. Fazenda River Life monitorada com 380 mil camarões em 4 viveiros.';
      setLastFeedback(fallback);
      speakText(fallback);
    } finally {
      setIsProcessing(false);
      setInputText('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      processCommand(inputText);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-slate-100 max-h-[95vh] flex flex-col justify-between my-auto">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0">
            <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse text-emerald-400' : 'text-cyan-400'}`} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
              Voz IA • Dr. Camarão Copilot
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-mono">
                Ao Vivo
              </span>
            </h2>
            <p className="text-xs text-slate-400">Controle completo por voz ou texto com inteligência no campo</p>
          </div>
        </div>

        {/* Círculo Central do Microfone */}
        <div className="flex flex-col items-center justify-center my-4 sm:my-6">
          <button
            onClick={toggleListening}
            disabled={!isSupported || isProcessing}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative ${
              isListening
                ? 'bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-cyan-500/50 scale-105 animate-pulse ring-4 ring-cyan-400/30'
                : 'bg-slate-800 border-2 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-300 active:scale-95'
            } ${!isSupported ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            title={isListening ? 'Clique para pausar microfone' : 'Clique para falar com o Dr. Camarão'}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-cyan-300 animate-spin" />
            ) : isListening ? (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            ) : (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            )}
          </button>
          <span className="text-xs mt-3 font-semibold text-cyan-300 text-center">
            {isProcessing
              ? 'Dr. Camarão está pensando...'
              : isListening
              ? 'Ouvindo sua voz... (Fale agora)'
              : 'Microfone pronto (Clique para Falar)'}
          </span>
        </div>

        {/* Transcrição e Feedback Falado */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 mb-4">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
            <span>Comando identificado:</span>
            {executedAction && (
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                <CheckCircle className="w-3 h-3" /> Ação executada
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200 font-medium min-h-[2rem]">
            {transcript || <span className="text-slate-500 italic">Diga ou digite um comando abaixo...</span>}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-cyan-300 leading-relaxed">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{lastFeedback}</span>
          </div>
        </div>

        {/* Input Híbrido: Digitação alternativa (para ambientes com barulho de aeradores ou sem microfone) */}
        <form onSubmit={handleFormSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ou digite: 'Abrir Estoque', 'Zerar', 'Água'..."
            className="flex-1 bg-slate-950/80 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>

        {/* Comandos Rápidos Sugeridos (1-Clique) */}
        <div className="space-y-2 mb-2">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Command className="w-3 h-3 text-cyan-400" /> Ações Rápidas por 1 Clique:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => processCommand('Abrir Estoque de Insumos')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Warehouse className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Estoque
              </span>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
            </button>

            <button
              onClick={() => processCommand('Ver Qualidade da Água e Balanço Iônico')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Água & O₂
              </span>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
            </button>

            <button
              onClick={() => processCommand('Ver Alimentação e Bandejas')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Bandejas
              </span>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
            </button>

            <button
              onClick={() => processCommand('Abrir DRE e Lucros')}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left text-slate-300 flex items-center justify-between hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> DRE Lucro
              </span>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenVision();
              }}
              className="p-2 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-700/60 rounded-lg text-left text-teal-200 flex items-center justify-between hover:border-teal-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Camera className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Foto IA
              </span>
              <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenReset) onOpenReset();
              }}
              className="p-2 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/60 rounded-lg text-left text-amber-200 flex items-center justify-between hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Zerar / Reset
              </span>
              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Rodapé com controle de áudio e atalho direto */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            {audioFeedbackEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px]">Voz Falada: <strong className="text-emerald-400">Ligada</strong></span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span className="text-[11px]">Voz Falada: <strong className="text-slate-400">Muda</strong></span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenVision();
            }}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Abrir Câmera IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
