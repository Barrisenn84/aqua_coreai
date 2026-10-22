import React, { Suspense, lazy, useCallback, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { AquaCoreProvider, useAquaCore } from './context/AquaCoreContext';
import { AppShell } from './components/AppShell';
import { InteractiveManual } from './components/InteractiveManual';
import { EmergencyBanner } from './components/EmergencyBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BiometryModal } from './components/BiometryModal';
import { FeedLabelScannerModal } from './components/FeedLabelScannerModal';
import { InvoiceModal } from './components/InvoiceModal';
import { EquipmentModal } from './components/EquipmentModal';
import { AuthModal } from './components/AuthModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import type { VoiceTankPayload } from './components/VoiceAssistantModal';
import { VisionAnalysisModal } from './components/VisionAnalysisModal';
import { FarmProfileModal } from './components/FarmProfileModal';
import { ResetControlModal } from './components/ResetControlModal';

const lazyNamed = (loader: () => Promise<any>, name: string): React.LazyExoticComponent<React.ComponentType<any>> =>
  lazy(async () => ({ default: (await loader())[name] as React.ComponentType<any> }));
const NerveCenterDashboard = lazyNamed(() => import('./components/NerveCenterDashboard'), 'NerveCenterDashboard');
const OperationsHubView = lazyNamed(() => import('./components/OperationsHubView'), 'OperationsHubView');
const WhatsAppGhostUXView = lazyNamed(() => import('./components/WhatsAppGhostUXView'), 'WhatsAppGhostUXView');
const BlackBoxHaaSView = lazyNamed(() => import('./components/BlackBoxHaaSView'), 'BlackBoxHaaSView');
const BiomassPredictorView = lazyNamed(() => import('./components/BiomassPredictorView'), 'BiomassPredictorView');
const FeedOptimizerView = lazyNamed(() => import('./components/FeedOptimizerView'), 'FeedOptimizerView');
const MarketBridgeView = lazyNamed(() => import('./components/MarketBridgeView'), 'MarketBridgeView');
const HarvestOracle = lazyNamed(() => import('./components/HarvestOracle'), 'HarvestOracle');
const BiometryView = lazyNamed(() => import('./components/BiometryView'), 'BiometryView');
const FinancialDREView = lazyNamed(() => import('./components/FinancialDREView'), 'FinancialDREView');
const AquaCoreTerminal = lazyNamed(() => import('./components/AquaCoreTerminal'), 'AquaCoreTerminal');
const FlutterMobileCompanion = lazyNamed(() => import('./components/FlutterMobileCompanion'), 'FlutterMobileCompanion');
const CloudArchitectureView = lazyNamed(() => import('./components/CloudArchitectureView'), 'CloudArchitectureView');
const FeedingTraysView = lazyNamed(() => import('./components/FeedingTraysView'), 'FeedingTraysView');
const WaterQualityIonView = lazyNamed(() => import('./components/WaterQualityIonView'), 'WaterQualityIonView');
const InventoryWarehouseView = lazyNamed(() => import('./components/InventoryWarehouseView'), 'InventoryWarehouseView');
const HarvestCommercialView = lazyNamed(() => import('./components/HarvestCommercialView'), 'HarvestCommercialView');
const MortalityMoltView = lazyNamed(() => import('./components/MortalityMoltView'), 'MortalityMoltView');
const CashFlowView = lazyNamed(() => import('./components/CashFlowView'), 'CashFlowView');
const IoTSimulatorControls = lazyNamed(() => import('./components/IoTSimulatorControls'), 'IoTSimulatorControls');

export type CanonicalTabType =
  | 'nerve-center' | 'operations-hub' | 'whatsapp-ghost' | 'blackbox-haas' | 'biomass-predictor'
  | 'feed-optimizer' | 'market-bridge' | 'harvest-oracle' | 'biometry' | 'dre' | 'terminal'
  | 'flutter-mobile' | 'architecture' | 'feeding-trays' | 'water-quality' | 'inventory-warehouse'
  | 'harvest-commercial' | 'mortality-molt' | 'cash-flow';

const aliases: Record<string, CanonicalTabType> = {
  inicio: 'nerve-center', painel: 'nerve-center', dashboard: 'nerve-center', 'nerve-center': 'nerve-center',
  operacao: 'operations-hub', operação: 'operations-hub', lotes: 'operations-hub', tanques: 'operations-hub', relatorios: 'operations-hub', relatórios: 'operations-hub', parceiros: 'operations-hub', 'operations-hub': 'operations-hub',
  whatsapp: 'whatsapp-ghost', 'whatsapp-ghost': 'whatsapp-ghost', iot: 'blackbox-haas', sensores: 'blackbox-haas', 'blackbox-haas': 'blackbox-haas',
  biomassa: 'biomass-predictor', 'biomass-predictor': 'biomass-predictor', alimentacao: 'feeding-trays', alimentação: 'feeding-trays', bandejas: 'feeding-trays', 'feeding-trays': 'feeding-trays',
  racao: 'feed-optimizer', ração: 'feed-optimizer', 'feed-optimizer': 'feed-optimizer', agua: 'water-quality', água: 'water-quality', 'water-quality': 'water-quality',
  estoque: 'inventory-warehouse', 'inventory-warehouse': 'inventory-warehouse', despesca: 'harvest-commercial', 'harvest-commercial': 'harvest-commercial',
  mortalidade: 'mortality-molt', sanidade: 'mortality-molt', 'mortality-molt': 'mortality-molt', caixa: 'cash-flow', 'cash-flow': 'cash-flow', dre: 'dre', financeiro: 'dre',
  mercado: 'market-bridge', 'market-bridge': 'market-bridge', previsao: 'harvest-oracle', previsão: 'harvest-oracle', 'harvest-oracle': 'harvest-oracle',
  biometria: 'biometry', biometry: 'biometry', terminal: 'terminal', mobile: 'flutter-mobile', 'flutter-mobile': 'flutter-mobile', arquitetura: 'architecture', architecture: 'architecture',
};

const normalizeTab = (value: string): CanonicalTabType => aliases[value.toLowerCase().trim()] || 'nerve-center';
const LoadingView = () => <div className="flex min-h-[45vh] items-center justify-center"><div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm font-bold text-slate-300"><LoaderCircle className="h-5 w-5 animate-spin text-cyan-300" />Carregando módulo…</div></div>;

function AppContent() {
  const { setActiveTankId, addTank, tanks, batches, sensorReadings, totalBiomassKg, globalFcr, globalSurvivalRatePct, farm, dre, isAuthModalOpen, setIsAuthModalOpen, setIsResetModalOpen } = useAquaCore();
  const [activeTab, setActiveTab] = useState<CanonicalTabType>('nerve-center');
  const [manualOpen, setManualOpen] = useState(() => localStorage.getItem('aquacore_manual_seen') !== 'yes');
  const [isBiometryModalOpen, setIsBiometryModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isFarmProfileModalOpen, setIsFarmProfileModalOpen] = useState(false);
  const [biometryTankTarget, setBiometryTankTarget] = useState('tank-01');
  const [auditTankTarget, setAuditTankTarget] = useState('tank-01');

  const navigate = useCallback((rawTab: string) => setActiveTab(normalizeTab(rawTab)), []);
  const closeManual = () => { localStorage.setItem('aquacore_manual_seen', 'yes'); setManualOpen(false); };
  const openBiometry = (tankId?: string) => { if (tankId) setBiometryTankTarget(tankId); setIsBiometryModalOpen(true); };
  const openAudit = (tankId: string) => { setAuditTankTarget(tankId); setActiveTankId(tankId); setActiveTab('terminal'); };

  const view = (() => {
    switch (activeTab) {
      case 'nerve-center': return <NerveCenterDashboard onOpenAudit={openAudit} onOpenBiometry={openBiometry} onNavigateToOracle={() => setActiveTab('harvest-oracle')} />;
      case 'operations-hub': return <OperationsHubView />;
      case 'whatsapp-ghost': return <WhatsAppGhostUXView />;
      case 'blackbox-haas': return <BlackBoxHaaSView />;
      case 'biomass-predictor': return <BiomassPredictorView />;
      case 'feed-optimizer': return <FeedOptimizerView />;
      case 'market-bridge': return <MarketBridgeView />;
      case 'harvest-oracle': return <HarvestOracle />;
      case 'biometry': return <BiometryView onOpenNewBiometry={() => openBiometry()} />;
      case 'dre': return <FinancialDREView />;
      case 'terminal': return <AquaCoreTerminal initialTankId={auditTankTarget} />;
      case 'flutter-mobile': return <FlutterMobileCompanion onOpenScanner={() => setIsScannerModalOpen(true)} onOpenBiometry={openBiometry} />;
      case 'architecture': return <CloudArchitectureView />;
      case 'feeding-trays': return <FeedingTraysView />;
      case 'water-quality': return <WaterQualityIonView />;
      case 'inventory-warehouse': return <InventoryWarehouseView onOpenScanner={() => setIsScannerModalOpen(true)} />;
      case 'harvest-commercial': return <HarvestCommercialView />;
      case 'mortality-molt': return <MortalityMoltView />;
      case 'cash-flow': return <CashFlowView />;
      default: return <OperationsHubView />;
    }
  })();

  return (
    <AppShell activeTab={activeTab} onNavigate={navigate} onOpenHelp={() => setManualOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onOpenBiometry={() => openBiometry()} onOpenScanner={() => setIsScannerModalOpen(true)} onOpenEquipment={() => setIsEquipmentModalOpen(true)} onOpenInvoice={() => setIsInvoiceModalOpen(true)} onOpenVoice={() => setIsVoiceModalOpen(true)} onOpenVision={() => setIsVisionModalOpen(true)} onOpenFarm={() => setIsFarmProfileModalOpen(true)} onOpenReset={() => setIsResetModalOpen(true)}>
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-cyan-300 focus:px-4 focus:py-3 focus:font-bold focus:text-slate-950">Pular para o conteúdo</a>
      <EmergencyBanner />
      <ErrorBoundary fallbackTitle="Este módulo encontrou um problema"><Suspense fallback={<LoadingView />}>{view}</Suspense></ErrorBoundary>
      <InteractiveManual open={manualOpen} onClose={closeManual} onNavigate={navigate} />
      <BiometryModal isOpen={isBiometryModalOpen} onClose={() => setIsBiometryModalOpen(false)} defaultTankId={biometryTankTarget} />
      <FeedLabelScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} defaultTankId={biometryTankTarget} />
      <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
      <EquipmentModal isOpen={isEquipmentModalOpen} onClose={() => setIsEquipmentModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <VoiceAssistantModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onNavigateTab={navigate} onOpenVision={() => { setIsVoiceModalOpen(false); setIsVisionModalOpen(true); }} onOpenScanner={() => { setIsVoiceModalOpen(false); setIsScannerModalOpen(true); }} onOpenFarmProfile={() => { setIsVoiceModalOpen(false); setIsFarmProfileModalOpen(true); }} onOpenReset={() => { setIsVoiceModalOpen(false); setIsResetModalOpen(true); }} onOpenBiometry={() => { setIsVoiceModalOpen(false); openBiometry(); }} snapshot={{
        tankCount: tanks.length,
        batchCount: batches.length,
        biomassKg: totalBiomassKg,
        globalFcr,
        survivalPct: globalSurvivalRatePct,
        salePricePerKg: farm.shrimpSalePricePerKg || farm.camarãoSalePricePerKg || farm.fishSalePricePerKg || 0,
        grossRevenue: dre.grossRevenue,
        latestSensors: Object.values(sensorReadings).slice(0, 8).map((reading) => ({ tankId: reading.tankId, oxygenMgL: reading.dissolvedOxygen, temperatureC: reading.temperature, ph: reading.ph, updatedAt: reading.timestamp })),
      }} onCreateTank={(payload: VoiceTankPayload) => {
        const areaM2 = Number(payload.areaM2 || 0);
        const depthM = Number(payload.depthM || 1.5);
        const aeratorCount = Number(payload.aeratorCount || 0);
        addTank({
          name: payload.name || 'Tanque novo',
          type: payload.type || 'escavado',
          areaM2,
          depthM,
          volumeM3: Math.round(areaM2 * depthM),
          aeratorCount,
          aeratorPowerKw: Number(payload.aeratorPowerKw || 2.2),
          aeratorActive: aeratorCount > 0,
          status: 'optimal',
          initialBatchCode: payload.initialBatchCode,
          initialShrimpCount: payload.initialShrimpCount,
          initialWeightG: payload.initialWeightG,
        });
      }} />
      <VisionAnalysisModal isOpen={isVisionModalOpen} onClose={() => setIsVisionModalOpen(false)} />
      <FarmProfileModal isOpen={isFarmProfileModalOpen} onClose={() => setIsFarmProfileModalOpen(false)} />
      <ResetControlModal />
      <Suspense fallback={null}><IoTSimulatorControls /></Suspense>
    </AppShell>
  );
}

export default function App() { return <ErrorBoundary><AquaCoreProvider><AppContent /></AquaCoreProvider></ErrorBoundary>; }
