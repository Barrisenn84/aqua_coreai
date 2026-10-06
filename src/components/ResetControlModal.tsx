import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  X,
  Database,
  Activity,
  Sparkles,
  Building2,
  Waves,
  Briefcase,
  Layers,
  MapPin,
  Phone,
  Fish,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

export const ResetControlModal: React.FC = () => {
  const {
    isResetModalOpen,
    setIsResetModalOpen,
    resetActiveSession,
    resetSavedData,
    resetToBlankBusiness,
    restoreDemoData,
    currentTenant,
    currentUser,
    farm,
  } = useAquaCore();

  const [activeTab, setActiveTab] = useState<'session' | 'blank_business' | 'selective'>('blank_business');

  // Opções da Aba 1 (Sessão Atual)
  const [sessionOpts, setSessionOpts] = useState({
    resetScenario: true,
    resetTelemetryHistory: true,
    resetChat: false,
    resetFilters: true,
  });
  const [sessionSuccessMessage, setSessionSuccessMessage] = useState<string | null>(null);

  // Opções da Aba 2 (Zerar e Iniciar Negócio Real)
  const [realFarmName, setRealFarmName] = useState(
    farm.name !== 'Fazenda River Life' ? farm.name : 'Minha Fazenda de Aquicultura'
  );
  const [realLocation, setRealLocation] = useState(
    farm.location !== 'Polo de Mogeiro – PB (Centro de leitura)' ? farm.location : 'Brasil'
  );
  const [realProducerName, setRealProducerName] = useState(
    currentUser.name !== 'Engenheiro Collermhann' ? currentUser.name : 'Produtor Responsável'
  );
  const [realProducerPhone, setRealProducerPhone] = useState(
    currentTenant.producerPhone || '+5584988585211'
  );
  const [realSpecies, setRealSpecies] = useState(
    currentTenant.speciesTarget || 'Litopenaeus vannamei (Camarão)'
  );
  const [clearTanksCheckbox, setClearTanksCheckbox] = useState(true);
  const [blankConfirmInput, setBlankConfirmInput] = useState('');
  const [isProcessingBlank, setIsProcessingBlank] = useState(false);
  const [blankStatusMessage, setBlankStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Opções da Aba 3 (Módulos Seletivos)
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [resetAllToFactory, setResetAllToFactory] = useState(false);
  const [selectiveConfirmInput, setSelectiveConfirmInput] = useState('');
  const [isProcessingSelective, setIsProcessingSelective] = useState(false);
  const [selectiveStatusMessage, setSelectiveStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isResetModalOpen) return null;

  const handleClose = () => {
    setSessionSuccessMessage(null);
    setBlankStatusMessage(null);
    setSelectiveStatusMessage(null);
    setBlankConfirmInput('');
    setSelectiveConfirmInput('');
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

  // Executar Zerar Tudo & Iniciar Negócio Real
  const isBlankConfirmationValid =
    blankConfirmInput.trim().toUpperCase() === 'ZERAR DADOS' ||
    blankConfirmInput.trim().toUpperCase() === 'CONFIRMAR' ||
    blankConfirmInput.trim().toUpperCase() === 'ZERAR DADOS SALVOS';

  const handleResetToBlankBusiness = async () => {
    if (!isBlankConfirmationValid) return;
    setIsProcessingBlank(true);
    setBlankStatusMessage(null);

    const result = await resetToBlankBusiness({
      farmName: realFarmName,
      location: realLocation,
      producerName: realProducerName,
      producerPhone: realProducerPhone,
      speciesTarget: realSpecies,
      clearTanks: clearTanksCheckbox,
    });

    setIsProcessingBlank(false);
    if (result.success) {
      setBlankStatusMessage({ type: 'success', text: result.message });
      setBlankConfirmInput('');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setBlankStatusMessage({ type: 'error', text: result.message });
    }
  };

  // Módulos Seletivos
  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const isSelectiveConfirmationValid =
    (selectiveConfirmInput.trim().toUpperCase() === 'ZERAR DADOS SALVOS' ||
      selectiveConfirmInput.trim().toUpperCase() === 'CONFIRMAR') &&
    (selectedModules.length > 0 || resetAllToFactory);

  const handleResetSelective = async () => {
    if (!isSelectiveConfirmationValid) return;
    setIsProcessingSelective(true);
    setSelectiveStatusMessage(null);

    const result = await resetSavedData({
      modules: selectedModules,
      resetAllToFactory,
      confirmationCode: selectiveConfirmInput.trim(),
    });

    setIsProcessingSelective(false);
    if (result.success) {
      setSelectiveStatusMessage({ type: 'success', text: result.message });
      setSelectedModules([]);
      setResetAllToFactory(false);
      setSelectiveConfirmInput('');
      setTimeout(() => {
        handleClose();
      }, 2200);
    } else {
      setSelectiveStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
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
                Propriedade ativa: <span className="text-cyan-300 font-medium">{farm.name}</span>
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

        {/* Seletor de 3 Abas */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-1.5">
          <button
            onClick={() => setActiveTab('blank_business')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'blank_business'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-300" />
            <span>1. Iniciar Meu Negócio Real (Zerar Demo)</span>
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono font-bold">
              Novo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('selective')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'selective'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-red-400" />
            <span>2. Módulos Específicos / Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'session'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>3. Sessão</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {/* ========================================================================= */}
          {/* ABA 1: ZERAR TUDO E INICIAR MEU NEGÓCIO REAL */}
          {/* ========================================================================= */}
          {activeTab === 'blank_business' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Configuração da Sua Fazenda / Empresa Real</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs font-sans">
                  Esta opção zera todos os dados fictícios de demonstração da <strong>"Fazenda River Life"</strong> (tanques de exemplo, biometrias, ração, despescas e custos simulados) e configura o sistema com os dados reais do seu negócio.
                </p>
              </div>

              {blankStatusMessage && (
                <div
                  className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs ${
                    blankStatusMessage.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
                      : 'bg-red-500/20 border border-red-500/50 text-red-200'
                  }`}
                >
                  {blankStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{blankStatusMessage.text}</span>
                </div>
              )}

              {/* Formulário de Identificação do Negócio Real */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Dados do Seu Negócio Real
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Nome da Sua Fazenda / Negócio</label>
                    <input
                      type="text"
                      value={realFarmName}
                      onChange={(e) => setRealFarmName(e.target.value)}
                      placeholder="Ex: Fazenda Boa Vista, Aquacultura Maré Alta"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Localização (Cidade – UF)</label>
                    <input
                      type="text"
                      value={realLocation}
                      onChange={(e) => setRealLocation(e.target.value)}
                      placeholder="Ex: Natal – RN, Mogeiro – PB, Aracati – CE"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nome do Dono / Responsável</label>
                    <input
                      type="text"
                      value={realProducerName}
                      onChange={(e) => setRealProducerName(e.target.value)}
                      placeholder="Ex: Barrisenn Araújo"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">WhatsApp para Alertas & Relatórios</label>
                    <input
                      type="text"
                      value={realProducerPhone}
                      onChange={(e) => setRealProducerPhone(e.target.value)}
                      placeholder="Ex: 84988585211"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Espécie Cultivada Principal</label>
                  <select
                    value={realSpecies}
                    onChange={(e) => setRealSpecies(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-bold focus:border-cyan-500 outline-none"
                  >
                    <option value="Litopenaeus vannamei (Camarão)">Litopenaeus vannamei (Camarão Branco do Pacífico)</option>
                    <option value="Oreochromis niloticus (Tilápia do Nilo)">Oreochromis niloticus (Tilápia do Nilo)</option>
                    <option value="Macrobrachium rosenbergii (Camarão Gigante da Malásia)">Macrobrachium rosenbergii (Camarão Gigante da Malásia)</option>
                    <option value="Policultivo (Camarão + Tilápia)">Policultivo (Camarão + Tilápia)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-700 cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={clearTanksCheckbox}
                      onChange={(e) => setClearTanksCheckbox(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">
                        Zerar os 7 tanques demonstrativos de exemplo
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        Deixa a lista com 0 tanques para você cadastrar seus tanques reais através do botão "+ Cadastrar Novo Tanque".
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Trava de Segurança */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Confirmação de Segurança:</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Para autorizar a reinicialização e configurar sua fazenda real, digite exatamente:{' '}
                  <span className="text-amber-300 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-700/50">
                    ZERAR DADOS
                  </span>
                </p>
                <input
                  type="text"
                  value={blankConfirmInput}
                  onChange={(e) => setBlankConfirmInput(e.target.value)}
                  placeholder="Digite ZERAR DADOS"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold tracking-wider uppercase focus:border-amber-500 outline-none"
                />
              </div>

              {/* Botão de Submissão */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetToBlankBusiness}
                  disabled={!isBlankConfirmationValid || isProcessingBlank}
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isBlankConfirmationValid && !isProcessingBlank
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-900/50 hover:scale-[1.01]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{isProcessingBlank ? 'Processando...' : '🚀 Zerar e Iniciar Meu Negócio Real'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: MÓDULOS ESPECÍFICOS / RESTAURAR DEMO */}
          {/* ========================================================================= */}
          {activeTab === 'selective' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Zona de Limpeza Granular ou Restauração da Demonstração:</span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  Selecione exatamente os módulos que deseja zerar individualmente ou marque para restaurar o padrão de demonstração de fábrica da Fazenda River Life.
                </p>
              </div>

              {selectiveStatusMessage && (
                <div
                  className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs ${
                    selectiveStatusMessage.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
                      : 'bg-red-500/20 border border-red-500/50 text-red-200'
                  }`}
                >
                  {selectiveStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{selectiveStatusMessage.text}</span>
                </div>
              )}

              {/* Lista de Módulos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'tanks', label: 'Tanques & Viveiros Cadastrados', desc: 'Zera todos os tanques e lotes em memória' },
                  { id: 'biometries', label: 'Biometrias & Pesagens', desc: 'Registros de FCR, peso médio e uniformidade' },
                  { id: 'feedingTrays', label: 'Bandejas & Comedouros', desc: 'Checagem de sobras e arraçoamento' },
                  { id: 'waterIonic', label: 'Qualidade da Água & Íons', desc: 'pH, amônia, cálcio, magnésio e alcalinidade' },
                  { id: 'mortality', label: 'Mortalidade & Mudas', desc: 'Histórico sanitário e ciclo lunar' },
                  { id: 'harvests', label: 'Despescas & Romaneios', desc: 'Registros de colheita e GTA' },
                  { id: 'cashFlow', label: 'Fluxo de Caixa (DFC)', desc: 'Entradas e saídas financeiras' },
                  { id: 'invoices', label: 'Notas Fiscais Emitidas', desc: 'Histórico fiscal' },
                  { id: 'inventory', label: 'Estoque de Insumos', desc: 'Sacaria de ração e corretivos' },
                  { id: 'equipments', label: 'Equipamentos & Aeradores', desc: 'Lista de motores e manutenção' },
                ].map((mod) => (
                  <label
                    key={mod.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      selectedModules.includes(mod.id)
                        ? 'bg-red-950/40 border-red-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod.id)}
                      onChange={() => toggleModule(mod.id)}
                      className="mt-0.5 rounded border-slate-700 text-red-500 focus:ring-red-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-white">{mod.label}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{mod.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Restauração de Fábrica */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetAllToFactory}
                    onChange={(e) => setResetAllToFactory(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <div>
                    <div className="font-bold text-cyan-300 text-xs">
                      Restaurar Demonstração Original de Fábrica (Fazenda River Life)
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      Restaura todos os 7 tanques, biometrias e telemetrias originais de exemplo.
                    </div>
                  </div>
                </label>
              </div>

              {/* Trava */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>Trava de Segurança Obrigatória:</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Digite exatamente:{' '}
                  <span className="text-red-300 font-bold bg-red-950/70 px-1.5 py-0.5 rounded border border-red-700/50">
                    ZERAR DADOS SALVOS
                  </span>
                </p>
                <input
                  type="text"
                  value={selectiveConfirmInput}
                  onChange={(e) => setSelectiveConfirmInput(e.target.value)}
                  placeholder="Digite ZERAR DADOS SALVOS"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold tracking-wider uppercase focus:border-red-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetSelective}
                  disabled={!isSelectiveConfirmationValid || isProcessingSelective}
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelectiveConfirmationValid && !isProcessingSelective
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isProcessingSelective ? 'Processando...' : 'Autorizar e Executar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: SESSÃO ATUAL (SEGURO) */}
          {/* ========================================================================= */}
          {activeTab === 'session' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Reinicialização Segura de Simulação & Visualização</span>
                </div>
                <p className="text-slate-400 text-xs font-sans">
                  Limpa cenários de estresse ativados (ex: alerta de hipóxia simulada), normaliza a telemetria ao vivo e redefine os filtros visuais da tela.
                </p>
              </div>

              {sessionSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{sessionSuccessMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-white">Normalizar Cenários & Simulações de Estresse</span>
                  <input
                    type="checkbox"
                    checked={sessionOpts.resetScenario}
                    onChange={(e) => setSessionOpts({ ...sessionOpts, resetScenario: e.target.checked })}
                    className="rounded border-slate-700 text-emerald-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-white">Redefinir Histórico Visual de Telemetria</span>
                  <input
                    type="checkbox"
                    checked={sessionOpts.resetTelemetryHistory}
                    onChange={(e) => setSessionOpts({ ...sessionOpts, resetTelemetryHistory: e.target.checked })}
                    className="rounded border-slate-700 text-emerald-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-white">Redefinir Filtros e Tanque Ativo</span>
                  <input
                    type="checkbox"
                    checked={sessionOpts.resetFilters}
                    onChange={(e) => setSessionOpts({ ...sessionOpts, resetFilters: e.target.checked })}
                    className="rounded border-slate-700 text-emerald-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={handleResetSession}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpar Sessão Agora</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
