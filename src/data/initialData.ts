import { Batch, Biometry, Farm, FeedingLog, SensorReading, Tank } from '../types/aquacore';

export const initialFarm: Farm = {
  id: 'farm-river-life',
  name: 'River Life (Área Fazenda)',
  location: 'Mogeiro – PB',
  timezone: 'America/Fortaleza (UTC-3)',
  currency: 'BRL (R$)',
  kwhCost: 0.72, // R$ por kWh
  fishSalePricePerKg: 24.50, // Camarão Vannamei Comercial Inteiro (R$ 24,50/kg)
  shrimpSalePricePerKg: 24.50,
  feedAverageCostPerKg: 4.20, // R$ por kg (Média ponderada rações)
};

// 7 Tanques Cadastrados: Todos Escavados | Linha: Engorda | Área Total: 1,682 ha (16.820 m²)
// 4 Tanques Ocupados (V 01, V 02, V 03, V 04) | 3 Tanques Livres (V 05, V 06, V 07)
export const initialTanks: Tank[] = [
  {
    id: 'tank-01',
    farmId: 'farm-river-life',
    name: 'Tanque V 01',
    type: 'escavado',
    volumeM3: 2370,
    areaM2: 1580, // 0,158 ha
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: 'optimal',
  },
  {
    id: 'tank-02',
    farmId: 'farm-river-life',
    name: 'Tanque V 02',
    type: 'escavado',
    volumeM3: 2370,
    areaM2: 1580, // 0,158 ha
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: 'optimal',
  },
  {
    id: 'tank-03',
    farmId: 'farm-river-life',
    name: 'Tanque V 03',
    type: 'escavado',
    volumeM3: 4665,
    areaM2: 3110, // 0,311 ha
    depthM: 1.5,
    aeratorCount: 6,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: 'optimal',
  },
  {
    id: 'tank-04',
    farmId: 'farm-river-life',
    name: 'Tanque V 04',
    type: 'escavado',
    volumeM3: 3420,
    areaM2: 2280, // 0,228 ha
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: 'optimal',
  },
  {
    id: 'tank-05',
    farmId: 'farm-river-life',
    name: 'Tanque V 05',
    type: 'escavado',
    volumeM3: 4215,
    areaM2: 2810, // 0,281 ha
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: false,
    status: 'optimal', // Tanque Livre
  },
  {
    id: 'tank-06',
    farmId: 'farm-river-life',
    name: 'Tanque V 06',
    type: 'escavado',
    volumeM3: 6390,
    areaM2: 4260, // 0,426 ha
    depthM: 1.5,
    aeratorCount: 6,
    aeratorPowerKw: 2.2,
    aeratorActive: false,
    status: 'optimal', // Tanque Livre
  },
  {
    id: 'tank-07',
    farmId: 'farm-river-life',
    name: 'Tanque V 07',
    type: 'escavado',
    volumeM3: 1800,
    areaM2: 1200, // 0,120 ha
    depthM: 1.5,
    aeratorCount: 2,
    aeratorPowerKw: 2.2,
    aeratorActive: false,
    status: 'optimal', // Tanque Livre
  },
];

// 4 Lotes Povoados (Total 380.000 un.) | Biomassa Técnica Atual: 3,53 kg | Projeção Despesca (15g): 5.700 kg
export const initialBatches: Batch[] = [
  {
    id: 'batch-01',
    tankId: 'tank-01',
    batchCode: 'Lote 02',
    species: 'Camarão Vannamei',
    startDate: '2026-09-21', // 16 dias de cultivo
    cycleDay: 16,
    initialCount: 100000,
    currentCount: 100000,
    initialWeightG: 0.0055, // 180 PL/g
    currentWeightG: 0.01, // Biometria cadastrada em 21/09/2026
    targetFinalWeightG: 15,
    expectedFinalWeightG: 15,
    accumulatedFeedKg: 0,
    targetHarvestDate: '2026-11-20',
  },
  {
    id: 'batch-02',
    tankId: 'tank-02',
    batchCode: 'Lote 01',
    species: 'Camarão Vannamei',
    startDate: '2026-09-11', // 26 dias de cultivo
    cycleDay: 26,
    initialCount: 100000,
    currentCount: 100000,
    initialWeightG: 0.0145, // 69 PL/g
    currentWeightG: 0.01, // Biometria cadastrada em 11/09/2026
    targetFinalWeightG: 15,
    expectedFinalWeightG: 15,
    accumulatedFeedKg: 0,
    targetHarvestDate: '2026-11-10',
  },
  {
    id: 'batch-03',
    tankId: 'tank-03',
    batchCode: 'Lote 01',
    species: 'Camarão Vannamei',
    startDate: '2026-09-09', // 28 dias de cultivo
    cycleDay: 28,
    initialCount: 100000,
    currentCount: 100000,
    initialWeightG: 0.0111, // 90 PL/g
    currentWeightG: 0.01, // Biometria cadastrada em 09/09/2026
    targetFinalWeightG: 15,
    expectedFinalWeightG: 15,
    accumulatedFeedKg: 0,
    targetHarvestDate: '2026-11-08',
  },
  {
    id: 'batch-04',
    tankId: 'tank-04',
    batchCode: 'Lote 02',
    species: 'Camarão Vannamei',
    startDate: '2026-10-01', // 5 dias de cultivo
    cycleDay: 5,
    initialCount: 80000,
    currentCount: 80000,
    initialWeightG: 0.0051, // 194 PL/g
    currentWeightG: 0.01, // Biometria cadastrada em 01/10/2026
    targetFinalWeightG: 15,
    expectedFinalWeightG: 15,
    accumulatedFeedKg: 0,
    targetHarvestDate: '2026-11-30',
  },
];

