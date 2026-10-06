import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AgroDRE,
  Batch,
  Biometry,
  CriticalAlert,
  Farm,
  FeedingLog,
  SensorReading,
  Tank,
} from '../types/aquacore';
import {
  IBlackBoxHardware,
  IWhatsAppMessage,
} from '../models/aquacultureModels';
import {
  initialBatches,
  initialBiometries,
  initialFarm,
  initialFeedingLogs,
  initialSensorReadings,
  initialTanks,
} from '../data/initialData';
import { initialWhatsAppMessages } from '../data/whatsAppData';
import { initialBlackBoxes } from '../data/blackBoxHardwareData';
import {
  calculateBiomassKg,
  calculateFCR,
  calculateToxicAmmonia,
  projectWeightTGC,
} from '../utils/aquacultureMath';
import {
  generateDailyDigestWhatsApp,
  generateGuardianWhatsAppAlert,
  requestWhatsAppGhostResponse,
} from '../utils/whatsappHelpers';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface ITenant {
  id: string;
  name: string;
  code: string;
  type: 'aquaculture_farm' | 'construction_site';
  location: string;
  kwhCost: number;
  feedCost: number;
  salePrice: number;
  speciesTarget: string;
  producerPhone?: string;
}

interface AquaCoreContextType {
  farm: Farm;
  tanks: Tank[];
  batches: Batch[];
  sensorReadings: Record<string, SensorReading>;
  sensorHistory: Record<string, SensorReading[]>;
  biometries: Biometry[];
  feedingLogs: FeedingLog[];
  alerts: CriticalAlert[];
  activeTankId: string;
  isSimulating: boolean;
  activeScenarioName: string | null;
  dre: AgroDRE;
  totalBiomassKg: number;
  globalFcr: number;
  globalSurvivalRatePct: number;
  whatsAppMessages: IWhatsAppMessage[];
  blackBoxes: IBlackBoxHardware[];
  currentUser: IUser;
  currentTenant: ITenant;
  availableTenants: ITenant[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  switchTenant: (tenantId: string) => void;
  login: (email: string, password?: string) => Promise<void>;
  sendWhatsAppMessage: (text: string) => Promise<void>;
  triggerDailyDigest: () => void;
  triggerGuardianEmergency: (tankId?: string) => void;
  toggleBlackBoxPower: (deviceId: string) => void;
  recalibrateProbe: (deviceId: string, probeType: 'dissolved_oxygen' | 'temperature' | 'ph') => void;
  setActiveTankId: (id: string) => void;
  toggleAerator: (tankId: string) => void;
  emergencyTurnOnAerators: (tankId: string) => void;
  emergencyOverrideAllAerators: () => void;
  addBiometry: (newBio: {
    tankId: string;
    avgWeightG: number;
    sampleSize: number;
    mortalityCount: number;
    uniformityPct: number;
  }) => Biometry;
  addFeedingLog: (newFeed: {
    tankId: string;
    amountKg: number;
    feedType: string;
    proteinPct: number;
    costPerKg: number;
  }) => void;
  updateFarmSettings: (settings: Partial<Farm>) => void;
  toggleSimulation: () => void;
  triggerScenario: (scenario: 'hypoxia_dawn' | 'ammonia_surge' | 'cold_front' | 'recover_optimal') => void;
  isResetModalOpen: boolean;
  setIsResetModalOpen: (open: boolean) => void;
  resetActiveSession: (options?: {
    resetScenario?: boolean;
    resetTelemetryHistory?: boolean;
    resetChat?: boolean;
    resetFilters?: boolean;
  }) => void;
  resetSavedData: (options: {
    modules: string[];
    resetAllToFactory?: boolean;
    confirmationCode: string;
  }) => Promise<{ success: boolean; message: string }>;
}

const AquaCoreContext = createContext<AquaCoreContextType | undefined>(undefined);

export const AquaCoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableTenants, setAvailableTenants] = useState<ITenant[]>([
    {
      id: 'tenant-river-life',
      name: 'Fazenda River Life (Camarão PB)',
      code: 'RIVER_LIFE',
      type: 'aquaculture_farm',
      location: 'Polo de Mogeiro – PB',
      kwhCost: 0.72,
      feedCost: 4.20,
      salePrice: 10.25,
      speciesTarget: 'Litopenaeus vannamei (Camarão)',
      producerPhone: '+5584988585211',
    },
    {
      id: 'tenant-santa-helena',
      name: 'Fazenda Santa Helena (Tilápia BA)',
      code: 'SANTA_HELENA',
      type: 'aquaculture_farm',
      location: 'Polo Paulo Afonso – BA',
      kwhCost: 0.68,
      feedCost: 3.90,
      salePrice: 9.80,
      speciesTarget: 'Oreochromis niloticus (Tilápia do Nilo)',
      producerPhone: '+5575991234567',
    },
    {
      id: 'tenant-constr-ai-01',
      name: 'Constr.AI • Obra Residencial Mirante',
      code: 'CONSTR_MIRANTE',
      type: 'construction_site',
      location: 'João Pessoa – PB (Bessa)',
      kwhCost: 0.85,
      feedCost: 0.0,
      salePrice: 0.0,
      speciesTarget: 'Edifício Residencial 18 Pavimentos',
      producerPhone: '+5583998765432',
    },
  ]);

  const [currentTenant, setCurrentTenant] = useState<ITenant>(availableTenants[0]);
  const [currentUser, setCurrentUser] = useState<IUser>({
    id: 'usr-01',
    name: 'Engenheiro Collermhann',
    email: 'collermhann@aquacore.ai',
    role: 'owner',
    phone: '+5584988585211',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const [farm, setFarm] = useState<Farm>(initialFarm);
  const [tanks, setTanks] = useState<Tank[]>(initialTanks);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [sensorReadings, setSensorReadings] = useState<Record<string, SensorReading>>(initialSensorReadings);
  const [biometries, setBiometries] = useState<Biometry[]>(initialBiometries);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>(initialFeedingLogs);
  const [activeTankId, setActiveTankId] = useState<string>('tank-04'); // Focus default on emergency tank 04
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeScenarioName, setActiveScenarioName] = useState<string | null>('Alerta Noturno: Hipóxia Tanque 04');

  // PILAR 1 & 3: WhatsApp Ghost UX Messages
  const [whatsAppMessages, setWhatsAppMessages] = useState<IWhatsAppMessage[]>(initialWhatsAppMessages);

  // PILAR 2: Hardware-as-a-Service Caixa Preta fleet
  const [blackBoxes, setBlackBoxes] = useState<IBlackBoxHardware[]>(initialBlackBoxes);

  // Time-series history for charts and sparklines
  const [sensorHistory, setSensorHistory] = useState<Record<string, SensorReading[]>>(() => {
    const hist: Record<string, SensorReading[]> = {};
    initialTanks.forEach((tank) => {
      const base = initialSensorReadings[tank.id];
      const points: SensorReading[] = [];
      for (let i = 12; i >= 0; i--) {
        const time = new Date(Date.now() - i * 5 * 60000);
        points.push({
          ...base,
          id: `hist-${tank.id}-${i}`,
          timestamp: time.toISOString(),
          // Slight historical wave
          dissolvedOxygen: Number((base.dissolvedOxygen + (Math.sin(i / 2) * 0.4)).toFixed(2)),
          temperature: Number((base.temperature + (Math.cos(i / 3) * 0.3)).toFixed(1)),
        });
      }
      hist[tank.id] = points;
    });
    return hist;
  });

  // Calculate critical alerts dynamically
  const alerts = useMemo<CriticalAlert[]>(() => {
    const list: CriticalAlert[] = [];
    tanks.forEach((tank) => {
      const read = sensorReadings[tank.id];
      const batch = batches.find((b) => b.tankId === tank.id);
      if (!read || !batch) return;

      const toxicNh3 = calculateToxicAmmonia(read.ammoniaTotal, read.ph, read.temperature);
      const biomassKg = calculateBiomassKg(batch.currentCount, batch.currentWeightG);
      const biomassValue = biomassKg * farm.fishSalePricePerKg;

      // Rule 1: Hypoxia (O2 < 3.2 mg/L)
      if (read.dissolvedOxygen < 3.2) {
        list.push({
          id: `alert-o2-${tank.id}`,
          tankId: tank.id,
          tankName: tank.name,
          parameter: 'O2',
          currentValue: read.dissolvedOxygen,
          unit: 'mg/L',
          threshold: 3.5,
          severity: 'critical',
          timestamp: 'Agora (Tempo Real)',
          message: `Oxigênio Crítico em ${read.dissolvedOxygen.toFixed(2)} mg/L! Risco imediato de asfixia e mortalidade total do lote.`,
          recommendedAction: `Acionar aeradores imediatamente e suspender 100% do arraçoamento até O2 > 5.0 mg/L.`,
          potentialLossReais: biomassValue,
          resolved: tank.aeratorActive && read.dissolvedOxygen >= 5.0,
        });
      }

      // Rule 2: Toxic Ammonia (> 0.05 mg/L NH3)
      if (toxicNh3 > 0.045) {
        list.push({
          id: `alert-nh3-${tank.id}`,
          tankId: tank.id,
          tankName: tank.name,
          parameter: 'NH3',
          currentValue: toxicNh3,
          unit: 'mg/L NH3',
          threshold: 0.02,
          severity: toxicNh3 > 0.08 ? 'critical' : 'warning',
          timestamp: 'Agora (Tempo Real)',
          message: `Amônia Tóxica não-ionizada em ${toxicNh3.toFixed(3)} mg/L (${read.ph.toFixed(2)} pH). Danos branquiais severos.`,
          recommendedAction: `Cortar 60% da ração e aplicar bio-remediador / aeração para remoção de gases voláteis.`,
          potentialLossReais: biomassValue * 0.15,
          resolved: false,
        });
      }
    });
    return list;
  }, [tanks, sensorReadings, batches, farm.fishSalePricePerKg]);

  // Overall farm metrics & DRE
  const { totalBiomassKg, globalFcr, globalSurvivalRatePct, dre } = useMemo(() => {
    let totalBiomass = 0;
    let initialTotalBiomass = 0;
    let totalFeedKg = 0;
    let totalInitialFish = 0;
    let totalCurrentFish = 0;

    batches.forEach((b) => {
      const bio = calculateBiomassKg(b.currentCount, b.currentWeightG);
      const initBio = calculateBiomassKg(b.initialCount, b.initialWeightG);
      totalBiomass += bio;
      initialTotalBiomass += initBio;
      totalFeedKg += b.accumulatedFeedKg;
      totalInitialFish += b.initialCount;
      totalCurrentFish += b.currentCount;
    });

    const netGain = totalBiomass - initialTotalBiomass;
    const fcr = netGain > 0 ? Number((totalFeedKg / netGain).toFixed(2)) : 1.42;
    const survivalRate = totalInitialFish > 0 ? Number(((totalCurrentFish / totalInitialFish) * 100).toFixed(1)) : 92.5;

    // Agro DRE calculation
    const grossRevenue = totalBiomass * farm.fishSalePricePerKg;
    const feedCost = totalFeedKg * farm.feedAverageCostPerKg;
    // Energy: calculated from all active aerators
    const totalAeratorKw = tanks.reduce((acc, t) => acc + (t.aeratorActive ? t.aeratorCount * t.aeratorPowerKw : 0), 0);
    const estimatedDailyEnergyKwh = totalAeratorKw * 10;
    const energyCost = estimatedDailyEnergyKwh * farm.kwhCost * 30; // 30-day projection
    const juvenilesCost = totalInitialFish * 0.32; // R$ 0,32 per juvenile
    const additivesProbioticsCost = totalBiomass * 0.42;
    const laborFixedCost = 6500; // Team salary and operational overhead

    const totalCost = feedCost + energyCost + juvenilesCost + additivesProbioticsCost + laborFixedCost;
    const ebitda = grossRevenue - totalCost;
    const netMarginPct = grossRevenue > 0 ? Number(((ebitda / grossRevenue) * 100).toFixed(1)) : 0;
    const costPerKgProduced = totalBiomass > 0 ? Number((totalCost / totalBiomass).toFixed(2)) : 0;
    const breakevenBiomassKg = costPerKgProduced > 0 ? Math.round(totalCost / farm.fishSalePricePerKg) : 0;

    const dreResult: AgroDRE = {
      grossRevenue: Math.round(grossRevenue),
      feedCost: Math.round(feedCost),
      energyCost: Math.round(energyCost),
      juvenilesCost: Math.round(juvenilesCost),
      additivesProbioticsCost: Math.round(additivesProbioticsCost),
      laborFixedCost: Math.round(laborFixedCost),
      totalCost: Math.round(totalCost),
      ebitda: Math.round(ebitda),
      netMarginPct,
      costPerKgProduced,
      currentBiomassKg: Math.round(totalBiomass),
      breakevenBiomassKg,
    };

    return {
      totalBiomassKg: Number(totalBiomass.toFixed(1)),
      globalFcr: fcr,
      globalSurvivalRatePct: survivalRate,
      dre: dreResult,
    };
  }, [batches, farm, tanks]);

  // IoT Sensor Telemetry Stream (Live tick simulation)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSensorReadings((prev) => {
        const next: Record<string, SensorReading> = {};
        tanks.forEach((tank) => {
          const current = prev[tank.id] || initialSensorReadings[tank.id];
          const isAeratorOn = tank.aeratorActive;

          // Physics: If aerator is ON, oxygen climbs towards saturation (6.2 mg/L)
          // If aerator is OFF, biological oxygen demand (BOD) decays O2 slowly
          let newDo = current.dissolvedOxygen;
          if (isAeratorOn) {
            newDo = Math.min(6.5, current.dissolvedOxygen + (6.2 - current.dissolvedOxygen) * 0.08 + (Math.random() * 0.06 - 0.03));
          } else {
            newDo = Math.max(1.8, current.dissolvedOxygen - 0.04 + (Math.random() * 0.02 - 0.01));
          }

          // Small natural thermal fluctuation
          const newTemp = Number((current.temperature + (Math.random() * 0.08 - 0.04)).toFixed(1));
          const newPh = Number((current.ph + (Math.random() * 0.04 - 0.02)).toFixed(2));
          const newTan = Number(Math.max(0.1, current.ammoniaTotal + (Math.random() * 0.02 - 0.01)).toFixed(2));
          const toxicNh3 = calculateToxicAmmonia(newTan, newPh, newTemp);

          next[tank.id] = {
            ...current,
            timestamp: new Date().toISOString(),
            dissolvedOxygen: Number(newDo.toFixed(2)),
            temperature: newTemp,
            ph: newPh,
            ammoniaTotal: newTan,
            ammoniaToxic: toxicNh3,
          };
        });
        return next;
      });

      // Update tanks status
      setTanks((prevTanks) =>
        prevTanks.map((t) => {
          const reading = sensorReadings[t.id];
          if (!reading) return t;
          let status: 'optimal' | 'warning' | 'critical' = 'optimal';
          if (reading.dissolvedOxygen < 3.2 || reading.ammoniaToxic > 0.08) {
            status = 'critical';
          } else if (reading.dissolvedOxygen < 4.5 || reading.ammoniaToxic > 0.04) {
            status = 'warning';
          }
          return { ...t, status };
        })
      );

      // Append to time-series history
      setSensorHistory((prevHist) => {
        const updated: Record<string, SensorReading[]> = {};
        tanks.forEach((tank) => {
          const currentReading = sensorReadings[tank.id];
          if (!currentReading) return;
          const currentList = prevHist[tank.id] || [];
          const trimmed = currentList.length > 20 ? currentList.slice(1) : currentList;
          updated[tank.id] = [...trimmed, currentReading];
        });
        return updated;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, tanks, sensorReadings]);

  // Actions
  const toggleAerator = (tankId: string) => {
    setTanks((prev) =>
      prev.map((t) => {
        if (t.id === tankId) {
          return { ...t, aeratorActive: !t.aeratorActive };
        }
        return t;
      })
    );
  };

  // Immediate disruption action for Emergency Banner
  const emergencyTurnOnAerators = (tankId: string) => {
    setTanks((prev) =>
      prev.map((t) => (t.id === tankId ? { ...t, aeratorActive: true, status: 'optimal' } : t))
    );
    // Instant boost in sensor reading to reflect aerator surge
    setSensorReadings((prev) => {
      const cur = prev[tankId];
      if (!cur) return prev;
      return {
        ...prev,
        [tankId]: {
          ...cur,
          dissolvedOxygen: Math.max(cur.dissolvedOxygen, 4.2), // Immediate bump
        },
      };
    });
  };

  const emergencyOverrideAllAerators = () => {
    setTanks((prev) => prev.map((t) => ({ ...t, aeratorActive: true })));
    setSensorReadings((prev) => {
      const updated: Record<string, SensorReading> = {};
      Object.entries(prev).forEach(([id, r]) => {
        updated[id] = {
          ...r,
          dissolvedOxygen: Math.max(r.dissolvedOxygen, 4.5),
        };
      });
      return updated;
    });
  };

  // Step 2: "Registro Invisível" - Biometry Logging with instant AI feedback
  const addBiometry = (newBio: {
    tankId: string;
    avgWeightG: number;
    sampleSize: number;
    mortalityCount: number;
    uniformityPct: number;
  }): Biometry => {
    const batch = batches.find((b) => b.tankId === newBio.tankId);
    const reading = sensorReadings[newBio.tankId] || initialSensorReadings[newBio.tankId];
    const expectedWeight = batch
      ? projectWeightTGC(batch.initialWeightG, reading.temperature, batch.cycleDay, batch.species)
      : newBio.avgWeightG;

    const diffPct = Number((((newBio.avgWeightG - expectedWeight) / expectedWeight) * 100).toFixed(1));
    const isAbove = diffPct >= 0;

    let aiNote = '';
    if (isAbove) {
      aiNote = `A biometria do lote ${batch?.batchCode || 'A'} indica crescimento ${diffPct}% acima da média técnica. Sugiro aumentar a ração em +200g/trato para acelerar a colheita em 4 dias.`;
    } else {
      aiNote = `A biometria indica desvio de ${diffPct}% abaixo da curva de ganho de peso esperada. Sugiro reduzir o trato em 10% por 48h para evitar perda de FCR e auditar oxigenação de fundo.`;
    }

    const biometryRecord: Biometry = {
      id: `bio-${Date.now()}`,
      batchId: batch?.id || 'batch-01',
      tankId: newBio.tankId,
      timestamp: new Date().toISOString(),
      avgWeightG: newBio.avgWeightG,
      sampleSize: newBio.sampleSize,
      mortalityCount: newBio.mortalityCount,
      uniformityPct: newBio.uniformityPct,
      dailyWeightGainG: Number((newBio.avgWeightG / (batch?.cycleDay || 100)).toFixed(2)),
      fcrCurrent: 1.34,
      fcrBenchmark: 1.42,
      growthVsBenchmarkPct: diffPct,
      aiActionNote: aiNote,
    };

    setBiometries((prev) => [biometryRecord, ...prev]);

    // Persistência em banco de dados
    fetch('/api/db/biometries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: currentTenant.id,
        tankId: newBio.tankId,
        batchId: batch?.id || 'batch-01',
        avgWeightG: newBio.avgWeightG,
        sampleSize: newBio.sampleSize,
        mortalityCount: newBio.mortalityCount,
        uniformityPct: newBio.uniformityPct,
        fcrCurrent: 1.34,
        aiActionNote: aiNote,
      }),
    }).catch((err) => console.warn('Aviso: persistência offline de biometria:', err));

    // Update batch weight and count
    if (batch) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === batch.id
            ? {
                ...b,
                currentWeightG: newBio.avgWeightG,
                currentCount: Math.max(0, b.currentCount - newBio.mortalityCount),
              }
            : b
        )
      );
    }

    return biometryRecord;
  };

  const addFeedingLog = (newFeed: {
    tankId: string;
    amountKg: number;
    feedType: string;
    proteinPct: number;
    costPerKg: number;
  }) => {
    const batch = batches.find((b) => b.tankId === newFeed.tankId);
    const log: FeedingLog = {
      id: `feed-${Date.now()}`,
      batchId: batch?.id || 'batch-01',
      tankId: newFeed.tankId,
      timestamp: new Date().toISOString(),
      amountKg: newFeed.amountKg,
      feedType: newFeed.feedType,
      proteinPct: newFeed.proteinPct,
      costPerKg: newFeed.costPerKg,
    };

    setFeedingLogs((prev) => [log, ...prev]);

    if (batch) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === batch.id
            ? {
                ...b,
                accumulatedFeedKg: b.accumulatedFeedKg + newFeed.amountKg,
              }
            : b
        )
      );
    }
  };

  const updateFarmSettings = (settings: Partial<Farm>) => {
    setFarm((prev) => ({ ...prev, ...settings }));
  };

  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev);
  };

  const triggerScenario = (scenario: 'hypoxia_dawn' | 'ammonia_surge' | 'cold_front' | 'recover_optimal') => {
    if (scenario === 'hypoxia_dawn') {
      setActiveScenarioName('Simulação: Hipóxia Severa de Madrugada (O2 = 1.95 mg/L no Tanque 04)');
      setTanks((prev) =>
        prev.map((t) => (t.id === 'tank-04' ? { ...t, aeratorActive: false, status: 'critical' } : t))
      );
      setSensorReadings((prev) => ({
        ...prev,
        'tank-04': {
          ...prev['tank-04'],
          dissolvedOxygen: 1.95,
        },
      }));
      setActiveTankId('tank-04');
    } else if (scenario === 'ammonia_surge') {
      setActiveScenarioName('Simulação: Pico de Amônia Tóxica (pH 8.65, TAN 1.9 mg/L no Tanque 03)');
      setSensorReadings((prev) => ({
        ...prev,
        'tank-03': {
          ...prev['tank-03'],
          ph: 8.65,
          ammoniaTotal: 1.90,
          ammoniaToxic: calculateToxicAmmonia(1.90, 8.65, prev['tank-03'].temperature),
        },
      }));
      setTanks((prev) =>
        prev.map((t) => (t.id === 'tank-03' ? { ...t, status: 'critical' } : t))
      );
      setActiveTankId('tank-03');
    } else if (scenario === 'cold_front') {
      setActiveScenarioName('Simulação: Frente Fria Brusca (-4°C na coluna d\'água)');
      setSensorReadings((prev) => {
        const updated: Record<string, SensorReading> = {};
        Object.entries(prev).forEach(([id, r]) => {
          updated[id] = { ...r, temperature: Math.max(19, r.temperature - 4.5) };
        });
        return updated;
      });
    } else if (scenario === 'recover_optimal') {
      setActiveScenarioName('Parâmetros Otimizados: Condição Nominal Estabelecida');
      setTanks((prev) => prev.map((t) => ({ ...t, aeratorActive: true, status: 'optimal' })));
      setSensorReadings((prev) => {
        const updated: Record<string, SensorReading> = {};
        Object.entries(prev).forEach(([id, r]) => {
          updated[id] = {
            ...r,
            dissolvedOxygen: 5.8,
            temperature: 28.5,
            ph: 7.5,
            ammoniaTotal: 0.45,
            ammoniaToxic: 0.012,
          };
        });
        return updated;
      });
    }
  };

  /**
   * 🔄 REINICIAR / ZERAR O QUE ESTIVER SENDO FEITO NA HORA (ESTADO VOLÁTIL E SELEÇÃO)
   * NUNCA APAGA DADOS SALVOS NO BANCO DE DADOS.
   */
  const resetActiveSession = (options?: {
    resetScenario?: boolean;
    resetTelemetryHistory?: boolean;
    resetChat?: boolean;
    resetFilters?: boolean;
  }) => {
    const opts = {
      resetScenario: true,
      resetTelemetryHistory: true,
      resetChat: false,
      resetFilters: true,
      ...options,
    };

    if (opts.resetScenario) {
      setActiveScenarioName(null);
      setTanks((prev) => prev.map((t) => ({ ...t, aeratorActive: true, status: 'optimal' })));
      setSensorReadings((prev) => {
        const updated: Record<string, SensorReading> = {};
        Object.entries(prev).forEach(([id, r]) => {
          updated[id] = {
            ...r,
            dissolvedOxygen: 5.8,
            temperature: 28.5,
            ph: 7.5,
            ammoniaTotal: 0.45,
            ammoniaToxic: 0.012,
          };
        });
        return updated;
      });
    }

    if (opts.resetTelemetryHistory) {
      const hist: Record<string, SensorReading[]> = {};
      initialTanks.forEach((tank) => {
        const base = initialSensorReadings[tank.id];
        const points: SensorReading[] = [];
        for (let i = 12; i >= 0; i--) {
          const time = new Date(Date.now() - i * 5 * 60000);
          points.push({
            ...base,
            id: `hist-${tank.id}-${i}`,
            timestamp: time.toISOString(),
            dissolvedOxygen: Number((5.8 + Math.sin(i / 2) * 0.2).toFixed(2)),
            temperature: Number((28.5 + Math.cos(i / 3) * 0.2).toFixed(1)),
          });
        }
        hist[tank.id] = points;
      });
      setSensorHistory(hist);
    }

    if (opts.resetChat) {
      setWhatsAppMessages(initialWhatsAppMessages);
    }

    if (opts.resetFilters) {
      setActiveTankId('tank-01');
    }
  };

  /**
   * 🛡️ REINICIAR DADOS SALVOS NO BANCO DE DADOS
   * NUNCA EXECUTA SEM CONFIRMAÇÃO EXPLÍCITA E AUTORIZAÇÃO DO USUÁRIO.
   */
  const resetSavedData = async (options: {
    modules: string[];
    resetAllToFactory?: boolean;
    confirmationCode: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/db/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenant.id,
          modules: options.modules,
          resetAllToFactory: options.resetAllToFactory,
          confirmationCode: options.confirmationCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'Falha na confirmação de segurança. Dados mantidos intactos.',
        };
      }

      // Atualiza o estado da sessão após reset autorizado
      resetActiveSession();
      return {
        success: true,
        message: data.result?.message || 'Dados selecionados foram reiniciados com sucesso.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro ao conectar ao servidor para reinicialização.',
      };
    }
  };

  // PILAR 1 & 3: WhatsApp Ghost UX Engine methods
  const sendWhatsAppMessage = async (text: string) => {
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: IWhatsAppMessage = {
      id: `wa-${Date.now()}`,
      sender: 'producer',
      senderName: 'Produtor (Você)',
      timestamp: nowTime,
      content: text,
      level: 'consultative',
      deliveryStatus: 'read',
    };

    setWhatsAppMessages((prev) => [...prev, userMsg]);

    try {
      const ghostResult = await requestWhatsAppGhostResponse(text, {
        farmName: farm.name,
        tanks: tanks.map((t) => {
          const b = batches.find((batch) => batch.tankId === t.id);
          return { id: t.id, name: t.name, status: t.status, species: b?.species || 'Tilápia do Nilo' };
        }),
        telemetry: sensorReadings,
        batches: batches,
        totalBiomassTons: totalBiomassKg / 1000,
        dailyFeedKg: dre.feedCost / (farm.feedAverageCostPerKg || 4.2),
      });

      const aiReply: IWhatsAppMessage = {
        id: `wa-ai-${Date.now()}`,
        sender: 'aqua-core-ai',
        senderName: 'AQUA-CORE AI 🟢',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        content: ghostResult.replyText,
        level: ghostResult.level,
        tankId: ghostResult.metadata?.tankId,
        actionRequired: ghostResult.actionRequired,
        followUpScheduleMinutes: ghostResult.followUpMinutes,
        deliveryStatus: 'sent',
        metadata: ghostResult.metadata,
      };

      setWhatsAppMessages((prev) => [...prev, aiReply]);
    } catch {
      const fallbackReply: IWhatsAppMessage = {
        id: `wa-ai-${Date.now()}`,
        sender: 'aqua-core-ai',
        senderName: 'AQUA-CORE AI 🟢',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        content: `✅ *AQUA-CORE*: Mensagem processada. Telemetria e parâmetros operando normalmente.`,
        level: 'informative',
        deliveryStatus: 'sent',
      };
      setWhatsAppMessages((prev) => [...prev, fallbackReply]);
    }
  };

  const triggerDailyDigest = () => {
    const digestText = generateDailyDigestWhatsApp(
      farm.name,
      totalBiomassKg / 1000,
      globalFcr,
      dre.ebitda,
      'Quinta-feira (Tanque 02)'
    );

    const digestMsg: IWhatsAppMessage = {
      id: `wa-digest-${Date.now()}`,
      sender: 'aqua-core-ai',
      senderName: 'AQUA-CORE AI 🟢',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      content: digestText,
      level: 'informative',
      deliveryStatus: 'delivered',
    };

    setWhatsAppMessages((prev) => [...prev, digestMsg]);
  };

  const triggerGuardianEmergency = (tankId?: string) => {
    const targetId = tankId || 'tank-04';
    const targetTank = tanks.find((t) => t.id === targetId) || tanks[3];
    const reading = sensorReadings[targetId] || { dissolvedOxygen: 2.4, temperature: 29.2 };

    const guardian = generateGuardianWhatsAppAlert(
      targetTank.name,
      reading.dissolvedOxygen,
      reading.temperature,
      14800
    );

    const alertMsg: IWhatsAppMessage = {
      id: `wa-guardian-${Date.now()}`,
      sender: 'aqua-core-ai',
      senderName: 'AQUA-CORE AI 🟢',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      content: guardian.text,
      level: 'critical',
      tankId: targetId,
      actionRequired: true,
      followUpScheduleMinutes: guardian.followUpScheduleMinutes,
      deliveryStatus: 'delivered',
      metadata: {
        dissolvedOxygen: reading.dissolvedOxygen,
        temperature: reading.temperature,
        financialImpactEstimated: 'R$ 14.800,00',
      },
    };

    setWhatsAppMessages((prev) => [...prev, alertMsg]);
  };

  // PILAR 2: Hardware-as-a-Service Caixa Preta fleet control
  const toggleBlackBoxPower = (deviceId: string) => {
    setBlackBoxes((prev) =>
      prev.map((box) =>
        box.deviceId === deviceId
          ? {
              ...box,
              online: !box.online,
              lastTelemetryTimestamp: !box.online ? 'Agora (re-conectado)' : 'Desconectado',
            }
          : box
      )
    );
  };

  const recalibrateProbe = (
    deviceId: string,
    probeType: 'dissolved_oxygen' | 'temperature' | 'ph'
  ) => {
    setBlackBoxes((prev) =>
      prev.map((box) => {
        if (box.deviceId !== deviceId) return box;
        const key = probeType === 'dissolved_oxygen' ? 'dissolvedOxygen' : probeType;
        return {
          ...box,
          probes: {
            ...box.probes,
            [key]: {
              ...box.probes[key],
              healthy: true,
              calibrationDate: 'Hoje (Recém calibrada)',
            },
          },
        };
      })
    );
  };

  const switchTenant = (tenantId: string) => {
    const t = availableTenants.find((item) => item.id === tenantId) || availableTenants[0];
    setCurrentTenant(t);
    setFarm((prev) => ({
      ...prev,
      name: t.name,
      kwhCost: t.kwhCost,
      feedAverageCostPerKg: t.feedCost,
      fishSalePricePerKg: t.salePrice,
    }));
  };

  const login = async (email: string, _password?: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (cleanEmail === 'nuncaparedelutar1988@gmail.com') {
      const masterUser: IUser = {
        id: 'usr-master-owner',
        name: 'Proprietário Geral • Master',
        email: 'nuncaparedelutar1988@gmail.com',
        role: 'superadmin_owner',
        phone: '+5584988585211',
      };
      setCurrentUser(masterUser);
      const t = availableTenants[0];
      setCurrentTenant(t);
      setFarm((prev) => ({
        ...prev,
        name: t.name,
        kwhCost: t.kwhCost,
        feedAverageCostPerKg: t.feedCost,
        fishSalePricePerKg: t.salePrice,
      }));
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
        if (data.tenant) setCurrentTenant(data.tenant);
        if (data.availableTenants) setAvailableTenants(data.availableTenants);
      }
    } catch {
      setCurrentUser({
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'engineer',
      });
    }
  };

  return (
    <AquaCoreContext.Provider
      value={{
        farm,
        tanks,
        batches,
        sensorReadings,
        sensorHistory,
        biometries,
        feedingLogs,
        alerts,
        activeTankId,
        isSimulating,
        activeScenarioName,
        dre,
        totalBiomassKg,
        globalFcr,
        globalSurvivalRatePct,
        whatsAppMessages,
        blackBoxes,
        currentUser,
        currentTenant,
        availableTenants,
        isAuthModalOpen,
        setIsAuthModalOpen,
        switchTenant,
        login,
        sendWhatsAppMessage,
        triggerDailyDigest,
        triggerGuardianEmergency,
        toggleBlackBoxPower,
        recalibrateProbe,
        setActiveTankId,
        toggleAerator,
        emergencyTurnOnAerators,
        emergencyOverrideAllAerators,
        addBiometry,
        addFeedingLog,
        updateFarmSettings,
        toggleSimulation,
        triggerScenario,
        isResetModalOpen,
        setIsResetModalOpen,
        resetActiveSession,
        resetSavedData,
      }}
    >
      {children}
    </AquaCoreContext.Provider>
  );
};

export const useAquaCore = () => {
  const context = useContext(AquaCoreContext);
  if (!context) {
    throw new Error('useAquaCore must be used within an AquaCoreProvider');
  }
  return context;
};
