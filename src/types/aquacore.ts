export type SpeciesType = 'Tilápia do Nilo' | 'Camarão Vannamei' | 'Tambaqui' | 'Salmão do Atlântico';

export type TankType = 'escavado' | 'rede' | 'ras' | 'bioflocos';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Farm {
  id: string;
  name: string;
  location: string;
  timezone: string;
  currency: string;
  kwhCost: number; // R$/kWh
  fishSalePricePerKg: number; // R$/kg
  shrimpSalePricePerKg?: number; // R$/kg
  feedAverageCostPerKg: number; // R$/kg
}

export interface Tank {
  id: string;
  farmId: string;
  name: string;
  type: TankType;
  volumeM3: number;
  areaM2: number;
  depthM: number;
  aeratorCount: number;
  aeratorPowerKw: number; // per aerator
  aeratorActive: boolean;
  status: 'optimal' | 'warning' | 'critical';
}

export interface Batch {
  id: string;
  tankId: string;
  batchCode: string;
  species: SpeciesType;
  startDate: string;
  cycleDay: number;
  initialCount: number;
  currentCount: number;
  initialWeightG: number;
  currentWeightG: number;
  targetFinalWeightG: number;
  expectedFinalWeightG: number;
  accumulatedFeedKg: number;
  targetHarvestDate: string;
}

export interface SensorReading {
  id: string;
  tankId: string;
  timestamp: string;
  temperature: number; // °C
  dissolvedOxygen: number; // mg/L
  ph: number;
  ammoniaTotal: number; // mg/L TAN (Total Ammonia Nitrogen)
  ammoniaToxic: number; // calculated NH3 un-ionized (mg/L)
  nitrite: number; // mg/L NO2
  orpMv?: number; // mV
  salinityPpt?: number;
}

export interface FeedingLog {
  id: string;
  batchId: string;
  tankId: string;
  timestamp: string;
  amountKg: number;
  feedType: string;
  proteinPct: number;
  costPerKg: number;
}

export interface Biometry {
  id: string;
  batchId: string;
  tankId: string;
  timestamp: string;
  avgWeightG: number;
  sampleSize: number;
  mortalityCount: number;
  uniformityPct: number;
  dailyWeightGainG: number; // GPD
  fcrCurrent: number;
  fcrBenchmark: number;
  growthVsBenchmarkPct: number; // e.g. +5.2%
  aiActionNote?: string;
}

export interface CriticalAlert {
  id: string;
  tankId: string;
  tankName: string;
  parameter: 'O2' | 'NH3' | 'PH' | 'TEMP' | 'FCR';
  currentValue: number;
  unit: string;
  threshold: number;
  severity: AlertSeverity;
  timestamp: string;
  message: string;
  recommendedAction: string;
  potentialLossReais: number;
  resolved: boolean;
}

export interface ChainOfThoughtStep {
  step: 'DADO' | 'BASELINE' | 'DESVIO' | 'RISCO' | 'AÇÃO_CORRETIVA' | 'IMPACTO_FINANCEIRO';
  title: string;
  content: string;
  severity?: 'neutral' | 'warning' | 'danger' | 'success';
}

export interface AquaCoreDiagnosticResult {
  timestamp: string;
  source: string;
  chainOfThought: ChainOfThoughtStep[];
  action: string;
  justification: string;
  expectedResult: string;
  quickMetrics: {
    label: string;
    value: string;
    change?: string;
    status: 'good' | 'warn' | 'crit';
  }[];
}

export interface HarvestScenario {
  dayOffset: number;
  targetDate: string;
  label: string;
  projectedAvgWeightG: number;
  projectedBiomassKg: number;
  marketPricePerKg: number;
  grossRevenueReais: number;
  feedCostAdditionalReais: number;
  energyCostAdditionalReais: number;
  accumulatedCostTotalReais: number;
  netProfitReais: number;
  profitDeltaVsTodayReais: number;
  projectedFcr: number;
  isOptimalPoint: boolean;
  verdict: string;
}

export interface AgroDRE {
  grossRevenue: number;
  feedCost: number;
  energyCost: number;
  juvenilesCost: number;
  additivesProbioticsCost: number;
  laborFixedCost: number;
  totalCost: number;
  ebitda: number;
  netMarginPct: number;
  costPerKgProduced: number;
  currentBiomassKg: number;
  breakevenBiomassKg: number;
}

export interface FeedingScheduleSlot {
  time: string; // e.g. "08:00", "11:30"
  standardAmountKg: number;
  adaptedAmountKg: number;
  adjustmentPct: number; // e.g. +12% or -60%
  reason: string;
  isCompleted?: boolean;
}

export interface AdaptiveFeedingPlan {
  tankId: string;
  batchId: string;
  currentTemp: number;
  currentO2: number;
  metabolicFactor: number; // multiplier e.g. 1.15
  dailyRecommendedFeedKg: number;
  baselineDailyFeedKg: number;
  netSavingsReais: number;
  monthlyProjectedSavingsReais: number;
  slots: FeedingScheduleSlot[];
  guideline: string;
}

export interface BiomassPredictionPoint {
  dayOffset: number;
  dateStr: string;
  avgWeightG: number;
  biomassTons: number;
  dailyWeightGainG: number;
  projectedFcr: number;
  isHarvestTarget: boolean;
}

export interface MarketBuyerBid {
  id: string;
  buyerName: string;
  buyerType: 'Frigorífico Exportador' | 'Distribuidor Atacadista' | 'Cooperativa Aquícola' | 'Rede Supermercados';
  location: string;
  pricePerKg: number;
  premiumDeltaPct: number; // e.g. +5.5% vs market index
  minWeightG: number;
  maxWeightG: number;
  requiredVolumeTons: number;
  paymentTerm: string;
  verifiedBadge: boolean;
  status: 'active' | 'negotiating' | 'closed';
}

export interface MarketBridgeListing {
  id: string;
  batchId: string;
  tankId: string;
  species: SpeciesType;
  availableBiomassTons: number;
  currentAvgWeightG: number;
  projectedHarvestDate: string;
  status: 'ready_to_list' | 'listed' | 'contract_locked';
  activeOffersCount: number;
  bestOfferPricePerKg: number;
  bestBuyerName: string;
}

export interface SentinelAuditItem {
  id: string;
  category: 'ESTOQUE' | 'RACAO_NUTRICAO' | 'BIOMETRIA' | 'QUALIDADE_AGUA' | 'CLIMA_LUA' | 'FINANCEIRO' | 'SISTEMA_DADOS';
  severity: 'CRITICO' | 'ATENCAO' | 'AJUSTE' | 'OTIMO';
  title: string;
  description: string;
  correlation: string; // Explica a correlação cruzada com outros módulos do sistema
  recommendedAction: string;
  autoFixAvailable: boolean;
  fixActionType?: 'COMPRA_RACAO' | 'PROGRAMAR_BIOMETRIA' | 'AJUSTAR_AERADOR' | 'ATUALIZAR_DADOS' | 'NOTIFICAR_PRODUTOR';
  fixPayload?: Record<string, any>;
  resolved?: boolean;
}

export interface SentinelAuditReport {
  id: string;
  timestamp: string;
  cycleIntervalMinutes: number; // 15
  systemHealthScore: number; // 0 a 100
  overallStatus: 'OTIMO' | 'ATENCAO' | 'CRITICO';
  totalAnomaliesCount: number;
  criticalCount: number;
  warningCount: number;
  executiveSummary: string;
  items: SentinelAuditItem[];
  nextRunInSeconds: number;
}
