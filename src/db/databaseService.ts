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
        return JSON.parse(raw);
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
}

export const db = new DatabaseService();
