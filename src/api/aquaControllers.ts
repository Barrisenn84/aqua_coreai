import { Request, Response } from 'express';
import { mqttIngestor, redisCache } from '../iot/mqttIngestor';
import { getAIGuidance, scanFeedBagLabel } from '../ai/geminiOracle';
import { runAquaCoreRuleEngine } from '../utils/aquacultureMath';
import { initialBatches, initialTanks } from '../data/initialData';

export const TelemetryController = {
  getLatest: (req: Request, res: Response) => {
    const { tankId } = req.params;
    const startHr = process.hrtime();
    const reading = mqttIngestor.getLatestReading(tankId);
    const diff = process.hrtime(startHr);
    const latencyMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

    if (!reading) {
      return res.status(404).json({ error: 'Nenhum dado telemétrico encontrado para o tanque' });
    }

    return res.json({
      reading,
      latencyMs: `${latencyMs} ms`,
      cacheSource: 'InMemory Redis-layer (< 2ms)',
    });
  },

  getHistory: (req: Request, res: Response) => {
    const { tankId } = req.params;
    const limit = Number(req.query.limit) || 10;
    const history = mqttIngestor.getRecentHistory(tankId, limit);
    return res.json({ history, count: history.length });
  },

  ingestPacket: (req: Request, res: Response) => {
    const { tankId, payload } = req.body;
    if (!tankId || !payload) {
      return res.status(400).json({ error: 'tankId e payload são obrigatórios' });
    }
    const topic = `aquacore/farm-01/tanks/${tankId}/telemetry`;
    const recorded = mqttIngestor.handleMqttPacket(topic, JSON.stringify({ ...payload, tankId }));
    return res.json({ success: true, topic, recorded });
  },
};

export const AIController = {
  getGuidance: async (req: Request, res: Response) => {
    try {
      const { tankId, currentReading, batchInfo, customQuery, tank } = req.body;

      // Fallback batch and tank if not provided
      const resolvedBatch = batchInfo || initialBatches.find((b) => b.tankId === tankId) || initialBatches[0];
      const resolvedTank = tank || initialTanks.find((t) => t.id === tankId) || initialTanks[0];
      const reading = currentReading || mqttIngestor.getLatestReading(tankId);

      if (!reading) {
        return res.status(400).json({ error: 'Leitura telemétrica ausente' });
      }

      try {
        const guidance = await getAIGuidance(
          tankId,
          reading,
          {
            _id: resolvedBatch.id || 'batch-01',
            tankId,
            batchCode: resolvedBatch.batchCode,
            species: resolvedBatch.species,
            startDate: new Date(),
            ageDays: resolvedBatch.cycleDay || 120,
            initialCount: resolvedBatch.initialCount || 5000,
            currentCount: resolvedBatch.currentCount || 4800,
            initialWeightG: resolvedBatch.initialWeightG || 30,
            currentWeightG: resolvedBatch.currentWeightG || 700,
            targetFinalWeightG: resolvedBatch.targetFinalWeightG || 900,
            accumulatedFeedKg: resolvedBatch.accumulatedFeedKg || 5000,
            targetHarvestDate: new Date(),
          },
          customQuery
        );
        return res.json(guidance);
      } catch (aiErr: any) {
        console.warn('Gemini API call failed or missing key, running fallback rule engine:', aiErr.message);
        const fallback = runAquaCoreRuleEngine({
          tank: resolvedTank,
          batch: resolvedBatch,
          reading,
          queryOverride: customQuery,
        });
        return res.json(fallback);
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  scanFeedBag: async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 é obrigatória' });
      }

      const result = await scanFeedBagLabel(imageBase64, mimeType || 'image/jpeg');
      return res.json(result);
    } catch (err: any) {
      console.error('Vision OCR processing error:', err.message);
      return res.status(500).json({
        error: `Falha na extração visual por IA: ${err.message}`,
        details: 'Certifique-se de que a imagem esteja nítida e iluminada.',
      });
    }
  },
};

export const IoTSystemController = {
  getStatus: (_req: Request, res: Response) => {
    return res.json(mqttIngestor.getMetrics());
  },
};

