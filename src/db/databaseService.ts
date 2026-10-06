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
      name: 'Fazenda River Life (Camarão PB)',
      code: 'RIVER_LIFE',
      type: 'aquaculture_farm',
      location: 'Polo de Mogeiro – PB',
      latitude: -7.2997,
      longitude: -35.2319,
      kwhCost: 0.72,
      feedCost: 4.20,
      salePrice: 10.25,
      producerPhone: '+5584988585211',
      speciesTarget: 'Litopenaeus vannamei (Camarão)',
    },
    {
      id: 'tenant-santa-helena',
      name: 'Fazenda Santa Helena (Tilápia BA)',
      code: 'SANTA_HELENA',
      type: 'aquaculture_farm',
      location: 'Polo Paulo Afonso – BA',
      latitude: -9.4069,
      longitude: -38.2144,
      kwhCost: 0.68,
      feedCost: 3.90,
      salePrice: 9.80,
      producerPhone: '+5575991234567',
      speciesTarget: 'Oreochromis niloticus (Tilápia do Nilo)',
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
      id: 'usr-01',
      tenantId: 'tenant-river-life',
      email: 'collermhann@aquacore.ai',
      name: 'Engenheiro Collermhann',
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
      id: 'bio-seed-01',
      tenantId: 'tenant-river-life',
      tankId: 'tank-04',
      batchId: 'batch-04',
      avgWeightG: 18.2,
      sampleSize: 80,
      mortalityCount: 15,
      uniformityPct: 89.5,
      fcrCurrent: 1.35,
      aiActionNote: 'Crescimento zootécnico dentro da curva de calibração para água a 29.5°C no Polo Paraíba.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'bio-seed-02',
      tenantId: 'tenant-river-life',
      tankId: 'tank-02',
      batchId: 'batch-02',
      avgWeightG: 14.8,
      sampleSize: 75,
      mortalityCount: 8,
      uniformityPct: 92.0,
      fcrCurrent: 1.28,
      aiActionNote: 'Conversão exemplar. Manter 3 tratos diários fracionados.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ],
  equipments: [
    {
      id: 'eq-01',
      tenantId: 'tenant-river-life',
      name: 'Aerador Palheta 2.0 CV (Motor Trifásico)',
      location: 'Tanque 04',
      type: 'Aeração Superficial',
      status: 'critical',
      powerKw: 2.2,
      lastMaintenance: '2026-08-10',
      overdueDays: 9,
      healthScore: 68.0,
      aiDiagnostics: 'Alerta preditivo: vibração excessiva no mancal acoplado e 9 dias sem lubrificação.',
    },
    {
      id: 'eq-02',
      tenantId: 'tenant-river-life',
      name: 'Soprador Roots Industrial 5.5 kW',
      location: 'Berçário de PLs',
      type: 'Aeração Submersa / Difusores',
      status: 'operational',
      powerKw: 5.5,
      lastMaintenance: '2026-09-20',
      overdueDays: 0,
      healthScore: 98.0,
    },
    {
      id: 'eq-03',
      tenantId: 'tenant-river-life',
      name: 'Bomba de Captação e Drenagem 5.0 HP',
      location: 'Canal Central de Abastecimento',
      type: 'Bombeamento Hidráulico',
      status: 'warning',
      powerKw: 3.7,
      lastMaintenance: '2026-09-02',
      overdueDays: 2,
      healthScore: 84.0,
    },
  ],
  invoices: [
    {
      id: 'inv-seed-01',
      tenantId: 'tenant-river-life',
      invoiceNumber: 'NF-892341',
      batchCode: 'Lote_04',
      quantityKg: 1200,
      pricePerKg: 10.25,
      totalValue: 12300,
      buyerName: 'Frigorífico Polo Paraíba & NE',
      buyerCnpj: '02.429.144/0001-93',
      status: 'issued',
      aiTaxReport: 'Parecer Fiscal IA: Desoneração de ICMS na saída de produtor rural e isenção PIS/COFINS agro.',
      createdAt: new Date().toISOString(),
    },
  ],
  feedingTrays: [
    {
      id: 'tray-01',
      tenantId: 'tenant-river-life',
      tankId: 'tank-04',
      batchId: 'batch-04',
      checkTime: '09:30',
      traysInspectedCount: 12,
      trayStatus: 'LIMPO',
      leftoverPercentage: 0.0,
      adjustmentSuggestedPct: 10.0,
      aiRecommendation: 'Comedouros 100% limpos após 2h do 1º trato. Aumentar +10% de ração no trato das 11h.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tray-02',
      tenantId: 'tenant-river-life',
      tankId: 'tank-02',
      batchId: 'batch-02',
      checkTime: '09:40',
      traysInspectedCount: 10,
      trayStatus: 'POUCA_SOBRA',
      leftoverPercentage: 5.0,
      adjustmentSuggestedPct: 0.0,
      aiRecommendation: 'Sobra mínima normal de transição de muda. Manter quantidade no próximo trato.',
      createdAt: new Date().toISOString(),
    },
  ],
  inventory: [
    {
      id: 'inv-item-01',
      tenantId: 'tenant-river-life',
      brand: 'Guabi Aqua',
      name: 'Poti Camarão 35% PB Extrusada 1.6mm',
      category: 'ENGORDA',
      itemType: 'Ração',
      unit: 'kg',
      proteinPercent: 35.0,
      currentStockKg: 3200.0,
      minStockAlertKg: 800.0,
      costPerKg: 6.20,
      location: 'Silo Principal - Setor A',
      status: 'NORMAL',
      notes: 'Lote G-2026/89. Validade 180 dias.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inv-item-02',
      tenantId: 'tenant-river-life',
      brand: 'AquaFeed Brasil',
      name: 'Micro Starter PL10 40% PB',
      category: 'INICIAL_PL',
      itemType: 'Ração',
      unit: 'kg',
      proteinPercent: 40.0,
      currentStockKg: 450.0,
      minStockAlertKg: 200.0,
      costPerKg: 12.80,
      location: 'Depósito Berçário',
      status: 'NORMAL',
      notes: 'Uso exclusivo nos tanques berçário.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inv-item-03',
      tenantId: 'tenant-river-life',
      brand: 'Calcário Agrícola PB',
      name: 'Calcário Calcítico Microencapsulado',
      category: 'CALCARIO',
      itemType: 'Corretivo',
      unit: 'kg',
      proteinPercent: 0.0,
      currentStockKg: 2800.0,
      minStockAlertKg: 1000.0,
      costPerKg: 0.45,
      location: 'Galpão de Químicos',
      status: 'NORMAL',
      notes: 'Para correção de alcalinidade pós-chuva.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inv-item-04',
      tenantId: 'tenant-river-life',
      brand: 'BioShrimp Pro',
      name: 'Probiótico Biorremediador de Fundo',
      category: 'PROBIOTICO',
      itemType: 'Biológico',
      unit: 'L',
      proteinPercent: 0.0,
      currentStockKg: 120.0,
      minStockAlertKg: 40.0,
      costPerKg: 48.00,
      location: 'Laboratório da Fazenda',
      status: 'NORMAL',
      notes: 'Bacillus subtilis + Bacillus licheniformis para controle de lodo.',
      createdAt: new Date().toISOString(),
    },
  ],
  waterIonic: [
    {
      id: 'ionic-01',
      tenantId: 'tenant-river-life',
      tankId: 'tank-04',
      salinityPpt: 16.5,
      dissolvedOxygenMgL: 5.8,
      temperatureC: 29.4,
      ph: 7.8,
      totalAlkalinityMgL: 145.0,
      totalHardnessMgL: 680.0,
      calciumMgL: 135.0,
      magnesiumMgL: 395.0,
      toxicAmmoniaNh3MgL: 0.012,
      nitriteNo2MgL: 0.03,
      transparencySecchiCm: 34.0,
      calcificationStatus: 'IDEAL',
      createdAt: new Date().toISOString(),
    },
  ],
  mortality: [
    {
      id: 'mort-01',
      tenantId: 'tenant-river-life',
      tankId: 'tank-04',
      batchId: 'batch-04',
      quantity: 12,
      lunarPhase: 'LUA_CHEIA',
      probableCause: 'ROTINA_MUDA',
      notes: 'Muda sincronizada de lua cheia sem sinal de mionecrose.',
      createdAt: new Date().toISOString(),
    },
  ],
  harvests: [
    {
      id: 'harv-01',
      tenantId: 'tenant-river-life',
      tankId: 'tank-01',
      batchId: 'batch-01',
      harvestType: 'TOTAL',
      totalWeightKg: 4800.0,
      shrimpCountEstimated: 266000,
      avgWeightG: 18.0,
      commercialClassification: '50/60',
      pricePerKg: 24.50,
      totalRevenue: 117600.0,
      buyerName: 'Frigorífico Polo Paraíba',
      gtaNumber: 'GTA-PB-2026-09812',
      notes: 'Despesca limpa, camarão com excelente firmeza e trato vazio.',
      createdAt: new Date().toISOString(),
    },
  ],
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
      id: 'mov-01',
      tenantId: 'tenant-river-life',
      movementType: 'ENTRADA',
      category: 'VENDA_CAMARAO',
      description: 'Recebimento Despesca Lote 01 (Frigorífico Polo PB)',
      amountRs: 117600.0,
      status: 'REALIZADO',
      documentRef: 'NF-892341',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mov-02',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'RACAO',
      description: 'Compra 10 Toneladas Ração 35% Guabi Aqua',
      amountRs: 48000.0,
      status: 'REALIZADO',
      documentRef: 'NF-FORN-9012',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mov-03',
      tenantId: 'tenant-river-life',
      movementType: 'SAIDA',
      category: 'ENERGIA_ELETRICA',
      description: 'Energisa PB - Tarifa Horosazonal Verde Aeradores',
      amountRs: 8640.0,
      status: 'REALIZADO',
      documentRef: 'CONTA-09-2026',
      createdAt: new Date().toISOString(),
    },
  ],
  farmProfiles: [
    {
      tenantId: 'tenant-river-life',
      name: 'Fazenda River Life (Camarão PB)',
      corporateName: 'River Life Carcinicultura do Nordeste Ltda',
      cnpj: '32.845.912/0001-44',
      stateRegistration: '16.984.231-0',
      address: 'Rodovia PB-018, Km 14, Polo Mogeiro / Vale do Paraíba',
      city: 'Mogeiro / João Pessoa',
      state: 'PB',
      waterSourceType: 'Estuário do Rio Paraíba & Aquífero Salobro',
      averageSalinityPpt: 18.5,
      totalAreaHectares: 18.4,
      waterSurfaceHectares: 12.2,
      technicianInCharge: 'Dr. Arnaldo Bezerra (Engenheiro de Pesca - UFRPE/CREA-PB)',
      councilRegistration: 'CREA-PB 14.892-D',
      environmentalLicense: 'SUDEMA-PB Licença de Operação LO nº 2024/0981-L',
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
        // Garante compatibilidade caso campos novos não estejam salvos
        return {
          ...INITIAL_DB_DATA,
          ...parsed,
          feedingTrays: parsed.feedingTrays || INITIAL_DB_DATA.feedingTrays,
          inventory: parsed.inventory || INITIAL_DB_DATA.inventory,
          waterIonic: parsed.waterIonic || INITIAL_DB_DATA.waterIonic,
          mortality: parsed.mortality || INITIAL_DB_DATA.mortality,
          harvests: parsed.harvests || INITIAL_DB_DATA.harvests,
          bankAccounts: parsed.bankAccounts || INITIAL_DB_DATA.bankAccounts,
          cashFlow: parsed.cashFlow || INITIAL_DB_DATA.cashFlow,
          farmProfiles: parsed.farmProfiles || INITIAL_DB_DATA.farmProfiles,
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
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
}

export const db = new DatabaseService();
