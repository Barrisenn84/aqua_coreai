import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { errorHandler } from './src/middleware/errorHandler';
import { authMiddleware } from './src/middleware/authMiddleware';
import {
  TelemetryController,
  AIController,
  IoTSystemController,
  WhatsAppController,
  HardwareController,
  AuthController,
  DatabaseController,
  SolarController,
  BrasilApiController,
  AIAuditController,
  VisionController,
  VoiceController,
  AgroCreditController,
} from './src/api/aquaControllers';
import { mqttIngestor } from './src/iot/mqttIngestor';
import { messagingHub } from './src/services/MessagingHub';
import { geminiOracle, MessageLevel } from './src/ai/geminiOracle';
import { aquacultureMath } from './src/utils/aquacultureMath';
import { environment } from './src/config/environment';
import { getLiveMogeiroWeather, getLiveCurrencies } from './src/services/freeApisService';
import { aiSentinelService } from './src/services/aiSentinelService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PRODUTOR_PHONE = environment.producerPhone;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

/**
 * 🩺 HEALTHCHECK ENDPOINTS (Railway, UpTime Robot & Kubernetes)
 */
app.get(['/api/health', '/health'], (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AQUA-CORE AI Production Server',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

/**
 * 📡 HUB DE MENSAGERIA: WEBHOOK DE ENTRADA (WhatsApp Ghost UX)
 */
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { from, text } = req.body;
    if (!from || !text) {
      return res.status(400).send('Payload incompleto: "from" e "text" são obrigatórios.');
    }

    console.log(`[Incoming WhatsApp] Produtor ${from}: "${text}"`);

    const userContext = {
      userId: from,
      farmId: 'farm_shrimp_jp',
      species: 'L. vannamei (Camarão)',
      stage: 'Pós-Larvas & Engorda',
      location: 'João Pessoa / PB',
    };

    const response = await messagingHub.processAndSend(
      from,
      {
        question: text,
        context: userContext,
      },
      MessageLevel.CONSULT
    );

    res.status(200).send({ status: 'delivered', response });
  } catch (error) {
    console.error('[Critical Error] Falha no Webhook WhatsApp:', error);
    res.status(500).send('Internal Server Error');
  }
});

// REST API Endpoints according to Backend Skeleton
app.get('/api/telemetry/latest/:tankId', TelemetryController.getLatest);
app.get('/api/telemetry/history/:tankId', TelemetryController.getHistory);
app.post('/api/telemetry/ingest', TelemetryController.ingestPacket);

app.post('/api/ai/guidance', AIController.getGuidance);
app.post('/api/ai/scan-label', AIController.scanFeedBag);
app.post('/api/aqua-core/analyze', AIController.getGuidance);

app.get('/api/iot/status', IoTSystemController.getStatus);

// PILAR 1 & 3: WhatsApp Meta Webhook, Twilio Webhook & Ghost UX endpoints
app.get('/api/whatsapp/webhook', WhatsAppController.verifyWebhook);
app.post('/api/whatsapp/webhook', WhatsAppController.handleWebhook);
app.post('/api/whatsapp/simulate-incoming', WhatsAppController.simulateIncoming);
app.post('/api/twilio/webhook', WhatsAppController.handleTwilioWebhook);
app.get('/api/messaging/history', WhatsAppController.getHistory);
app.post('/api/messaging/dispatch', WhatsAppController.dispatchManual);

// PILAR 2: Hardware-as-a-Service Caixa Preta fleet & telemetry endpoints
app.get('/api/hardware/fleet', HardwareController.getFleet);
app.post('/api/hardware/telemetry', HardwareController.ingestTelemetry);

// 🔐 AUTENTICAÇÃO & MULTI-TENANT (Abertos para login)
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/tenants', AuthController.getTenants);
app.post('/api/auth/switch-tenant', AuthController.switchTenant);

// 💾 BANCO DE DADOS PERSISTENTE (Protegidos por JWT)
app.use('/api/db', authMiddleware);
app.get('/api/db/biometries/:tenantId', DatabaseController.getBiometries);
app.post('/api/db/biometries', DatabaseController.addBiometry);
app.get('/api/db/equipments/:tenantId', DatabaseController.getEquipments);
app.put('/api/db/equipments/:id', DatabaseController.updateEquipment);
app.get('/api/db/invoices/:tenantId', DatabaseController.getInvoices);
app.post('/api/db/invoices', DatabaseController.addInvoice);

// 🍽️ Bandejas de Alimentação & Comedouros
app.get('/api/db/feeding-trays', DatabaseController.getFeedingTrays);
app.post('/api/db/feeding-trays', DatabaseController.addFeedingTray);

