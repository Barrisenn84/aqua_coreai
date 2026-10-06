import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  X,
  Sliders,
  Database,
  Radio,
  FileSpreadsheet,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const ResetControlModal: React.FC = () => {
  const {
    isResetModalOpen,
    setIsResetModalOpen,
    resetActiveSession,
    resetSavedData,
    currentTenant,
  } = useAquaCore();

  const [activeTab, setActiveTab] = useState<'session' | 'saved'>('session');

  // Opções da Aba 1 (Sessão Atual)
  const [sessionOpts, setSessionOpts] = useState({
    resetScenario: true,
    resetTelemetryHistory: true,
    resetChat: false,
    resetFilters: true,
  });
  const [sessionSuccessMessage, setSessionSuccessMessage] = useState<string | null>(null);

  // Opções da Aba 2 (Dados Salvos)
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [resetAllToFactory, setResetAllToFactory] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isProcessingSaved, setIsProcessingSaved] = useState(false);
  const [savedStatusMessage, setSavedStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isResetModalOpen) return null;

  const handleClose = () => {
    setSessionSuccessMessage(null);
    setSavedStatusMessage(null);
    setConfirmationInput('');
    setIsResetModalOpen(false);
  };

  const handleResetSession = () => {
    resetActiveSession(sessionOpts);
    setSessionSuccessMessage('Sessão atual reiniciada com sucesso! Todos os dados salvos continuam 100% protegidos e preservados.');
    setTimeout(() => {
      setSessionSuccessMessage(null);
      setIsResetModalOpen(false);
    }, 1800);
  };

  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const isConfirmationValid =
    confirmationInput.trim().toUpperCase() === 'ZERAR DADOS SALVOS' &&
    (selectedModules.length > 0 || resetAllToFactory);

  const handleResetSaved = async () => {
    if (!isConfirmationValid) return;
    setIsProcessingSaved(true);
    setSavedStatusMessage(null);

    const result = await resetSavedData({
      modules: selectedModules,
      resetAllToFactory,
      confirmationCode: confirmationInput.trim(),
    });

    setIsProcessingSaved(false);
    if (result.success) {
      setSavedStatusMessage({ type: 'success', text: result.message });
      setSelectedModules([]);
      setResetAllToFactory(false);
      setConfirmationInput('');
      setTimeout(() => {
        handleClose();
      }, 2200);
    } else {
      setSavedStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Central de Reinicialização & Governança</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  PROTEÇÃO TOTAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Fazenda: <span className="text-cyan-300 font-medium">{currentTenant.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Abas com Código de Segurança */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
          <button
            onClick={() => setActiveTab('session')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'session'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>1. Zerar O Que Estou Fazendo Agora</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
              Seguro
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-red-300 hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-4 h-4 text-red-400" />
            <span>2. Zerar Dados Salvos no Banco</span>
            <span className="text-[10px] bg-red-500/30 text-red-300 px-1.5 py-0.2 rounded font-mono">
              Blindado
            </span>
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ================= ABA 1: SESSÃO ATUAL ================= */}
          {activeTab === 'session' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-200/90 leading-relaxed">
                  <p className="font-bold text-emerald-300 text-sm">
                    Garantia de Preservação de Dados:
                  </p>
                  Esta opção reseta <strong>apenas o estado em andamento na tela</strong> (simulações ativas, alertas de teste ou filtros de exibição).
                  <span className="block mt-1 text-emerald-300 font-semibold">
                    ✓ NENHUM dado gravado no banco de dados (biometrias, estoque, notas ou financeiro) será apagado ou alterado.
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Selecione o que deseja reiniciar agora:
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={sessionOpts.resetScenario}
                    onChange={(e) =>
                      setSessionOpts({ ...sessionOpts, resetScenario: e.target.checked })
                    }
                    className="mt-1 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="text-white font-bold block">
                      Zerar Cenário de Simulação / Estresse Ativo
                    </span>
                    <span className="text-slate-400">
                      Interrompe testes de hipóxia, amônia ou frente fria, retornando todos os viveiros e aeradores para a condição nominal verde.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={sessionOpts.resetTelemetryHistory}
                    onChange={(e) =>
                      setSessionOpts({ ...sessionOpts, resetTelemetryHistory: e.target.checked })
                    }
                    className="mt-1 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="text-white font-bold block">
                      Zerar Histórico Volátil de Gráficos da Sessão
                    </span>
                    <span className="text-slate-400">
                      Restaura as curvas das últimas leituras instantâneas dos sensores para a linha de base calibrada.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={sessionOpts.resetFilters}
                    onChange={(e) =>
                      setSessionOpts({ ...sessionOpts, resetFilters: e.target.checked })
                    }
                    className="mt-1 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="text-white font-bold block">
                      Redefinir Seleção de Viveiro & Filtros
                    </span>
                    <span className="text-slate-400">
                      Volta a tela para o viveiro principal (Tanque 01) e limpa filtros temporários de busca.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={sessionOpts.resetChat}
                    onChange={(e) =>
                      setSessionOpts({ ...sessionOpts, resetChat: e.target.checked })
                    }
                    className="mt-1 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="text-white font-bold block">
                      Limpar Mensagens Temporárias do Assistente WhatsApp
                    </span>
                    <span className="text-slate-400">
                      Reinicia a tela de diálogo do chat de teste para a saudação matinal padrão.
                    </span>
                  </div>
                </label>
              </div>

              {sessionSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sessionSuccessMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* ================= ABA 2: DADOS SALVOS (BLINDADA) ================= */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200 leading-relaxed">
                  <p className="font-bold text-red-300 text-sm">
                    ZONA DE PROTEÇÃO RÍGIDA CONTRA PERDA ACIDENTAL:
                  </p>
                  O sistema <strong>NUNCA</strong> apaga dados salvos sem sua expressa autorização. Para prosseguir, selecione exatamente os módulos que deseja redefinir e digite a frase de confirmação de segurança abaixo.
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                  Escolha os módulos salvos que deseja zerar/restaurar:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'biometries', label: 'Biometrias & Pesagens', desc: 'Registros de FCR e peso' },
                    { id: 'feedingTrays', label: 'Bandejas & Comedouros', desc: 'Checagem de sobras e tratos' },
                    { id: 'waterIonic', label: 'Qualidade da Água & Íons', desc: 'pH, amônia, Ca e Mg' },
                    { id: 'mortality', label: 'Mortalidade & Mudas', desc: 'Histórico sanitário' },
                    { id: 'harvests', label: 'Despescas & Romaneios', desc: 'Registros de colheita e GTA' },
                    { id: 'cashFlow', label: 'Fluxo de Caixa (DFC)', desc: 'Entradas e saídas financeiras' },
                    { id: 'invoices', label: 'Notas Fiscais Emitidas', desc: 'Histórico fiscal' },
                    { id: 'inventory', label: 'Estoque de Insumos', desc: 'Sacaria de ração e calcário' },
                  ].map((item) => {
                    const isChecked = selectedModules.includes(item.id) || resetAllToFactory;
                    return (
                      <label
                        key={item.id}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-red-950/30 border-red-500/50 text-white'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={resetAllToFactory}
                          onChange={() => toggleModule(item.id)}
                          className="mt-0.5 rounded accent-red-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block">{item.label}</span>
                          <span className="text-[11px] text-slate-400">{item.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Opção Geral de Fábrica */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-red-950/20 border border-red-800/40 cursor-pointer hover:bg-red-950/40 transition-colors">
                <input
                  type="checkbox"
                  checked={resetAllToFactory}
                  onChange={(e) => setResetAllToFactory(e.target.checked)}
                  className="rounded accent-red-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="text-red-300 font-bold block">
                    Restaurar TODOS os dados salvos para o padrão original de fábrica (Demonstração)
                  </span>
                  <span className="text-slate-400">
                    Substitui todas as tabelas salvas pelos dados iniciais da Fazenda River Life.
                  </span>
                </div>
              </label>

              {/* Trava de Segurança por Digitação Obrigatória */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-mono font-bold text-red-400 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Trava de Segurança Obrigatória:</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Para autorizar e desbloquear o botão, digite exatamente em maiúsculas:{' '}
                  <span className="text-white font-mono font-bold px-1.5 py-0.5 rounded bg-red-950 border border-red-700">
                    ZERAR DADOS SALVOS
                  </span>
                </p>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder="Digite aqui: ZERAR DADOS SALVOS"
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs p-2.5 rounded-lg focus:outline-none focus:border-red-500 uppercase tracking-wider"
                />
              </div>

              {savedStatusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    savedStatusMessage.type === 'success'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                      : 'bg-red-950 border border-red-600 text-red-300'
                  }`}
                >
                  {savedStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{savedStatusMessage.text}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {activeTab === 'session' ? (
            <button
              onClick={handleResetSession}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all cursor-pointer font-mono"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Sessão Atual</span>
            </button>
          ) : (
            <button
              onClick={handleResetSaved}
              disabled={!isConfirmationValid || isProcessingSaved}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all font-mono ${
                isConfirmationValid && !isProcessingSaved
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>
                {isProcessingSaved
                  ? 'Processando...'
                  : 'Autorizar e Zerar Dados Salvos Selecionados'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
