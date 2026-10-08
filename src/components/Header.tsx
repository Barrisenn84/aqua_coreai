import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Box,
  Building2,
  Camera,
  Cloud,
  Compass,
  Cpu,
  DollarSign,
  Droplets,
  Handshake,
  HardHat,
  Layers,
  MessageSquare,
  PiggyBank,
  Radio,
  Sliders,
  Smartphone,
  Sun,
  Sunset,
  TrendingUp,
  UserCheck,
  FileCheck,
  Wrench,
  Mic,
  Utensils,
  Anchor,
  Warehouse,
  Moon,
  Landmark,
  Home,
  RotateCcw,
  Crown,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAquaCore } from '../context/AquaCoreContext';

interface HeaderProps {
  activeTab:
    | 'nerve-center'
    | 'whatsapp-ghost'
    | 'blackbox-haas'
    | 'biomass-predictor'
    | 'feed-optimizer'
    | 'market-bridge'
    | 'harvest-oracle'
    | 'biometry'
    | 'dre'
    | 'terminal'
    | 'flutter-mobile'
    | 'architecture'
    | 'feeding-trays'
    | 'water-quality'
    | 'inventory-warehouse'
    | 'harvest-commercial'
    | 'mortality-molt'
    | 'cash-flow';
  setActiveTab: (
    tab:
      | 'nerve-center'
      | 'whatsapp-ghost'
      | 'blackbox-haas'
      | 'biomass-predictor'
      | 'feed-optimizer'
      | 'market-bridge'
      | 'harvest-oracle'
      | 'biometry'
      | 'dre'
      | 'terminal'
      | 'flutter-mobile'
      | 'architecture'
      | 'feeding-trays'
      | 'water-quality'
      | 'inventory-warehouse'
      | 'harvest-commercial'
      | 'mortality-molt'
      | 'cash-flow'
  ) => void;
  onOpenBiometryModal: () => void;
  onOpenScannerModal: () => void;
  onOpenInvoiceModal?: () => void;
  onOpenEquipmentModal?: () => void;
  onOpenVoiceModal?: () => void;
  onOpenVisionModal?: () => void;
  onOpenFarmProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBiometryModal,
  onOpenScannerModal,
  onOpenInvoiceModal,
  onOpenEquipmentModal,
  onOpenVoiceModal,
  onOpenVisionModal,
  onOpenFarmProfileModal,
}) => {
  const {
    farm,
    alerts,
    isSimulating,
    toggleSimulation,
    activeScenarioName,
    currentTenant,
    currentUser,
    setIsAuthModalOpen,
    setIsResetModalOpen,
  } = useAquaCore();

  const [solarData, setSolarData] = useState<{ sunrise: string; sunset: string; isDaylight: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/solar/cycle')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.sunrise) {
          setSolarData({
            sunrise: data.sunrise,
            sunset: data.sunset,
            isDaylight: data.isDaylight,
          });
        }
      })
      .catch(() => {});
  }, []);

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length;
  const isConstruction = currentTenant.type === 'construction_site';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationSections = [
    {
      category: '🏠 Minha Fazenda & Controle',
      description: 'Visão geral de tudo o que está acontecendo na propriedade',
      items: [
        { id: 'nerve-center', label: 'Centro de Controle', subtitle: 'Painel Geral com Clima e Viveiros', icon: Layers, color: 'text-cyan-400' },
        { id: 'whatsapp-ghost', label: 'Assistente WhatsApp', subtitle: 'Fale com o robô Dr. Camarão pelo Zap', icon: MessageSquare, color: 'text-emerald-400' },
        { id: 'blackbox-haas', label: 'Caixas Pretas IoT', subtitle: 'Sensores 4G vigiando os viveiros 24h', icon: Box, color: 'text-cyan-400' },
      ],
    },
    {
      category: '🦐 Cuidado com os Camarões',
      description: 'Comida, saúde da água, peso e troca de casquinha',
      items: [
        { id: 'feeding-trays', label: 'Bandejas & Comedouro', subtitle: 'Ver se o camarão comeu tudo ou sobrou', icon: Utensils, color: 'text-amber-400' },
        { id: 'water-quality', label: 'Qualidade da Água & Oxigênio', subtitle: 'Ar para respirar e pureza da água', icon: Droplets, color: 'text-cyan-400' },
        { id: 'biometry', label: 'Biometria & Peso', subtitle: 'Pesar e medir os camarões na balança', icon: Sliders, color: 'text-blue-400' },
        { id: 'mortality-molt', label: 'Mudas & Sanidade', subtitle: 'Troca de casquinha na lua nova e cheia', icon: Moon, color: 'text-rose-400' },
      ],
    },
    {
      category: '📦 Comida & Galpão',
      description: 'Sacos de ração, adubos e economia de insumos',
      items: [
        { id: 'inventory-warehouse', label: 'Estoque & Galpão', subtitle: 'Sacos de ração, adubos e probióticos', icon: Warehouse, color: 'text-orange-400' },
        { id: 'feed-optimizer', label: 'Otimizador de Ração', subtitle: 'Como economizar ração sem passar fome', icon: PiggyBank, color: 'text-emerald-400' },
      ],
    },
    {
      category: '💰 Dinheiro & Vendas',
      description: 'Cofrinho da fazenda, despesas e melhor preço de venda',
      items: [
        { id: 'dre', label: 'DRE & Lucros', subtitle: 'Quanto dinheiro sobrou no cofrinho da fazenda', icon: DollarSign, color: 'text-emerald-400' },
        { id: 'cash-flow', label: 'Fluxo de Caixa (DFC)', subtitle: 'Entradas e saídas de dinheiro do dia a dia', icon: Landmark, color: 'text-teal-400' },
        { id: 'harvest-commercial', label: 'Despescas & Romaneio', subtitle: 'Colheita e pesagem dos caminhões de venda', icon: Anchor, color: 'text-emerald-400' },
        { id: 'market-bridge', label: 'Bolsa & Cotações', subtitle: 'Encontre o melhor comprador e preço por kg', icon: Handshake, color: 'text-amber-400' },
      ],
    },
    {
      category: '🤖 Inteligência Artificial (Robôs que Ajudam)',
      description: 'Previsões de futuro e diagnósticos inteligentes',
      items: [
        { id: 'biomass-predictor', label: 'Preditor de Peso', subtitle: 'Adivinha o tamanho futuro dos camarões', icon: Compass, color: 'text-blue-400' },
        { id: 'harvest-oracle', label: 'Oráculo de Despesca', subtitle: 'Descobre o dia perfeito para vender', icon: TrendingUp, color: 'text-amber-400' },
        { id: 'terminal', label: 'Terminal de Decisão', subtitle: 'Conselhos avançados de engenharia aquícola', icon: Cpu, color: 'text-purple-400' },
        { id: 'flutter-mobile', label: 'App do Viveiro', subtitle: 'Visualização móvel para o operador de campo', icon: Smartphone, color: 'text-cyan-400' },
        { id: 'architecture', label: 'Nuvem da Fazenda', subtitle: 'Como os computadores conversam entre si', icon: Cloud, color: 'text-indigo-400' },
      ],
    },
  ];

  return (
    <header className="glass-panel sticky top-0 z-40 border-b-0 border-b-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Topmost Telemetry Status Bar */}
      <div className="border-b border-slate-800/80 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-cyan-500' : 'bg-slate-600'}`}></span>
            </span>
            <span>IOT LIVE TELEMETRY</span>
          </div>
          <span className="text-slate-600">|</span>

          {/* Botão de Organização / Tenant & Usuário */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-bold cursor-pointer"
            title="Clique para alternar de organização ou usuário"
          >
            {isConstruction ? (
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="text-white">{currentTenant.name}</span>
            <span className="text-slate-500">•</span>
            {currentUser.email === 'nuncaparedelutar1988@gmail.com' ? (
              <span className="text-amber-300 font-mono text-[11px] flex items-center gap-1 font-black bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/60">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Proprietário Master</span>
              </span>
            ) : (
              <span className="text-cyan-300 font-mono text-[11px]">{currentUser.name}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Ciclo Solar da Sunrise-Sunset API */}
          {solarData && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 font-mono text-[11px]">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>☀️ {solarData.sunrise}</span>
              <span className="text-slate-600">/</span>
              <Sunset className="w-3 h-3 text-orange-400" />
              <span>🌇 {solarData.sunset}</span>
            </div>
          )}

          {activeScenarioName && (
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-mono text-[11px]">
              <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
              <span>{activeScenarioName}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded text-[11px] font-mono">
            <span className="text-slate-400">ENERGIA:</span>
            <span className="text-slate-200 font-bold">R$ {currentTenant.kwhCost.toFixed(2)}/kWh</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-0.5 rounded text-[11px] font-mono">
            <span className="text-slate-400">REFERÊNCIA:</span>
            <span className="text-emerald-400 font-bold">R$ {currentTenant.salePrice.toFixed(2)}/kg</span>
          </div>

          <button
            onClick={toggleSimulation}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer ${
              isSimulating
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60'
                : 'bg-amber-950/80 text-amber-400 border border-amber-800/60 hover:bg-amber-900/60'
            }`}
            title="Pausar / Retomar fluxo de telemetria IoT"
          >
            <Activity className="w-3 h-3" />
            <span>{isSimulating ? 'STREAMING ATIVO' : 'PAUSADO'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity & Mobile Trigger */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-300/50 shrink-0 transform transition hover:scale-110 hover:rotate-3">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">
                  AQUA<span className="premium-gradient-text text-glow-cyan">-CORE</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  AI ENGINE
                </span>
              </div>
              <p className="text-[11px] text-cyan-300/80 font-medium truncate max-w-[200px] sm:max-w-md">
                {farm.name} • {farm.location}
              </p>
            </div>
          </div>

          {/* Botões rápidos visíveis apenas no celular/tablet */}
          <div className="flex items-center gap-2 lg:hidden">
            {onOpenVisionModal && (
              <button
                onClick={onOpenVisionModal}
                className="px-2.5 py-1.5 rounded-lg bg-teal-950 border border-teal-600/50 text-teal-300 text-xs font-bold flex items-center gap-1 shadow-sm"
                title="Tirar foto com IA"
              >
                <Camera className="w-4 h-4 text-teal-400" />
                <span className="text-[11px]">Foto IA</span>
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 shadow-md flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-transform active:scale-95"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Menu</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Desktop e Tablet Grande) */}
        <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <button
            onClick={() => setActiveTab('nerve-center')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'nerve-center'
                ? 'glass-card text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] transform -translate-y-0.5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Centro de Controle</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('whatsapp-ghost')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'whatsapp-ghost'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Assistente WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('feeding-trays')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'feeding-trays'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
            }`}
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>Bandejas & Comedouro</span>
          </button>

          <button
            onClick={() => setActiveTab('water-quality')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'water-quality'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
          >
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>Qualidade da Água</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory-warehouse')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'inventory-warehouse'
                ? 'bg-orange-500/25 text-orange-300 border border-orange-500/50 shadow-sm shadow-orange-500/20'
                : 'text-slate-400 hover:text-orange-300 hover:bg-slate-800/60'
            }`}
          >
            <Warehouse className="w-4 h-4 text-orange-400" />
            <span>Estoque & Galpão</span>
          </button>

          <button
            onClick={() => setActiveTab('dre')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dre'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>DRE & Lucros</span>
          </button>

          <button
            onClick={() => setActiveTab('market-bridge')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'market-bridge'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Handshake className="w-4 h-4 text-amber-400" />
            <span>Bolsa & Cotações</span>
          </button>

          {/* Botão para abrir Todas as Telas */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="px-2.5 py-2 rounded-lg text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/60 flex items-center gap-1.5 cursor-pointer border border-cyan-800/40 bg-cyan-950/30"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Todas as Telas (18)</span>
          </button>
        </nav>

        {/* Fast Action CTA (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* 🔄 Botão de Governança: Zerar / Reiniciar Controlado */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border border-amber-600/60 shadow-md shadow-amber-950/30 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
            title="Zerar o que estou fazendo agora ou reiniciar dados salvos com proteção"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Zerar / Reiniciar</span>
          </button>

          {onOpenFarmProfileModal && (
            <button
              onClick={onOpenFarmProfileModal}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              title="Cadastro institucional da Fazenda, CNPJ e Licença Ambiental"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Minha Fazenda</span>
            </button>
          )}

          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-600/50 shadow-md shadow-purple-950/40 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              title="Comando e Diálogo por Voz com o Oráculo Dr. Camarão"
            >
              <Mic className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>Voz IA</span>
            </button>
          )}

          {onOpenVisionModal && (
            <button
              onClick={onOpenVisionModal}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-teal-900/80 to-cyan-900/80 hover:from-teal-800 hover:to-cyan-800 text-teal-200 border border-teal-600/50 shadow-md shadow-teal-950/40 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              title="Visão Computacional Multimodal (Bandeja, Camarão, Fitas, Sacos)"
            >
              <Camera className="w-3.5 h-3.5 text-teal-300" />
              <span>Foto IA</span>
            </button>
          )}

          {onOpenInvoiceModal && (
            <button
              onClick={onOpenInvoiceModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              title="Emissão simplificada de Nota Fiscal com despacho WhatsApp"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Emitir NF</span>
            </button>
          )}

          {onOpenEquipmentModal && (
            <button
              onClick={onOpenEquipmentModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              title="Gestão e manutenção de equipamentos com alerta de atraso > 7 dias"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Equipamentos</span>
            </button>
          )}

          <button
            onClick={onOpenScannerModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-700/80 hover:bg-cyan-600 text-cyan-100 shadow-md shadow-cyan-900/40 transition-all flex items-center gap-1.5 cursor-pointer font-mono border border-cyan-500/30"
            title="Escanear etiqueta de ração com IA (Input Zero)"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-300" />
            <span>Scanner Ração</span>
          </button>

          <button
            onClick={onOpenBiometryModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>+ Biometria</span>
          </button>
        </div>
      </div>

      {/* 📱 MODAL / DRAWER COMPLETO COM TODAS AS 18 TELAS EM LINGUAGEM DIDÁTICA INFANTIL E RESPONSIVA */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-slate-100 my-auto max-h-[92vh] flex flex-col overflow-y-auto">
            {/* Cabeçalho do Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                  <Menu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Menu Completo da Fazenda</h3>
                  <p className="text-xs text-cyan-300/80">Linguagem Simples & Acesso a Todas as Telas</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ações Rápidas no Topo do Menu */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {onOpenVisionModal && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenVisionModal();
                  }}
                  className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-600/50 hover:bg-teal-900/60 text-teal-300 text-xs font-bold flex flex-col items-center gap-1 text-center cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-teal-400" />
                  <span>📷 Foto com IA</span>
                  <span className="text-[10px] text-teal-400/80 font-normal">Tirar foto de tudo</span>
                </button>
              )}

              {onOpenVoiceModal && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenVoiceModal();
                  }}
                  className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-600/50 hover:bg-purple-900/60 text-purple-300 text-xs font-bold flex flex-col items-center gap-1 text-center cursor-pointer"
                >
                  <Mic className="w-5 h-5 text-purple-400" />
                  <span>🎤 Falar com a IA</span>
                  <span className="text-[10px] text-purple-400/80 font-normal">Conversar por voz</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsResetModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/50 hover:bg-amber-900/60 text-amber-300 text-xs font-bold flex flex-col items-center gap-1 text-center cursor-pointer font-mono"
              >
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <span>🔄 Zerar / Reiniciar</span>
                <span className="text-[10px] text-amber-400/80 font-normal">Com confirmação</span>
              </button>

              {onOpenFarmProfileModal && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenFarmProfileModal();
                  }}
                  className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-600/50 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold flex flex-col items-center gap-1 text-center cursor-pointer"
                >
                  <Home className="w-5 h-5 text-cyan-400" />
                  <span>🏡 Minha Fazenda</span>
                  <span className="text-[10px] text-cyan-400/80 font-normal">Dados & Licença</span>
                </button>
              )}
            </div>

            {/* Seções de Navegação Categorizadas e Didáticas */}
            <div className="space-y-4">
              {navigationSections.map((sec, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <div className="mb-2">
                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">{sec.category}</h4>
                    <p className="text-[11px] text-slate-400">{sec.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md bg-slate-800 border border-slate-700 shrink-0 ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-200 truncate">{item.label}</div>
                            <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📱 BARRA DE NAVEGAÇÃO INFERIOR FIXA PARA SMARTPHONES (BOTTOM NAV) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-t-cyan-500/20 flex items-center justify-around py-3 px-2 md:hidden rounded-t-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.2)] pb-safe">
        <button
          onClick={() => setActiveTab('nerve-center')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'nerve-center' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => setActiveTab('feeding-trays')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'feeding-trays' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px]">Ração</span>
        </button>

        <button
          onClick={() => setActiveTab('water-quality')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'water-quality' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-5 h-5" />
          <span className="text-[10px]">Água</span>
        </button>

        {onOpenVisionModal && (
          <button
            onClick={onOpenVisionModal}
            className="flex flex-col items-center gap-0.5 text-teal-400 font-bold cursor-pointer"
          >
            <div className="p-1 rounded-full bg-teal-500/20 border border-teal-500/40">
              <Camera className="w-5 h-5 text-teal-300" />
            </div>
            <span className="text-[10px]">Foto IA</span>
          </button>
        )}

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Mais</span>
        </button>
      </div>
    </header>
  );
};