// 📦 Estoque de Insumos & Armazém Inteligente
app.get('/api/db/inventory', DatabaseController.getInventory);
app.post('/api/db/inventory', DatabaseController.addInventoryItem);
app.patch('/api/db/inventory/:id', DatabaseController.updateInventoryStock);

// 💧 Balanço Iônico & Qualidade da Água
app.get('/api/db/water-ionic', DatabaseController.getWaterIonic);
app.post('/api/db/water-ionic', DatabaseController.addWaterIonic);

// 🦐 Mortalidade & Ciclo de Mudas Lunares
app.get('/api/db/mortality', DatabaseController.getMortality);
app.post('/api/db/mortality', DatabaseController.addMortality);

// 🎣 Despescas & Romaneio Comercial
app.get('/api/db/harvests', DatabaseController.getHarvests);
app.post('/api/db/harvests', DatabaseController.addHarvest);

// 🏦 Contas Bancárias & Fluxo de Caixa Diário (DFC)
app.get('/api/db/bank-accounts', DatabaseController.getBankAccounts);
app.get('/api/db/cash-flow', DatabaseController.getCashFlow);
app.post('/api/db/cash-flow', DatabaseController.addCashFlow);

// 🏡 Minha Fazenda (Cadastro & Licenciamento Ambiental)
app.get('/api/db/farm-profile', DatabaseController.getFarmProfile);
app.put('/api/db/farm-profile', DatabaseController.updateFarmProfile);
app.post('/api/db/farm-profile', DatabaseController.updateFarmProfile);

// 🛡️ REINICIALIZAÇÃO CONTROLADA
app.post('/api/db/reset', DatabaseController.resetData);

// 📷 VISÃO COMPUTACIONAL & IA (Protegidos)
app.use(['/api/vision', '/api/voice', '/api/ai/audit', '/api/sentinel/run', '/api/sentinel/resolve'], authMiddleware);
app.post('/api/vision/analyze', VisionController.analyzeImage);
app.post('/api/voice/command', VoiceController.processCommand);
app.post('/api/ai/audit-invoice', AIAuditController.auditInvoice);
app.post('/api/ai/audit-equipment', AIAuditController.auditEquipment);
app.post('/api/ai/audit-dre', AIAuditController.auditDre);

// 🛡️ SENTINELA IA: VARREDURA AUTÔNOMA A CADA 15 MINUTOS (TODOS OS SUBSISTEMAS INTEGRADOS)
app.get('/api/sentinel/status', (_req, res) => {
  res.json(aiSentinelService.getStatus());
});

app.get('/api/sentinel/logs', (_req, res) => {
  res.json({ logs: aiSentinelService.getHistory() });
});

