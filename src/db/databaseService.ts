import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../.data');
const DB_FILE = path.resolve(DATA_DIR, 'aqua_core_db.json');

// Interface dos dados persistentes em banco
export interface DbSchema {
  tenants: Array<{
    id: string;
    name: string;
    code: string;
    type: 'aquaculture_farm' | 'construction_site';
    location: string;
    latitude: number;
    longitude: number;
    kwhCost: number;
    feedCost: number;
    salePrice: number;
    producerPhone: string;
    speciesTarget: string;
  }>;
  users: Array<{
    id: string;
    tenantId: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
  }>;
  biometries: Array<{
    id: string;
    tenantId: string;
    tankId: string;
    batchId: string;
    avgWeightG: number;
    sampleSize: number;
    mortalityCount: number;
    uniformityPct: number;
    fcrCurrent: number;
    aiActionNote?: string;
    createdAt: string;
  }>;
  equipments: Array<{
    id: string;
    tenantId: string;
    name: string;
    location: string;
    type: string;
    status: 'operational' | 'warning' | 'critical';
    powerKw: number;
    lastMaintenance: string;
    overdueDays: number;
    healthScore: number;
    aiDiagnostics?: string;
  }>;
  invoices: Array<{
    id: string;
    tenantId: string;
    invoiceNumber: string;
    batchCode: string;
    quantityKg: number;
    pricePerKg: number;
    totalValue: number;
    buyerName: string;
    buyerCnpj?: string;
    status: string;
    aiTaxReport?: string;
    createdAt: string;
  }>;
  feedingTrays: Array<{
    id: string;
    tenantId: string;
    tankId: string;
    batchId: string;
    checkTime: string;
    traysInspectedCount: number;
    trayStatus: 'LIMPO' | 'POUCA_SOBRA' | 'SOBRA_MEDIA' | 'SOBRA_ALTA';
    leftoverPercentage: number;
    adjustmentSuggestedPct: number;
    aiRecommendation?: string;
    createdAt: string;
  }>;
  inventory: Array<{
    id: string;
    tenantId: string;
    brand: string;
    name: string;
    category: string;
    itemType: string;
    unit: string;
    proteinPercent: number;
    currentStockKg: number;
    minStockAlertKg: number;
    costPerKg: number;
    location: string;
    status: 'NORMAL' | 'ABAIXO_MINIMO' | 'ESGOTADO';
    notes?: string;
    createdAt: string;
  }>;
  waterIonic: Array<{
    id: string;
    tenantId: string;
    tankId: string;
    salinityPpt: number;
    dissolvedOxygenMgL: number;
    temperatureC: number;
    ph: number;
    totalAlkalinityMgL: number;
    totalHardnessMgL: number;
    calciumMgL: number;
    magnesiumMgL: number;
    toxicAmmoniaNh3MgL: number;
    nitriteNo2MgL: number;
    transparencySecchiCm: number;
    calcificationStatus: 'IDEAL' | 'EXIGE_CALAGEM' | 'DESEQUILIBRIO_IONICO';
    createdAt: string;
  }>;
  mortality: Array<{
    id: string;
    tenantId: string;
    tankId: string;
    batchId: string;
    quantity: number;
    lunarPhase: string;
    probableCause: string;
    notes?: string;
    createdAt: string;
  }>;
  harvests: Array<{
    id: string;
    tenantId: string;
    tankId: string;
    batchId: string;
    harvestType: 'TOTAL' | 'DESBASTE_PARCIAL';
    totalWeightKg: number;
    shrimpCountEstimated: number;
    avgWeightG: number;
    commercialClassification: string;
    pricePerKg: number;
    totalRevenue: number;
    buyerName: string;
    gtaNumber?: string;
    notes?: string;
    createdAt: string;
  }>;
  bankAccounts: Array<{
    id: string;
    tenantId: string;
    bankName: string;
    accountType: string;
    agency: string;
    accountNumber: string;
    holderName: string;
    currentBalanceRs: number;
    pixKey: string;
    isActive: boolean;
  }>;
  cashFlow: Array<{
    id: string;
    tenantId: string;
    movementType: 'ENTRADA' | 'SAIDA';
    category: string;
    description: string;
    amountRs: number;
    status: 'REALIZADO' | 'PREVISTO';
    documentRef?: string;
    createdAt: string;
  }>;
  farmProfiles: Array<{
    tenantId: string;
    name: string;
    corporateName: string;
    cnpj: string;
    stateRegistration: string;
    address: string;
    city: string;
    state: string;
    waterSourceType: string;
    averageSalinityPpt: number;
    totalAreaHectares: number;
    waterSurfaceHectares: number;
    technicianInCharge: string;
    councilRegistration: string;
    environmentalLicense: string;
  }>;
}

