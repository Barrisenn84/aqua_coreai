export interface IFarm {
  _id: string;
  name: string;
  location: string;
  timezone: string;
  currency: string;
  kwhCost: number;
  camarãoSalePricePerKg: number;
  feedAverageCostPerKg: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITank {
  _id: string;
  farmId: string;
  name: string;
  type: 'escavado' | 'rede' | 'ras' | 'bioflocos';
  volumeM3: number;
  areaM2: number;
  depthM: number;
  aeratorCount: number;
  aeratorPowerKw: number;
  aeratorActive: boolean;
  status: 'optimal' | 'warning' | 'critical';
  mqttTopic: string;
}

export interface IBatch {
  _id: string;
  tankId: string;
  batchCode: string;
  species: 'Litopenaeus vannamei' | 'Camarão Vannamei' | 'Tambaqui' | 'Salmão do Atlântico';
  startDate: Date;
  ageDays: number;
  initialCount: number;
  currentCount: number;
  initialWeightG: number;
  currentWeightG: number;
  targetFinalWeightG: number;
  accumulatedFeedKg: number;
  targetHarvestDate: Date;
}

export interface ISensorData {
  _id?: string;
  tankId: string;
  timestamp: string;
  temperature: number; // °C
  dissolvedOxygen: number; // mg/L
  ph: number;
  ammoniaTotal: number; // mg/L TAN
  ammoniaToxic: number; // mg/L NH3 un-ionized
  nitrite: number; // mg/L
  salinityPpt?: number;
}

export interface IFeedingLog {
  _id?: string;
  batchId: string;
  tankId: string;
  timestamp: string;
  amountKg: number;
  feedType: string;
  proteinPct: number;
  costPerKg: number;
  source: 'manual' | 'label_scanner_ai' | 'automated_feeder';
}

export interface IBiometry {
  _id?: string;
  batchId: string;
  tankId: string;
  timestamp: string;
  avgWeightG: number;
  sampleSize: number;
  mortalityCount: number;
  uniformityPct: number;
  growthVsBenchmarkPct: number;
  aiActionNote?: string;
}

export interface FeedLabelScanResult {
  manufacturer: string;
  brandName: string;
  crudeProteinPct: number; // PB %
  pelletSizeMm: number; // mm
  targetStage: 'Alevinagem' | 'Crescimento' | 'Terminação' | 'Bioflocos';
  bagWeightKg: number;
  lotNumber: string;
  suggestedFeedingRatePct: number;
  confidenceScore: number;
  summary: string;
  itemType?: string;
  productName?: string;
  officialRegistration?: string;
  priceBrl?: number;
  pelletType?: string;
  usageInstructions?: string;
  benefits?: string[];
}

export type WhatsAppMessageLevel = 'informative' | 'consultative' | 'critical';

export interface WhatsAppGhostOutput {
  level: WhatsAppMessageLevel;
  replyText: string;
  intent: string;
  actionRequired: boolean;
  followUpMinutes?: number;
  metadata?: {
    tankId?: string;
    temperature?: number;
    dissolvedOxygen?: number;
    recommendedFeedKg?: number;
    financialImpactEstimated?: string;
  };
}

export interface IWhatsAppMessage {
  id: string;
  sender: 'producer' | 'aqua-core-ai' | string;
  senderName: string;
  timestamp: string;
  content: string;
  text?: string;
  level: WhatsAppMessageLevel;
  tankId?: string;
  actionRequired?: boolean;
  followUpScheduleMinutes?: number;
  deliveryStatus: 'sent' | 'delivered' | 'read' | string;
  status?: string;
  isOutgoing?: boolean;
  metadata?: {
    intent?: string;
    temperature?: number;
    dissolvedOxygen?: number;
    recommendedFeedKg?: number;
    financialImpactEstimated?: string;
  };
}

export interface IBlackBoxProbe {
  type: 'dissolved_oxygen' | 'temperature' | 'ph';
  name: string;
  model: string;
  currentValue: number;
  unit: string;
  healthy: boolean;
  calibrationDate: string;
  waterSubmerged: boolean;
}

export interface IBlackBoxHardware {
  deviceId: string;
  deviceName: string;
  tankId: string;
  mcu: 'ESP32 Dual-Core 240MHz';
  cellularModem: 'SIM7600 4G/LTE Cat-1';
  simIccid: string;
  signalStrengthDbm: number; // e.g. -68 dBm (Excellent)
  signalQualityPct: number; // 0-100%
  batteryPct: number; // 0-100%
  batteryVoltageV: number; // 3.7 - 4.2V Li-ion
  batteryType: 'LiFePO4 12.8V 20Ah / Solar Buffered';
  solarPanelWatts: number; // 20W
  solarGeneratingWatts: number; // e.g. 14.8W
  chargingStatus: 'solar_charging' | 'battery_discharging' | 'full';
  probes: {
    dissolvedOxygen: IBlackBoxProbe;
    temperature: IBlackBoxProbe;
    ph: IBlackBoxProbe;
  };
  transmissionIntervalSec: number; // 300s (5min)
  lastTelemetryTimestamp: string;
  online: boolean;
  firmwareVersion: string;
  locationGps?: { lat: number; lng: number };
}
