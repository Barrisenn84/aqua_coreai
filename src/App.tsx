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

function AppContent() {
  const { setActiveTankId, isAuthModalOpen, setIsAuthModalOpen } = useAquaCore();
  const [activeTab, setActiveTab] = useState<
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
  >('nerve-center');
  const [isBiometryModalOpen, setIsBiometryModalOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const [isFarmProfileModalOpen, setIsFarmProfileModalOpen] = useState<boolean>(false);
  const [biometryTankTarget, setBiometryTankTarget] = useState<string>('tank-02');
  const [auditTankTarget, setAuditTankTarget] = useState<string>('tank-04');

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Global Mission Critical Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
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

      {/* Modal de Voz IA Bilateral (Dr. Camarão) */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
        onOpenVision={() => {
          setIsVoiceModalOpen(false);
          setIsVisionModalOpen(true);
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