// Dados semente iniciais de alta fidelidade
const INITIAL_DB_DATA: DbSchema = {
  tenants: [
    {
      id: 'tenant-river-life',
      name: 'River Life (Área Fazenda)',
      code: 'RIVER_LIFE',
      type: 'aquaculture_farm',
      location: 'Mogeiro – PB',
      latitude: -7.2997,
      longitude: -35.2319,
      kwhCost: 0.72,
      feedCost: 4.20,
      salePrice: 24.50,
      producerPhone: '+5584988585211',
      speciesTarget: 'Litopenaeus vannamei (Camarão)',
    },
    {
      id: 'tenant-santa-helena',
      name: 'Fazenda Santa Helena (Camarão BA)',
      code: 'SANTA_HELENA',
      type: 'aquaculture_farm',
      location: 'Polo Paulo Afonso – BA',
      latitude: -9.4069,
      longitude: -38.2144,
      kwhCost: 0.68,
      feedCost: 3.90,
      salePrice: 9.80,
      producerPhone: '+5575991234567',
      speciesTarget: 'Oreochromis niloticus (Litopenaeus vannamei)',
    },
    {
      id: 'tenant-constr-ai-01',
      name: 'Constr.AI • Obra Residencial Mirante',
      code: 'CONSTR_MIRANTE',
      type: 'construction_site',
      location: 'João Pessoa – PB (Bessa)',
      latitude: -7.0722,
      longitude: -34.8419,
      kwhCost: 0.85,
      feedCost: 0.0,
      salePrice: 0.0,
      producerPhone: '+5583998765432',
      speciesTarget: 'Edifício Residencial 18 Pavimentos',
    },
  ],
  users: [
    {
      id: 'usr-master-owner',
      tenantId: 'tenant-river-life',
      email: 'nuncaparedelutar1988@gmail.com',
      name: 'Proprietário Geral • Master',
      role: 'superadmin_owner',
      phone: '+5584988585211',
    },
    {
      id: 'usr-01',
      tenantId: 'tenant-river-life',
      email: 'collermhann@aquacore.ai',
      name: 'Collermhann',
      role: 'owner',
      phone: '+5584988585211',
    },
    {
      id: 'usr-02',
      tenantId: 'tenant-santa-helena',
      email: 'helena@aquacore.ai',
      name: 'Dra. Helena Martins',
      role: 'engineer',
      phone: '+5575991234567',
    },
    {
      id: 'usr-03',
      tenantId: 'tenant-constr-ai-01',
      email: 'mestre.silva@constr.ai',
      name: 'Mestre de Obras Silva',
      role: 'engineer',
      phone: '+5583998765432',
    },
  ],
  biometries: [
    {
      id: 'bio-seed-v01',
      tenantId: 'tenant-river-life',
      tankId: 'tank-01',
      batchId: 'batch-01',
      avgWeightG: 0.01,
      sampleSize: 100,
      mortalityCount: 0,
      uniformityPct: 100.0,
      fcrCurrent: 0.0,
      aiActionNote: 'Povoamento Tanque V 01 (Lote 02). 100.000 PLs (180 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 150g aplicado.',
      createdAt: '2026-09-21T08:00:00Z',
    },
    {
      id: 'bio-seed-v02',
      tenantId: 'tenant-river-life',
      tankId: 'tank-02',
      batchId: 'batch-02',
      avgWeightG: 0.01,
      sampleSize: 100,
      mortalityCount: 0,
      uniformityPct: 100.0,
      fcrCurrent: 0.0,
      aiActionNote: 'Povoamento Tanque V 02 (Lote 01). 100.000 PLs (69 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 150g aplicado. Biometria pendente aos 26 dias.',
      createdAt: '2026-09-11T08:00:00Z',
    },
    {
      id: 'bio-seed-v03',
      tenantId: 'tenant-river-life',
      tankId: 'tank-03',
      batchId: 'batch-03',
      avgWeightG: 0.01,
      sampleSize: 100,
      mortalityCount: 0,
      uniformityPct: 100.0,
      fcrCurrent: 0.0,
      aiActionNote: 'Povoamento Tanque V 03 (Lote 01). 100.000 PLs (90 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 150g aplicado. Biometria pendente aos 28 dias.',
      createdAt: '2026-09-09T08:00:00Z',
    },
    {
      id: 'bio-seed-v04',
      tenantId: 'tenant-river-life',
      tankId: 'tank-04',
      batchId: 'batch-04',
      avgWeightG: 0.01,
      sampleSize: 100,
      mortalityCount: 0,
      uniformityPct: 100.0,
      fcrCurrent: 0.0,
      aiActionNote: 'Povoamento Tanque V 04 (Lote 02). 80.000 PLs (194 PL/g). Sobrevivência 100%, estresse 0%. Fertilizante DECOSOLO 100g aplicado.',
      createdAt: '2026-10-01T08:00:00Z',
    },
  ],
  equipments: [
    {
      id: 'eq-01',
      tenantId: 'tenant-river-life',
      name: 'Aerador Palheta 2.0 CV (Tanque V 01)',
      location: 'Tanque V 01',
      type: 'Aeração Superficial',
      status: 'operational',
      powerKw: 2.2,
      lastMaintenance: '2026-09-21',
      overdueDays: 0,
      healthScore: 95.0,
      aiDiagnostics: 'Operando em conformidade com ciclo de povoamento.',
    },
    {
      id: 'eq-02',
      tenantId: 'tenant-river-life',
      name: 'Aerador Palheta 2.0 CV (Tanque V 02)',
      location: 'Tanque V 02',
      type: 'Aeração Superficial',
      status: 'operational',
      powerKw: 2.2,
      lastMaintenance: '2026-09-11',
      overdueDays: 0,
      healthScore: 94.0,
    },
    {
      id: 'eq-03',
      tenantId: 'tenant-river-life',
      name: 'Aeradores Palheta 2.0 CV Banco (Tanque V 03)',
      location: 'Tanque V 03',
      type: 'Aeração Superficial',
      status: 'operational',
      powerKw: 2.2,
      lastMaintenance: '2026-09-09',
      overdueDays: 0,
      healthScore: 92.0,
    },
    {
      id: 'eq-04',
      tenantId: 'tenant-river-life',
      name: 'Aerador Palheta 2.0 CV (Tanque V 04)',
      location: 'Tanque V 04',
      type: 'Aeração Superficial',
      status: 'operational',
      powerKw: 2.2,
      lastMaintenance: '2026-10-01',
      overdueDays: 0,
      healthScore: 98.0,
    },
  ],
  invoices: [],
  feedingTrays: [],
  inventory: [
    {
      id: 'inv-item-decosolo',
      tenantId: 'tenant-river-life',
      brand: 'Decosolo Fertilizantes',
      name: 'DECOSOLO Fertilizante Mineral',
      category: 'FERTILIZANTE',
      itemType: 'Fertilizante',
      unit: 'g',
      proteinPercent: 0.0,
      currentStockKg: 9.45, // 9.450 g
      minStockAlertKg: 1.0,
      costPerKg: 110.0, // R$ 0,11/g -> R$ 110,00/kg
      location: 'Depósito Central Mogeiro',
      status: 'NORMAL',
      notes: 'Estoque atual: 9.450 g. Saldo em estoque: R$ 1.039,50 (R$ 0,11/g). Status: Regular.',
      createdAt: '2026-09-20T08:00:00Z',
    },
    {
      id: 'inv-item-guabi',
      tenantId: 'tenant-river-life',
      brand: 'Guabi Aqua',
      name: 'Ração Guabi Engorda 35% PB',
      category: 'ENGORDA',
      itemType: 'Ração',
      unit: 'kg',
      proteinPercent: 35.0,
      currentStockKg: 0.0,
      minStockAlertKg: 500.0,
      costPerKg: 4.20,
      location: 'Silo Principal - Setor A',
      status: 'ESGOTADO',
      notes: 'Estoque atual: 0,00 kg. Status: Zerado / Alerta Crítico. Necessário reposição para engorda.',
      createdAt: '2026-10-07T07:38:00Z',
    },
    {
      id: 'inv-item-samaria',
      tenantId: 'tenant-river-life',
      brand: 'Samaria Rações',
      name: 'Ração Samaria Starter Micropeletizada 40% PB',
      category: 'INICIAL_PL',
      itemType: 'Ração',
      unit: 'kg',
      proteinPercent: 40.0,
      currentStockKg: 0.0,
      minStockAlertKg: 200.0,
      costPerKg: 6.50,
      location: 'Depósito Berçário',
      status: 'ESGOTADO',
      notes: 'Estoque atual: 0,00 kg. Estoque mínimo exigido: 200,00 kg. Status: Abaixo do Mínimo / Alerta Crítico.',
      createdAt: '2026-10-07T07:38:00Z',
    },
    {
      id: 'inv-item-smartpack',
      tenantId: 'tenant-river-life',
      brand: 'Smart Aqua Biotech',
      name: 'Smart Pack Suplemento Probiótico e Mineral',
      category: 'PROBIOTICO',
      itemType: 'Suplemento',
      unit: 'g',
      proteinPercent: 0.0,
      currentStockKg: 0.0,
      minStockAlertKg: 1000.0,
      costPerKg: 85.0,
      location: 'Laboratório de Qualidade de Água',
      status: 'ESGOTADO',
      notes: 'Estoque atual: 0,00 g. Status: Zerado / Alerta.',
      createdAt: '2026-10-07T07:38:00Z',
    },
  ],
  waterIonic: [
    {
      id: 'ionic-01',
      tenantId: 'tenant-river-life',
      tankId: 'tank-01',
      salinityPpt: 19.0,
      dissolvedOxygenMgL: 5.75,
      temperatureC: 27.8,
      ph: 7.82,
      totalAlkalinityMgL: 145.0,
      totalHardnessMgL: 680.0,
      calciumMgL: 135.0,
      magnesiumMgL: 395.0,
      toxicAmmoniaNh3MgL: 0.012,
      nitriteNo2MgL: 0.03,
      transparencySecchiCm: 35.0,
      calcificationStatus: 'IDEAL',
      createdAt: '2026-10-07T07:38:00Z',
    },
  ],
  mortality: [],
  harvests: [],
  bankAccounts: [
    {
      id: 'acc-01',
      tenantId: 'tenant-river-life',
      bankName: 'Banco do Brasil (Agência Agro João Pessoa)',
      accountType: 'CORRENTE',
      agency: '1618-7',
      accountNumber: '25489-0',
      holderName: 'River Life Carcinicultura Ltda',
      currentBalanceRs: 84500.0,
      pixKey: 'financeiro@aquacore.ai',
      isActive: true,
    },
    {
      id: 'acc-02',
      tenantId: 'tenant-river-life',
      bankName: 'Sicoob Cooperativa Nordeste',
      accountType: 'APLICACAO',
      agency: '4120-0',
      accountNumber: '10982-3',
      holderName: 'River Life Carcinicultura Ltda',
      currentBalanceRs: 120000.0,
      pixKey: '32.845.912/0001-44',
      isActive: true,
    },
  ],
  cashFlow: [
    {
      id: 'mov-larva-01',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'LARVAS',
      description: 'Aquisição de Pós-Larvas (100.000 un) - Tanque V 01 (Lote 02) - Fornecedor: River Life',
      amountRs: 1000.0,
      status: 'REALIZADO',
      documentRef: 'REC-PL-V01',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mov-larva-02',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'LARVAS',
      description: 'Aquisição de Pós-Larvas (100.000 un) - Tanque V 02 (Lote 01) - Fornecedor: River Life',
      amountRs: 1000.0,
      status: 'REALIZADO',
      documentRef: 'REC-PL-V02',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mov-larva-03',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'LARVAS',
      description: 'Aquisição de Pós-Larvas (100.000 un) - Tanque V 03 (Lote 01) - Fornecedor: River Life',
      amountRs: 1000.0,
      status: 'REALIZADO',
      documentRef: 'REC-PL-V03',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mov-larva-04',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'LARVAS',
      description: 'Aquisição de Pós-Larvas (80.000 un) - Tanque V 04 (Lote 02) - Fornecedor: River Life',
      amountRs: 800.0,
      status: 'REALIZADO',
      documentRef: 'REC-PL-V04',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mov-fert-01',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'FERTILIZACAO',
      description: 'Aplicação Fertilizante DECOSOLO (150 g @ R$ 0,11/g) - Tanque V 01',
      amountRs: 16.50,
      status: 'REALIZADO',
      documentRef: 'INS-DEC-01',
      createdAt: '2026-09-21T08:00:00Z',
    },
    {
      id: 'mov-fert-02',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'FERTILIZACAO',
      description: 'Aplicação Fertilizante DECOSOLO (150 g @ R$ 0,11/g) - Tanque V 02',
      amountRs: 16.50,
      status: 'REALIZADO',
      documentRef: 'INS-DEC-02',
      createdAt: '2026-09-11T08:00:00Z',
    },
    {
      id: 'mov-fert-03',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'FERTILIZACAO',
      description: 'Aplicação Fertilizante DECOSOLO (150 g @ R$ 0,11/g) - Tanque V 03',
      amountRs: 16.50,
      status: 'REALIZADO',
      documentRef: 'INS-DEC-03',
      createdAt: '2026-09-09T08:00:00Z',
    },
    {
      id: 'mov-fert-04',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'FERTILIZACAO',
      description: 'Aplicação Fertilizante DECOSOLO (100 g @ R$ 0,11/g) - Tanque V 04',
      amountRs: 11.00,
      status: 'REALIZADO',
      documentRef: 'INS-DEC-04',
      createdAt: '2026-10-01T08:00:00Z',
    },
  ],
  farmProfiles: [
    {
      tenantId: 'tenant-river-life',
      name: 'River Life (Área Fazenda)',
      corporateName: 'River Life Carcinicultura',
      cnpj: '32.845.912/0001-44',
      stateRegistration: '16.984.231-0',
      address: 'Polo de Mogeiro – PB',
      city: 'Mogeiro',
      state: 'PB',
      waterSourceType: 'Poço Profundo & Aquífero Salobro Mogeiro PB',
      averageSalinityPpt: 19.0,
      totalAreaHectares: 1.682,
      waterSurfaceHectares: 1.682,
      technicianInCharge: 'Collermhann',
      councilRegistration: 'CREA-PB 14.892-D',
      environmentalLicense: 'SUDEMA-PB Licença Simplificada nº 2026/014-PB',
    },
  ],
};

