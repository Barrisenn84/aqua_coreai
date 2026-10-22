import { Batch, Biometry, Farm, FeedingLog, SensorReading, Tank } from '../types/aquacore';
import { meuPescadoSnapshot } from './meuPescadoImport';

export const initialFarm: Farm = {
  id: 'farm-river-life',
  name: meuPescadoSnapshot.farm.productionAreaName,
  location: meuPescadoSnapshot.farm.location,
  timezone: 'America/Sao_Paulo (UTC-3)',
  currency: 'BRL (R$)',
  kwhCost: 0.72,
  // The source account did not expose a sale-price history. Keep these empty
  // until the operator enters a negotiated price, so projections never invent
  // revenue or margin.
  shrimpSalePricePerKg: 0,
  fishSalePricePerKg: 0,
  camarãoSalePricePerKg: 0,
  camaraoSalePricePerKg: 0,
  feedAverageCostPerKg: 38.85,
};

export const initialTanks: Tank[] = meuPescadoSnapshot.tanks.map((tank, index) => ({
  id: tank.id,
  farmId: initialFarm.id,
  name: tank.name,
  type: 'escavado',
  volumeM3: tank.volumeM3,
  areaM2: tank.volumeM3,
  depthM: 1,
  aeratorCount: tank.status === 'Ocupado' ? 1 : 0,
  aeratorPowerKw: 2.2,
  aeratorActive: tank.status === 'Ocupado',
  status: index === 4 ? 'optimal' : 'optimal',
}));

export const initialBatches: Batch[] = meuPescadoSnapshot.lots.map((lot) => ({
  id: lot.id,
  tankId: lot.tankId,
  batchCode: lot.batchCode,
  species: 'Camarão Vannamei',
  startDate: '2026-10-17',
  cycleDay: lot.cultivationDays,
  initialCount: lot.initialPopulation,
  currentCount: lot.currentPopulation,
  initialWeightG: (lot.initialBiomassKg * 1000) / lot.initialPopulation,
  currentWeightG: lot.currentWeightG,
  targetFinalWeightG: 15,
  expectedFinalWeightG: 15,
  accumulatedFeedKg: lot.accumulatedFeedKg,
  targetHarvestDate: '2027-01-15',
  stage: 'Berçário',
  stockingDate: '2026-10-17',
  targetWeightG: 15,
  healthStatus: 'Dados importados — validação necessária',
  farmId: initialFarm.id,
}));

const sensorBase = [
  [28.2, 5.6, 7.8, 0.18],
  [28.3, 5.4, 7.9, 0.20],
  [28.1, 5.7, 7.8, 0.17],
  [28.4, 5.3, 8.0, 0.22],
  [28.0, 6.0, 7.7, 0.12],
] as const;

export const initialSensorReadings: Record<string, SensorReading> = Object.fromEntries(
  initialTanks.map((tank, index) => {
    const [temperature, dissolvedOxygen, ph, ammoniaTotal] = sensorBase[index];
    return [tank.id, {
      id: `read-${tank.id}`,
      tankId: tank.id,
      timestamp: '2026-10-21T15:14:00-03:00',
      temperature,
      dissolvedOxygen,
      ph,
      ammoniaTotal,
      ammoniaToxic: 0.01,
      nitrite: 0.05,
      orpMv: 290,
      salinityPpt: 19,
    }];
  }),
);

export const initialBiometries: Biometry[] = meuPescadoSnapshot.biometries
  .filter((item) => item.avgWeightG !== null)
  .map((item, index) => ({
    id: `bio-mp-${index + 1}`,
    batchId: meuPescadoSnapshot.lots[index].id,
    tankId: meuPescadoSnapshot.lots[index].tankId,
    timestamp: `${item.lastBiometry}T12:00:00-03:00`,
    avgWeightG: item.avgWeightG || 0,
    sampleSize: 0,
    mortalityCount: 0,
    uniformityPct: 100,
    dailyWeightGainG: 0,
    fcrCurrent: meuPescadoSnapshot.lots[index].fcr,
    fcrBenchmark: 1.35,
    growthVsBenchmarkPct: 0,
    aiActionNote: 'Importado do Meu Pescado. Amostra não informada; confirmar antes de usar em projeções.',
  }));

export const initialFeedingLogs: FeedingLog[] = meuPescadoSnapshot.nutrition.map((item, index) => ({
  id: `feed-mp-${index + 1}`,
  batchId: meuPescadoSnapshot.lots[index].id,
  tankId: meuPescadoSnapshot.lots[index].tankId,
  timestamp: `${item.lastFeeding}T12:00:00-03:00`,
  amountKg: item.lastAmountKg,
  feedType: item.product,
  proteinPct: 45,
  costPerKg: 38.85,
}));
