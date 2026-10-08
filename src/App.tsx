import React, { useState } from 'react';
import { AquaCoreProvider, useAquaCore } from './context/AquaCoreContext';
import { Header } from './components/Header';
import { EmergencyBanner } from './components/EmergencyBanner';
import { NerveCenterDashboard } from './components/NerveCenterDashboard';
import { HarvestOracle } from './components/HarvestOracle';
import { BiometryView } from './components/BiometryView';
import { FinancialDREView } from './components/FinancialDREView';
import { AquaCoreTerminal } from './components/AquaCoreTerminal';
import { BiometryModal } from './components/BiometryModal';
import { FeedLabelScannerModal } from './components/FeedLabelScannerModal';
import { InvoiceModal } from './components/InvoiceModal';
import { EquipmentModal } from './components/EquipmentModal';
import { FlutterMobileCompanion } from './components/FlutterMobileCompanion';
import { CloudArchitectureView } from './components/CloudArchitectureView';
import { BiomassPredictorView } from './components/BiomassPredictorView';
import { FeedOptimizerView } from './components/FeedOptimizerView';
import { MarketBridgeView } from './components/MarketBridgeView';
import { WhatsAppGhostUXView } from './components/WhatsAppGhostUXView';
import { BlackBoxHaaSView } from './components/BlackBoxHaaSView';
import { IoTSimulatorControls } from './components/IoTSimulatorControls';
import { AuthModal } from './components/AuthModal';

// Componentes Adicionados do Meu Pescado
import { FeedingTraysView } from './components/FeedingTraysView';
import { WaterQualityIonView } from './components/WaterQualityIonView';
import { InventoryWarehouseView } from './components/InventoryWarehouseView';
import { HarvestCommercialView } from './components/HarvestCommercialView';
import { MortalityMoltView } from './components/MortalityMoltView';
import { CashFlowView } from './components/CashFlowView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { VisionAnalysisModal } from './components/VisionAnalysisModal';
import { FarmProfileModal } from './components/FarmProfileModal';
import { ResetControlModal } from './components/ResetControlModal';

export type CanonicalTabType =
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

const TAB_ALIASES: Record<string, CanonicalTabType> = {
  // Inventory
  inventory: 'inventory-warehouse',
  'inventory-warehouse': 'inventory-warehouse',
  warehouse: 'inventory-warehouse',
  estoque: 'inventory-warehouse',
  insumos: 'inventory-warehouse',
  racao: 'inventory-warehouse',
  ração: 'inventory-warehouse',

  // Nerve center / Dashboard / Tanques
  'nerve-center': 'nerve-center',
  nerve_center: 'nerve-center',
  dashboard: 'nerve-center',
  tanques: 'nerve-center',
  viveiros: 'nerve-center',
  tanks: 'nerve-center',
  inicio: 'nerve-center',
  início: 'nerve-center',
  painel: 'nerve-center',

  // Feeding trays
  'feeding-trays': 'feeding-trays',
  feeding_trays: 'feeding-trays',
  feeding: 'feeding-trays',
  bandejas: 'feeding-trays',
  comedouros: 'feeding-trays',
  comedouro: 'feeding-trays',
  alimentacao: 'feeding-trays',
  alimentação: 'feeding-trays',

  // Water quality
  'water-quality': 'water-quality',
  water_quality: 'water-quality',
  water: 'water-quality',
  agua: 'water-quality',
  água: 'water-quality',
  oxigenio: 'water-quality',
  oxigênio: 'water-quality',
  ionico: 'water-quality',
  iônico: 'water-quality',

  // Harvest commercial
  'harvest-commercial': 'harvest-commercial',
  harvest_commercial: 'harvest-commercial',
  harvest: 'harvest-commercial',
  despesca: 'harvest-commercial',
  despescas: 'harvest-commercial',
  romaneio: 'harvest-commercial',
  romaneios: 'harvest-commercial',
  colheita: 'harvest-commercial',

  // Mortality & molt
  'mortality-molt': 'mortality-molt',
  mortality_molt: 'mortality-molt',
  muda: 'mortality-molt',
  mudas: 'mortality-molt',
  mortalidade: 'mortality-molt',
  sanidade: 'mortality-molt',

  // Financial / DRE / Cash flow
  dre: 'dre',
  financeiro: 'dre',
  lucro: 'dre',
  lucros: 'dre',
  custos: 'dre',
  'cash-flow': 'cash-flow',
  cash_flow: 'cash-flow',
  caixa: 'cash-flow',
  fluxo: 'cash-flow',

  // Market bridge
  'market-bridge': 'market-bridge',
  market_bridge: 'market-bridge',
  market: 'market-bridge',
  mercado: 'market-bridge',
  cotacao: 'market-bridge',
  cotação: 'market-bridge',
  cotacoes: 'market-bridge',
  cotações: 'market-bridge',

  // Biometry
  biometry: 'biometry',
  biometria: 'biometry',
  peso: 'biometry',

  // WhatsApp
  'whatsapp-ghost': 'whatsapp-ghost',
  whatsapp_ghost: 'whatsapp-ghost',
  whatsapp: 'whatsapp-ghost',
  zap: 'whatsapp-ghost',

  // Blackbox IoT
  'blackbox-haas': 'blackbox-haas',
  blackbox_haas: 'blackbox-haas',
  blackbox: 'blackbox-haas',
  iot: 'blackbox-haas',
  sensores: 'blackbox-haas',

  // Predictor / Optimizer / Oracle
  'biomass-predictor': 'biomass-predictor',
  biomass_predictor: 'biomass-predictor',
  biomass: 'biomass-predictor',
  biomassa: 'biomass-predictor',
  'feed-optimizer': 'feed-optimizer',
  feed_optimizer: 'feed-optimizer',
  otimizador: 'feed-optimizer',
  'harvest-oracle': 'harvest-oracle',
  harvest_oracle: 'harvest-oracle',
  oracle: 'harvest-oracle',
  oraculo: 'harvest-oracle',
  oráculo: 'harvest-oracle',

  // Terminal / Mobile / Architecture
  terminal: 'terminal',
  'flutter-mobile': 'flutter-mobile',
  flutter_mobile: 'flutter-mobile',
  mobile: 'flutter-mobile',
  celular: 'flutter-mobile',
  architecture: 'architecture',
  arquitetura: 'architecture',
};