app.post('/api/sentinel/snapshot', (req, res) => {
  try {
    if (req.body) {
      aiSentinelService.updateCachedSnapshot(req.body);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sentinel/run', async (req, res) => {
  try {
    const liveSnapshot = req.body?.liveSnapshot || req.body;
    const report = await aiSentinelService.runFullSystemAudit('manual_forced', liveSnapshot);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sentinel/resolve', async (req, res) => {
  try {
    const { actionId, fixActionType, payload } = req.body;
    const result = await aiSentinelService.resolveAction(actionId, fixActionType, payload);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🌊 POLO JOÃO PESSOA / PB: CÁLCULO DINÂMICO DE LIMITES DE OXIGÊNIO
 * Integra temperatura ambiente de João Pessoa (PB), nível do mar e salinidade
 * ao modelo físico de saturação de O2 e limiares zootécnicos do AquaCore.
 */
app.get('/api/aqua-core/joao-pessoa-oxygen-config', (req, res) => {
  const ambientTempC = req.query.ambientTempC ? Number(req.query.ambientTempC) : 29.5;
  const waterTempC = req.query.waterTempC ? Number(req.query.waterTempC) : undefined;
  const salinityPpt = req.query.salinityPpt ? Number(req.query.salinityPpt) : 20;
  const species = (req.query.species as any) || 'Litopenaeus vannamei';
  const stage = (req.query.stage as any) || 'Pós-Larva';
  const measuredDo = req.query.measuredDo ? Number(req.query.measuredDo) : undefined;

  const result = aquacultureMath.configureJoaoPessoaCriticalOxygenThresholds(
    { ambientTempC, waterTempC, salinityPpt, species, stage },
    measuredDo
  );

  return res.json(result);
});

app.post('/api/aqua-core/joao-pessoa-oxygen-config', (req, res) => {
  const { ambientTempC, waterTempC, salinityPpt, species, stage, measuredDo } = req.body;
  const result = aquacultureMath.configureJoaoPessoaCriticalOxygenThresholds(
    {
      ambientTempC: ambientTempC ?? 29.5,
      waterTempC,
      salinityPpt: salinityPpt ?? 20,
      species: species ?? 'Litopenaeus vannamei',
      stage: stage ?? 'Pós-Larva',
    },
    measuredDo
  );
  return res.json(result);
});

// 1. Saturação Dinâmica de O2 (Fator 0.8 para segurança de PLs)
const calculateDynamicO2Limit = aquacultureMath.calculateDynamicO2Limit;

// 4. Previsão de Despesca Enriquecida (Crescimento acelerado JP tropical)
const calculateHarvestForecast = aquacultureMath.calculateHarvestForecast;

/**
 * 🛰️ MONITORAMENTO EM TEMPO REAL: GATILHO DE EMERGÊNCIA & OFFLINE SYNC
 */
mqttIngestor.on('data', async (data: any) => {
  // Saturação Dinâmica de O2
  const waterTemp = data.temp || (data.sensor === 'temp' ? data.value : 29.8);
  const o2Limit = calculateDynamicO2Limit(waterTemp);

  if (data.sensor === 'oxygen' && data.value < o2Limit) {
    await messagingHub.processAndSend(PRODUTOR_PHONE, {
      tankId: data.tankId || 'Tanque 01',
      sensor: 'oxygen',
      value: data.value,
      limit: o2Limit,
      tempAgua: waterTemp,
      urgency: 'IMMEDIATE',
    }, MessageLevel.CRITICAL);
  }

  // Validação de Estoque Crítico
  const criticalItems = ['DECOSOLO', 'RAÇÃO SAMARIA STARTER', 'SMART PACK'];
  if (data.sensor === 'stock') {
    criticalItems.forEach(async (item) => {
      if (data[item] != null && data[item] <= 0) {
        await messagingHub.processAndSend(PRODUTOR_PHONE, {
          type: 'STOCK_CRITICAL',
          message: `Item crítico em estoque: ${item}. Quantidade 0. Mínimo: 200kg (ração).`,
          urgency: 'HIGH',
        }, MessageLevel.CRITICAL);
      }
    });
  }

  // Sincronização Offline → WhatsApp
  if (data.type === 'offline_sync') {
    await messagingHub.processAndSend(PRODUTOR_PHONE, {
      farm: 'River Life',
      user: 'Collermhann',
      message: `🔄 Sincronização Offline: ${data.descricao || 'Nutrição, Biometria, Mortalidade, Calagem, Arraçoamento, Analise de água'}. Hora: ${new Date().toLocaleString('pt-BR')}`,
    }, MessageLevel.INFO);
  }
});

// REST Endpoint: Disparo de Sincronização Offline
app.post('/api/aqua-core/offline-sync', async (req, res) => {
  const syncPayload = {
    type: 'offline_sync',
    farm: 'River Life',
    user: 'Collermhann',
    timestamp: new Date().toISOString(),
    recordsCount: req.body?.recordsCount || 24,
  };

  mqttIngestor.emit('data', syncPayload);

  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      farm: 'River Life',
      user: 'Collermhann',
      message: `🔄 Sincronização Offline realizada. Dados: Nutrição, Biometria, Mortalidade, Calagem, Arraçoamento, Analise de água. Hora: ${new Date().toLocaleString('pt-BR')}`,
      urgency: 'INFO',
    },
    MessageLevel.INFO
  );

  return res.json({
    status: 'success',
    syncedAt: new Date().toISOString(),
    message: 'Sincronização offline processada e notificação WhatsApp disparada para Collermhann (+55 84 98858-5211).',
  });
});

// REST Endpoint: Emissão de Nota Fiscal
app.post('/api/aqua-core/invoice/generate', async (req, res) => {
  const { batchCode, quantityKg, pricePerKg, buyerName } = req.body;
  const totalValue = Number(quantityKg) * Number(pricePerKg);

  const message = `📄 NF gerada para ${batchCode || 'Lote_04'}. Quantidade: ${quantityKg}kg | Valor: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Comprador: ${buyerName || 'Frigorífico Polo Paraíba'}. Anexar PDF.`;

  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      type: 'INVOICE_GENERATED',
      message,
      urgency: 'INFO',
    },
    MessageLevel.INFO
  );

  return res.json({
    status: 'success',
    invoiceNumber: `NF-${Math.floor(100000 + Math.random() * 900000)}`,
    batchCode,
    quantityKg,
    pricePerKg,
    totalValue,
    whatsappDispatchedTo: PRODUTOR_PHONE,
    message,
  });
});

// REST Endpoint: Manutenção de Equipamentos
app.post('/api/aqua-core/equipment/maintenance', async (req, res) => {
  const { equipmentName, overdueDays } = req.body;
  const days = overdueDays || 8;

  let message = `⚙️ Manutenção de rotina agendada para ${equipmentName || 'Aerador Palheta 2CV'}.`;
  if (days > 7) {
    message = `⚙️ ALERTA MANUTENÇÃO: Equipamento ${equipmentName || 'Aerador Palheta 2CV'} com manutenção preventiva vencida há ${days} dias. Verificar correias, óleo e rolamentos imediatamente na Fazenda River Life.`;
  }

  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      type: 'EQUIPMENT_MAINTENANCE',
      message,
      urgency: days > 7 ? 'HIGH' : 'LOW',
    },
    days > 7 ? MessageLevel.CRITICAL : MessageLevel.INFO
  );

  return res.json({
    status: 'success',
    equipmentName,
    overdueDays: days,
    alertTriggered: days > 7,
    message,
  });
});

