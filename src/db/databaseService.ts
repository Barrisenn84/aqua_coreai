import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), '.data');
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
      salePrice: 0,
      producerPhone: '',
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
      salePrice: 0,
      producerPhone: '',
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
      producerPhone: '',
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
      phone: '',
    },
    {
      id: 'usr-01',
      tenantId: 'tenant-river-life',
      email: 'collermhann@aquacore.ai',
      name: 'Collermhann',
      role: 'owner',
      phone: '',
    },
    {
      id: 'usr-02',
      tenantId: 'tenant-santa-helena',
      email: 'helena@aquacore.ai',
      name: 'Dra. Helena Martins',
      role: 'engineer',
      phone: '',
    },
    {
      id: 'usr-03',
      tenantId: 'tenant-constr-ai-01',
      email: 'mestre.silva@constr.ai',
      name: 'Mestre de Obras Silva',
      role: 'engineer',
      phone: '',
    },
  ],
  biometries: [
    {
      id: 'bio-mp-t1-20261020',
      tenantId: 'tenant-river-life',
      tankId: 'tank-01',
      batchId: 'batch-01',
      avgWeightG: 0.004854,
      sampleSize: 0,
      mortalityCount: 0,
      uniformityPct: 100.0,
      fcrCurrent: 1.47,
      aiActionNote: 'Importado do Meu Pescado; tamanho da amostra não informado. Biomassa da tela Biometria: 2,28 kg; cartão do lote: 1,31 kg.',
      createdAt: '2026-10-20T12:00:00-03:00',
    },
    {
      id: 'bio-mp-t2-20261017',
      tenantId: 'tenant-river-life',
      tankId: 'tank-02',
      batchId: 'batch-02',
      avgWeightG: 0.002625,
      sampleSize: 0,
      mortalityCount: 0,
      uniformityPct: 100.0,
      fcrCurrent: 0.0,
      aiActionNote: 'Importado do Meu Pescado; tamanho da amostra não informado.',
      createdAt: '2026-10-17T12:00:00-03:00',
    },
    {
      id: 'bio-mp-t3-20261017',
      tenantId: 'tenant-river-life',
      tankId: 'tank-03',
      batchId: 'batch-03',
      avgWeightG: 0.002625,
      sampleSize: 0,
      mortalityCount: 0,
      uniformityPct: 100.0,
      fcrCurrent: 0.0,
      aiActionNote: 'Importado do Meu Pescado; tamanho da amostra não informado.',
      createdAt: '2026-10-17T12:00:00-03:00',
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
    { id: 'mp-stock-sugar', tenantId: 'tenant-river-life', brand: 'Não informado', name: 'AÇÚCAR', category: 'VEICULO', itemType: 'Veículo', unit: 'kg', proteinPercent: 0, currentStockKg: 10, minStockAlertKg: 0, costPerKg: 4.69, location: 'River Life (Entreposto)', status: 'NORMAL', notes: 'Saldo informado: R$ 46,90.', createdAt: '2026-10-21T15:14:00-03:00' },
    { id: 'mp-stock-biomarine', tenantId: 'tenant-river-life', brand: 'BR BIOMARINE', name: 'BR BIOMARINE', category: 'PROBIOTICO', itemType: 'Nutrição/ Probiótico', unit: 'l', proteinPercent: 0, currentStockKg: 2.6, minStockAlertKg: 0, costPerKg: 130, location: 'River Life (Entreposto)', status: 'NORMAL', notes: 'Quantidade preservada na unidade original (litros). Saldo: R$ 338,00.', createdAt: '2026-10-21T15:14:00-03:00' },
    { id: 'mp-stock-imuno', tenantId: 'tenant-river-life', brand: 'Não informado', name: 'IMUNO AQUA', category: 'PROBIOTICO', itemType: 'Nutrição/ Probiótico', unit: 'g', proteinPercent: 0, currentStockKg: 2500, minStockAlertKg: 0, costPerKg: 0.11, location: 'River Life (Entreposto)', status: 'NORMAL', notes: 'Quantidade preservada na unidade original (gramas). Saldo: R$ 280,00.', createdAt: '2026-10-21T15:14:00-03:00' },
    { id: 'mp-stock-protect', tenantId: 'tenant-river-life', brand: 'Não informado', name: 'PROTECT', category: 'PROBIOTICO', itemType: 'Nutrição/ Probiótico', unit: 'l', proteinPercent: 0, currentStockKg: 2, minStockAlertKg: 0, costPerKg: 58.43, location: 'River Life (Entreposto)', status: 'NORMAL', notes: 'Quantidade preservada na unidade original (litros). Saldo: R$ 116,86.', createdAt: '2026-10-21T15:14:00-03:00' },
    { id: 'mp-stock-feed', tenantId: 'tenant-river-life', brand: 'Nutriesfera', name: 'RAÇÃO NUTRIESFERA 450', category: 'RACAO', itemType: 'Ração', unit: 'kg', proteinPercent: 45, currentStockKg: 39.2, minStockAlertKg: 0, costPerKg: 38.85, location: 'River Life (Entreposto)', status: 'NORMAL', notes: 'Saldo informado: R$ 1.522,92.', createdAt: '2026-10-21T15:14:00-03:00' },
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
      id: 'mp-account-default',
      tenantId: 'tenant-river-life',
      bankName: 'Padrão',
      accountType: 'Não informado',
      agency: 'Não informada',
      accountNumber: 'Protegido',
      holderName: 'River Life',
      currentBalanceRs: -20043.76,
      pixKey: 'Protegido',
      isActive: true,
    },
  ],
  cashFlow: [
    {
      id: 'mp-receivable-20261031',
      tenantId: 'tenant-river-life',
      movementType: 'ENTRADA',
      category: 'FINANCEIRO',
      description: 'Conta a receber — NJ Criação e Produção de Camarão e Tilápia Ltda. — vencimento 31/10/2026',
      amountRs: 3900,
      status: 'PREVISTO',
      documentRef: 'MEU-PESCADO-RECEBER-20261031',
      createdAt: '2026-10-20T12:00:00-03:00',
    },
    {
      id: 'mp-payable-20261021',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'ESTOQUE',
      description: 'Conta a pagar — Feed & Care — prazo 15 dias — vencimento 21/10/2026',
      amountRs: 1942.50,
      status: 'PREVISTO',
      documentRef: 'MEU-PESCADO-PAGAR-20261021',
      createdAt: '2026-10-07T12:00:00-03:00',
    },
  ],
  farmProfiles: [
    {
      tenantId: 'tenant-river-life',
      name: 'River Life (Área Fazenda)',
      corporateName: 'Não informado na origem',
      cnpj: '',
      stateRegistration: '',
      address: 'Mogeiro – PB',
      city: 'Mogeiro',
      state: 'PB',
      waterSourceType: 'Não informado na origem',
      averageSalinityPpt: 0,
      totalAreaHectares: 0,
      waterSurfaceHectares: 0,
      technicianInCharge: 'Collermhann',
      councilRegistration: '',
      environmentalLicense: '',
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
          inventory: (parsed.inventory && parsed.inventory.length > 0 && parsed.inventory.some((i: any) => i.id === 'mp-stock-feed'))
            ? parsed.inventory
            : INITIAL_DB_DATA.inventory,
          cashFlow: (parsed.cashFlow && parsed.cashFlow.length > 0 && parsed.cashFlow.some((c: any) => c.id === 'mp-payable-20261021'))
            ? parsed.cashFlow
            : INITIAL_DB_DATA.cashFlow,
          biometries: (parsed.biometries && parsed.biometries.length > 0 && parsed.biometries.some((b: any) => b.id === 'bio-mp-t1-20261020'))
            ? parsed.biometries
            : INITIAL_DB_DATA.biometries,
          bankAccounts: (parsed.bankAccounts && parsed.bankAccounts.some((account: any) => account.id === 'mp-account-default'))
            ? parsed.bankAccounts
            : INITIAL_DB_DATA.bankAccounts,
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
          phone: '',
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
    const phone = farmData?.producerPhone?.trim() || '';
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