const VALID_TABS_SET = new Set(Object.values(TAB_ALIASES));

function normalizeTab(rawTab?: string): CanonicalTabType {
  if (!rawTab) return 'nerve-center';
  const clean = rawTab.toLowerCase().trim();
  if (TAB_ALIASES[clean]) return TAB_ALIASES[clean];
  if (VALID_TABS_SET.has(clean as any)) return clean as CanonicalTabType;
  return 'nerve-center';
}

function AppContent() {
  const { setActiveTankId, isAuthModalOpen, setIsAuthModalOpen, setIsResetModalOpen } = useAquaCore();
  const [activeTab, setActiveTab] = useState<CanonicalTabType>('nerve-center');
  const [isBiometryModalOpen, setIsBiometryModalOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const [isFarmProfileModalOpen, setIsFarmProfileModalOpen] = useState<boolean>(false);
  const [biometryTankTarget, setBiometryTankTarget] = useState<string>('tank-02');
  const [auditTankTarget, setAuditTankTarget] = useState<string>('tank-04');

  const handleNavigateTab = (rawTab: string) => {
    const target = normalizeTab(rawTab);
    setActiveTab(target);
  };

  const handleOpenBiometry = (tankId?: string) => {
    if (tankId) setBiometryTankTarget(tankId);
    setIsBiometryModalOpen(true);
  };

  const handleOpenAudit = (tankId: string) => {
    setAuditTankTarget(tankId);
    setActiveTankId(tankId);
    setActiveTab('terminal');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
      {/* Global Mission Critical Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigateTab as any}
        onOpenBiometryModal={() => handleOpenBiometry()}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
        onOpenEquipmentModal={() => setIsEquipmentModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenVisionModal={() => setIsVisionModalOpen(true)}
        onOpenFarmProfileModal={() => setIsFarmProfileModalOpen(true)}
      />

      {/* Emergency Hypoxia / Critical Banner (Visible on all tabs when triggered) */}
      <EmergencyBanner />

      {/* Main Content Viewport - Garantido contra tela preta com renderização segura */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-24 md:pb-6 overflow-x-hidden">
        {activeTab === 'nerve-center' && (
          <NerveCenterDashboard
            onOpenAudit={handleOpenAudit}
            onOpenBiometry={handleOpenBiometry}
            onNavigateToOracle={() => setActiveTab('harvest-oracle')}
          />
        )}

        {activeTab === 'whatsapp-ghost' && <WhatsAppGhostUXView />}

        {activeTab === 'blackbox-haas' && <BlackBoxHaaSView />}

        {activeTab === 'biomass-predictor' && <BiomassPredictorView />}

        {activeTab === 'feed-optimizer' && <FeedOptimizerView />}

        {activeTab === 'market-bridge' && <MarketBridgeView />}

        {activeTab === 'harvest-oracle' && <HarvestOracle />}

        {activeTab === 'biometry' && (
          <BiometryView onOpenNewBiometry={() => handleOpenBiometry()} />
        )}

        {activeTab === 'dre' && <FinancialDREView />}

        {activeTab === 'terminal' && (
          <AquaCoreTerminal initialTankId={auditTankTarget} />
        )}

        {activeTab === 'flutter-mobile' && (
          <FlutterMobileCompanion
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onOpenBiometry={handleOpenBiometry}
          />
        )}

        {activeTab === 'architecture' && <CloudArchitectureView />}

        {/* TELAS INTEGRADAS DO MEU PESCADO */}
        {activeTab === 'feeding-trays' && <FeedingTraysView />}

        {activeTab === 'water-quality' && <WaterQualityIonView />}

        {activeTab === 'inventory-warehouse' && (
          <InventoryWarehouseView onOpenScanner={() => setIsScannerModalOpen(true)} />
        )}

        {activeTab === 'harvest-commercial' && <HarvestCommercialView />}

        {activeTab === 'mortality-molt' && <MortalityMoltView />}

        {activeTab === 'cash-flow' && <CashFlowView />}

        {/* Fallback de proteção absoluta: impede tela preta se uma aba desconhecida for passada */}
        {!VALID_TABS_SET.has(activeTab) && (
          <NerveCenterDashboard
            onOpenAudit={handleOpenAudit}
            onOpenBiometry={handleOpenBiometry}
            onNavigateToOracle={() => setActiveTab('harvest-oracle')}
          />
        )}
      </main>

      {/* Footer System Telemetry */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AQUA-CORE AI • Sistema Nervoso de Inteligência Aquícola Global</span>
          <span>Arquitetura Desacoplada: Ingestão MQTT + Cache Redis + Gemini Cognitive Bridge</span>
        </div>
      </footer>

      {/* Modal for Quick Biometry Validation */}
      <BiometryModal
        isOpen={isBiometryModalOpen}
        onClose={() => setIsBiometryModalOpen(false)}
        defaultTankId={biometryTankTarget}
      />

      {/* Modal for Input Zero Feed Bag Label Scanner */}
      <FeedLabelScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        defaultTankId={biometryTankTarget}
      />

      {/* Modal for Emissão de Nota Fiscal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      {/* Modal for Gestão e Manutenção de Equipamentos */}
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
      />

      {/* Modal Multi-Tenant & Autenticação Central */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modal de Voz IA Bilateral (Dr. Camarão Copilot) */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onNavigateTab={handleNavigateTab}
        onOpenVision={() => {
          setIsVoiceModalOpen(false);
          setIsVisionModalOpen(true);
        }}
        onOpenScanner={() => {
          setIsVoiceModalOpen(false);
          setIsScannerModalOpen(true);
        }}
        onOpenFarmProfile={() => {
          setIsVoiceModalOpen(false);
          setIsFarmProfileModalOpen(true);
        }}
        onOpenReset={() => {
          setIsVoiceModalOpen(false);
          setIsResetModalOpen(true);
        }}
        onOpenBiometry={() => {
          setIsVoiceModalOpen(false);
          handleOpenBiometry();
        }}
      />

      {/* Modal de Visão Computacional Multimodal (5 Modos) */}
      <VisionAnalysisModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
      />

      {/* Modal de Minha Fazenda / Cadastro Institucional & Licença */}
      <FarmProfileModal
        isOpen={isFarmProfileModalOpen}
        onClose={() => setIsFarmProfileModalOpen(false)}
      />

      {/* 🛡️ Modal de Governança: Zerar / Reiniciar Controlado */}
      <ResetControlModal />

      {/* Floating IoT Stress Simulator Controls */}
      <IoTSimulatorControls />
    </div>
  );
}

export default function App() {
  return (
    <AquaCoreProvider>
      <AppContent />
    </AquaCoreProvider>
  );
}