// REST Endpoint: Previsão de Despesca Enriquecida
app.get('/api/aqua-core/harvest-forecast', (req, res) => {
  const currentWeight = req.query.weight ? Number(req.query.weight) : 550;
  const population = req.query.population ? Number(req.query.population) : 15000;
  const days = req.query.days ? Number(req.query.days) : 10;

  const forecast = calculateHarvestForecast(currentWeight, population, days);

  return res.json({
    farm: 'Fazenda River Life',
    location: 'Polo de Mogeiro – PB',
    totalTanks: 7,
    totalPopulation: population,
    currentBiomassKg: Math.round((currentWeight * population) / 1000),
    projectedBiomass10dKg: Math.round(forecast.biomass),
    ...forecast,
  });
});

// REST Endpoint: Microclima ao Vivo via Open-Meteo (Polo de Mogeiro – PB)
app.get('/api/weather/live', async (_req, res) => {
  try {
    const weather = await getLiveMogeiroWeather();
    return res.json(weather);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Cotação de Moedas & Paridade de Insumos (USD/BRL & EUR/BRL)
app.get('/api/market/live-currencies', async (_req, res) => {
  try {
    const currencies = await getLiveCurrencies();
    return res.json(currencies);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Auditoria Geral de Saúde da Fazenda via IA
app.post('/api/ai/farm-health-audit', async (req, res) => {
  try {
    const { farmData } = req.body;
    const auditPrompt = `AUDITORIA COMPLETA DE PRODUÇÃO - FAZENDA RIVER LIFE (POLO DE MOGEIRO – PB):
Realize uma auditoria detalhada dos 7 tanques em cultivo de camarão Litopenaeus vannamei.
Dados: Sobrevivência 98%, FCR 1.35 (meta 1.35), População 15.000 un, Biomassa 8.500 kg, Faturamento projetado R$ 22.500, Custo R$ 12.500.
Emita o parecer do Engenheiro de Produção com impacto financeiro em Reais e diretrizes de manejo para o próximo ciclo de aeração.`;

    const aiResponse = await geminiOracle.getConsultativeResponse({
      question: auditPrompt,
      context: farmData || {},
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis: aiResponse,
      engine: 'AQUA-CORE AI (Gemini 2.5 Flash)',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 🌅 O RITUAL MATINAL: DAILY DIGEST CARCINICULTURA
 */
setInterval(async () => {
  console.log('[Daily Cron] Gerando resumos de lucro para carcinicultura PB...');
  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      farmData: {
        farmName: 'Fazenda Camarão Paraíba',
        stability: 98,
        criticalAlerts: 0,
        tempDeviation: 0.1,
        species: 'Litopenaeus vannamei',
      },
      marketPrices: {
        shrimp_premium: 45.00,
        shrimp_standard: 32.00,
        tilapiaLivePerKg: 10.25,
      },
    },
    MessageLevel.INFO
  );
}, 86400000); // 24 horas

// Production or Vite Dev server middleware
async function start() {
  const distIndexHtml = path.resolve(__dirname, 'dist', 'index.html');
  const hasDist = fs.existsSync(distIndexHtml);
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.RAILWAY_ENVIRONMENT !== undefined ||
    hasDist;

  if (isProduction && hasDist) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ==========================================================
    🚀 AQUA-CORE AI: MODO CARCINICULTURA ATIVADO
    ==========================================================
    📱 Client: ${PRODUTOR_PHONE} (Paraíba/PB)
    🦀 Focus: Litopenaeus vannamei (Pós-Larvas & Engorda)
    🛰️ Sensor Threshold: O2 < 4.0mg/L (Critical)
    🧠 Engine: Gemini 2.5 Flash (Shrimp & Fish Expert)
    🌐 Port: ${PORT} (Orchestrator & Web App Active)
    ==========================================================
    `);
  });

  app.use(errorHandler);
}

start();