// Telemetria em tempo real para os 7 tanques da Fazenda River Life (Mogeiro - PB)
export const initialSensorReadings: Record<string, SensorReading> = {
  'tank-01': {
    id: 'read-01',
    tankId: 'tank-01',
    timestamp: '2026-10-07T07:38:00Z',
    temperature: 27.8,
    dissolvedOxygen: 5.75,
    ph: 7.82,
    ammoniaTotal: 0.22,
    ammoniaToxic: 0.012,
    nitrite: 0.08,
    orpMv: 295,
    salinityPpt: 19,
  },
  'tank-02': {
    id: 'read-02',
    tankId: 'tank-02',
    timestamp: '2026-10-07T07:39:00Z',
    temperature: 27.9,
    dissolvedOxygen: 5.60,
    ph: 7.85,
    ammoniaTotal: 0.25,
    ammoniaToxic: 0.014,
    nitrite: 0.10,
    orpMv: 285,
    salinityPpt: 19,
  },
  'tank-03': {
    id: 'read-03',
    tankId: 'tank-03',
    timestamp: '2026-10-07T07:40:00Z',
    temperature: 28.1,
    dissolvedOxygen: 5.52,
    ph: 7.80,
    ammoniaTotal: 0.24,
    ammoniaToxic: 0.013,
    nitrite: 0.09,
    orpMv: 290,
    salinityPpt: 19,
  },
  'tank-04': {
    id: 'read-04',
    tankId: 'tank-04',
    timestamp: '2026-10-07T07:41:00Z',
    temperature: 27.6,
    dissolvedOxygen: 5.85,
    ph: 7.78,
    ammoniaTotal: 0.18,
    ammoniaToxic: 0.009,
    nitrite: 0.06,
    orpMv: 305,
    salinityPpt: 19,
  },
  'tank-05': {
    id: 'read-05',
    tankId: 'tank-05',
    timestamp: '2026-10-07T07:42:00Z',
    temperature: 27.4,
    dissolvedOxygen: 6.10,
    ph: 7.75,
    ammoniaTotal: 0.12,
    ammoniaToxic: 0.005,
    nitrite: 0.04,
    orpMv: 315,
    salinityPpt: 19,
  },
  'tank-06': {
    id: 'read-06',
    tankId: 'tank-06',
    timestamp: '2026-10-07T07:43:00Z',
    temperature: 27.5,
    dissolvedOxygen: 6.05,
    ph: 7.76,
    ammoniaTotal: 0.14,
    ammoniaToxic: 0.006,
    nitrite: 0.05,
    orpMv: 310,
    salinityPpt: 19,
  },
  'tank-07': {
    id: 'read-07',
    tankId: 'tank-07',
    timestamp: '2026-10-07T07:44:00Z',
    temperature: 27.3,
    dissolvedOxygen: 6.20,
    ph: 7.72,
    ammoniaTotal: 0.10,
    ammoniaToxic: 0.004,
    nitrite: 0.03,
    orpMv: 320,
    salinityPpt: 19,
  },
};

// Biometrias cadastradas no Meu Pescado (peso de recebimento/povoamento: 0,01 g)
export const initialBiometries: Biometry[] = [
  {
    id: 'bio-v01',
    batchId: 'batch-01',
    tankId: 'tank-01',
    timestamp: '2026-09-21T08:00:00Z',
    sampleSize: 100,
    avgWeightG: 0.01,
    mortalityCount: 0,
    uniformityPct: 100,
    dailyWeightGainG: 0.0,
    fcrCurrent: 0.0,
    fcrBenchmark: 1.30,
    growthVsBenchmarkPct: 0.0,
    aiActionNote: 'Povoamento Tanque V 01 (Lote 02). 100.000 PLs (180 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 150g aplicado.',
  },
  {
    id: 'bio-v02',
    batchId: 'batch-02',
    tankId: 'tank-02',
    timestamp: '2026-09-11T08:00:00Z',
    sampleSize: 100,
    avgWeightG: 0.01,
    mortalityCount: 0,
    uniformityPct: 100,
    dailyWeightGainG: 0.0,
    fcrCurrent: 0.0,
    fcrBenchmark: 1.30,
    growthVsBenchmarkPct: 0.0,
    aiActionNote: 'Povoamento Tanque V 02 (Lote 01). 100.000 PLs (69 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 150g aplicado. Pendente biometria aos 26 dias.',
  },
  {
    id: 'bio-v03',
    batchId: 'batch-03',
    tankId: 'tank-03',
    timestamp: '2026-09-09T08:00:00Z',
    sampleSize: 100,
    avgWeightG: 0.01,
    mortalityCount: 0,
    uniformityPct: 100,
    dailyWeightGainG: 0.0,
    fcrCurrent: 0.0,
    fcrBenchmark: 1.30,
    growthVsBenchmarkPct: 0.0,
    aiActionNote: 'Povoamento Tanque V 03 (Lote 01). 100.000 PLs (90 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 150g aplicado. Pendente biometria aos 28 dias.',
  },
  {
    id: 'bio-v04',
    batchId: 'batch-04',
    tankId: 'tank-04',
    timestamp: '2026-10-01T08:00:00Z',
    sampleSize: 100,
    avgWeightG: 0.01,
    mortalityCount: 0,
    uniformityPct: 100,
    dailyWeightGainG: 0.0,
    fcrCurrent: 0.0,
    fcrBenchmark: 1.30,
    growthVsBenchmarkPct: 0.0,
    aiActionNote: 'Povoamento Tanque V 04 (Lote 02). 80.000 PLs (194 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 100g aplicado.',
  },
];

// Ração total arraçoada no Meu Pescado: 0,00 kg
export const initialFeedingLogs: FeedingLog[] = [];