class DatabaseService {
  private data: DbSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.warn('[DatabaseService] Aviso ao criar pasta .data:', err);
      }
    }
  }

  private loadData(): DbSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Sempre garante que o tenant River Life esteja com os dados reais semente do Meu Pescado
        const mergedTenants = INITIAL_DB_DATA.tenants.map(it => {
          const found = (parsed.tenants || []).find((t: any) => t.id === it.id);
          return found ? { ...it, ...found, name: it.id === 'tenant-river-life' ? it.name : (found.name || it.name) } : it;
        });

        return {
          ...INITIAL_DB_DATA,
          ...parsed,
          tenants: mergedTenants,
          inventory: (parsed.inventory && parsed.inventory.length > 0 && parsed.inventory.some((i: any) => i.id === 'inv-item-decosolo'))
            ? parsed.inventory
            : INITIAL_DB_DATA.inventory,
          cashFlow: (parsed.cashFlow && parsed.cashFlow.length > 0 && parsed.cashFlow.some((c: any) => c.id === 'mov-larva-01'))
            ? parsed.cashFlow
            : INITIAL_DB_DATA.cashFlow,
          biometries: (parsed.biometries && parsed.biometries.length > 0 && parsed.biometries.some((b: any) => b.id === 'bio-seed-v01'))
            ? parsed.biometries
            : INITIAL_DB_DATA.biometries,
          farmProfiles: INITIAL_DB_DATA.farmProfiles,
        };
      }
    } catch (err) {
      console.warn('[DatabaseService] Falha na leitura do DB local, inicializando dados padrão:', err);
    }
    this.saveData(INITIAL_DB_DATA);
    return INITIAL_DB_DATA;
  }

  private saveData(data: DbSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DatabaseService] Falha ao persistir em disco:', err);
    }
  }

  // Multi-Tenant / Tenants
  public getTenants() {
    return this.data.tenants;
  }

  public getTenantById(id: string) {
    return this.data.tenants.find((t) => t.id === id) || this.data.tenants[0];
  }

  // Usuários
  public getUsers(tenantId?: string) {
    if (tenantId) return this.data.users.filter((u) => u.tenantId === tenantId);
    return this.data.users;
  }

  public findUserByEmail(email: string) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (cleanEmail === 'nuncaparedelutar1988@gmail.com') {
      let master = this.data.users.find((u) => u.email.toLowerCase() === 'nuncaparedelutar1988@gmail.com');
      if (!master) {
        master = {
          id: 'usr-master-owner',
          tenantId: 'tenant-river-life',
          email: 'nuncaparedelutar1988@gmail.com',
          name: 'Proprietário Geral • Master',
          role: 'superadmin_owner',
          phone: '+5584988585211',
        };
        this.data.users.unshift(master);
        this.saveData(this.data);
      }
      return master;
    }
    return this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
  }

  public createUser(user: { tenantId: string; email: string; name: string; role: string; phone?: string }) {
    const newUser = { id: `usr-${Date.now()}`, ...user };
    this.data.users.push(newUser);
    this.saveData(this.data);
    return newUser;
  }

  // Biometria
  public getBiometries(tenantId: string) {
    return this.data.biometries.filter((b) => b.tenantId === tenantId);
  }

  public addBiometry(bio: Omit<DbSchema['biometries'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `bio-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...bio,
    };
    this.data.biometries.unshift(record);
    this.saveData(this.data);
    return record;
  }

  // Equipamentos
  public getEquipments(tenantId: string) {
    return this.data.equipments.filter((e) => e.tenantId === tenantId);
  }

  public updateEquipment(id: string, updates: Partial<DbSchema['equipments'][0]>) {
    this.data.equipments = this.data.equipments.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq));
    this.saveData(this.data);
    return this.data.equipments.find((eq) => eq.id === id);
  }

  // Faturas e Notas Fiscais
  public getInvoices(tenantId: string) {
    return this.data.invoices.filter((i) => i.tenantId === tenantId);
  }

  public addInvoice(inv: Omit<DbSchema['invoices'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...inv,
    };
    this.data.invoices.unshift(record);
    this.saveData(this.data);
    return record;
  }

  // 🍽️ Bandejas de Alimentação / Comedouros
  public getFeedingTrays(tenantId: string) {
    return (this.data.feedingTrays || []).filter((t) => t.tenantId === tenantId);
  }

  public addFeedingTray(tray: Omit<DbSchema['feedingTrays'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `tray-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...tray,
    };
    if (!this.data.feedingTrays) this.data.feedingTrays = [];
    this.data.feedingTrays.unshift(record);
    this.saveData(this.data);
    return record;
  }

  // 📦 Estoque de Insumos & Armazém
  public getInventory(tenantId: string) {
    return (this.data.inventory || []).filter((i) => i.tenantId === tenantId);
  }

  public addInventoryItem(item: Omit<DbSchema['inventory'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...item,
    };
    if (!this.data.inventory) this.data.inventory = [];
    this.data.inventory.unshift(record);
    this.saveData(this.data);
    return record;
  }

  public updateInventoryStock(id: string, newStockKg: number) {
    if (!this.data.inventory) this.data.inventory = [];
    this.data.inventory = this.data.inventory.map((item) =>
      item.id === id ? { ...item, currentStockKg: newStockKg, status: newStockKg <= item.minStockAlertKg ? 'ABAIXO_MINIMO' : 'NORMAL' } : item
    );
    this.saveData(this.data);
    return this.data.inventory.find((i) => i.id === id);
  }

  // 💧 Balanço Iônico & Qualidade de Água
  public getWaterIonic(tenantId: string) {
    return (this.data.waterIonic || []).filter((w) => w.tenantId === tenantId);
  }

  public addWaterIonic(log: Omit<DbSchema['waterIonic'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `ionic-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...log,
    };
    if (!this.data.waterIonic) this.data.waterIonic = [];
    this.data.waterIonic.unshift(record);
    this.saveData(this.data);
    return record;
  }

  // 🦐 Mortalidade & Mudas Lunares
  public getMortality(tenantId: string) {
    return (this.data.mortality || []).filter((m) => m.tenantId === tenantId);
  }

  public addMortality(m: Omit<DbSchema['mortality'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `mort-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...m,
    };
    if (!this.data.mortality) this.data.mortality = [];
    this.data.mortality.unshift(record);
    this.saveData(this.data);
    return record;
  }

  // 🎣 Despescas & Romaneio
  public getHarvests(tenantId: string) {
    return (this.data.harvests || []).filter((h) => h.tenantId === tenantId);
  }

  public addHarvest(h: Omit<DbSchema['harvests'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `harv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...h,
    };
    if (!this.data.harvests) this.data.harvests = [];
    this.data.harvests.unshift(record);
    this.saveData(this.data);
    return record;
  }

  // 🏦 Contas Bancárias & DFC
  public getBankAccounts(tenantId: string) {
    return (this.data.bankAccounts || []).filter((b) => b.tenantId === tenantId);
  }

  public getCashFlow(tenantId: string) {
    return (this.data.cashFlow || []).filter((c) => c.tenantId === tenantId);
  }

  public addCashFlow(mov: Omit<DbSchema['cashFlow'][0], 'id' | 'createdAt'>) {
    const record = {
      id: `mov-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...mov,
    };
    if (!this.data.cashFlow) this.data.cashFlow = [];
    this.data.cashFlow.unshift(record);
    this.saveData(this.data);
    return record;
  }

  // 🏡 Perfil da Fazenda
  public getFarmProfile(tenantId: string) {
    return (this.data.farmProfiles || []).find((f) => f.tenantId === tenantId) || this.data.farmProfiles[0];
  }

  public updateFarmProfile(tenantId: string, profile: Partial<DbSchema['farmProfiles'][0]>) {
    if (!this.data.farmProfiles) this.data.farmProfiles = [];
    const idx = this.data.farmProfiles.findIndex((f) => f.tenantId === tenantId);
    if (idx >= 0) {
      this.data.farmProfiles[idx] = { ...this.data.farmProfiles[idx], ...profile };
    } else {
      this.data.farmProfiles.push({ tenantId, ...profile } as any);
    }
    this.saveData(this.data);
    return this.getFarmProfile(tenantId);
  }

  // 🛡️ REINICIALIZAÇÃO CONTROLADA: ZERAR DADOS SALVOS SOMENTE COM INDICAÇÃO E CONFIRMAÇÃO DO USUÁRIO
  public resetSavedData(
    tenantId: string,
    options: {
      modules?: string[];
      resetAllToFactory?: boolean;
    }
  ) {
    const modules = options.modules || [];
    const resetAll = !!options.resetAllToFactory;

    if (resetAll) {
      // Restaura todos os dados originais de fábrica para o tenant
      const initial = JSON.parse(JSON.stringify(INITIAL_DB_DATA)) as DbSchema;
      this.data.biometries = this.data.biometries.filter((b) => b.tenantId !== tenantId).concat(
        initial.biometries.filter((b) => b.tenantId === tenantId)
      );
      this.data.feedingTrays = this.data.feedingTrays.filter((t) => t.tenantId !== tenantId).concat(
        initial.feedingTrays.filter((t) => t.tenantId === tenantId)
      );
      this.data.waterIonic = this.data.waterIonic.filter((w) => w.tenantId !== tenantId).concat(
        initial.waterIonic.filter((w) => w.tenantId === tenantId)
      );
      this.data.mortality = this.data.mortality.filter((m) => m.tenantId !== tenantId).concat(
        initial.mortality.filter((m) => m.tenantId === tenantId)
      );
      this.data.harvests = this.data.harvests.filter((h) => h.tenantId !== tenantId).concat(
        initial.harvests.filter((h) => h.tenantId === tenantId)
      );
      this.data.cashFlow = this.data.cashFlow.filter((c) => c.tenantId !== tenantId).concat(
        initial.cashFlow.filter((c) => c.tenantId === tenantId)
      );
      this.data.invoices = this.data.invoices.filter((i) => i.tenantId !== tenantId).concat(
        initial.invoices.filter((i) => i.tenantId === tenantId)
      );
      this.data.inventory = this.data.inventory.filter((i) => i.tenantId !== tenantId).concat(
        initial.inventory.filter((i) => i.tenantId === tenantId)
      );
      this.data.equipments = this.data.equipments.filter((e) => e.tenantId !== tenantId).concat(
        initial.equipments.filter((e) => e.tenantId === tenantId)
      );
      this.saveData(this.data);
      return { message: 'Todos os módulos foram restaurados para os dados padrão de fábrica (Demonstração).', modulesReset: ['all'] };
    }

    const resetReport: string[] = [];

    // Limpa de verdade os dados para o tenant sem reinserir mock demo
    if (modules.includes('biometries')) {
      this.data.biometries = this.data.biometries.filter((b) => b.tenantId !== tenantId);
      resetReport.push('Biometrias');
    }
    if (modules.includes('feedingTrays')) {
      this.data.feedingTrays = this.data.feedingTrays.filter((t) => t.tenantId !== tenantId);
      resetReport.push('Bandejas de Alimentação');
    }
    if (modules.includes('waterIonic')) {
      this.data.waterIonic = this.data.waterIonic.filter((w) => w.tenantId !== tenantId);
      resetReport.push('Balanço Iônico e Água');
    }
    if (modules.includes('mortality')) {
      this.data.mortality = this.data.mortality.filter((m) => m.tenantId !== tenantId);
      resetReport.push('Mortalidade e Mudas');
    }
    if (modules.includes('harvests')) {
      this.data.harvests = this.data.harvests.filter((h) => h.tenantId !== tenantId);
      resetReport.push('Despescas');
    }
    if (modules.includes('cashFlow')) {
      this.data.cashFlow = this.data.cashFlow.filter((c) => c.tenantId !== tenantId);
      resetReport.push('Fluxo de Caixa DFC');
    }
    if (modules.includes('invoices')) {
      this.data.invoices = this.data.invoices.filter((i) => i.tenantId !== tenantId);
      resetReport.push('Notas Fiscais');
    }
    if (modules.includes('inventory')) {
      this.data.inventory = this.data.inventory.filter((i) => i.tenantId !== tenantId);
      resetReport.push('Estoque e Insumos');
    }
    if (modules.includes('equipments')) {
      this.data.equipments = this.data.equipments.filter((e) => e.tenantId !== tenantId);
      resetReport.push('Equipamentos');
    }

    this.saveData(this.data);
    return {
      message: `Módulos selecionados foram zerados com sucesso: ${resetReport.join(', ')}.`,
      modulesReset: resetReport,
    };
  }

  // 🚀 ZERAR TUDO E INICIAR MEU NEGÓCIO REAL DO ZERO
  public resetTenantToBlank(
    tenantId: string,
    farmData?: {
      farmName?: string;
      location?: string;
      producerName?: string;
      producerPhone?: string;
      speciesTarget?: string;
    }
  ) {
    // 1. Zera todos os módulos salvos no banco para o tenant
    this.data.biometries = this.data.biometries.filter((b) => b.tenantId !== tenantId);
    this.data.feedingTrays = this.data.feedingTrays.filter((t) => t.tenantId !== tenantId);
    this.data.waterIonic = this.data.waterIonic.filter((w) => w.tenantId !== tenantId);
    this.data.mortality = this.data.mortality.filter((m) => m.tenantId !== tenantId);
    this.data.harvests = this.data.harvests.filter((h) => h.tenantId !== tenantId);
    this.data.cashFlow = this.data.cashFlow.filter((c) => c.tenantId !== tenantId);
    this.data.invoices = this.data.invoices.filter((i) => i.tenantId !== tenantId);
    this.data.inventory = this.data.inventory.filter((i) => i.tenantId !== tenantId);
    this.data.equipments = this.data.equipments.filter((e) => e.tenantId !== tenantId);

    // 2. Atualiza perfil da fazenda com os dados reais informados pelo proprietário
    const fName = farmData?.farmName?.trim() || 'Minha Fazenda';
    const loc = farmData?.location?.trim() || 'Brasil';
    const phone = farmData?.producerPhone?.trim() || '+5584988585211';
    const species = farmData?.speciesTarget?.trim() || 'Litopenaeus vannamei (Camarão)';

    const existingProfileIdx = this.data.farmProfiles.findIndex((p) => p.tenantId === tenantId);
    const newProfile = {
      tenantId,
      name: fName,
      corporateName: fName,
      cnpj: '',
      stateRegistration: '',
      address: loc,
      city: loc.split('-')[0]?.trim() || loc,
      state: loc.split('-')[1]?.trim() || '',
      waterSourceType: 'Captação Própria',
      averageSalinityPpt: 15.0,
      totalAreaHectares: 0,
      waterSurfaceHectares: 0,
      technicianInCharge: farmData?.producerName?.trim() || 'Produtor Responsável',
      councilRegistration: '',
      environmentalLicense: '',
    };

    if (existingProfileIdx >= 0) {
      this.data.farmProfiles[existingProfileIdx] = newProfile;
    } else {
      this.data.farmProfiles.push(newProfile);
    }

    // Atualiza o tenant correspondente
    const tIdx = this.data.tenants.findIndex((t) => t.id === tenantId);
    if (tIdx >= 0) {
      this.data.tenants[tIdx].name = fName;
      this.data.tenants[tIdx].location = loc;
      this.data.tenants[tIdx].speciesTarget = species;
      this.data.tenants[tIdx].producerPhone = phone;
    }

    this.saveData(this.data);
    return {
      success: true,
      message: 'Sistema zerado com sucesso! Os dados fictícios de demonstração foram removidos e sua fazenda real está configurada.',
      profile: newProfile,
    };
  }
}

export const db = new DatabaseService();
export const databaseService = db;