export const WhatsAppController = {
  // Meta Cloud API Webhook Verification (GET)
  verifyWebhook: (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'aqua_core_secret_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Token de verificação inválido' });
  },

  // Meta Cloud API Webhook Inbound Message (POST)
  handleWebhook: async (req: Request, res: Response) => {
    try {
      const body = req.body;
      res.status(200).json({ status: 'EVENT_RECEIVED' });

      // If message present in standard Meta format
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (message && message.type === 'text') {
        const fromNumber = message.from;
        const textBody = message.text.body;
        console.log(`[WhatsApp Webhook] Mensagem recebida de ${fromNumber}: "${textBody}"`);

        // Dispara processamento pelo Hub de Mensageria
        const { messagingHub } = await import('../services/MessagingHub');
        await messagingHub.handleIncomingProducerMessage(fromNumber, textBody);
      }
    } catch (err: any) {
      console.error('[WhatsApp Webhook] Erro ao processar:', err.message);
    }
  },

  // Twilio WhatsApp Webhook Inbound Message (POST)
  handleTwilioWebhook: async (req: Request, res: Response) => {
    try {
      const { From, Body } = req.body;
      const userPhone = From ? String(From).replace('whatsapp:', '') : '+5511999998888';
      const text = String(Body || '');
      console.log(`[Twilio Webhook] Mensagem de ${userPhone}: "${text}"`);

      const { messagingHub } = await import('../services/MessagingHub');
      const reply = await messagingHub.handleIncomingProducerMessage(userPhone, text);

      res.type('text/xml');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`);
    } catch (err: any) {
      console.error('[Twilio Webhook] Erro ao processar:', err.message);
      return res.status(500).send('<Response><Message>Erro ao processar mensagem</Message></Response>');
    }
  },

  // Interactive Test & Ghost UX simulation endpoint
  simulateIncoming: async (req: Request, res: Response) => {
    try {
      const { text, context } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Campo text é obrigatório' });
      }

      const { processWhatsAppGhostMessage } = await import('../ai/geminiOracle');
      const fallbackContext = context || {
        farmName: 'Santa Helena Aquacultura',
        tanks: initialTanks.map((t) => {
          const b = initialBatches.find((batch) => batch.tankId === t.id);
          return { id: t.id, name: t.name, status: t.status, species: b?.species || 'Tilápia do Nilo' };
        }),
        telemetry: {},
        batches: initialBatches,
        totalBiomassTons: 23.45,
        dailyFeedKg: 340,
      };

      const result = await processWhatsAppGhostMessage(text, fallbackContext);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Retorna histórico de mensagens despachadas pelo MessagingHub
  getHistory: async (_req: Request, res: Response) => {
    try {
      const { messagingHub } = await import('../services/MessagingHub');
      return res.json({ history: messagingHub.getHistory() });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Despacho manual via MessagingHub
  dispatchManual: async (req: Request, res: Response) => {
    try {
      const { userId, payload, level } = req.body;
      const { messagingHub, MessageLevel } = await import('../services/MessagingHub');
      const lvl = level || MessageLevel.INFORMATIVE;
      const message = await messagingHub.processAndSend(userId || '+5511999998888', payload || {}, lvl);
      return res.json({ success: true, message });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

export const HardwareController = {
  getFleet: async (_req: Request, res: Response) => {
    const { initialBlackBoxes } = await import('../data/blackBoxHardwareData');
    return res.json({ fleet: initialBlackBoxes, count: initialBlackBoxes.length });
  },

  ingestTelemetry: (req: Request, res: Response) => {
    const { deviceId, tankId, telemetry } = req.body;
    if (!deviceId || !tankId || !telemetry) {
      return res.status(400).json({ error: 'deviceId, tankId e telemetry são obrigatórios' });
    }

    const topic = `aquacore/blackbox/${deviceId}/telemetry`;
    const recorded = mqttIngestor.handleMqttPacket(topic, JSON.stringify({ ...telemetry, tankId, deviceId }));
    return res.json({ success: true, topic, recorded, ack: 'ACK_SIM7600_OK' });
  },
};

/**
 * 🔐 CONTROLLER DE AUTENTICAÇÃO & MULTI-TENANT
 */
export const AuthController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { db } = await import('../db/databaseService');
      const user = db.findUserByEmail(email || '');
      const tenant = user ? db.getTenantById(user.tenantId) : db.getTenants()[0];

      return res.json({
        token: `jwt_session_${Date.now()}`,
        user: user || {
          id: 'usr-default',
          name: 'Produtor Visitante',
          email: email || 'produtor@aquacore.ai',
          role: 'engineer',
          tenantId: tenant.id,
        },
        tenant,
        availableTenants: db.getTenants(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getTenants: async (_req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      return res.json({ tenants: db.getTenants() });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  switchTenant: async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.body;
      const { db } = await import('../db/databaseService');
      const tenant = db.getTenantById(tenantId);
      return res.json({ success: true, tenant });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

/**
 * 💾 CONTROLLER DE BANCO DE DADOS PERSISTENTE
 */
export const DatabaseController = {
  getBiometries: async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { db } = await import('../db/databaseService');
      const list = db.getBiometries(tenantId || 'tenant-river-life');
      return res.json({ biometries: list, count: list.length });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addBiometry: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addBiometry(req.body);
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getEquipments: async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { db } = await import('../db/databaseService');
      const list = db.getEquipments(tenantId || 'tenant-river-life');
      return res.json({ equipments: list });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateEquipment: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { db } = await import('../db/databaseService');
      const updated = db.updateEquipment(id, req.body);
      return res.json({ success: true, equipment: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getInvoices: async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { db } = await import('../db/databaseService');
      const list = db.getInvoices(tenantId || 'tenant-river-life');
      return res.json({ invoices: list });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addInvoice: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addInvoice(req.body);
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 🍽️ Bandejas de Alimentação
  getFeedingTrays: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ trays: db.getFeedingTrays(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addFeedingTray: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addFeedingTray(req.body);
      const feedKg = Number(req.body.feedAmountKg || req.body.amountKg || 0);
      if (feedKg > 0) {
        const inv = db.getInventory(req.body.tenantId || 'tenant-river-life');
        const feedItem = inv.find((i) => i.id === 'inv-item-samaria' || i.name.toLowerCase().includes('samaria') || i.category.toLowerCase().includes('ração'));
        if (feedItem) {
          db.updateInventoryStock(feedItem.id, Math.max(0, feedItem.currentStockKg - feedKg));
        }
      }
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 📦 Estoque de Insumos
  getInventory: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ items: db.getInventory(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addInventoryItem: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addInventoryItem(req.body);
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateInventoryStock: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { currentStockKg } = req.body;
      const { db } = await import('../db/databaseService');
      const record = db.updateInventoryStock(id, Number(currentStockKg));
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 💧 Balanço Iônico & Água
  getWaterIonic: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ logs: db.getWaterIonic(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addWaterIonic: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addWaterIonic(req.body);
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 🦐 Mortalidade & Mudas Lunares
  getMortality: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ logs: db.getMortality(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addMortality: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addMortality(req.body);
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 🎣 Despescas & Romaneio
  getHarvests: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ harvests: db.getHarvests(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addHarvest: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addHarvest(req.body);
      const revenue = Number(record.totalRevenue || (record.totalWeightKg * record.pricePerKg));
      if (revenue > 0) {
        db.addCashFlow({
          tenantId: record.tenantId || 'tenant-river-life',
          movementType: 'ENTRADA',
          category: 'Receita de Despesca / Venda',
          description: `Despesca ${record.harvestType === 'TOTAL' ? 'Total' : 'Parcial'} (${record.totalWeightKg} kg a R$ ${record.pricePerKg.toFixed(2)}/kg) - ${record.buyerName}`,
          amountRs: revenue,
          status: 'REALIZADO',
          documentRef: record.gtaNumber || `ROMANEIO-${record.id}`,
        });
      }
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 🏦 Contas & Fluxo de Caixa
  getBankAccounts: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ accounts: db.getBankAccounts(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getCashFlow: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ movements: db.getCashFlow(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  addCashFlow: async (req: Request, res: Response) => {
    try {
      const { db } = await import('../db/databaseService');
      const record = db.addCashFlow(req.body);
      return res.json({ success: true, record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 🏡 Perfil Institucional da Fazenda
  getFarmProfile: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      return res.json({ profile: db.getFarmProfile(tenantId) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateFarmProfile: async (req: Request, res: Response) => {
    try {
      const tenantId = (req.query.tenantId as string) || 'tenant-river-life';
      const { db } = await import('../db/databaseService');
      const updated = db.updateFarmProfile(tenantId, req.body);
      return res.json({ success: true, profile: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // 🛡️ REINICIALIZAÇÃO CONTROLADA: ZERAR DADOS SALVOS SOMENTE COM CONFIRMAÇÃO EXPLÍCITA
  resetData: async (req: Request, res: Response) => {
    try {
      const { tenantId, modules, resetAllToFactory, startBlankBusiness, farmData, confirmationCode } = req.body;
      const normalizedCode = (confirmationCode || '').trim().toUpperCase();

      if (
        normalizedCode !== 'ZERAR DADOS SALVOS' &&
        normalizedCode !== 'CONFIRMAR' &&
        normalizedCode !== 'ZERAR DADOS' &&
        normalizedCode !== 'ZERAR TUDO'
      ) {
        return res.status(403).json({
          error: 'Código de confirmação inválido. Digite exatamente "ZERAR DADOS SALVOS" ou "CONFIRMAR" para autorizar a operação.',
        });
      }

      const { db } = await import('../db/databaseService');

      if (startBlankBusiness) {
        const result = db.resetTenantToBlank(tenantId || 'tenant-river-life', farmData);
        return res.json({ success: true, result });
      }

      const result = db.resetSavedData(tenantId || 'tenant-river-life', {
        modules: modules || [],
        resetAllToFactory: !!resetAllToFactory,
      });

      return res.json({ success: true, result });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

/**
 * ☀️ CONTROLLER DO CICLO SOLAR (Sunrise-Sunset API)
 */
export const SolarController = {
  getCycle: async (req: Request, res: Response) => {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : -7.2997;
      const lon = req.query.lon ? Number(req.query.lon) : -35.2319;
      const { getLiveSolarCycle } = await import('../services/freeApisService');
      const data = await getLiveSolarCycle(lat, lon);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

/**
 * 🇧🇷 CONTROLLER BRASILAPI (CNPJ, CEP & Feriados)
 */
export const BrasilApiController = {
  getCnpj: async (req: Request, res: Response) => {
    try {
      const { cnpj } = req.params;
      const { consultarCnpjBrasilApi } = await import('../services/freeApisService');
      const data = await consultarCnpjBrasilApi(cnpj);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getCep: async (req: Request, res: Response) => {
    try {
      const { cep } = req.params;
      const { consultarCepBrasilApi } = await import('../services/freeApisService');
      const data = await consultarCepBrasilApi(cep);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getFeriados: async (req: Request, res: Response) => {
    try {
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      const { consultarFeriadosBrasilApi } = await import('../services/freeApisService');
      const feriados = await consultarFeriadosBrasilApi(year);
      return res.json({ feriados });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

/**
 * 💰 CONTROLLER DE CRÉDITO AGRO (Banco Central do Brasil / Selic / PRONAF)
 */
export const AgroCreditController = {
  getBenchmark: async (_req: Request, res: Response) => {
    try {
      const { getAgroCreditBenchmark } = await import('../services/freeApisService');
      const data = await getAgroCreditBenchmark();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

/**
 * 📷 CONTROLLER DE VISÃO COMPUTACIONAL MULTIMODAL
 */
export const VisionController = {
  analyzeImage: async (req: Request, res: Response) => {
    try {
      const { analyzeVisionCarciniculture } = await import('../ai/geminiOracle');
      const analysis = await analyzeVisionCarciniculture(req.body);
      return res.json(analysis);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

/**
 * 🎤 CONTROLLER DO ASSISTENTE DE VOZ IA (Dr. Camarão)
 */
export const VoiceController = {
  processCommand: async (req: Request, res: Response) => {
    try {
      const { transcript } = req.body;
      const { processVoiceAssistantCommand } = await import('../ai/geminiOracle');
      const response = await processVoiceAssistantCommand(transcript || '');
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};

/**
 * 🧠 CONTROLLER DE AUDITORIAS ESPECIALIZADAS COM IA (Gemini 2.0 Flash)
 */
export const AIAuditController = {
  auditInvoice: async (req: Request, res: Response) => {
    try {
      const { auditInvoiceWithAI } = await import('../ai/geminiOracle');
      const report = await auditInvoiceWithAI(req.body);
      return res.json({ success: true, report });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  auditEquipment: async (req: Request, res: Response) => {
    try {
      const { auditEquipmentWithAI } = await import('../ai/geminiOracle');
      const report = await auditEquipmentWithAI(req.body);
      return res.json({ success: true, report });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  auditDre: async (req: Request, res: Response) => {
    try {
      const { auditDreWithAI } = await import('../ai/geminiOracle');
      const report = await auditDreWithAI(req.body);
      return res.json({ success: true, report });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};


