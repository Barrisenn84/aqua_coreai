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

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
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
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">
                AQUA<span className="text-cyan-400">-CORE</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                AI ENGINE
              </span>
            </div>
            <p className="text-[11px] text-cyan-300/80 font-medium truncate max-w-sm sm:max-w-md">
              {farm.name} • {farm.location}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('nerve-center')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'nerve-center'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
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
            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-300 font-mono">
              IA Meta
            </span>
          </button>

          <button
            onClick={() => setActiveTab('blackbox-haas')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'blackbox-haas'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-4 h-4 text-cyan-400" />
            <span>Caixas Pretas IoT</span>
            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-500/30 text-cyan-300 font-mono">
              4G
            </span>
          </button>

          <button
            onClick={() => setActiveTab('biomass-predictor')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'biomass-predictor'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Preditor de Biomassa</span>
          </button>

          <button
            onClick={() => setActiveTab('feed-optimizer')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'feed-optimizer'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <span>Otimizador de Ração</span>
            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-300">
              -15%
            </span>
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

          <button
            onClick={() => setActiveTab('harvest-oracle')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'harvest-oracle'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Oráculo de Despesca</span>
          </button>

          <button
            onClick={() => setActiveTab('biometry')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'biometry'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Biometria & Conversão</span>
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
            <span>DRE & Custos</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Terminal de Decisão IA</span>
          </button>

          <button
            onClick={() => setActiveTab('flutter-mobile')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'flutter-mobile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>App do Viveiro</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-4 h-4 text-indigo-400" />
            <span>Arquitetura da Nuvem</span>
          </button>

          {/* NOVAS ABAS INTEGRADAS DO MEU PESCADO */}
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
            <span>Qualidade & Balanço Iônico</span>
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
            onClick={() => setActiveTab('harvest-commercial')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'harvest-commercial'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
            }`}
          >
            <Anchor className="w-4 h-4 text-emerald-400" />
            <span>Despescas & Romaneio</span>
          </button>

          <button
            onClick={() => setActiveTab('mortality-molt')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mortality-molt'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
            }`}
          >
            <Moon className="w-4 h-4 text-rose-400" />
            <span>Mudas & Sanidade</span>
          </button>

          <button
            onClick={() => setActiveTab('cash-flow')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cash-flow'
                ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50 shadow-sm shadow-teal-500/20'
                : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800/60'
            }`}
          >
            <Landmark className="w-4 h-4 text-teal-400" />
            <span>Fluxo de Caixa (DFC)</span>
          </button>
        </nav>

        {/* Fast Action CTA */}
        <div className="flex items-center gap-2">
          {/* 🔄 Botão de Governança: Zerar / Reiniciar Controlado */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border border-amber-600/60 shadow-md shadow-amber-950/30 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
            title="Zerar o que estou fazendo agora ou reiniciar dados salvos com proteção"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Zerar / Reiniciar</span>
          </button>

          {onOpenFarmProfileModal && (
            <button
              onClick={onOpenFarmProfileModal}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              title="Cadastro institucional da Fazenda, CNPJ e Licença Ambiental"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Minha Fazenda</span>
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
    </header>
  );
};
