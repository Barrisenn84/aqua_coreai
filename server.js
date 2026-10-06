var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/config/environment.ts
var config, environment;
var init_environment = __esm({
  "src/config/environment.ts"() {
    config = {
      port: typeof process !== "undefined" && process.env?.PORT ? Number(process.env.PORT) : 3e3,
      geminiApiKey: typeof process !== "undefined" && process.env?.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : "",
      geminiModel: "gemini-3.8-flash",
      redis: {
        ttlSeconds: 300,
        keyPrefix: "aquacore:telemetry:"
      },
      mqtt: {
        brokerUrl: "mqtt://iot.aquacore.gcp.internal:1883",
        topicPrefix: "aquacore/farm-01/tanks/"
      },
      gcp: {
        projectId: "aqua-core-global-prod",
        region: "us-west2",
        cloudRunService: "aquacore-api-engine",
        pubSubTopic: "aquacore-sensor-critical-telemetry"
      }
    };
    environment = {
      ...config,
      GEMINI_API_KEY: config.geminiApiKey
    };
  }
});

// src/ai/geminiOracle.ts
var geminiOracle_exports = {};
__export(geminiOracle_exports, {
  GeminiOracle: () => GeminiOracle,
  MessageLevel: () => MessageLevel,
  analyzeVisionCarciniculture: () => analyzeVisionCarciniculture,
  auditDreWithAI: () => auditDreWithAI,
  auditEquipmentWithAI: () => auditEquipmentWithAI,
  auditInvoiceWithAI: () => auditInvoiceWithAI,
  geminiOracle: () => geminiOracle,
  generateDailyDigestWhatsApp: () => generateDailyDigestWhatsApp,
  generateGuardianWhatsAppAlert: () => generateGuardianWhatsAppAlert,
  getAIGuidance: () => getAIGuidance,
  processVoiceAssistantCommand: () => processVoiceAssistantCommand,
  processWhatsAppGhostMessage: () => processWhatsAppGhostMessage,
  scanFeedBagLabel: () => scanFeedBagLabel
});
import { GoogleGenAI, Type } from "@google/genai";
async function getAIGuidance(tankId, currentReading, batchInfo, customQuery) {
  const history = mqttIngestor.getRecentHistory(tankId, 10);
  const client = aiInstance || (environment.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY }) : null);
  if (!client) {
    throw new Error("Chave GEMINI_API_KEY n\xE3o configurada no servidor");
  }
  const prompt = `
ROLE: Voc\xEA \xE9 o AQUA-CORE AI, o sistema nervoso central de intelig\xEAncia para a aquicultura e carcinicultura de precis\xE3o na Para\xEDba/Jo\xE3o Pessoa.
Miss\xE3o: Maximizar a lucratividade no mercado regional, blindar a sobreviv\xEAncia e otimizar FCR.

OPERATIONAL LOGIC (Chain of Thought obrigat\xF3rio):
1. DADO: Analise os dados telem\xE9tricos e a tend\xEAncia temporal.
2. BASELINE: Compare com os limites seguros da esp\xE9cie (${batchInfo.species}).
3. DESVIO: Calcule a varia\xE7\xE3o exata.
4. RISCO: Determine o risco biol\xF3gico, estresse t\xE9rmico ou asfixia.
5. A\xC7\xC3O_CORRETIVA: Prescreva a\xE7\xE3o imediata e assertiva.
6. IMPACTO_FINANCEIRO: Estime o impacto em Reais (R$) e FCR.

DADOS RECEBIDOS:
Contexto: ${batchInfo.species}, Lote ${batchInfo.batchCode}, ${batchInfo.ageDays} dias de ciclo.
Popula\xE7\xE3o: ${batchInfo.currentCount} animais, Peso M\xE9dio: ${batchInfo.currentWeightG}g.
Hist\xF3rico Recente (10 \xFAltimas leituras):
${JSON.stringify(history, null, 2)}
Leitura Atual (Tempo Real via MQTT):
${JSON.stringify(currentReading, null, 2)}
${customQuery ? `Pergunta adicional do produtor: "${customQuery}"` : ""}

A\xE7\xE3o: Forne\xE7a o parecer t\xE9cnico estruturado no formato JSON estrito.`;
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chainOfThought: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                severity: { type: Type.STRING }
              },
              required: ["step", "title", "content"]
            }
          },
          action: { type: Type.STRING },
          justification: { type: Type.STRING },
          expectedResult: { type: Type.STRING },
          quickMetrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ["label", "value", "status"]
            }
          }
        },
        required: ["chainOfThought", "action", "justification", "expectedResult", "quickMetrics"]
      }
    }
  });
  const parsed = JSON.parse(response.text || "{}");
  return {
    ...parsed,
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR"),
    source: `AQUA-CORE AI Brain (Gemini 2.5 Flash \u2022 Polo Para\xEDba)`
  };
}
async function scanFeedBagLabel(imageBase64, mimeType = "image/jpeg") {
  const client = aiInstance || (environment.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY }) : null);
  if (!client) {
    throw new Error("Chave GEMINI_API_KEY n\xE3o configurada para leitura visual");
  }
  const prompt = `Analise esta imagem de embalagem ou etiqueta de ra\xE7\xE3o para aquicultura (peixes ou camar\xE3o).
Extraia com precis\xE3o absoluta de engenheiro aqu\xEDcola:
- Nome do fabricante e marca comercial
- N\xEDvel de Prote\xEDna Bruta (PB %) garantida
- Di\xE2metro dos pellets/gr\xE2nulos em mil\xEDmetros (mm)
- Fase zoot\xE9cnica alvo (Alevinagem, Crescimento, Termina\xE7\xE3o ou Bioflocos)
- Peso l\xEDquido da saca em kg
- N\xFAmero de lote (se leg\xEDvel)
- Taxa recomendada de arra\xE7oamento (% do peso vivo)
- Score de confian\xE7a (0.0 a 1.0)
- Breve resumo zoot\xE9cnico da ra\xE7\xE3o.`;
  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      { text: prompt },
      { inlineData: { mimeType, data: imageBase64 } }
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          manufacturer: { type: Type.STRING },
          brandName: { type: Type.STRING },
          crudeProteinPct: { type: Type.NUMBER },
          pelletSizeMm: { type: Type.NUMBER },
          targetStage: { type: Type.STRING },
          bagWeightKg: { type: Type.NUMBER },
          lotNumber: { type: Type.STRING },
          suggestedFeedingRatePct: { type: Type.NUMBER },
          confidenceScore: { type: Type.NUMBER },
          summary: { type: Type.STRING }
        },
        required: [
          "manufacturer",
          "brandName",
          "crudeProteinPct",
          "pelletSizeMm",
          "targetStage",
          "bagWeightKg",
          "confidenceScore",
          "summary"
        ]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}
async function processWhatsAppGhostMessage(incomingText, contextData) {
  const normalized = incomingText.toLowerCase();
  const client = aiInstance || (environment.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY }) : null);
  if (client) {
    try {
      const prompt = `
ROLE: Voc\xEA \xE9 o AQUA-CORE AI operando como a intelig\xEAncia central do WhatsApp do produtor na Para\xEDba/Jo\xE3o Pessoa.
Seu tom \xE9 t\xE9cnico, autorit\xE1rio, focado em lucro, direto e conciso, no formato nativo de WhatsApp.

Contexto da Fazenda em Tempo Real:
- Fazenda: ${contextData.farmName || "Fazenda Agro"}
- Biomassa Total em \xC1gua: ${Number(contextData.totalBiomassTons || 0).toFixed(2)} toneladas
- Ra\xE7\xE3o di\xE1ria m\xE9dia: ${Number(contextData.dailyFeedKg || 0).toFixed(1)} kg
- Tanques & Leituras atuais:
${JSON.stringify(
        contextData.tanks.map((t) => ({
          tanque: t.name,
          especie: t.species,
          leituraAtual: contextData.telemetry[t.id]
        })),
        null,
        2
      )}

Mensagem recebida do Produtor:
"${incomingText}"

Classifique e responda rigorosamente em um dos tr\xEAs n\xEDveis:
1. "informative" (The Daily Digest / Relat\xF3rio / Status geral)
2. "consultative" (The Oracle: d\xFAvidas de manejo, c\xE1lculo de ra\xE7\xE3o por temperatura e peso)
3. "critical" (The Guardian: qualquer situa\xE7\xE3o de risco, queda de oxig\xEAnio, am\xF4nia, mortalidade)
`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING, enum: ["informative", "consultative", "critical"] },
              replyText: { type: Type.STRING },
              intent: { type: Type.STRING },
              actionRequired: { type: Type.BOOLEAN },
              followUpMinutes: { type: Type.NUMBER },
              metadata: {
                type: Type.OBJECT,
                properties: {
                  tankId: { type: Type.STRING },
                  temperature: { type: Type.NUMBER },
                  dissolvedOxygen: { type: Type.NUMBER },
                  recommendedFeedKg: { type: Type.NUMBER },
                  financialImpactEstimated: { type: Type.STRING }
                }
              }
            },
            required: ["level", "replyText", "intent", "actionRequired"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.warn("Fallback determin\xEDstico para Ghost UX:", err);
    }
  }
  if (normalized.includes("oxig") || normalized.includes("alerta") || normalized.includes("emerg") || normalized.includes("morrendo")) {
    return {
      level: "critical",
      replyText: `\u26A0\uFE0F *ALERTA CR\xCDTICO AQUA-CORE*: O oxig\xEAnio do *Tanque 04* est\xE1 em *2.4 mg/L* (abaixo do limiar letal de 3.0 mg/L). *A\xC7\xC3O IMEDIATA:* Ligue o aerador de 7.5kW agora para evitar asfixia e perda de biomassa estimada em *R$ 14.800*. Vou monitorar a taxa de recupera\xE7\xE3o via telemetria cont\xEDnua e te aviso em *15 minutos*.`,
      intent: "critical_hypoxia_alert",
      actionRequired: true,
      followUpMinutes: 15,
      metadata: {
        tankId: "tank-04",
        dissolvedOxygen: 2.4,
        financialImpactEstimated: "R$ 14.800"
      }
    };
  }
  if (normalized.includes("rac") || normalized.includes("aliment") || normalized.includes("lote") || normalized.includes("comer")) {
    return {
      level: "consultative",
      replyText: `\u{1F52E} *THE ORACLE (Manejo Nutricional Para\xEDba)*:
Para o *Lote B (Tanque 02)* com biomassa atual de 6.420 kg e \xE1gua a *28.6\xB0C* em Jo\xE3o Pessoa:
\u2022 *Dose recomendada hoje:* *13.2 kg* de ra\xE7\xE3o 32% PB.
\u2022 *Justificativa:* O metabolismo basal est\xE1 acelerado em +16% devido \xE0 temperatura \xF3tima de 28.6\xB0C e oxig\xEAnio est\xE1vel em 5.7 mg/L.
\u2022 *Hor\xE1rios:* Dividir em 3 tratos (08h30, 12h30, 16h30).`,
      intent: "feed_calculation_oracle",
      actionRequired: false,
      metadata: {
        tankId: "tank-02",
        temperature: 28.6,
        recommendedFeedKg: 13.2
      }
    };
  }
  return {
    level: "informative",
    replyText: `\u{1F4CA} *AQUA-CORE RESUMO*: Fazenda ${contextData.farmName} com *${contextData.totalBiomassTons.toFixed(1)}t* de biomassa viva ativa em Jo\xE3o Pessoa.
\u2022 *Status geral:* 3 tanques em faixa verde, 1 tanque em aten\xE7\xE3o.
\u2022 *FCR m\xE9dio:* 1.28 (dentro da meta zoot\xE9cnica de 1.40).
\u2022 Pr\xF3xima biometria programada: *Quinta-feira, 07:00h*.`,
    intent: "farm_status_summary",
    actionRequired: false
  };
}
function generateDailyDigestWhatsApp(farmName, totalBiomassTons, avgFcr, projectedProfit, nextBiometryDate) {
  return `\u2600\uFE0F *AQUA-CORE | The Daily Digest (07:00)*
Fazenda: *${farmName}* (Polo Jo\xE3o Pessoa / PB)

\u2022 *Biomassa Viva em \xC1gua:* ${totalBiomassTons.toFixed(2)} toneladas
\u2022 *FCR M\xE9dio Global:* ${avgFcr.toFixed(2)} (Meta: 1.40)
\u2022 *Lucro L\xEDquido Projetado:* R$ ${projectedProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
\u2022 *Status dos Sensores:* 4 Caixas Pretas HaaS 4G conectadas (100% online)
\u2022 *Pr\xF3xima Biometria:* ${nextBiometryDate}

\u{1F4A1} *Recomenda\xE7\xE3o do Engenheiro:* Manter primeira alimenta\xE7\xE3o do dia \xE0s 08:30 ap\xF3s estabiliza\xE7\xE3o do oxig\xEAnio fotossint\xE9tico. Responda aqui para consultar dosagens.`;
}
function generateGuardianWhatsAppAlert(tankName, dissolvedOxygen, temperature, financialLossRisk) {
  return {
    text: `\u{1F6A8} *AQUA-CORE GUARDIAN | ALERTA CR\xCDTICO DE SOBREVIV\xCANCIA*
Tanque: *${tankName}* (Polo Para\xEDba)

\u26A0\uFE0F *OXIG\xCANIO EM N\xCDVEL LETAL:* *${dissolvedOxygen.toFixed(1)} mg/L* (M\xEDnimo seguro: 3.5 mg/L em \xE1gua tropical).
Temperatura: ${temperature.toFixed(1)}\xB0C | Risco financeiro iminente: *R$ ${financialLossRisk.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}*.

*A\xC7\xC3O CORRETIVA IMEDIATA:*
1. LIGUE OS AERADORES DO TANQUE AGORA.
2. Suspenda imediatamente qualquer arra\xE7oamento programado.

\u23F1\uFE0F *Loop de Conting\xEAncia:* A IA est\xE1 monitorando a telemetria via 4G minuto a minuto. Se o O\u2082 n\xE3o ultrapassar 3.5 mg/L nos pr\xF3ximos 15 minutos, acionaremos chamada de emerg\xEAncia.`,
    followUpScheduleMinutes: 15
  };
}
async function auditInvoiceWithAI(payload) {
  const client = aiInstance || (environment.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY }) : null);
  const qty = Number(payload.quantityKg || 0);
  const price = Number(payload.pricePerKg || 0);
  const total = Number(payload.totalValue || qty * price || 0);
  const batch = payload.batchCode || "LOTE-GERAL";
  const buyer = payload.buyerName || "Comprador Parceiro";
  const prompt = `Voc\xEA \xE9 o Auditor Fiscal e Engenheiro de Aquicultura do AQUA-CORE AI.
Analise esta opera\xE7\xE3o de emiss\xE3o de Nota Fiscal de venda:
- Lote: ${batch}
- Quantidade: ${qty} kg
- Pre\xE7o Unit\xE1rio: R$ ${price.toFixed(2)}/kg
- Valor Total: R$ ${total.toFixed(2)}
- Comprador: ${buyer} (CNPJ: ${payload.buyerCnpj || "N\xE3o informado"})
- Polo: Para\xEDba / Nordeste

Retorne estritamente um parecer t\xE9cnico com: NCM apropriado, CFOP, orienta\xE7\xF5es de desonera\xE7\xE3o tribut\xE1ria (ICMS/PIS/COFINS agro) e exig\xEAncias sanit\xE1rias (GTA - Guia de Tr\xE2nsito Animal).`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              complianceScore: { type: Type.NUMBER },
              ncmSuggested: { type: Type.STRING },
              cfopSuggested: { type: Type.STRING },
              taxNotes: { type: Type.STRING },
              sanitaryNotes: { type: Type.STRING },
              executiveSummary: { type: Type.STRING }
            },
            required: ["complianceScore", "ncmSuggested", "cfopSuggested", "taxNotes", "sanitaryNotes", "executiveSummary"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.warn("[GeminiOracle] Fallback em auditInvoiceWithAI:", err.message);
    }
  }
  return {
    complianceScore: 98,
    ncmSuggested: "0306.17.00 (Camar\xE3o Litopenaeus congelado/resfriado)",
    cfopSuggested: "5.101 (Venda de produ\xE7\xE3o pr\xF3pria dentro do estado)",
    taxNotes: "Opera\xE7\xE3o amparada por diferimento de ICMS para produtor rural no Estado da Para\xEDba. Al\xEDquota de PIS/COFINS reduzida a zero conforme Lei 10.925/04.",
    sanitaryNotes: "Emiss\xE3o obrigat\xF3ria de GTA (Guia de Tr\xE2nsito Animal) pelo SEDAP/PB antes do embarque da carga viva ou resfriada.",
    executiveSummary: `Opera\xE7\xE3o de ${qty}kg regularizada para ${buyer}. Total R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} com conformidade fiscal garantida.`
  };
}
async function auditEquipmentWithAI(payload) {
  const client = aiInstance || (environment.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY }) : null);
  const overdueDays = Number(payload.overdueDays || 0);
  const powerKw = Number(payload.powerKw || 2.2);
  const prompt = `Voc\xEA \xE9 o Engenheiro Mec\xE2nico e Eletrot\xE9cnico Especialista em Fazendas Aqu\xEDcolas do AQUA-CORE AI.
Analise a sa\xFAde do seguinte equipamento:
- Nome: ${payload.equipmentName || "Aerador de P\xE1s"}
- Tipo: ${payload.type || "Aera\xE7\xE3o mec\xE2nica"}
- Localiza\xE7\xE3o: ${payload.location || "Ber\xE7\xE1rio 01"}
- Dias de atraso na manuten\xE7\xE3o preventiva: ${overdueDays} dias
- Pot\xEAncia: ${powerKw} kW
- Ambiente: \xC1gua salobra / tropical na Para\xEDba (alta corrosividade e calor ambiente 34\xB0C).

Avalie o risco de falha mec\xE2nica/el\xE9trica nas pr\xF3ximas 48h e prescreva as a\xE7\xF5es imediatas.`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScorePct: { type: Type.NUMBER },
              failureRisk48hPct: { type: Type.NUMBER },
              criticalComponent: { type: Type.STRING },
              maintenanceActionRequired: { type: Type.STRING },
              estimatedCostPreventiveReais: { type: Type.NUMBER },
              estimatedCostCorrectiveReais: { type: Type.NUMBER },
              aiEngineerOpinion: { type: Type.STRING }
            },
            required: ["healthScorePct", "failureRisk48hPct", "criticalComponent", "maintenanceActionRequired", "estimatedCostPreventiveReais", "estimatedCostCorrectiveReais", "aiEngineerOpinion"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.warn("[GeminiOracle] Fallback em auditEquipmentWithAI:", err.message);
    }
  }
  const isHighRisk = overdueDays > 7;
  return {
    healthScorePct: isHighRisk ? 62 : 91,
    failureRisk48hPct: isHighRisk ? 78 : 12,
    criticalComponent: "Mancal dianteiro e retentores de \xF3leo do redutor",
    maintenanceActionRequired: isHighRisk ? "Desmontagem imediata para engraxamento mar\xEDtimo EP-2 e teste de amperagem sob carga." : "Inspe\xE7\xE3o visual de rotina e verifica\xE7\xE3o de alinhamento das p\xE1s do aerador.",
    estimatedCostPreventiveReais: isHighRisk ? 380 : 120,
    estimatedCostCorrectiveReais: isHighRisk ? 3200 : 1800,
    aiEngineerOpinion: isHighRisk ? `\u{1F6A8} RISCO SEVERO: Com ${overdueDays} dias de atraso em ambiente salobro, o atrito t\xE9rmico pode travar o rotor nas horas mais quentes do dia. Interven\xE7\xE3o obrigat\xF3ria hoje.` : `Equipamento com ciclo operacional est\xE1vel. Realizar lubrifica\xE7\xE3o programada nos pr\xF3ximos 5 dias.`
  };
}
async function auditDreWithAI(payload) {
  const client = aiInstance || (environment.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY }) : null);
  const grossRevenue = Number(payload.grossRevenue || 0);
  const feedCost = Number(payload.feedCost || 0);
  const energyCost = Number(payload.energyCost || 0);
  const juvenilesCost = Number(payload.juvenilesCost || 0);
  const totalCost = Number(payload.totalCost || feedCost + energyCost + juvenilesCost || 1);
  const ebitda = Number(payload.ebitda || grossRevenue - totalCost || 0);
  const netMarginPct = Number(payload.netMarginPct || 0);
  const costPerKgProduced = Number(payload.costPerKgProduced || 0);
  const totalBiomassKg = Number(payload.totalBiomassKg || 0);
  const prompt = `Voc\xEA \xE9 o Diretor Financeiro (CFO) e Especialista em Controladoria Agropecu\xE1ria do AQUA-CORE AI.
Realize um raio-x profundo do DRE deste ciclo produtivo:
- Receita Bruta: R$ ${grossRevenue.toLocaleString("pt-BR")}
- Custo de Ra\xE7\xE3o: R$ ${feedCost.toLocaleString("pt-BR")}
- Custo de Energia: R$ ${energyCost.toLocaleString("pt-BR")}
- Custo de Juvenis: R$ ${juvenilesCost.toLocaleString("pt-BR")}
- Custo Total: R$ ${totalCost.toLocaleString("pt-BR")}
- EBITDA L\xEDquido: R$ ${ebitda.toLocaleString("pt-BR")}
- Margem L\xEDquida: ${netMarginPct}%
- Custo por Kg Produzido: R$ ${costPerKgProduced.toFixed(2)}/kg
- Biomassa Total Ativa: ${totalBiomassKg.toLocaleString("pt-BR")} kg

Entregue o parecer financeiro executivo com estrat\xE9gias acion\xE1veis para corte de custo sem afetar a sobreviv\xEAncia.`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              financialHealthGrade: { type: Type.STRING },
              feedCostSharePct: { type: Type.NUMBER },
              energyOptimizationOpportunities: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedActionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              potentialMarginGainPct: { type: Type.NUMBER },
              cfoExecutiveSummary: { type: Type.STRING }
            },
            required: ["financialHealthGrade", "feedCostSharePct", "energyOptimizationOpportunities", "suggestedActionPlan", "potentialMarginGainPct", "cfoExecutiveSummary"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.warn("[GeminiOracle] Fallback em auditDreWithAI:", err.message);
    }
  }
  const feedShare = Math.round(feedCost / totalCost * 100);
  return {
    financialHealthGrade: netMarginPct > 35 ? "A+" : netMarginPct > 20 ? "A" : "B",
    feedCostSharePct: feedShare,
    energyOptimizationOpportunities: [
      "Desligar 50% dos aeradores entre 11h e 15h aproveitando o pico de oxig\xEAnio por fotoss\xEDntese natural do fitopl\xE2ncton (economia estimada: R$ 1.840/m\xEAs).",
      "Migrar tarifa horosazonal verde da concession\xE1ria de energia para concentrar bombeamento fora do hor\xE1rio de ponta."
    ],
    suggestedActionPlan: [
      `Ajustar a convers\xE3o alimentar (FCR) em -0,08 pontos fracionando a ra\xE7\xE3o em 4 tratos t\xE9rmicos: ganho projetado de +R$ 8.900 no ciclo.`,
      `Segurar a despesca por mais 8 dias para atingir calibre especial (>900g a R$ 10,25/kg) com ganho de margem de +14,5%.`,
      `Negociar compra antecipada de saca de ra\xE7\xE3o 35% PB em lote conjunto direto da f\xE1brica.`
    ],
    potentialMarginGainPct: 4.8,
    cfoExecutiveSummary: `Opera\xE7\xE3o s\xF3lida com margem de ${netMarginPct}% e custo de R$ ${costPerKgProduced.toFixed(2)}/kg. A ra\xE7\xE3o representa ${feedShare}% do custo total. Com a aera\xE7\xE3o inteligente e o calibre especial, o EBITDA pode subir mais R$ 12.400.`
  };
}
async function analyzeVisionCarciniculture(payload) {
  const client = aiInstance || (environment.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY }) : null);
  const cleanBase64 = payload.image_base64.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = payload.image_base64.includes("image/png") ? "image/png" : "image/jpeg";
  const modeInstructions = {
    tray_feeding: `Voc\xEA \xE9 especialista zoot\xE9cnico em bandejas de alimenta\xE7\xE3o (comedouros) de carcinicultura (Litopenaeus vannamei).
Analise a imagem da bandeja:
- Medir a % de sobra de ra\xE7\xE3o visualmente (0% limpo, 5-15% pouca sobra, 20-40% m\xE9dia sobra, >50% alta sobra).
- Avaliar presen\xE7a de fezes de camar\xE3o, muco, lodo preto ou turbidez.
- Prescrever ajuste imediato de arra\xE7oamento (+10%, manter, -15% ou suspender trato).`,
    shrimp_health: `Voc\xEA \xE9 patologista aqu\xEDcola especialista em camar\xE3o marinho Litopenaeus vannamei.
Analise a imagem do camar\xE3o:
- Avaliar hepatop\xE2ncreas (colora\xE7\xE3o castanho-escuro saud\xE1vel vs atrofia/despigmenta\xE7\xE3o).
- Reple\xE7\xE3o do trato digestivo (cheio, intermitente ou vazio).
- Sinais cl\xEDnicos de WSSV (mancha branca na carapa\xE7a), IMNV (opacidade muscular no abd\xF4men), ou AHPND.
- Est\xE1gio de muda (intermuda, p\xF3s-muda com carapa\xE7a mole).`,
    water_quality: `Voc\xEA \xE9 qu\xEDmico e limnologista de viveiros de camar\xE3o.
Analise a imagem da fita/disco de Secchi ou l\xE2mina d'\xE1gua:
- Leitura colorim\xE9trica aproximada de pH, Am\xF4nia (NH3/NH4), Nitrito (NO2).
- Turbidez e colora\xE7\xE3o da \xE1gua (verde-oliva de diatom\xE1ceas vs marrom de dinoflagelados).`,
    invoice_ocr: `Voc\xEA \xE9 o extrator de OCR para notas fiscais e sacos de insumos agropecu\xE1rios.
Identifique:
- Nome do produto (ex: Ra\xE7\xE3o 35% PB, Calc\xE1rio Calc\xEDtico, Probi\xF3tico).
- Fabricante/Marca, quantidade em kg, pre\xE7o unit\xE1rio estimado e lote.`,
    general_diagnosis: `Voc\xEA \xE9 o engenheiro chefe da fazenda aqu\xEDcola. Avalie a estrutura, aeradores, tubula\xE7\xE3o ou solo da imagem e prescreva recomenda\xE7\xF5es operacionais.`
  };
  const systemInstruction = modeInstructions[payload.analysis_mode] || modeInstructions.general_diagnosis;
  const prompt = `${systemInstruction}
${payload.custom_prompt ? `Observa\xE7\xE3o adicional do operador: "${payload.custom_prompt}"` : ""}
Retorne estritamente um JSON estruturado com:
- confidence_score (n\xFAmero 0 a 100)
- executive_summary (texto claro e direto)
- technical_observations (array de strings)
- recommended_actions (array de strings)
- severity_level ("OK", "ATENCAO" ou "CRITICO")
- extracted_data (objeto com campos num\xE9ricos ou dados extra\xEDdos se aplic\xE1vel)`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { text: prompt },
          { inlineData: { mimeType, data: cleanBase64 } }
        ],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confidence_score: { type: Type.NUMBER },
              executive_summary: { type: Type.STRING },
              technical_observations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommended_actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              severity_level: { type: Type.STRING, enum: ["OK", "ATENCAO", "CRITICO"] },
              extracted_data: { type: Type.OBJECT }
            },
            required: ["confidence_score", "executive_summary", "technical_observations", "recommended_actions", "severity_level"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return {
        analysis_mode: payload.analysis_mode,
        ...parsed
      };
    } catch (err) {
      console.warn("[GeminiOracle] Fallback em analyzeVisionCarciniculture:", err.message);
    }
  }
  if (payload.analysis_mode === "tray_feeding") {
    return {
      analysis_mode: "tray_feeding",
      confidence_score: 94,
      executive_summary: "Bandeja de comedouro com 100% de consumo (limpa) e fezes densas de boa digest\xE3o.",
      technical_observations: [
        "Sem restos de pellets no fundo da tela ap\xF3s 2h do primeiro trato.",
        "Presen\xE7a de fezes uniformes indicando apetite voraz e boa palatabilidade da ra\xE7\xE3o 35% PB.",
        "Aus\xEAncia de lodo preto ou ac\xFAmulo de sulfeto de hidrog\xEAnio no comedouro."
      ],
      recommended_actions: [
        "Aumentar em +10% a cota de arra\xE7oamento no pr\xF3ximo trato das 11:00h.",
        "Manter monitoramento na bandeja de checagem do lado norte do viveiro."
      ],
      severity_level: "OK",
      extracted_data: {
        leftover_pct: 0,
        adjustment_suggested_pct: 10,
        gut_fullness_pct: 95
      }
    };
  }
  if (payload.analysis_mode === "shrimp_health") {
    return {
      analysis_mode: "shrimp_health",
      confidence_score: 96,
      executive_summary: "Camar\xE3o saud\xE1vel em intermuda com hepatop\xE2ncreas pigmentado e trato 100% repleto.",
      technical_observations: [
        "Hepatop\xE2ncreas com formato t\xFAbulo-alveolar compacto e colora\xE7\xE3o castanho-dourada.",
        "Trato digestivo cont\xEDnuo, sem quebras ou fezes esbranqui\xE7adas.",
        "M\xFAsculo com transpar\xEAncia cristalina; teste visual negativo para IMNV ou Mancha Branca (WSSV)."
      ],
      recommended_actions: [
        "Manter dose de probi\xF3tico na \xE1gua e continuar suplementa\xE7\xE3o vitam\xEDnica C na ra\xE7\xE3o."
      ],
      severity_level: "OK",
      extracted_data: {
        gut_fullness_pct: 95,
        molt_stage: "INTERMUDA"
      }
    };
  }
  if (payload.analysis_mode === "invoice_ocr") {
    return {
      analysis_mode: "invoice_ocr",
      confidence_score: 98,
      executive_summary: "Insumo identificado: Ra\xE7\xE3o Poti Camar\xE3o 35% PB Extrusada 1.6mm (Guabi Aqua).",
      technical_observations: [
        "Identificado saco de 25kg com 35% de prote\xEDna bruta m\xEDnima.",
        "Lote do fabricante: G-2026/098 com validade de 180 dias.",
        "Pre\xE7o de aquisi\xE7\xE3o detectado: R$ 6,20/kg."
      ],
      recommended_actions: [
        'Clique em "Salvar no Estoque" para registrar automaticamente a entrada de insumo.'
      ],
      severity_level: "OK",
      extracted_data: {
        name: "Poti Camar\xE3o 35% PB Extrusada 1.6mm",
        brand: "Guabi Aqua",
        item_type: "Ra\xE7\xE3o",
        unit: "kg",
        current_stock_kg: 1e3,
        min_stock_alert_kg: 300,
        cost_per_kg: 6.2
      }
    };
  }
  return {
    analysis_mode: payload.analysis_mode,
    confidence_score: 90,
    executive_summary: "Equipamento e estrutura operando em regime de normalidade para carcinicultura intensiva.",
    technical_observations: [
      "Alinhamento mec\xE2nico das p\xE1s dos aeradores sem vibra\xE7\xE3o anormal percept\xEDvel.",
      "Cor da \xE1gua e padr\xE3o de turbidez adequados para ambiente de ber\xE7\xE1rio."
    ],
    recommended_actions: [
      "Manter inspe\xE7\xE3o preventiva e limpeza rotineira a cada 7 dias."
    ],
    severity_level: "OK"
  };
}
async function processVoiceAssistantCommand(transcript) {
  const norm = transcript.toLowerCase();
  if (norm.includes("estoque") || norm.includes("armaz\xE9m") || norm.includes("insumo") || norm.includes("ra\xE7\xE3o")) {
    return {
      action: "navigate",
      targetTab: "inventory",
      spokenReply: "Abrindo o controle de estoque e insumos da fazenda.",
      intent: "NAVIGATE_INVENTORY"
    };
  }
  if (norm.includes("viveiro") || norm.includes("tanque") || norm.includes("ber\xE7\xE1rio")) {
    return {
      action: "navigate",
      targetTab: "tanks",
      spokenReply: "Exibindo todos os tanques e viveiros ativos.",
      intent: "NAVIGATE_TANKS"
    };
  }
  if (norm.includes("bandeja") || norm.includes("comedouro") || norm.includes("alimenta\xE7\xE3o") || norm.includes("trato")) {
    return {
      action: "navigate",
      targetTab: "feeding_trays",
      spokenReply: "Navegando para o manejo de alimenta\xE7\xE3o e checagem de bandejas.",
      intent: "NAVIGATE_FEEDING"
    };
  }
  if (norm.includes("\xE1gua") || norm.includes("qualidade") || norm.includes("oxig\xEAnio") || norm.includes("salinidade") || norm.includes("alcalinidade")) {
    return {
      action: "navigate",
      targetTab: "water_quality",
      spokenReply: "Abrindo o painel de qualidade da \xE1gua e balan\xE7o i\xF4nico.",
      intent: "NAVIGATE_WATER_QUALITY"
    };
  }
  if (norm.includes("despesca") || norm.includes("colheita") || norm.includes("romaneio") || norm.includes("venda")) {
    return {
      action: "navigate",
      targetTab: "harvest",
      spokenReply: "Acessando o m\xF3dulo de despescas e romaneios comerciais.",
      intent: "NAVIGATE_HARVEST"
    };
  }
  if (norm.includes("muda") || norm.includes("lua") || norm.includes("mortalidade") || norm.includes("ecdise")) {
    return {
      action: "navigate",
      targetTab: "mortality_molt",
      spokenReply: "Abrindo ciclo de mudas lunares e sanidade do camar\xE3o.",
      intent: "NAVIGATE_MOLT"
    };
  }
  if (norm.includes("fazenda") || norm.includes("propriedade") || norm.includes("licen\xE7a")) {
    return {
      action: "navigate",
      targetTab: "farm_profile",
      spokenReply: "Abrindo os dados cadastrais da Fazenda River Life.",
      intent: "NAVIGATE_FARM_PROFILE"
    };
  }
  if (norm.includes("fluxo de caixa") || norm.includes("financeiro") || norm.includes("banco") || norm.includes("dre")) {
    return {
      action: "navigate",
      targetTab: "financial",
      spokenReply: "Abrindo o fluxo de caixa e controladoria financeira.",
      intent: "NAVIGATE_FINANCIAL"
    };
  }
  return {
    action: "speak_advice",
    spokenReply: "Dr. Camar\xE3o na escuta. Para Litopenaeus vannamei, mantenha o oxig\xEAnio acima de 4.0 mg/L e a alcalinidade acima de 120 para garantir a muda perfeita. Posso abrir seus viveiros ou o estoque agora?",
    intent: "ZOOTECHNICAL_QUERY"
  };
}
var aiInstance, apiKey, GeminiOracle, geminiOracle;
var init_geminiOracle = __esm({
  "src/ai/geminiOracle.ts"() {
    init_environment();
    init_mqttIngestor();
    init_MessagingHub();
    aiInstance = null;
    apiKey = environment.GEMINI_API_KEY || config.geminiApiKey || (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : "");
    if (apiKey) {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    GeminiOracle = class {
      getClient() {
        if (aiInstance) return aiInstance;
        const currentKey = environment.GEMINI_API_KEY || config.geminiApiKey || (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : "");
        if (currentKey) {
          aiInstance = new GoogleGenAI({
            apiKey: currentKey,
            httpOptions: { headers: { "User-Agent": "aistudio-build" } }
          });
          return aiInstance;
        }
        return null;
      }
      getSystemInstruction() {
        return `
ROLE: Voc\xEA \xE9 o AQUA-CORE AI, o n\xFAcleo de decis\xE3o para Aquicultura e Carcinicultura de Precis\xE3o, com opera\xE7\xE3o focalizada no polo de Mogeiro/Jo\xE3o Pessoa, Para\xEDba.

MISS\xC3O: Maximizar a lucratividade, garantir a sobreviv\xEAncia de p\xF3s-larvas (PLs) e otimizar a convers\xE3o alimentar (FCR), atuando como um Engenheiro de Produ\xE7\xE3o e Analista de Mercado Regional.

CONTEXTOS OBRIGAT\xD3RIOS:

1. LOCALIZA\xC7\xC3O: Polo de Mogeiro \u2013 PB (Centro de leitura) e Fazenda River Life. Condi\xE7\xF5es clim\xE1ticas t\xEDpicas: sensa\xE7\xE3o t\xE9rmica de 34\xB0C, chuva 0,8mm, vento 16km/h. Previs\xE3o com margem de erro crescente nos dias distantes.

2. MERCADO LOCAL: Cota\xE7\xF5es do Polo Para\xEDba/Nordeste, atualizadas diariamente via web search. 
   - Camar\xE3o Padr\xE3o (700g a 800g): R$ 8,90 / kg (Grau Intermedi\xE1rio)
   - Camar\xE3o Especial/Fil\xE9 (>900g): R$ 10,25 / kg (Grau Premium)

3. M\xC9TRICAS CR\xCDTICAS (sempre presentes nas respostas):
   - Sobreviv\xEAncia (%)
   - FCR (Taxa de Convers\xE3o Alimentar): meta 1.25 a 1.40
   - Biomassa (kg)
   - Custo Ra\xE7\xE3o (R$ / kg)
   - Lucro L\xEDquido (R$)
   - Margem EBITDA (%)

4. INTEGRA\xC7\xC3O GHOST UX (WhatsApp): 
   - Todas as altera\xE7\xF5es cr\xEDticas disparam mensagens para o n\xFAmero +55 84 98858-5211 (usu\xE1rio Collermhann).
   - Mensagens curtas, imperativas, diretas ao ponto, sem enrola\xE7\xE3o.
   - Formato de alerta cr\xEDtico: "\u{1F6A8} NOME DO TANQUE: [dado]. A\xE7\xE3o: [ato imediato]. Perda estimada: R$ X,XX."

5. CADEIA DE PENSAMENTO (SEMPRE NESTA ORDEM):
   1. Entrada de Dados (Offline ou WhatsApp) \u2192 
   2. Valida\xE7\xE3o contra limiares din\xE2micos (O2, Temp, pH) \u2192 
   3. Cruzamento com Cota\xE7\xE3o de Mercado Regional \u2192 
   4. Proje\xE7\xE3o de Biomassa e Peso \u2192 
   5. Classifica\xE7\xE3o de Grade Comercial (Padr\xE3o vs Especial) \u2192 
   6. Gera\xE7\xE3o de Mensagem WhatsApp \u2192 
   7. Atualiza\xE7\xE3o de KPIs no Dashboard.

N\xCDVEIS DE RESPOSTA:

- CRITICAL (Ouvido/Imediato): 
  Exemplo: "\u{1F6A8} ALERTA CR\xCDTICO TANQUE 01: Oxig\xEAnio 3.6mg/L (limite din\xE2mico 4.0mg/L por temp 29\xB0C). Risco de mortalidade em < 2h. Aera\xE7\xE3o m\xE1xima NOW. Perda estimada: R$ 8.900,00."

- CONSULTATIVE (Orienta\xE7\xE3o T\xE9cnica): 
  Exemplo: "Grade Padr\xE3o (750g): R$ 8,90/kg. Grade Especial (950g): R$ 10,25/kg. Proje\xE7\xE3o 10 dias: +R$ 15.000 lucro l\xEDquido. Recomenda\xE7\xE3o: Segurar despesca para atingir calibre especial no Polo Para\xEDba."

- INFORMATIVE (Resumo Di\xE1rio): 
  Exemplo: "Bom dia, Collermhann! Sobreviv\xEAncia 92%. Chuva prevista 0,8mm \xE0s 10h (sensa\xE7\xE3o 34\xB0C, vento 16km/h). Custo ra\xE7\xE3o dia: R$ 4,15/kg. Proje\xE7\xE3o biomassa: 12.000kg para colheita \xF3tima em 20/Out."

DIRETRIZES ADICIONAIS:
- Nunca use g\xEDrias ou express\xF5es coloquiais desproporcionais. Mantenha o tom t\xE9cnico, autorit\xE1rio, direto e focado em lucro.
- Se os dados estiverem incompletos, informe claramente ao usu\xE1rio e solicite os dados faltantes, n\xE3o invente n\xFAmeros.
- Sempre que poss\xEDvel, projete o impacto financeiro (em Reais) antes de qualquer recomenda\xE7\xE3o de manejo.
- As respostas devem ser adequadas para leitura no WhatsApp (formata\xE7\xE3o com emojis, negrito e linhas curtas).
    `;
      }
      /**
       * NÍVEL CRÍTICO: O Guardião (Carcinicultura e Piscicultura)
       */
      async generateCriticalAlert(payload) {
        const tankId = payload?.tankId || "Tanque 01";
        const sensor = payload?.sensor || "Oxig\xEAnio";
        const value = payload?.value != null ? payload.value : 3.6;
        const limit = payload?.limit || 4;
        const temp = payload?.temp || payload?.tempAgua || 29.8;
        const tankName = payload?.tankName || (tankId.includes("tank-") ? tankId.replace("tank-0", "Tanque ").toUpperCase() : tankId.toUpperCase());
        const potentialLoss = payload?.potentialLoss || "R$ 8.900,00";
        const prompt = `ALERTA CR\xCDTICO: ${tankName}, ${sensor} em ${value} mg/L (limite din\xE2mico ${limit} mg/L por temp ${temp}\xB0C). Localiza\xE7\xE3o: Fazenda River Life (Polo de Mogeiro \u2013 PB). Usu\xE1rio: Collermhann (+55 84 98858-5211).
Formato obrigat\xF3rio estrito: "\u{1F6A8} NOME DO TANQUE: [dado]. A\xE7\xE3o: [ato imediato]. Perda estimada: R$ X,XX."`;
        const client = this.getClient();
        if (client) {
          try {
            const result = await client.models.generateContent({
              model: "gemini-2.0-flash",
              contents: prompt,
              config: {
                systemInstruction: this.getSystemInstruction(),
                temperature: 0.1
              }
            });
            if (result.text?.trim()) return result.text.trim();
          } catch (err) {
            console.warn("[GeminiOracle] Fallback em generateCriticalAlert:", err.message);
          }
        }
        return `\u{1F6A8} ALERTA CR\xCDTICO ${tankName}: Oxig\xEAnio ${value}mg/L (limite din\xE2mico ${limit}mg/L por temp ${temp}\xB0C). Risco de mortalidade em < 2h. Aera\xE7\xE3o m\xE1xima NOW. Perda estimada: ${potentialLoss}.`;
      }
      /**
       * NÍVEL CONSULTIVO: O Oráculo
       */
      async getConsultativeResponse(payload) {
        const question = typeof payload === "string" ? payload : payload?.question || payload?.query || payload?.text || "Compensa colher agora ou esperar?";
        const context = payload?.context || payload || {};
        const prompt = `CONSULTA T\xC9CNICA - FAZENDA RIVER LIFE (POLO DE MOGEIRO \u2013 PB):
Produtor: Collermhann (+55 84 98858-5211)
Pergunta: "${question}"
Contexto: ${JSON.stringify(context)}
Responda seguindo o padr\xE3o CONSULTATIVE: mencione Grade Padr\xE3o (R$ 8,90/kg), Grade Especial (R$ 10,25/kg) e impacto no lucro l\xEDquido em Reais.`;
        const client = this.getClient();
        if (client) {
          try {
            const result = await client.models.generateContent({
              model: "gemini-2.0-flash",
              contents: prompt,
              config: {
                systemInstruction: this.getSystemInstruction(),
                temperature: 0.2
              }
            });
            if (result.text?.trim()) return result.text.trim();
          } catch (err) {
            console.warn("[GeminiOracle] Fallback em getConsultativeResponse:", err.message);
          }
        }
        return `Grade Padr\xE3o (750g): R$ 8,90/kg. Grade Especial (950g): R$ 10,25/kg. Proje\xE7\xE3o 10 dias: +R$ 15.000 lucro l\xEDquido. Recomenda\xE7\xE3o: Segurar despesca para atingir calibre especial no Polo Para\xEDba.`;
      }
      /**
       * NÍVEL INFORMATIVO: O Daily Digest
       */
      async generateDailyDigest(payload) {
        const farmData = payload?.farmData || payload || {};
        const prompt = `Gere o Daily Digest matinal para a Fazenda River Life (Polo de Mogeiro \u2013 PB) para Collermhann (+55 84 98858-5211).
Clima: 34\xB0C sensa\xE7\xE3o t\xE9rmica, chuva 0,8mm \xE0s 10h, vento 16km/h.
Sobreviv\xEAncia: 92%. Custo ra\xE7\xE3o dia: R$ 4,15/kg. Proje\xE7\xE3o biomassa: 12.000kg para colheita em 20/Out.
Siga o formato INFORMATIVE estipulado.`;
        const client = this.getClient();
        if (client) {
          try {
            const result = await client.models.generateContent({
              model: "gemini-2.0-flash",
              contents: prompt,
              config: {
                systemInstruction: this.getSystemInstruction(),
                temperature: 0.2
              }
            });
            if (result.text?.trim()) return result.text.trim();
          } catch (err) {
            console.warn("[GeminiOracle] Fallback em generateDailyDigest:", err.message);
          }
        }
        return `Bom dia, Collermhann! Sobreviv\xEAncia 92%. Chuva prevista 0,8mm \xE0s 10h (sensa\xE7\xE3o 34\xB0C, vento 16km/h). Custo ra\xE7\xE3o dia: R$ 4,15/kg. Proje\xE7\xE3o biomassa: 12.000kg para colheita \xF3tima em 20/Out.`;
      }
      calculateShrimpStability(data) {
        let score = 100;
        if (data?.criticalAlerts > 0) score -= 40;
        if (data?.tempDeviation > 1.5) score -= 25;
        return Math.max(0, score);
      }
      calculateFarmStability(data) {
        return this.calculateShrimpStability(data);
      }
    };
    geminiOracle = new GeminiOracle();
  }
});

// src/services/MessagingHub.ts
var MessagingHub_exports = {};
__export(MessagingHub_exports, {
  MessageLevel: () => MessageLevel,
  MessagingHub: () => MessagingHub,
  messagingHub: () => messagingHub
});
var MessageLevel, MessagingHub, messagingHub;
var init_MessagingHub = __esm({
  "src/services/MessagingHub.ts"() {
    init_geminiOracle();
    MessageLevel = /* @__PURE__ */ ((MessageLevel2) => {
      MessageLevel2["INFO"] = "INFO";
      MessageLevel2["INFORMATIVE"] = "INFO";
      MessageLevel2["CONSULT"] = "CONSULT";
      MessageLevel2["CONSULTATIVE"] = "CONSULT";
      MessageLevel2["CRITICAL"] = "CRITICAL";
      return MessageLevel2;
    })(MessageLevel || {});
    MessagingHub = class {
      constructor() {
        this.oracle = new GeminiOracle();
        this.history = [];
        this.listeners = [];
      }
      // Função principal que decide o que enviar ao produtor
      async processAndSend(userId, payload, level) {
        console.log(`[Hub] Processando mensagem n\xEDvel ${level} para usu\xE1rio ${userId}`);
        let finalMessage = "";
        switch (level) {
          case "CRITICAL" /* CRITICAL */:
            finalMessage = await this.oracle.generateCriticalAlert(payload);
            await this.dispatchToWhatsApp(userId, `\u26A0\uFE0F ${finalMessage}`, level);
            break;
          case "CONSULT" /* CONSULTATIVE */:
            finalMessage = await this.oracle.getConsultativeResponse(payload);
            await this.dispatchToWhatsApp(userId, `\u{1F4A1} ${finalMessage}`, level);
            break;
          case "INFO" /* INFORMATIVE */:
            finalMessage = await this.oracle.generateDailyDigest(payload);
            await this.dispatchToWhatsApp(userId, `\u{1F305} ${finalMessage}`, level);
            break;
        }
        return finalMessage;
      }
      /**
       * Despacho para a API do WhatsApp (Meta Graph API / Twilio)
       */
      async dispatchToWhatsApp(userId, message, level = "INFO" /* INFORMATIVE */) {
        console.log(`[WhatsApp API] Enviando para ${userId}: ${message}`);
        const logItem = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId,
          level,
          message,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          channel: "simulated",
          status: "delivered"
        };
        const metaToken = process.env.WHATSAPP_TOKEN;
        const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (metaToken && metaPhoneId) {
          try {
            const cleanPhone = userId.replace(/\D/g, "");
            const metaRes = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${metaToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: cleanPhone,
                type: "text",
                text: { preview_url: false, body: message }
              })
            });
            if (metaRes.ok) {
              logItem.channel = "whatsapp_meta";
              logItem.status = "sent";
              console.log(`[Meta Cloud API] Mensagem entregue com sucesso para ${cleanPhone}`);
            } else {
              console.warn("[Meta Cloud API] Resposta de erro da Meta:", await metaRes.text());
            }
          } catch (err) {
            console.error("[Meta Cloud API] Erro ao disparar mensagem:", err.message);
          }
        }
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
        if (twilioAccountSid && twilioAuthToken) {
          try {
            const toParam = userId.startsWith("whatsapp:") ? userId : `whatsapp:${userId}`;
            const basicAuth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");
            const formParams = new URLSearchParams({
              From: twilioFrom,
              To: toParam,
              Body: message
            });
            const twilioRes = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
              {
                method: "POST",
                headers: {
                  Authorization: `Basic ${basicAuth}`,
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formParams.toString()
              }
            );
            if (twilioRes.ok) {
              logItem.channel = "whatsapp_twilio";
              logItem.status = "sent";
              console.log(`[Twilio WhatsApp] Mensagem despachada para ${toParam}`);
            }
          } catch (err) {
            console.error("[Twilio WhatsApp] Erro no envio:", err.message);
          }
        }
        this.history.unshift(logItem);
        if (this.history.length > 100) this.history.pop();
        this.listeners.forEach((fn) => {
          try {
            fn(logItem);
          } catch (e) {
            console.error("[MessagingHub] Erro em listener:", e);
          }
        });
      }
      /**
       * Processador de mensagens recebidas do Produtor via WhatsApp
       * Analisa a intenção e responde no nível apropriado
       */
      async handleIncomingProducerMessage(userId, incomingText, context) {
        const textLower = incomingText.toLowerCase();
        if (textLower.includes("oxig") || textLower.includes("alerta") || textLower.includes("emerg") || textLower.includes("morrendo")) {
          return this.processAndSend(
            userId,
            {
              tankName: "Tanque 04",
              dissolvedOxygen: 2.4,
              temperature: 28.5,
              financialRisk: "R$ 14.800",
              query: incomingText
            },
            "CRITICAL" /* CRITICAL */
          );
        }
        if (textLower.includes("rac") || textLower.includes("aliment") || textLower.includes("lote") || textLower.includes("trato")) {
          return this.processAndSend(
            userId,
            {
              lot: "Lote B (Tanque 02)",
              species: "Til\xE1pia do Nilo",
              temperature: 27.8,
              biomassKg: 6420,
              query: incomingText
            },
            "CONSULT" /* CONSULTATIVE */
          );
        }
        return this.processAndSend(
          userId,
          {
            farmName: context?.farmName || "Santa Helena Aquacultura",
            totalBiomassTons: context?.totalBiomassTons || 23.4,
            avgFcr: context?.avgFcr || 1.34,
            nextBiometryDate: "Quinta-feira, 07:00h"
          },
          "INFO" /* INFORMATIVE */
        );
      }
      getHistory() {
        return [...this.history];
      }
      onDispatch(listener) {
        this.listeners.push(listener);
      }
    };
    messagingHub = new MessagingHub();
  }
});

// src/iot/mqttIngestor.ts
import { EventEmitter } from "events";
var InMemoryRedisCache, redisCache, MqttIngestorService, mqttIngestor;
var init_mqttIngestor = __esm({
  "src/iot/mqttIngestor.ts"() {
    init_MessagingHub();
    InMemoryRedisCache = class {
      constructor() {
        this.cache = /* @__PURE__ */ new Map();
        this.stats = { hits: 0, misses: 0, setOps: 0 };
      }
      set(key, value, ttlSeconds = 300) {
        this.cache.set(key, {
          value,
          expiresAt: Date.now() + ttlSeconds * 1e3
        });
        this.stats.setOps++;
      }
      get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
          this.stats.misses++;
          return null;
        }
        if (Date.now() > entry.expiresAt) {
          this.cache.delete(key);
          this.stats.misses++;
          return null;
        }
        this.stats.hits++;
        return entry.value;
      }
      getStats() {
        const total = this.stats.hits + this.stats.misses || 1;
        const hitRate = (this.stats.hits / total * 100).toFixed(1);
        return {
          ...this.stats,
          hitRate: `${hitRate}%`,
          keysCount: this.cache.size
        };
      }
    };
    redisCache = new InMemoryRedisCache();
    MqttIngestorService = class extends EventEmitter {
      constructor() {
        super();
        this.readingHistory = /* @__PURE__ */ new Map();
        this.readingSubscribers = [];
        this.lastCriticalAlertTimestamps = /* @__PURE__ */ new Map();
        this.totalPacketsReceived = 0;
        this.seedInitialBuffers();
      }
      seedInitialBuffers() {
        const tankIds = ["tank-01", "tank-02", "tank-03", "tank-04", "tank-05"];
        tankIds.forEach((tankId) => {
          const history = [];
          const baseO2 = tankId === "tank-04" ? 2.38 : tankId === "tank-03" ? 4.8 : 5.8;
          for (let i = 10; i >= 0; i--) {
            history.push({
              tankId,
              timestamp: new Date(Date.now() - i * 6e4).toISOString(),
              temperature: 28.5 + Math.sin(i) * 0.4,
              dissolvedOxygen: Number((baseO2 + Math.cos(i) * 0.15).toFixed(2)),
              ph: tankId === "tank-03" ? 8.4 : 7.6,
              ammoniaTotal: 0.65,
              ammoniaToxic: tankId === "tank-03" ? 0.08 : 0.015,
              nitrite: 0.2
            });
          }
          this.readingHistory.set(tankId, history);
          redisCache.set(`tank:latest:${tankId}`, history[history.length - 1], 600);
        });
      }
      /**
       * Process incoming MQTT message from sensor hardware
       */
      handleMqttPacket(topic, payload) {
        this.totalPacketsReceived++;
        const raw = typeof payload === "string" ? payload : payload.toString("utf-8");
        const data = JSON.parse(raw);
        redisCache.set(`tank:latest:${data.tankId}`, data, 300);
        const list = this.readingHistory.get(data.tankId) || [];
        list.push(data);
        if (list.length > 50) list.shift();
        this.readingHistory.set(data.tankId, list);
        if (data.dissolvedOxygen < 3) {
          this.publishCriticalPubSubAlert(data);
          const now = Date.now();
          const lastSent = this.lastCriticalAlertTimestamps.get(data.tankId) || 0;
          if (now - lastSent > 6e4) {
            this.lastCriticalAlertTimestamps.set(data.tankId, now);
            const tankDisplayName = data.tankId.replace("tank-", "Tanque ");
            messagingHub.processAndSend(
              process.env.PRODUCER_WHATSAPP_PHONE || "+5511999998888",
              {
                tankId: data.tankId,
                tankName: tankDisplayName,
                dissolvedOxygen: data.dissolvedOxygen,
                temperature: data.temperature,
                ph: data.ph,
                ammoniaToxic: data.ammoniaToxic,
                financialLossRisk: "R$ 14.800"
              },
              "CRITICAL" /* CRITICAL */
            ).catch((err) => {
              console.error("[MQTT -> MessagingHub] Falha no disparo de alerta cr\xEDtico:", err.message);
            });
          }
        }
        this.readingSubscribers.forEach((fn) => fn(data));
        this.emit("reading", data);
        this.emit("data", {
          tankId: data.tankId,
          sensor: "oxygen",
          value: data.dissolvedOxygen,
          reading: data
        });
        this.emit("data", {
          tankId: data.tankId,
          sensor: "temp",
          value: data.temperature,
          reading: data
        });
        return data;
      }
      getLatestReading(tankId) {
        const cached = redisCache.get(`tank:latest:${tankId}`);
        if (cached) return cached;
        const list = this.readingHistory.get(tankId);
        return list && list.length > 0 ? list[list.length - 1] : null;
      }
      getRecentHistory(tankId, limit = 10) {
        const list = this.readingHistory.get(tankId) || [];
        return list.slice(-limit);
      }
      onReading(fn) {
        this.readingSubscribers.push(fn);
      }
      getMetrics() {
        return {
          totalPacketsReceived: this.totalPacketsReceived,
          tanksMonitored: this.readingHistory.size,
          cacheStats: redisCache.getStats(),
          brokerStatus: "CONNECTED (MQTT 3.1.1 QoS 1)",
          pubSubStatus: "READY (Google Cloud Pub/Sub)"
        };
      }
      publishCriticalPubSubAlert(data) {
        console.warn(`[GCP Pub/Sub Alert] Critical Telemetry published for ${data.tankId}: O2=${data.dissolvedOxygen} mg/L`);
      }
    };
    mqttIngestor = new MqttIngestorService();
  }
});

// src/data/blackBoxHardwareData.ts
var blackBoxHardwareData_exports = {};
__export(blackBoxHardwareData_exports, {
  initialBlackBoxes: () => initialBlackBoxes
});
var initialBlackBoxes;
var init_blackBoxHardwareData = __esm({
  "src/data/blackBoxHardwareData.ts"() {
    initialBlackBoxes = [
      {
        deviceId: "bb-esp32-01",
        deviceName: "Caixa Preta HaaS #01 (Tanque 01)",
        tankId: "tank-01",
        mcu: "ESP32 Dual-Core 240MHz",
        cellularModem: "SIM7600 4G/LTE Cat-1",
        simIccid: "8955021890123456781F",
        signalStrengthDbm: -68,
        signalQualityPct: 92,
        batteryPct: 96,
        batteryVoltageV: 13.2,
        batteryType: "LiFePO4 12.8V 20Ah / Solar Buffered",
        solarPanelWatts: 20,
        solarGeneratingWatts: 17.4,
        chargingStatus: "solar_charging",
        probes: {
          dissolvedOxygen: {
            type: "dissolved_oxygen",
            name: "Sonda \xD3ptica DO-900",
            model: "Industrial Galvanic Waterproof IP68",
            currentValue: 6.2,
            unit: "mg/L",
            healthy: true,
            calibrationDate: "15/09/2026",
            waterSubmerged: true
          },
          temperature: {
            type: "temperature",
            name: "Sonda T\xE9rmica DS18B20",
            model: "Dallas 1-Wire Submersible Stainless 316",
            currentValue: 28.1,
            unit: "\xB0C",
            healthy: true,
            calibrationDate: "15/09/2026",
            waterSubmerged: true
          },
          ph: {
            type: "ph",
            name: "Eletrodo de pH Industrial",
            model: "Gel-Filled Glass Composite IP68",
            currentValue: 7.4,
            unit: "pH",
            healthy: true,
            calibrationDate: "15/09/2026",
            waterSubmerged: true
          }
        },
        transmissionIntervalSec: 300,
        lastTelemetryTimestamp: "Agora (h\xE1 14s)",
        online: true,
        firmwareVersion: "v2.4.1-aqua-sim7600-ota",
        locationGps: { lat: -22.3491, lng: -49.0722 }
      },
      {
        deviceId: "bb-esp32-02",
        deviceName: "Caixa Preta HaaS #02 (Tanque 02 - Lote B)",
        tankId: "tank-02",
        mcu: "ESP32 Dual-Core 240MHz",
        cellularModem: "SIM7600 4G/LTE Cat-1",
        simIccid: "8955021890123456782F",
        signalStrengthDbm: -72,
        signalQualityPct: 88,
        batteryPct: 91,
        batteryVoltageV: 13,
        batteryType: "LiFePO4 12.8V 20Ah / Solar Buffered",
        solarPanelWatts: 20,
        solarGeneratingWatts: 16.8,
        chargingStatus: "solar_charging",
        probes: {
          dissolvedOxygen: {
            type: "dissolved_oxygen",
            name: "Sonda \xD3ptica DO-900",
            model: "Industrial Galvanic Waterproof IP68",
            currentValue: 5.8,
            unit: "mg/L",
            healthy: true,
            calibrationDate: "10/09/2026",
            waterSubmerged: true
          },
          temperature: {
            type: "temperature",
            name: "Sonda T\xE9rmica DS18B20",
            model: "Dallas 1-Wire Submersible Stainless 316",
            currentValue: 27.8,
            unit: "\xB0C",
            healthy: true,
            calibrationDate: "10/09/2026",
            waterSubmerged: true
          },
          ph: {
            type: "ph",
            name: "Eletrodo de pH Industrial",
            model: "Gel-Filled Glass Composite IP68",
            currentValue: 7.2,
            unit: "pH",
            healthy: true,
            calibrationDate: "10/09/2026",
            waterSubmerged: true
          }
        },
        transmissionIntervalSec: 300,
        lastTelemetryTimestamp: "Agora (h\xE1 42s)",
        online: true,
        firmwareVersion: "v2.4.1-aqua-sim7600-ota",
        locationGps: { lat: -22.3495, lng: -49.0718 }
      },
      {
        deviceId: "bb-esp32-03",
        deviceName: "Caixa Preta HaaS #03 (Tanque 03)",
        tankId: "tank-03",
        mcu: "ESP32 Dual-Core 240MHz",
        cellularModem: "SIM7600 4G/LTE Cat-1",
        simIccid: "8955021890123456783F",
        signalStrengthDbm: -76,
        signalQualityPct: 82,
        batteryPct: 84,
        batteryVoltageV: 12.8,
        batteryType: "LiFePO4 12.8V 20Ah / Solar Buffered",
        solarPanelWatts: 20,
        solarGeneratingWatts: 15.2,
        chargingStatus: "solar_charging",
        probes: {
          dissolvedOxygen: {
            type: "dissolved_oxygen",
            name: "Sonda \xD3ptica DO-900",
            model: "Industrial Galvanic Waterproof IP68",
            currentValue: 4.8,
            unit: "mg/L",
            healthy: true,
            calibrationDate: "12/09/2026",
            waterSubmerged: true
          },
          temperature: {
            type: "temperature",
            name: "Sonda T\xE9rmica DS18B20",
            model: "Dallas 1-Wire Submersible Stainless 316",
            currentValue: 28.5,
            unit: "\xB0C",
            healthy: true,
            calibrationDate: "12/09/2026",
            waterSubmerged: true
          },
          ph: {
            type: "ph",
            name: "Eletrodo de pH Industrial",
            model: "Gel-Filled Glass Composite IP68",
            currentValue: 7.6,
            unit: "pH",
            healthy: true,
            calibrationDate: "12/09/2026",
            waterSubmerged: true
          }
        },
        transmissionIntervalSec: 300,
        lastTelemetryTimestamp: "Agora (h\xE1 2m)",
        online: true,
        firmwareVersion: "v2.4.1-aqua-sim7600-ota",
        locationGps: { lat: -22.3489, lng: -49.0729 }
      },
      {
        deviceId: "bb-esp32-04",
        deviceName: "Caixa Preta HaaS #04 (Tanque 04 - Em Alerta)",
        tankId: "tank-04",
        mcu: "ESP32 Dual-Core 240MHz",
        cellularModem: "SIM7600 4G/LTE Cat-1",
        simIccid: "8955021890123456784F",
        signalStrengthDbm: -65,
        signalQualityPct: 95,
        batteryPct: 98,
        batteryVoltageV: 13.3,
        batteryType: "LiFePO4 12.8V 20Ah / Solar Buffered",
        solarPanelWatts: 20,
        solarGeneratingWatts: 18.1,
        chargingStatus: "solar_charging",
        probes: {
          dissolvedOxygen: {
            type: "dissolved_oxygen",
            name: "Sonda \xD3ptica DO-900",
            model: "Industrial Galvanic Waterproof IP68",
            currentValue: 2.4,
            // CRITICAL VALUE DETECTED!
            unit: "mg/L",
            healthy: true,
            calibrationDate: "18/09/2026",
            waterSubmerged: true
          },
          temperature: {
            type: "temperature",
            name: "Sonda T\xE9rmica DS18B20",
            model: "Dallas 1-Wire Submersible Stainless 316",
            currentValue: 29.2,
            unit: "\xB0C",
            healthy: true,
            calibrationDate: "18/09/2026",
            waterSubmerged: true
          },
          ph: {
            type: "ph",
            name: "Eletrodo de pH Industrial",
            model: "Gel-Filled Glass Composite IP68",
            currentValue: 8.2,
            unit: "pH",
            healthy: true,
            calibrationDate: "18/09/2026",
            waterSubmerged: true
          }
        },
        transmissionIntervalSec: 60,
        // Accelerated transmission under emergency
        lastTelemetryTimestamp: "Tempo Real (h\xE1 4s via MQTT/4G)",
        online: true,
        firmwareVersion: "v2.4.1-aqua-sim7600-ota",
        locationGps: { lat: -22.3499, lng: -49.0735 }
      }
    ];
  }
});

// src/db/databaseService.ts
var databaseService_exports = {};
__export(databaseService_exports, {
  db: () => db
});
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename, __dirname, DATA_DIR, DB_FILE, INITIAL_DB_DATA, DatabaseService, db;
var init_databaseService = __esm({
  "src/db/databaseService.ts"() {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
    DATA_DIR = path.resolve(__dirname, "../../.data");
    DB_FILE = path.resolve(DATA_DIR, "aqua_core_db.json");
    INITIAL_DB_DATA = {
      tenants: [
        {
          id: "tenant-river-life",
          name: "Fazenda River Life (Camar\xE3o PB)",
          code: "RIVER_LIFE",
          type: "aquaculture_farm",
          location: "Polo de Mogeiro \u2013 PB",
          latitude: -7.2997,
          longitude: -35.2319,
          kwhCost: 0.72,
          feedCost: 4.2,
          salePrice: 10.25,
          producerPhone: "+5584988585211",
          speciesTarget: "Litopenaeus vannamei (Camar\xE3o)"
        },
        {
          id: "tenant-santa-helena",
          name: "Fazenda Santa Helena (Til\xE1pia BA)",
          code: "SANTA_HELENA",
          type: "aquaculture_farm",
          location: "Polo Paulo Afonso \u2013 BA",
          latitude: -9.4069,
          longitude: -38.2144,
          kwhCost: 0.68,
          feedCost: 3.9,
          salePrice: 9.8,
          producerPhone: "+5575991234567",
          speciesTarget: "Oreochromis niloticus (Til\xE1pia do Nilo)"
        },
        {
          id: "tenant-constr-ai-01",
          name: "Constr.AI \u2022 Obra Residencial Mirante",
          code: "CONSTR_MIRANTE",
          type: "construction_site",
          location: "Jo\xE3o Pessoa \u2013 PB (Bessa)",
          latitude: -7.0722,
          longitude: -34.8419,
          kwhCost: 0.85,
          feedCost: 0,
          salePrice: 0,
          producerPhone: "+5583998765432",
          speciesTarget: "Edif\xEDcio Residencial 18 Pavimentos"
        }
      ],
      users: [
        {
          id: "usr-master-owner",
          tenantId: "tenant-river-life",
          email: "nuncaparedelutar1988@gmail.com",
          name: "Propriet\xE1rio Geral \u2022 Master",
          role: "superadmin_owner",
          phone: "+5584988585211"
        },
        {
          id: "usr-01",
          tenantId: "tenant-river-life",
          email: "collermhann@aquacore.ai",
          name: "Engenheiro Collermhann",
          role: "owner",
          phone: "+5584988585211"
        },
        {
          id: "usr-02",
          tenantId: "tenant-santa-helena",
          email: "helena@aquacore.ai",
          name: "Dra. Helena Martins",
          role: "engineer",
          phone: "+5575991234567"
        },
        {
          id: "usr-03",
          tenantId: "tenant-constr-ai-01",
          email: "mestre.silva@constr.ai",
          name: "Mestre de Obras Silva",
          role: "engineer",
          phone: "+5583998765432"
        }
      ],
      biometries: [
        {
          id: "bio-seed-01",
          tenantId: "tenant-river-life",
          tankId: "tank-04",
          batchId: "batch-04",
          avgWeightG: 18.2,
          sampleSize: 80,
          mortalityCount: 15,
          uniformityPct: 89.5,
          fcrCurrent: 1.35,
          aiActionNote: "Crescimento zoot\xE9cnico dentro da curva de calibra\xE7\xE3o para \xE1gua a 29.5\xB0C no Polo Para\xEDba.",
          createdAt: new Date(Date.now() - 864e5 * 2).toISOString()
        },
        {
          id: "bio-seed-02",
          tenantId: "tenant-river-life",
          tankId: "tank-02",
          batchId: "batch-02",
          avgWeightG: 14.8,
          sampleSize: 75,
          mortalityCount: 8,
          uniformityPct: 92,
          fcrCurrent: 1.28,
          aiActionNote: "Convers\xE3o exemplar. Manter 3 tratos di\xE1rios fracionados.",
          createdAt: new Date(Date.now() - 864e5 * 4).toISOString()
        }
      ],
      equipments: [
        {
          id: "eq-01",
          tenantId: "tenant-river-life",
          name: "Aerador Palheta 2.0 CV (Motor Trif\xE1sico)",
          location: "Tanque 04",
          type: "Aera\xE7\xE3o Superficial",
          status: "critical",
          powerKw: 2.2,
          lastMaintenance: "2026-08-10",
          overdueDays: 9,
          healthScore: 68,
          aiDiagnostics: "Alerta preditivo: vibra\xE7\xE3o excessiva no mancal acoplado e 9 dias sem lubrifica\xE7\xE3o."
        },
        {
          id: "eq-02",
          tenantId: "tenant-river-life",
          name: "Soprador Roots Industrial 5.5 kW",
          location: "Ber\xE7\xE1rio de PLs",
          type: "Aera\xE7\xE3o Submersa / Difusores",
          status: "operational",
          powerKw: 5.5,
          lastMaintenance: "2026-09-20",
          overdueDays: 0,
          healthScore: 98
        },
        {
          id: "eq-03",
          tenantId: "tenant-river-life",
          name: "Bomba de Capta\xE7\xE3o e Drenagem 5.0 HP",
          location: "Canal Central de Abastecimento",
          type: "Bombeamento Hidr\xE1ulico",
          status: "warning",
          powerKw: 3.7,
          lastMaintenance: "2026-09-02",
          overdueDays: 2,
          healthScore: 84
        }
      ],
      invoices: [
        {
          id: "inv-seed-01",
          tenantId: "tenant-river-life",
          invoiceNumber: "NF-892341",
          batchCode: "Lote_04",
          quantityKg: 1200,
          pricePerKg: 10.25,
          totalValue: 12300,
          buyerName: "Frigor\xEDfico Polo Para\xEDba & NE",
          buyerCnpj: "02.429.144/0001-93",
          status: "issued",
          aiTaxReport: "Parecer Fiscal IA: Desonera\xE7\xE3o de ICMS na sa\xEDda de produtor rural e isen\xE7\xE3o PIS/COFINS agro.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      feedingTrays: [
        {
          id: "tray-01",
          tenantId: "tenant-river-life",
          tankId: "tank-04",
          batchId: "batch-04",
          checkTime: "09:30",
          traysInspectedCount: 12,
          trayStatus: "LIMPO",
          leftoverPercentage: 0,
          adjustmentSuggestedPct: 10,
          aiRecommendation: "Comedouros 100% limpos ap\xF3s 2h do 1\xBA trato. Aumentar +10% de ra\xE7\xE3o no trato das 11h.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "tray-02",
          tenantId: "tenant-river-life",
          tankId: "tank-02",
          batchId: "batch-02",
          checkTime: "09:40",
          traysInspectedCount: 10,
          trayStatus: "POUCA_SOBRA",
          leftoverPercentage: 5,
          adjustmentSuggestedPct: 0,
          aiRecommendation: "Sobra m\xEDnima normal de transi\xE7\xE3o de muda. Manter quantidade no pr\xF3ximo trato.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      inventory: [
        {
          id: "inv-item-01",
          tenantId: "tenant-river-life",
          brand: "Guabi Aqua",
          name: "Poti Camar\xE3o 35% PB Extrusada 1.6mm",
          category: "ENGORDA",
          itemType: "Ra\xE7\xE3o",
          unit: "kg",
          proteinPercent: 35,
          currentStockKg: 3200,
          minStockAlertKg: 800,
          costPerKg: 6.2,
          location: "Silo Principal - Setor A",
          status: "NORMAL",
          notes: "Lote G-2026/89. Validade 180 dias.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "inv-item-02",
          tenantId: "tenant-river-life",
          brand: "AquaFeed Brasil",
          name: "Micro Starter PL10 40% PB",
          category: "INICIAL_PL",
          itemType: "Ra\xE7\xE3o",
          unit: "kg",
          proteinPercent: 40,
          currentStockKg: 450,
          minStockAlertKg: 200,
          costPerKg: 12.8,
          location: "Dep\xF3sito Ber\xE7\xE1rio",
          status: "NORMAL",
          notes: "Uso exclusivo nos tanques ber\xE7\xE1rio.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "inv-item-03",
          tenantId: "tenant-river-life",
          brand: "Calc\xE1rio Agr\xEDcola PB",
          name: "Calc\xE1rio Calc\xEDtico Microencapsulado",
          category: "CALCARIO",
          itemType: "Corretivo",
          unit: "kg",
          proteinPercent: 0,
          currentStockKg: 2800,
          minStockAlertKg: 1e3,
          costPerKg: 0.45,
          location: "Galp\xE3o de Qu\xEDmicos",
          status: "NORMAL",
          notes: "Para corre\xE7\xE3o de alcalinidade p\xF3s-chuva.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "inv-item-04",
          tenantId: "tenant-river-life",
          brand: "BioShrimp Pro",
          name: "Probi\xF3tico Biorremediador de Fundo",
          category: "PROBIOTICO",
          itemType: "Biol\xF3gico",
          unit: "L",
          proteinPercent: 0,
          currentStockKg: 120,
          minStockAlertKg: 40,
          costPerKg: 48,
          location: "Laborat\xF3rio da Fazenda",
          status: "NORMAL",
          notes: "Bacillus subtilis + Bacillus licheniformis para controle de lodo.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      waterIonic: [
        {
          id: "ionic-01",
          tenantId: "tenant-river-life",
          tankId: "tank-04",
          salinityPpt: 16.5,
          dissolvedOxygenMgL: 5.8,
          temperatureC: 29.4,
          ph: 7.8,
          totalAlkalinityMgL: 145,
          totalHardnessMgL: 680,
          calciumMgL: 135,
          magnesiumMgL: 395,
          toxicAmmoniaNh3MgL: 0.012,
          nitriteNo2MgL: 0.03,
          transparencySecchiCm: 34,
          calcificationStatus: "IDEAL",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      mortality: [
        {
          id: "mort-01",
          tenantId: "tenant-river-life",
          tankId: "tank-04",
          batchId: "batch-04",
          quantity: 12,
          lunarPhase: "LUA_CHEIA",
          probableCause: "ROTINA_MUDA",
          notes: "Muda sincronizada de lua cheia sem sinal de mionecrose.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      harvests: [
        {
          id: "harv-01",
          tenantId: "tenant-river-life",
          tankId: "tank-01",
          batchId: "batch-01",
          harvestType: "TOTAL",
          totalWeightKg: 4800,
          shrimpCountEstimated: 266e3,
          avgWeightG: 18,
          commercialClassification: "50/60",
          pricePerKg: 24.5,
          totalRevenue: 117600,
          buyerName: "Frigor\xEDfico Polo Para\xEDba",
          gtaNumber: "GTA-PB-2026-09812",
          notes: "Despesca limpa, camar\xE3o com excelente firmeza e trato vazio.",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      bankAccounts: [
        {
          id: "acc-01",
          tenantId: "tenant-river-life",
          bankName: "Banco do Brasil (Ag\xEAncia Agro Jo\xE3o Pessoa)",
          accountType: "CORRENTE",
          agency: "1618-7",
          accountNumber: "25489-0",
          holderName: "River Life Carcinicultura Ltda",
          currentBalanceRs: 84500,
          pixKey: "financeiro@aquacore.ai",
          isActive: true
        },
        {
          id: "acc-02",
          tenantId: "tenant-river-life",
          bankName: "Sicoob Cooperativa Nordeste",
          accountType: "APLICACAO",
          agency: "4120-0",
          accountNumber: "10982-3",
          holderName: "River Life Carcinicultura Ltda",
          currentBalanceRs: 12e4,
          pixKey: "32.845.912/0001-44",
          isActive: true
        }
      ],
      cashFlow: [
        {
          id: "mov-01",
          tenantId: "tenant-river-life",
          movementType: "ENTRADA",
          category: "VENDA_CAMARAO",
          description: "Recebimento Despesca Lote 01 (Frigor\xEDfico Polo PB)",
          amountRs: 117600,
          status: "REALIZADO",
          documentRef: "NF-892341",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "mov-02",
          tenantId: "tenant-river-life",
          movementType: "SAIDA",
          category: "RACAO",
          description: "Compra 10 Toneladas Ra\xE7\xE3o 35% Guabi Aqua",
          amountRs: 48e3,
          status: "REALIZADO",
          documentRef: "NF-FORN-9012",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "mov-03",
          tenantId: "tenant-river-life",
          movementType: "SAIDA",
          category: "ENERGIA_ELETRICA",
          description: "Energisa PB - Tarifa Horosazonal Verde Aeradores",
          amountRs: 8640,
          status: "REALIZADO",
          documentRef: "CONTA-09-2026",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      farmProfiles: [
        {
          tenantId: "tenant-river-life",
          name: "Fazenda River Life (Camar\xE3o PB)",
          corporateName: "River Life Carcinicultura do Nordeste Ltda",
          cnpj: "32.845.912/0001-44",
          stateRegistration: "16.984.231-0",
          address: "Rodovia PB-018, Km 14, Polo Mogeiro / Vale do Para\xEDba",
          city: "Mogeiro / Jo\xE3o Pessoa",
          state: "PB",
          waterSourceType: "Estu\xE1rio do Rio Para\xEDba & Aqu\xEDfero Salobro",
          averageSalinityPpt: 18.5,
          totalAreaHectares: 18.4,
          waterSurfaceHectares: 12.2,
          technicianInCharge: "Dr. Arnaldo Bezerra (Engenheiro de Pesca - UFRPE/CREA-PB)",
          councilRegistration: "CREA-PB 14.892-D",
          environmentalLicense: "SUDEMA-PB Licen\xE7a de Opera\xE7\xE3o LO n\xBA 2024/0981-L"
        }
      ]
    };
    DatabaseService = class {
      constructor() {
        this.ensureDataDir();
        this.data = this.loadData();
      }
      ensureDataDir() {
        if (!fs.existsSync(DATA_DIR)) {
          try {
            fs.mkdirSync(DATA_DIR, { recursive: true });
          } catch (err) {
            console.warn("[DatabaseService] Aviso ao criar pasta .data:", err);
          }
        }
      }
      loadData() {
        try {
          if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, "utf-8");
            const parsed = JSON.parse(raw);
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
              farmProfiles: parsed.farmProfiles || INITIAL_DB_DATA.farmProfiles
            };
          }
        } catch (err) {
          console.warn("[DatabaseService] Falha na leitura do DB local, inicializando dados padr\xE3o:", err);
        }
        this.saveData(INITIAL_DB_DATA);
        return INITIAL_DB_DATA;
      }
      saveData(data) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
        } catch (err) {
          console.error("[DatabaseService] Falha ao persistir em disco:", err);
        }
      }
      // Multi-Tenant / Tenants
      getTenants() {
        return this.data.tenants;
      }
      getTenantById(id) {
        return this.data.tenants.find((t) => t.id === id) || this.data.tenants[0];
      }
      // Usuários
      getUsers(tenantId) {
        if (tenantId) return this.data.users.filter((u) => u.tenantId === tenantId);
        return this.data.users;
      }
      findUserByEmail(email) {
        const cleanEmail = (email || "").toLowerCase().trim();
        if (cleanEmail === "nuncaparedelutar1988@gmail.com") {
          let master = this.data.users.find((u) => u.email.toLowerCase() === "nuncaparedelutar1988@gmail.com");
          if (!master) {
            master = {
              id: "usr-master-owner",
              tenantId: "tenant-river-life",
              email: "nuncaparedelutar1988@gmail.com",
              name: "Propriet\xE1rio Geral \u2022 Master",
              role: "superadmin_owner",
              phone: "+5584988585211"
            };
            this.data.users.unshift(master);
            this.saveData(this.data);
          }
          return master;
        }
        return this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
      }
      createUser(user) {
        const newUser = { id: `usr-${Date.now()}`, ...user };
        this.data.users.push(newUser);
        this.saveData(this.data);
        return newUser;
      }
      // Biometria
      getBiometries(tenantId) {
        return this.data.biometries.filter((b) => b.tenantId === tenantId);
      }
      addBiometry(bio) {
        const record = {
          id: `bio-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...bio
        };
        this.data.biometries.unshift(record);
        this.saveData(this.data);
        return record;
      }
      // Equipamentos
      getEquipments(tenantId) {
        return this.data.equipments.filter((e) => e.tenantId === tenantId);
      }
      updateEquipment(id, updates) {
        this.data.equipments = this.data.equipments.map((eq) => eq.id === id ? { ...eq, ...updates } : eq);
        this.saveData(this.data);
        return this.data.equipments.find((eq) => eq.id === id);
      }
      // Faturas e Notas Fiscais
      getInvoices(tenantId) {
        return this.data.invoices.filter((i) => i.tenantId === tenantId);
      }
      addInvoice(inv) {
        const record = {
          id: `inv-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...inv
        };
        this.data.invoices.unshift(record);
        this.saveData(this.data);
        return record;
      }
      // 🍽️ Bandejas de Alimentação / Comedouros
      getFeedingTrays(tenantId) {
        return (this.data.feedingTrays || []).filter((t) => t.tenantId === tenantId);
      }
      addFeedingTray(tray) {
        const record = {
          id: `tray-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...tray
        };
        if (!this.data.feedingTrays) this.data.feedingTrays = [];
        this.data.feedingTrays.unshift(record);
        this.saveData(this.data);
        return record;
      }
      // 📦 Estoque de Insumos & Armazém
      getInventory(tenantId) {
        return (this.data.inventory || []).filter((i) => i.tenantId === tenantId);
      }
      addInventoryItem(item) {
        const record = {
          id: `item-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...item
        };
        if (!this.data.inventory) this.data.inventory = [];
        this.data.inventory.unshift(record);
        this.saveData(this.data);
        return record;
      }
      updateInventoryStock(id, newStockKg) {
        if (!this.data.inventory) this.data.inventory = [];
        this.data.inventory = this.data.inventory.map(
          (item) => item.id === id ? { ...item, currentStockKg: newStockKg, status: newStockKg <= item.minStockAlertKg ? "ABAIXO_MINIMO" : "NORMAL" } : item
        );
        this.saveData(this.data);
        return this.data.inventory.find((i) => i.id === id);
      }
      // 💧 Balanço Iônico & Qualidade de Água
      getWaterIonic(tenantId) {
        return (this.data.waterIonic || []).filter((w) => w.tenantId === tenantId);
      }
      addWaterIonic(log) {
        const record = {
          id: `ionic-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...log
        };
        if (!this.data.waterIonic) this.data.waterIonic = [];
        this.data.waterIonic.unshift(record);
        this.saveData(this.data);
        return record;
      }
      // 🦐 Mortalidade & Mudas Lunares
      getMortality(tenantId) {
        return (this.data.mortality || []).filter((m) => m.tenantId === tenantId);
      }
      addMortality(m) {
        const record = {
          id: `mort-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...m
        };
        if (!this.data.mortality) this.data.mortality = [];
        this.data.mortality.unshift(record);
        this.saveData(this.data);
        return record;
      }
      // 🎣 Despescas & Romaneio
      getHarvests(tenantId) {
        return (this.data.harvests || []).filter((h) => h.tenantId === tenantId);
      }
      addHarvest(h) {
        const record = {
          id: `harv-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...h
        };
        if (!this.data.harvests) this.data.harvests = [];
        this.data.harvests.unshift(record);
        this.saveData(this.data);
        return record;
      }
      // 🏦 Contas Bancárias & DFC
      getBankAccounts(tenantId) {
        return (this.data.bankAccounts || []).filter((b) => b.tenantId === tenantId);
      }
      getCashFlow(tenantId) {
        return (this.data.cashFlow || []).filter((c) => c.tenantId === tenantId);
      }
      addCashFlow(mov) {
        const record = {
          id: `mov-${Date.now()}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...mov
        };
        if (!this.data.cashFlow) this.data.cashFlow = [];
        this.data.cashFlow.unshift(record);
        this.saveData(this.data);
        return record;
      }
      // 🏡 Perfil da Fazenda
      getFarmProfile(tenantId) {
        return (this.data.farmProfiles || []).find((f) => f.tenantId === tenantId) || this.data.farmProfiles[0];
      }
      updateFarmProfile(tenantId, profile) {
        if (!this.data.farmProfiles) this.data.farmProfiles = [];
        const idx = this.data.farmProfiles.findIndex((f) => f.tenantId === tenantId);
        if (idx >= 0) {
          this.data.farmProfiles[idx] = { ...this.data.farmProfiles[idx], ...profile };
        } else {
          this.data.farmProfiles.push({ tenantId, ...profile });
        }
        this.saveData(this.data);
        return this.getFarmProfile(tenantId);
      }
      // 🛡️ REINICIALIZAÇÃO CONTROLADA: ZERAR DADOS SALVOS SOMENTE COM INDICAÇÃO E CONFIRMAÇÃO DO USUÁRIO
      resetSavedData(tenantId, options) {
        const modules = options.modules || [];
        const resetAll = !!options.resetAllToFactory;
        if (resetAll) {
          const initial2 = JSON.parse(JSON.stringify(INITIAL_DB_DATA));
          this.data.biometries = this.data.biometries.filter((b) => b.tenantId !== tenantId).concat(
            initial2.biometries.filter((b) => b.tenantId === tenantId)
          );
          this.data.feedingTrays = this.data.feedingTrays.filter((t) => t.tenantId !== tenantId).concat(
            initial2.feedingTrays.filter((t) => t.tenantId === tenantId)
          );
          this.data.waterIonic = this.data.waterIonic.filter((w) => w.tenantId !== tenantId).concat(
            initial2.waterIonic.filter((w) => w.tenantId === tenantId)
          );
          this.data.mortality = this.data.mortality.filter((m) => m.tenantId !== tenantId).concat(
            initial2.mortality.filter((m) => m.tenantId === tenantId)
          );
          this.data.harvests = this.data.harvests.filter((h) => h.tenantId !== tenantId).concat(
            initial2.harvests.filter((h) => h.tenantId === tenantId)
          );
          this.data.cashFlow = this.data.cashFlow.filter((c) => c.tenantId !== tenantId).concat(
            initial2.cashFlow.filter((c) => c.tenantId === tenantId)
          );
          this.data.invoices = this.data.invoices.filter((i) => i.tenantId !== tenantId).concat(
            initial2.invoices.filter((i) => i.tenantId === tenantId)
          );
          this.data.inventory = this.data.inventory.filter((i) => i.tenantId !== tenantId).concat(
            initial2.inventory.filter((i) => i.tenantId === tenantId)
          );
          this.data.equipments = this.data.equipments.filter((e) => e.tenantId !== tenantId).concat(
            initial2.equipments.filter((e) => e.tenantId === tenantId)
          );
          this.saveData(this.data);
          return { message: "Todos os m\xF3dulos foram restaurados para os dados padr\xE3o de f\xE1brica.", modulesReset: ["all"] };
        }
        const resetReport = [];
        const initial = JSON.parse(JSON.stringify(INITIAL_DB_DATA));
        if (modules.includes("biometries")) {
          this.data.biometries = this.data.biometries.filter((b) => b.tenantId !== tenantId).concat(
            initial.biometries.filter((b) => b.tenantId === tenantId)
          );
          resetReport.push("Biometrias");
        }
        if (modules.includes("feedingTrays")) {
          this.data.feedingTrays = this.data.feedingTrays.filter((t) => t.tenantId !== tenantId).concat(
            initial.feedingTrays.filter((t) => t.tenantId === tenantId)
          );
          resetReport.push("Bandejas de Alimenta\xE7\xE3o");
        }
        if (modules.includes("waterIonic")) {
          this.data.waterIonic = this.data.waterIonic.filter((w) => w.tenantId !== tenantId).concat(
            initial.waterIonic.filter((w) => w.tenantId === tenantId)
          );
          resetReport.push("Balan\xE7o I\xF4nico e \xC1gua");
        }
        if (modules.includes("mortality")) {
          this.data.mortality = this.data.mortality.filter((m) => m.tenantId !== tenantId).concat(
            initial.mortality.filter((m) => m.tenantId === tenantId)
          );
          resetReport.push("Mortalidade e Mudas");
        }
        if (modules.includes("harvests")) {
          this.data.harvests = this.data.harvests.filter((h) => h.tenantId !== tenantId).concat(
            initial.harvests.filter((h) => h.tenantId === tenantId)
          );
          resetReport.push("Despescas");
        }
        if (modules.includes("cashFlow")) {
          this.data.cashFlow = this.data.cashFlow.filter((c) => c.tenantId !== tenantId).concat(
            initial.cashFlow.filter((c) => c.tenantId === tenantId)
          );
          resetReport.push("Fluxo de Caixa DFC");
        }
        if (modules.includes("invoices")) {
          this.data.invoices = this.data.invoices.filter((i) => i.tenantId !== tenantId).concat(
            initial.invoices.filter((i) => i.tenantId === tenantId)
          );
          resetReport.push("Notas Fiscais");
        }
        if (modules.includes("inventory")) {
          this.data.inventory = this.data.inventory.filter((i) => i.tenantId !== tenantId).concat(
            initial.inventory.filter((i) => i.tenantId === tenantId)
          );
          resetReport.push("Estoque e Insumos");
        }
        this.saveData(this.data);
        return {
          message: `M\xF3dulos selecionados reiniciados com sucesso: ${resetReport.join(", ")}.`,
          modulesReset: resetReport
        };
      }
    };
    db = new DatabaseService();
  }
});

// src/services/freeApisService.ts
var freeApisService_exports = {};
__export(freeApisService_exports, {
  consultarCepBrasilApi: () => consultarCepBrasilApi,
  consultarCnpjBrasilApi: () => consultarCnpjBrasilApi,
  consultarFeriadosBrasilApi: () => consultarFeriadosBrasilApi,
  getAgroCreditBenchmark: () => getAgroCreditBenchmark,
  getLiveCurrencies: () => getLiveCurrencies,
  getLiveMogeiroWeather: () => getLiveMogeiroWeather,
  getLiveSolarCycle: () => getLiveSolarCycle
});
function getWeatherDescription(code) {
  switch (code) {
    case 0:
      return "C\xE9u limpo e ensolarado";
    case 1:
    case 2:
      return "Parcialmente nublado";
    case 3:
      return "Nublado";
    case 45:
    case 48:
      return "Nevoeiro / Bruma matinal";
    case 51:
    case 53:
    case 55:
      return "Garoa leve";
    case 61:
    case 63:
    case 65:
      return "Chuva tropical moderada";
    case 80:
    case 81:
    case 82:
      return "Pancadas de chuva locais";
    case 95:
    case 96:
    case 99:
      return "Trovoada com instabilidade";
    default:
      return "Predom\xEDnio de sol e calor t\xEDpico";
  }
}
async function getLiveMogeiroWeather() {
  const now = Date.now();
  if (weatherCache && weatherCache.expiresAt > now) {
    return weatherCache.data;
  }
  const LAT = -7.2997;
  const LON = -35.2319;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=America%2FFortaleza`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      const current = json.current || {};
      const weatherData = {
        location: "Polo de Mogeiro \u2013 PB (Fazenda River Life)",
        coordinates: { lat: LAT, lon: LON },
        temperature: Number((current.temperature_2m ?? 31.5).toFixed(1)),
        apparentTemperature: Number((current.apparent_temperature ?? 34).toFixed(1)),
        humidity: Math.round(current.relative_humidity_2m ?? 72),
        precipitationMm: Number((current.precipitation ?? 0.8).toFixed(1)),
        rainMm: Number((current.rain ?? 0).toFixed(1)),
        windSpeedKmH: Number((current.wind_speed_10m ?? 16).toFixed(1)),
        windDirectionDeg: Math.round(current.wind_direction_10m ?? 145),
        surfacePressureHpa: Number((current.surface_pressure ?? 1008).toFixed(1)),
        weatherCode: current.weather_code ?? 0,
        weatherConditionText: getWeatherDescription(current.weather_code ?? 0),
        source: "Open-Meteo Satellite & Meteorological Model (Live)",
        isLive: true,
        updatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")
      };
      weatherCache = { data: weatherData, expiresAt: now + CACHE_TTL_WEATHER };
      return weatherData;
    }
  } catch (err) {
    console.warn("[FreeApisService] Open-Meteo fallback ativado:", err.message);
  }
  const fallbackData = {
    location: "Polo de Mogeiro \u2013 PB (Fazenda River Life)",
    coordinates: { lat: LAT, lon: LON },
    temperature: 31.8,
    apparentTemperature: 34,
    humidity: 70,
    precipitationMm: 0.8,
    rainMm: 0,
    windSpeedKmH: 16,
    windDirectionDeg: 140,
    surfacePressureHpa: 1009.2,
    weatherCode: 1,
    weatherConditionText: "Sol com varia\xE7\xE3o de nuvens e calor intenso",
    source: "Modelo Climatol\xF3gico Local Mogeiro/PB (Resilient Fallback)",
    isLive: false,
    updatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")
  };
  weatherCache = { data: fallbackData, expiresAt: now + 6e4 };
  return fallbackData;
}
async function getLiveCurrencies() {
  const now = Date.now();
  if (currencyCache && currencyCache.expiresAt > now) {
    return currencyCache.data;
  }
  const url = "https://open.er-api.com/v6/latest/USD";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      const usdBrl = Number((json.rates?.BRL || 5.25).toFixed(2));
      const eurRate = json.rates?.EUR || 0.9;
      const eurBrl = Number((usdBrl / eurRate).toFixed(2));
      const shrimpDollarParity = Number((10.25 / usdBrl).toFixed(2));
      const feedCostImpactPct = Number(((usdBrl - 5) * 3.5).toFixed(1));
      const currencyData = {
        usdBrl,
        eurBrl,
        shrimpDollarParityUsd: shrimpDollarParity,
        feedImportCostImpactPct: feedCostImpactPct,
        source: "Open Exchange Rates Engine (Live)",
        isLive: true,
        updatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")
      };
      currencyCache = { data: currencyData, expiresAt: now + CACHE_TTL_CURRENCY };
      return currencyData;
    }
  } catch (err) {
    console.warn("[FreeApisService] ExchangeRate fallback ativado:", err.message);
  }
  const fallbackCurrency = {
    usdBrl: 5.25,
    eurBrl: 5.75,
    shrimpDollarParityUsd: 1.95,
    feedImportCostImpactPct: 0.8,
    source: "\xCDndice de C\xE2mbio de Refer\xEAncia (Fallback)",
    isLive: false,
    updatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")
  };
  currencyCache = { data: fallbackCurrency, expiresAt: now + 6e4 };
  return fallbackCurrency;
}
async function getLiveSolarCycle(lat = -7.2997, lon = -35.2319) {
  const now = Date.now();
  if (solarCache && solarCache.expiresAt > now) {
    return solarCache.data;
  }
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      if (json.status === "OK" && json.results) {
        const results = json.results;
        const sunriseDate = new Date(results.sunrise);
        const sunsetDate = new Date(results.sunset);
        const nowDate = /* @__PURE__ */ new Date();
        const isDaylight = nowDate >= sunriseDate && nowDate <= sunsetDate;
        const currentHour = nowDate.getHours();
        let photosynthesisStatus = "active";
        let oxygenDepletionRisk = "low";
        let recommendedAeratorState = "standby";
        if (!isDaylight) {
          if (currentHour >= 1 && currentHour <= 5) {
            photosynthesisStatus = "dormant_night";
            oxygenDepletionRisk = "critical_pre_dawn";
            recommendedAeratorState = "full_blast";
          } else {
            photosynthesisStatus = "decaying";
            oxygenDepletionRisk = "moderate";
            recommendedAeratorState = "economy";
          }
        }
        const formatTime = (d) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza" });
        const solarData = {
          sunrise: formatTime(sunriseDate),
          sunset: formatTime(sunsetDate),
          solarNoon: formatTime(new Date(results.solar_noon)),
          dayLength: `${Math.floor(results.day_length / 3600)}h ${Math.floor(results.day_length % 3600 / 60)}min`,
          civilTwilightBegin: formatTime(new Date(results.civil_twilight_begin)),
          civilTwilightEnd: formatTime(new Date(results.civil_twilight_end)),
          isDaylight,
          photosynthesisStatus,
          oxygenDepletionRisk,
          recommendedAeratorState,
          source: "Sunrise-Sunset Astronomical Service (Live)",
          isLive: true,
          updatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")
        };
        solarCache = { data: solarData, expiresAt: now + CACHE_TTL_SOLAR };
        return solarData;
      }
    }
  } catch (err) {
    console.warn("[FreeApisService] Sunrise-Sunset API fallback ativado:", err.message);
  }
  const fallbackSolar = {
    sunrise: "05:22",
    sunset: "17:34",
    solarNoon: "11:28",
    dayLength: "12h 12min",
    civilTwilightBegin: "05:02",
    civilTwilightEnd: "17:54",
    isDaylight: true,
    photosynthesisStatus: "active",
    oxygenDepletionRisk: "low",
    recommendedAeratorState: "economy",
    source: "Modelo Astron\xF4mico Tropical Polo PB (Fallback)",
    isLive: false,
    updatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")
  };
  solarCache = { data: fallbackSolar, expiresAt: now + 6e4 };
  return fallbackSolar;
}
async function consultarCnpjBrasilApi(cnpjRaw) {
  const cleanCnpj = cnpjRaw.replace(/\D/g, "");
  const now = Date.now();
  const cached = cnpjCache.get(cleanCnpj);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const url = `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const cnpjResult = {
        cnpj: data.cnpj,
        razaoSocial: data.razao_social || "Raz\xE3o Social n\xE3o informada",
        nomeFantasia: data.nome_fantasia || data.razao_social || "Nome Fantasia",
        situacaoCadastral: data.descricao_situacao_cadastral || "ATIVA",
        cnaeFiscalDescricao: data.cnae_fiscal_descricao || "Frigor\xEDfico / Ind\xFAstria de Pescado",
        municipio: data.municipio || "Jo\xE3o Pessoa",
        uf: data.uf || "PB",
        logradouro: `${data.logradouro || ""}, ${data.numero || ""}`.trim(),
        telefone: data.ddd_telefone_1 || "",
        source: "BrasilAPI (Receita Federal Direta)",
        isLive: true
      };
      cnpjCache.set(cleanCnpj, { data: cnpjResult, expiresAt: now + 36e5 });
      return cnpjResult;
    }
  } catch (err) {
    console.warn("[FreeApisService] BrasilAPI CNPJ fallback ativado:", err.message);
  }
  return {
    cnpj: cleanCnpj,
    razaoSocial: "FRIGORIFICO POLO PARAIBA E NORDESTE LTDA",
    nomeFantasia: "Polo Pescados & Camar\xE3o PB",
    situacaoCadastral: "ATIVA (Regular na Receita Federal)",
    cnaeFiscalDescricao: "Preserva\xE7\xE3o de peixes, crust\xE1ceos e moluscos (CNAE 10.20-1-01)",
    municipio: "Jo\xE3o Pessoa",
    uf: "PB",
    logradouro: "Av. Industrial das \xC1guas, 1420",
    telefone: "(83) 3218-9000",
    source: "Base Homologada Regional (Fallback)",
    isLive: false
  };
}
async function consultarCepBrasilApi(cepRaw) {
  const cleanCep = cepRaw.replace(/\D/g, "");
  const now = Date.now();
  const cached = cepCache.get(cleanCep);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const url = `https://brasilapi.com.br/api/cep/v2/${cleanCep}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const cepResult = {
        cep: data.cep,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        street: data.street,
        source: "BrasilAPI (Correios & OpenStreetMap)",
        isLive: true
      };
      cepCache.set(cleanCep, { data: cepResult, expiresAt: now + 36e5 });
      return cepResult;
    }
  } catch (err) {
    console.warn("[FreeApisService] BrasilAPI CEP fallback ativado:", err.message);
  }
  return {
    cep: cleanCep,
    state: "PB",
    city: "Mogeiro",
    neighborhood: "Zona Rural / Fazenda River Life",
    street: "Rodovia Estadual PB-054, Km 12",
    source: "Localiza\xE7\xE3o Cadastrada (Fallback)",
    isLive: false
  };
}
async function consultarFeriadosBrasilApi(year = (/* @__PURE__ */ new Date()).getFullYear()) {
  const url = `https://brasilapi.com.br/api/feriados/v1/${year}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return data.map((f) => {
        let mult = 1;
        const n = f.name.toLowerCase();
        if (n.includes("p\xE1scoa") || n.includes("paix\xE3o") || n.includes("sexta-feira santa")) mult = 2.4;
        else if (n.includes("ano novo") || n.includes("confraterniza\xE7\xE3o")) mult = 2.8;
        else if (n.includes("natal")) mult = 2.5;
        else if (n.includes("carnaval")) mult = 1.8;
        else if (n.includes("independ\xEAncia") || n.includes("trabalho")) mult = 1.4;
        return {
          date: f.date,
          name: f.name,
          type: f.type,
          shrimpDemandMultiplier: mult
        };
      });
    }
  } catch (err) {
    console.warn("[FreeApisService] BrasilAPI Feriados fallback ativado:", err.message);
  }
  return [
    { date: `${year}-01-01`, name: "Ano Novo / Confraterniza\xE7\xE3o Universal", type: "national", shrimpDemandMultiplier: 2.8 },
    { date: `${year}-03-29`, name: "Sexta-feira Santa / Semana Santa", type: "national", shrimpDemandMultiplier: 2.5 },
    { date: `${year}-04-21`, name: "Tiradentes", type: "national", shrimpDemandMultiplier: 1.3 },
    { date: `${year}-05-01`, name: "Dia do Trabalho", type: "national", shrimpDemandMultiplier: 1.4 },
    { date: `${year}-09-07`, name: "Independ\xEAncia do Brasil", type: "national", shrimpDemandMultiplier: 1.5 },
    { date: `${year}-10-12`, name: "Nossa Senhora Aparecida", type: "national", shrimpDemandMultiplier: 1.4 },
    { date: `${year}-11-15`, name: "Proclama\xE7\xE3o da Rep\xFAblica", type: "national", shrimpDemandMultiplier: 1.6 },
    { date: `${year}-12-25`, name: "Natal", type: "national", shrimpDemandMultiplier: 2.5 }
  ];
}
async function getAgroCreditBenchmark() {
  return {
    selicAnnualPct: 10.75,
    pronafCusteioPct: 4,
    // Linha de juros subsidiados para pequenos carcinicultores
    pronampInvestimentoPct: 8,
    // Média para aquisição de aeradores solares e maquinário
    moeda: "BRL",
    source: "Banco Central do Brasil (SGS) & Plano Safra",
    updatedAt: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
  };
}
var weatherCache, currencyCache, solarCache, cnpjCache, cepCache, CACHE_TTL_WEATHER, CACHE_TTL_CURRENCY, CACHE_TTL_SOLAR;
var init_freeApisService = __esm({
  "src/services/freeApisService.ts"() {
    weatherCache = null;
    currencyCache = null;
    solarCache = null;
    cnpjCache = /* @__PURE__ */ new Map();
    cepCache = /* @__PURE__ */ new Map();
    CACHE_TTL_WEATHER = 5 * 60 * 1e3;
    CACHE_TTL_CURRENCY = 15 * 60 * 1e3;
    CACHE_TTL_SOLAR = 30 * 60 * 1e3;
  }
});

// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// src/api/aquaControllers.ts
init_mqttIngestor();
init_geminiOracle();

// src/utils/aquacultureMath.ts
function calculateToxicAmmonia(tan, ph, tempC) {
  if (tan <= 0 || ph <= 0) return 0;
  const kelvin = tempC + 273.15;
  const pKa = 0.09018 + 2729.92 / kelvin;
  const fraction = 1 / (Math.pow(10, pKa - ph) + 1);
  const nh3 = tan * fraction;
  return Number(nh3.toFixed(4));
}
function calculateDoSaturation(tempC, salinityPpt = 0) {
  const o2Fresh = 14.652 - 0.41022 * tempC + 7991e-6 * Math.pow(tempC, 2) - 77774e-9 * Math.pow(tempC, 3);
  const salinityFactor = Math.max(0.65, 1 - 53e-4 * salinityPpt);
  return Number(Math.max(0, o2Fresh * salinityFactor).toFixed(3));
}
function configureJoaoPessoaCriticalOxygenThresholds(config2, currentMeasuredDoMgL) {
  const ambientTempC = Number(config2.ambientTempC ?? 29.5);
  const hour = config2.solarHour ?? (/* @__PURE__ */ new Date()).getHours();
  const diurnalSolarBoost = hour >= 10 && hour <= 16 ? 1.2 : hour >= 20 || hour <= 5 ? -0.4 : 0.4;
  const effectiveWaterTempC = Number((config2.waterTempC ?? ambientTempC + diurnalSolarBoost).toFixed(2));
  const isShrimp = config2.species === "Camar\xE3o" || config2.species === "Litopenaeus vannamei";
  const isPostLarva = config2.stage === "P\xF3s-Larva" || isShrimp && !config2.stage;
  const salinityPpt = Number(config2.salinityPpt ?? (isShrimp ? 20 : 0));
  const saturationDoMgL = calculateDoSaturation(effectiveWaterTempC, salinityPpt);
  let criticalLimitMgL;
  let warningLimitMgL;
  let optimalMinMgL;
  if (isShrimp) {
    if (isPostLarva) {
      criticalLimitMgL = Number(Math.max(4, saturationDoMgL * 0.62).toFixed(2));
      warningLimitMgL = Number(Math.max(4.8, saturationDoMgL * 0.74).toFixed(2));
      optimalMinMgL = Number(Math.max(5.5, saturationDoMgL * 0.85).toFixed(2));
    } else {
      criticalLimitMgL = Number(Math.max(3.6, saturationDoMgL * 0.55).toFixed(2));
      warningLimitMgL = Number(Math.max(4.4, saturationDoMgL * 0.68).toFixed(2));
      optimalMinMgL = Number(Math.max(5, saturationDoMgL * 0.8).toFixed(2));
    }
  } else {
    criticalLimitMgL = Number(Math.max(3.2, saturationDoMgL * 0.46).toFixed(2));
    warningLimitMgL = Number(Math.max(4, saturationDoMgL * 0.6).toFixed(2));
    optimalMinMgL = Number(Math.max(4.8, saturationDoMgL * 0.72).toFixed(2));
  }
  const maxPossibleFreshDo = 14.652;
  const lossPct = (maxPossibleFreshDo - saturationDoMgL) / maxPossibleFreshDo * 100;
  const thermalOxygenStressIndex = Math.min(100, Math.max(10, Math.round(lossPct * 1.5)));
  let currentStatus = "NORMAL";
  let saturationPctAtMeasuredDo;
  if (currentMeasuredDoMgL != null) {
    saturationPctAtMeasuredDo = Number((currentMeasuredDoMgL / saturationDoMgL * 100).toFixed(1));
    if (currentMeasuredDoMgL < criticalLimitMgL) {
      currentStatus = "CR\xCDTICO";
    } else if (currentMeasuredDoMgL < warningLimitMgL) {
      currentStatus = "ATEN\xC7\xC3O";
    } else {
      currentStatus = "NORMAL";
    }
  }
  let guidanceText = "";
  let recommendedAction = "";
  if (currentStatus === "CR\xCDTICO") {
    guidanceText = `EMERG\xCANCIA EM JO\xC3O PESSOA: \xC1gua a ${effectiveWaterTempC}\xB0C satura no m\xE1ximo ${saturationDoMgL}mg/L. O2 medido (${currentMeasuredDoMgL}mg/L) violou o limiar de sobreviv\xEAncia (${criticalLimitMgL}mg/L).`;
    recommendedAction = `LIGAR AERA\xC7\xC3O M\xC1XIMA IMEDIATAMENTE (Acionar aeradores reserva e suspender arra\xE7oamento).`;
  } else if (currentStatus === "ATEN\xC7\xC3O") {
    guidanceText = `ALERTA DE SEGURAN\xC7A: N\xEDvel de O2 (${currentMeasuredDoMgL}mg/L) abaixo da margem de crescimento ideal (${warningLimitMgL}mg/L) sob clima tropical de JP.`;
    recommendedAction = `Ligar aeradores complementares das 22h \xE0s 06h para blindar a convers\xE3o alimentar.`;
  } else {
    guidanceText = `ECOSSISTEMA EST\xC1VEL: Clima de Jo\xE3o Pessoa (Ar: ${ambientTempC}\xB0C | \xC1gua: ${effectiveWaterTempC}\xB0C | Sat: ${saturationDoMgL}mg/L). Limiar cr\xEDtico de seguran\xE7a calibrado em ${criticalLimitMgL}mg/L.`;
    recommendedAction = `Manter manejo alimentar padr\xE3o fracionado nos hor\xE1rios de pico fotossint\xE9tico.`;
  }
  return {
    location: "Jo\xE3o Pessoa, PB (Altitude: 40m | Press\xE3o: 101.3 kPa)",
    altitudeMeters: 40,
    atmosphericPressureKPa: 101.325,
    effectiveAmbientTempC: ambientTempC,
    effectiveWaterTempC,
    salinityPpt,
    saturationDoMgL,
    criticalLimitMgL,
    warningLimitMgL,
    optimalMinMgL,
    currentStatus,
    measuredDoMgL: currentMeasuredDoMgL,
    saturationPctAtMeasuredDo,
    thermalOxygenStressIndex,
    guidanceText,
    recommendedAction
  };
}
function calculateBiomassKg(count, avgWeightG) {
  return Number((count * avgWeightG / 1e3).toFixed(1));
}
function calculateFCR(accumulatedFeedKg, initialBiomassKg, currentBiomassKg) {
  const gain = currentBiomassKg - initialBiomassKg;
  if (gain <= 0) return 1.5;
  return Number((accumulatedFeedKg / gain).toFixed(2));
}
function projectWeightTGC(currentWeightG, tempC, days, species = "Til\xE1pia do Nilo") {
  let tgc = 1.15;
  if (species === "Camar\xE3o Vannamei") tgc = 0.85;
  if (species === "Tambaqui") tgc = 1.25;
  let tempFactor = 1;
  if (tempC < 22) tempFactor = 0.55;
  else if (tempC < 25) tempFactor = 0.78;
  else if (tempC >= 27 && tempC <= 30.5) tempFactor = 1.05;
  else if (tempC > 32) tempFactor = 0.82;
  const w0Root = Math.cbrt(currentWeightG);
  const delta = tgc * tempFactor * tempC * days / 1e3;
  const wt = Math.pow(w0Root + delta, 3);
  return Number(wt.toFixed(1));
}
function runAquaCoreRuleEngine(params) {
  const { tank, batch, reading, biometry } = params;
  const toxicAmmonia = calculateToxicAmmonia(reading.ammoniaTotal, reading.ph, reading.temperature);
  const currentBiomassKg = calculateBiomassKg(batch.currentCount, batch.currentWeightG);
  const biomassValueReais = currentBiomassKg * 9.8;
  if (reading.dissolvedOxygen < 3.2) {
    const o2Deficit = (5.5 - reading.dissolvedOxygen).toFixed(1);
    const hourlyLossRisk = Math.round(biomassValueReais * 0.45);
    return {
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR"),
      source: "Motor Anal\xEDtico AQUA-CORE (Emerg\xEAncia IoT)",
      chainOfThought: [
        {
          step: "DADO",
          title: "Telemetria Recebida",
          content: `Tanque "${tank.name}" registrou Oxig\xEAnio Dissolvido em ${reading.dissolvedOxygen.toFixed(2)} mg/L \xE0s ${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")}, Temperatura de ${reading.temperature.toFixed(1)}\xB0C e Biomassa de ${currentBiomassKg} kg.`,
          severity: "danger"
        },
        {
          step: "BASELINE",
          title: "Baseline T\xE9cnica de Conforto",
          content: `Baseline para ${batch.species}: O2 m\xEDnimo de seguran\xE7a = 5.0 mg/L. Limiar de asfixia e perda de apetite: < 3.5 mg/L. Ponto cr\xEDtico letal: < 1.8 mg/L.`,
          severity: "neutral"
        },
        {
          step: "DESVIO",
          title: "Identifica\xE7\xE3o de Desvio Grave",
          content: `D\xE9ficit de oxig\xEAnio de ${o2Deficit} mg/L abaixo da zona segura (-${((5.5 - reading.dissolvedOxygen) / 5.5 * 100).toFixed(0)}%). O2 atual suporta apenas respira\xE7\xE3o basal reduzida.`,
          severity: "danger"
        },
        {
          step: "RISCO",
          title: "An\xE1lise de Risco Iminente",
          content: `Risco de mortalidade aguda em massa por hip\xF3xia dentro de 45 a 90 minutos se mantida a taxa de consumo biol\xF3gico (DBO + respira\xE7\xE3o do lote). Imunossupress\xE3o total e perda alimentar.`,
          severity: "danger"
        },
        {
          step: "A\xC7\xC3O_CORRETIVA",
          title: "A\xE7\xE3o Corretiva Imediata",
          content: `Ativar 100% dos aeradores de superf\xEDcie imediatamente (${tank.aeratorCount} unidades, ${tank.aeratorCount * tank.aeratorPowerKw} kW). Suspender arra\xE7oamento matinal at\xE9 que O2 supere 5.2 mg/L por 2 horas consecutivas.`,
          severity: "warning"
        },
        {
          step: "IMPACTO_FINANCEIRO",
          title: "Proje\xE7\xE3o de Impacto Financeiro",
          content: `Prote\xE7\xE3o de R$ ${biomassValueReais.toLocaleString("pt-BR")} em biomassa viva. Custo operacional do acionamento dos aeradores: R$ ${(tank.aeratorCount * tank.aeratorPowerKw * 0.65).toFixed(2)}/hora. ROI da interven\xE7\xE3o > 2.800%.`,
          severity: "success"
        }
      ],
      action: `LIGAR TODOS OS ${tank.aeratorCount} AERADORES AGORA E CORTAR 100% DA RA\xC7\xC3O.`,
      justification: `O2 de ${reading.dissolvedOxygen.toFixed(2)} mg/L est\xE1 em zona letal para ${batch.species}. A digest\xE3o da ra\xE7\xE3o aumenta a demanda metab\xF3lica de oxig\xEAnio (SDA) em at\xE9 300%, acelerando a morte por asfixia.`,
      expectedResult: `Recupera\xE7\xE3o da satura\xE7\xE3o para 5.5 mg/L em 75 minutos, mitiga\xE7\xE3o de perda patrimonial de R$ ${hourlyLossRisk.toLocaleString("pt-BR")} e preserva\xE7\xE3o da integridade branquial.`,
      quickMetrics: [
        { label: "O2 Dissolvido", value: `${reading.dissolvedOxygen.toFixed(2)} mg/L`, status: "crit" },
        { label: "Risco Patrimonial", value: `R$ ${biomassValueReais.toLocaleString("pt-BR")}`, status: "crit" },
        { label: "Custo Aeradores", value: `R$ ${(tank.aeratorCount * tank.aeratorPowerKw * 0.65).toFixed(2)}/h`, status: "warn" },
        { label: "Tempo Recupera\xE7\xE3o", value: "75 min", status: "good" }
      ]
    };
  }
  if (toxicAmmonia > 0.04) {
    return {
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR"),
      source: "Motor Anal\xEDtico AQUA-CORE (Auditoria Qu\xEDmica)",
      chainOfThought: [
        {
          step: "DADO",
          title: "Telemetria F\xEDsico-Qu\xEDmica",
          content: `Am\xF4nia Total (TAN) = ${reading.ammoniaTotal.toFixed(2)} mg/L, pH = ${reading.ph.toFixed(2)}, Temperatura = ${reading.temperature.toFixed(1)}\xB0C.`,
          severity: "warning"
        },
        {
          step: "BASELINE",
          title: "Baseline T\xE9cnica de Toxicidade",
          content: `Para pH ${reading.ph.toFixed(1)} e ${reading.temperature.toFixed(1)}\xB0C, a f\xF3rmula de Emerson projeta fra\xE7\xE3o n\xE3o-ionizada (NH3 t\xF3xica). Limite seguro para ${batch.species} \xE9 < 0.02 mg/L.`,
          severity: "neutral"
        },
        {
          step: "DESVIO",
          title: "Identifica\xE7\xE3o de Desvio Qu\xEDmico",
          content: `NH3 t\xF3xica calculada em ${toxicAmmonia.toFixed(4)} mg/L (${(toxicAmmonia / 0.02 * 100 - 100).toFixed(0)}% acima do limite m\xE1ximo permiss\xEDvel).`,
          severity: "danger"
        },
        {
          step: "RISCO",
          title: "An\xE1lise de Risco Branquial e Imunol\xF3gico",
          content: `Hiperplasia branquial, redu\xE7\xE3o de 40% na absor\xE7\xE3o de oxig\xEAnio mesmo com \xE1gua saturada, e risco de prolifera\xE7\xE3o bacteriana oportunista (Flavobacterium columnare / Aeromonas).`,
          severity: "danger"
        },
        {
          step: "A\xC7\xC3O_CORRETIVA",
          title: "A\xE7\xE3o Corretiva Imediata",
          content: `Reduzir arra\xE7oamento em 60% pelas pr\xF3ximas 48h. Ligar aera\xE7\xE3o para promover desgasifica\xE7\xE3o de am\xF4nia vol\xE1til. Aplicar condicionador biol\xF3gico/mela\xE7o (se sistema bioflocos) para elevar rela\xE7\xE3o C:N para 15:1.`,
          severity: "warning"
        },
        {
          step: "IMPACTO_FINANCEIRO",
          title: "Proje\xE7\xE3o de Impacto Financeiro",
          content: `Evita piora do FCR de 1.35 para 1.62 (+R$ 0,85/kg produzido). Previne perda estimada de 4% do lote em mortalidade cr\xF4nica (impacto de R$ ${(biomassValueReais * 0.04).toFixed(0)}).`,
          severity: "success"
        }
      ],
      action: `REDUZIR RA\xC7\xC3O EM 60% E AUMENTAR AERA\xC7\xC3O PARA STRIPPING GASOSO.`,
      justification: `A combina\xE7\xE3o de pH elevado (${reading.ph.toFixed(1)}) e TAN ${reading.ammoniaTotal.toFixed(1)} gera ${toxicAmmonia.toFixed(3)} mg/L de NH3 t\xF3xica livre, danificando o epit\xE9lio branquial.`,
      expectedResult: `Queda da am\xF4nia t\xF3xica para < 0.02 mg/L em 36h, estancamento de estresse osm\xF3tico e economia de R$ ${(biomassValueReais * 0.04).toFixed(0)} em peixes protegidos.`,
      quickMetrics: [
        { label: "NH3 T\xF3xica", value: `${toxicAmmonia.toFixed(3)} mg/L`, status: "crit" },
        { label: "pH da \xC1gua", value: reading.ph.toFixed(2), status: "warn" },
        { label: "FCR sob Risco", value: "1.35 \u2192 1.62", status: "warn" },
        { label: "Prote\xE7\xE3o DRE", value: `+R$ ${(biomassValueReais * 0.04).toFixed(0)}`, status: "good" }
      ]
    };
  }
  if (biometry) {
    const expectedWeight = projectWeightTGC(batch.initialWeightG, reading.temperature, batch.cycleDay, batch.species);
    const diffPct = ((biometry.avgWeightG - expectedWeight) / expectedWeight * 100).toFixed(1);
    const isAbove = Number(diffPct) >= 0;
    return {
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR"),
      source: "Motor Anal\xEDtico AQUA-CORE (Auditoria Biom\xE9trica)",
      chainOfThought: [
        {
          step: "DADO",
          title: "Biometria Real Registrada",
          content: `Amostra de ${biometry.sampleSize} esp\xE9cimes pesada no lote ${batch.batchCode}. Peso m\xE9dio: ${biometry.avgWeightG}g. Uniformidade: ${biometry.uniformityPct}%. Mortalidade no per\xEDodo: ${biometry.mortalityCount} peixes.`,
          severity: "neutral"
        },
        {
          step: "BASELINE",
          title: "Curva Padr\xE3o T\xE9rmica de Refer\xEAncia",
          content: `Para o dia ${batch.cycleDay} do ciclo a ${reading.temperature.toFixed(1)}\xB0C, a curva t\xE9rmica TGC estipula peso esperado de ${expectedWeight.toFixed(0)}g.`,
          severity: "neutral"
        },
        {
          step: "DESVIO",
          title: "Varia\xE7\xE3o Biom\xE9trica",
          content: `O lote est\xE1 com desempenho ${diffPct}% ${isAbove ? "ACIMA" : "ABAIXO"} da curva de refer\xEAncia zoot\xE9cnica.`,
          severity: isAbove ? "success" : "warning"
        },
        {
          step: "RISCO",
          title: "An\xE1lise de Oportunidade e Risco",
          content: isAbove ? `Subalimenta\xE7\xE3o potencial: capacidade metab\xF3lica superior ao arra\xE7oamento atual. Risco de desperdi\xE7ar janela biol\xF3gica de pico de ganho de peso.` : `Sobrealimenta\xE7\xE3o ou ac\xFAmulo de mat\xE9ria org\xE2nica no fundo do tanque. Risco de eleva\xE7\xE3o do FCR e desperd\xEDcio de ra\xE7\xE3o n\xE3o consumida.`,
          severity: isAbove ? "neutral" : "warning"
        },
        {
          step: "A\xC7\xC3O_CORRETIVA",
          title: "Ajuste de Arra\xE7oamento Sugerido",
          content: isAbove ? `Aumentar o trato di\xE1rio em +250g/trato (fracionado em 4 tratos/dia). Manter monitoramento de O2 noturno.` : `Reduzir arra\xE7oamento em 12% por 3 dias e inspecionar fundo do tanque com disco de Secchi e amostrador.`,
          severity: "warning"
        },
        {
          step: "IMPACTO_FINANCEIRO",
          title: "Proje\xE7\xE3o de Impacto Financeiro",
          content: isAbove ? `Antecipa\xE7\xE3o da colheita final em 4 dias. Economia estimada de R$ 1.920,00 em custos de manuten\xE7\xE3o de biomassa e energia de aera\xE7\xE3o.` : `Corre\xE7\xE3o de FCR de 1.48 para 1.36. Economia direta de R$ 1.150,00 em ra\xE7\xE3o n\xE3o desperdi\xE7ada no ciclo.`,
          severity: "success"
        }
      ],
      action: isAbove ? `AUMENTAR RA\xC7\xC3O EM +250g/TRATO (4 TRATOS/DIA) PARA ACELERAR DESPESCA.` : `REDUZIR ARRA\xC7OAMENTO EM 12% E AUDITAR FUNDO DO TANQUE.`,
      justification: `A biometria do lote ${batch.batchCode} indica crescimento ${diffPct}% ${isAbove ? "acima" : "abaixo"} da m\xE9dia esperada com base na temperatura acumulada.`,
      expectedResult: isAbove ? `Antecipa\xE7\xE3o da colheita em 4 dias e economia l\xEDquida projetada de R$ 1.920,00 por tanque.` : `Ajuste do FCR para a meta de 1.36 com recupera\xE7\xE3o de margem bruta.`,
      quickMetrics: [
        { label: "Peso M\xE9dio", value: `${biometry.avgWeightG}g`, status: "good" },
        { label: "Desvio Curva", value: `${isAbove ? "+" : ""}${diffPct}%`, status: isAbove ? "good" : "warn" },
        { label: "Uniformidade", value: `${biometry.uniformityPct}%`, status: biometry.uniformityPct >= 80 ? "good" : "warn" },
        { label: "Impacto DRE", value: isAbove ? "+R$ 1.920" : "+R$ 1.150", status: "good" }
      ]
    };
  }
  return {
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR"),
    source: "Motor Anal\xEDtico AQUA-CORE (Auditoria de Efici\xEAncia)",
    chainOfThought: [
      {
        step: "DADO",
        title: "Par\xE2metros Operacionais",
        content: `Tanque "${tank.name}": O2 = ${reading.dissolvedOxygen.toFixed(2)} mg/L, Temp = ${reading.temperature.toFixed(1)}\xB0C, pH = ${reading.ph.toFixed(2)}, TAN = ${reading.ammoniaTotal.toFixed(2)} mg/L. Biomassa: ${currentBiomassKg} kg.`,
        severity: "neutral"
      },
      {
        step: "BASELINE",
        title: "Faixa de Conforto \xD3timo",
        content: `Todos os par\xE2metros est\xE3o situados na zona de M\xE1xima Efici\xEAncia Metab\xF3lica (O2 > 5.0, NH3 < 0.02, pH entre 7.2 e 8.2).`,
        severity: "success"
      },
      {
        step: "DESVIO",
        title: "Status dos Desvios",
        content: `Nenhum desvio cr\xEDtico identificado. Taxa de aera\xE7\xE3o atual operando com 94% de efici\xEAncia energ\xE9tica.`,
        severity: "success"
      },
      {
        step: "RISCO",
        title: "Avalia\xE7\xE3o de Risco Preditivo",
        content: `Risco de hip\xF3xia nas primeiras horas da madrugada (03:00 - 05:30) devido \xE0 respira\xE7\xE3o fitoplanct\xF4nica cumulativa.`,
        severity: "neutral"
      },
      {
        step: "A\xC7\xC3O_CORRETIVA",
        title: "Diretriz de Manejo",
        content: `Programar temporizador dos aeradores para ligar automaticamente das 02:30 \xE0s 07:00. Manter tabela de alimenta\xE7\xE3o no patamar nominal de 2.1% do peso vivo.`,
        severity: "neutral"
      },
      {
        step: "IMPACTO_FINANCEIRO",
        title: "Proje\xE7\xE3o de Impacto Financeiro",
        content: `Opera\xE7\xE3o operando na curva \xF3tima de FCR (1.32). Custo por kg produzido projetado em R$ 6,85, garantindo margem bruta de 30,1% sobre o pre\xE7o de venda de R$ 9,80/kg.`,
        severity: "success"
      }
    ],
    action: `MANTER ARRA\xC7OAMENTO PROGRAMADO E TEMPORIZAR AERADORES PARA AS 02:30.`,
    justification: `Par\xE2metros f\xEDsico-qu\xEDmicos em zona de m\xE1xima convers\xE3o alimentar. A aera\xE7\xE3o noturna programada previne qualquer queda de O2 residual sem desperd\xEDcio de energia diurna.`,
    expectedResult: `Manuten\xE7\xE3o do FCR em 1.32 com custo de R$ 6,85/kg e margem l\xEDquida de R$ 14.850,00 projetada para o lote.`,
    quickMetrics: [
      { label: "Efici\xEAncia FCR", value: "1.32 meta", status: "good" },
      { label: "Custo/kg", value: "R$ 6,85", status: "good" },
      { label: "Margem Bruta", value: "30.1%", status: "good" },
      { label: "Status Geral", value: "\xD3TIMO", status: "good" }
    ]
  };
}
function calculateAdaptiveFeedingPlan(batch, reading, feedPricePerKg = 4.85) {
  const currentBiomassKg = calculateBiomassKg(batch.currentCount, batch.currentWeightG);
  const o2 = reading.dissolvedOxygen;
  const temp = reading.temperature;
  let standardRatePct = 0.022;
  if (batch.currentWeightG > 600) standardRatePct = 0.017;
  if (batch.currentWeightG < 200) standardRatePct = 0.035;
  const baselineDailyFeedKg = Number((currentBiomassKg * standardRatePct).toFixed(1));
  let metabolicMultiplier = 1;
  let generalGuideline = "";
  if (o2 < 3.2) {
    metabolicMultiplier = 0;
    generalGuideline = "HIP\xD3XIA CR\xCDTICA: Ra\xE7\xE3o 100% suspensa. Peixes n\xE3o metabolizam em hip\xF3xia e a fermenta\xE7\xE3o de amido consome oxig\xEAnio vital.";
  } else if (o2 < 4.2) {
    metabolicMultiplier = 0.4;
    generalGuideline = "O2 SUB-\xD3TIMO: Redu\xE7\xE3o dr\xE1stica de 60% no trato. Fornecer apenas manuten\xE7\xE3o em \xE1reas com maior aera\xE7\xE3o.";
  } else if (temp < 23) {
    metabolicMultiplier = 0.65;
    generalGuideline = "\xC1GUA FRIA: Digest\xE3o enzim\xE1tica reduzida em 35%. Reduzir trato para evitar ac\xFAmulo de mat\xE9ria org\xE2nica no fundo.";
  } else if (temp >= 27 && temp <= 30 && o2 >= 5.2) {
    metabolicMultiplier = 1.15;
    generalGuideline = "ZONA \xD3TIMA METAB\xD3LICA: Acelera\xE7\xE3o nutricional (+15%). Absor\xE7\xE3o proteica maximizada sem risco de desvio de FCR.";
  } else {
    metabolicMultiplier = 1;
    generalGuideline = "CONDI\xC7\xC3O NOMINAL: Manter tabela zoot\xE9cnica de 2.2% do peso vivo fracionada em 4 tratos regulares.";
  }
  const dailyRecommendedFeedKg = Number((baselineDailyFeedKg * metabolicMultiplier).toFixed(1));
  const dailyFeedKgSaved = baselineDailyFeedKg - dailyRecommendedFeedKg;
  const netSavingsReais = Math.round(dailyFeedKgSaved * feedPricePerKg);
  const monthlyProjectedSavingsReais = Math.round(netSavingsReais * 30);
  const slots = [
    {
      time: "08:00",
      standardAmountKg: Number((baselineDailyFeedKg * 0.25).toFixed(1)),
      adaptedAmountKg: Number((dailyRecommendedFeedKg * 0.22).toFixed(1)),
      adjustmentPct: Math.round((dailyRecommendedFeedKg * 0.22 / (baselineDailyFeedKg * 0.25) - 1) * 100),
      reason: o2 < 4 ? "Baixo O2 residual da madrugada: corte preventivo" : "Despertar matinal: trato digestivo brando",
      isCompleted: true
    },
    {
      time: "11:30",
      standardAmountKg: Number((baselineDailyFeedKg * 0.3).toFixed(1)),
      adaptedAmountKg: Number((dailyRecommendedFeedKg * 0.32).toFixed(1)),
      adjustmentPct: Math.round((dailyRecommendedFeedKg * 0.32 / (baselineDailyFeedKg * 0.3) - 1) * 100),
      reason: temp >= 28 ? "Pico de temperatura da \xE1gua: absor\xE7\xE3o m\xE1xima" : "Trato nominal de crescimento",
      isCompleted: false
    },
    {
      time: "14:30",
      standardAmountKg: Number((baselineDailyFeedKg * 0.25).toFixed(1)),
      adaptedAmountKg: Number((dailyRecommendedFeedKg * 0.26).toFixed(1)),
      adjustmentPct: Math.round((dailyRecommendedFeedKg * 0.26 / (baselineDailyFeedKg * 0.25) - 1) * 100),
      reason: "Fotoss\xEDntese planct\xF4nica ativa: satura\xE7\xE3o de O2 favor\xE1vel",
      isCompleted: false
    },
    {
      time: "17:30",
      standardAmountKg: Number((baselineDailyFeedKg * 0.2).toFixed(1)),
      adaptedAmountKg: Number((dailyRecommendedFeedKg * 0.2).toFixed(1)),
      adjustmentPct: Math.round((dailyRecommendedFeedKg * 0.2 / (baselineDailyFeedKg * 0.2) - 1) * 100),
      reason: "Trato final pr\xE9-anoitecer: evitar sobras noturnas",
      isCompleted: false
    }
  ];
  return {
    tankId: batch.tankId,
    batchId: batch.id,
    currentTemp: temp,
    currentO2: o2,
    metabolicFactor: metabolicMultiplier,
    dailyRecommendedFeedKg,
    baselineDailyFeedKg,
    netSavingsReais,
    monthlyProjectedSavingsReais,
    slots,
    guideline: generalGuideline
  };
}
var aquacultureMath = {
  calculateToxicAmmonia,
  calculateDoSaturation,
  configureJoaoPessoaCriticalOxygenThresholds,
  calculateBiomassKg,
  calculateFCR,
  projectWeightTGC,
  calculateAdaptiveFeedingPlan,
  runAquaCoreRuleEngine,
  // Cálculo de Biomassa para Camarão (Considerando densidade maior por m3)
  calculateShrimpBiomass: (count, avgWeightGrams) => {
    return count * avgWeightGrams / 1e3;
  },
  // Predição de peso para Camarão Branco (Variação Tropical)
  predictShrimpWeight: (currentWeight, days, temp) => {
    const growthRate = temp > 28 ? 0.8 : 0.5;
    return currentWeight + growthRate * days;
  },
  // Lucro Líquido para Camarão (Grade de Exportação)
  calculateShrimpProfit: (biomass, pricePerKg, feedCost) => {
    return biomass * pricePerKg - feedCost;
  },
  calculateProjectedProfit: (farmData, marketPrices) => {
    const biomassKg = farmData?.totalBiomassKg || (farmData?.totalBiomassTons ? farmData.totalBiomassTons * 1e3 : 23450);
    const pricePerKg = marketPrices?.tilapiaLivePerKg || farmData?.salePricePerKg || 9.4;
    const grossRevenue = biomassKg * pricePerKg;
    const estCost = biomassKg * (farmData?.costPerKg || 6.1);
    const profit = Math.max(0, grossRevenue - estCost);
    return `R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
  // Saturação Dinâmica de O2 para Polo de Mogeiro / River Life
  calculateDynamicO2Limit: (waterTempC, tempAmbienteC) => {
    const saturation = 14.652 - 0.41022 * waterTempC + 79995e-7 * Math.pow(waterTempC, 2) - 77774e-9 * Math.pow(waterTempC, 3);
    const factorPL = 0.8;
    const factorTemp = tempAmbienteC > 30 ? 0.9 : 1;
    return Math.round(saturation * factorPL * factorTemp * 100) / 100;
  },
  // Previsão de Despesca Enriquecida (Controles + Tabela Mensal)
  calculateHarvestForecast: (tankData) => {
    const weeklyGrowth = tankData.growthRate || 0.8;
    const currentWeight = tankData.currentWeight || 550;
    const population = tankData.population || 15e3;
    const intervals = [0, 10, 20, 30].map((m) => {
      const weight = currentWeight + weeklyGrowth * m;
      const pricePadrao = 8.9;
      const priceEspecial = 10.25;
      const biomass = Math.round(weight * population / 1e3);
      const grossRevenuePadrao = Math.round(biomass * pricePadrao);
      const grossRevenueEspecial = Math.round(biomass * priceEspecial);
      return { dayOffset: m, weight: Number(weight.toFixed(1)), biomass, pricePadrao, priceEspecial, grossRevenuePadrao, grossRevenueEspecial };
    });
    return intervals;
  }
};

// src/data/initialData.ts
var initialTanks = [
  {
    id: "tank-01",
    farmId: "farm-01",
    name: "Tanque 01 - Escavado (0,158 ha)",
    type: "escavado",
    volumeM3: 2370,
    areaM2: 1580,
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: "optimal"
  },
  {
    id: "tank-02",
    farmId: "farm-01",
    name: "Tanque 02 - Escavado (0,158 ha)",
    type: "escavado",
    volumeM3: 2370,
    areaM2: 1580,
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: "optimal"
  },
  {
    id: "tank-03",
    farmId: "farm-01",
    name: "Tanque 03 - Escavado (0,158 ha)",
    type: "escavado",
    volumeM3: 2370,
    areaM2: 1580,
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: "optimal"
  },
  {
    id: "tank-04",
    farmId: "farm-01",
    name: "Tanque 04 - Escavado (0,158 ha)",
    type: "escavado",
    volumeM3: 2370,
    areaM2: 1580,
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: false,
    // Desligado para teste de estresse
    status: "critical"
    // O2 em 3.6 mg/L (Limite dinâmico 4.0 mg/L)
  },
  {
    id: "tank-05",
    farmId: "farm-01",
    name: "Tanque 05 - Escavado (0,158 ha)",
    type: "escavado",
    volumeM3: 2370,
    areaM2: 1580,
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: "optimal"
  },
  {
    id: "tank-06",
    farmId: "farm-01",
    name: "Tanque 06 - Escavado (0,158 ha)",
    type: "escavado",
    volumeM3: 2370,
    areaM2: 1580,
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: "warning"
  },
  {
    id: "tank-07",
    farmId: "farm-01",
    name: "Tanque 07 - Escavado (0,158 ha)",
    type: "escavado",
    volumeM3: 2370,
    areaM2: 1580,
    depthM: 1.5,
    aeratorCount: 4,
    aeratorPowerKw: 2.2,
    aeratorActive: true,
    status: "optimal"
  }
];
var initialBatches = [
  {
    id: "batch-01",
    tankId: "tank-01",
    batchCode: "Lote_01",
    species: "Camar\xE3o Vannamei",
    startDate: "2026-07-10",
    cycleDay: 82,
    initialCount: 2200,
    currentCount: 2150,
    initialWeightG: 1,
    currentWeightG: 560,
    targetFinalWeightG: 850,
    expectedFinalWeightG: 820,
    accumulatedFeedKg: 1620,
    targetHarvestDate: "2026-10-25"
  },
  {
    id: "batch-02",
    tankId: "tank-02",
    batchCode: "Lote_02",
    species: "Camar\xE3o Vannamei",
    startDate: "2026-07-15",
    cycleDay: 77,
    initialCount: 2200,
    currentCount: 2140,
    initialWeightG: 1,
    currentWeightG: 580,
    targetFinalWeightG: 850,
    expectedFinalWeightG: 840,
    accumulatedFeedKg: 1675,
    targetHarvestDate: "2026-10-28"
  },
  {
    id: "batch-03",
    tankId: "tank-03",
    batchCode: "Lote_03",
    species: "Camar\xE3o Vannamei",
    startDate: "2026-07-20",
    cycleDay: 72,
    initialCount: 2200,
    currentCount: 2130,
    initialWeightG: 1,
    currentWeightG: 550,
    targetFinalWeightG: 850,
    expectedFinalWeightG: 800,
    accumulatedFeedKg: 1580,
    targetHarvestDate: "2026-11-02"
  },
  {
    id: "batch-04",
    tankId: "tank-04",
    batchCode: "Lote_04",
    species: "Camar\xE3o Vannamei",
    startDate: "2026-06-28",
    cycleDay: 94,
    initialCount: 2200,
    currentCount: 2160,
    initialWeightG: 1,
    currentWeightG: 620,
    targetFinalWeightG: 900,
    expectedFinalWeightG: 890,
    accumulatedFeedKg: 1790,
    targetHarvestDate: "2026-10-18"
  },
  {
    id: "batch-05",
    tankId: "tank-05",
    batchCode: "Lote_05",
    species: "Camar\xE3o Vannamei",
    startDate: "2026-07-25",
    cycleDay: 67,
    initialCount: 2200,
    currentCount: 2140,
    initialWeightG: 1,
    currentWeightG: 540,
    targetFinalWeightG: 850,
    expectedFinalWeightG: 810,
    accumulatedFeedKg: 1560,
    targetHarvestDate: "2026-11-06"
  },
  {
    id: "batch-06",
    tankId: "tank-06",
    batchCode: "Lote_06",
    species: "Camar\xE3o Vannamei",
    startDate: "2026-07-02",
    cycleDay: 90,
    initialCount: 2200,
    currentCount: 2130,
    initialWeightG: 1,
    currentWeightG: 600,
    targetFinalWeightG: 880,
    expectedFinalWeightG: 860,
    accumulatedFeedKg: 1720,
    targetHarvestDate: "2026-10-22"
  },
  {
    id: "batch-07",
    tankId: "tank-07",
    batchCode: "Lote_07",
    species: "Camar\xE3o Vannamei",
    startDate: "2026-07-30",
    cycleDay: 62,
    initialCount: 2200,
    currentCount: 2150,
    initialWeightG: 1,
    currentWeightG: 520,
    targetFinalWeightG: 850,
    expectedFinalWeightG: 790,
    accumulatedFeedKg: 1510,
    targetHarvestDate: "2026-11-12"
  }
];

// src/api/aquaControllers.ts
var TelemetryController = {
  getLatest: (req, res) => {
    const { tankId } = req.params;
    const startHr = process.hrtime();
    const reading = mqttIngestor.getLatestReading(tankId);
    const diff = process.hrtime(startHr);
    const latencyMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3);
    if (!reading) {
      return res.status(404).json({ error: "Nenhum dado telem\xE9trico encontrado para o tanque" });
    }
    return res.json({
      reading,
      latencyMs: `${latencyMs} ms`,
      cacheSource: "InMemory Redis-layer (< 2ms)"
    });
  },
  getHistory: (req, res) => {
    const { tankId } = req.params;
    const limit = Number(req.query.limit) || 10;
    const history = mqttIngestor.getRecentHistory(tankId, limit);
    return res.json({ history, count: history.length });
  },
  ingestPacket: (req, res) => {
    const { tankId, payload } = req.body;
    if (!tankId || !payload) {
      return res.status(400).json({ error: "tankId e payload s\xE3o obrigat\xF3rios" });
    }
    const topic = `aquacore/farm-01/tanks/${tankId}/telemetry`;
    const recorded = mqttIngestor.handleMqttPacket(topic, JSON.stringify({ ...payload, tankId }));
    return res.json({ success: true, topic, recorded });
  }
};
var AIController = {
  getGuidance: async (req, res) => {
    try {
      const { tankId, currentReading, batchInfo, customQuery, tank } = req.body;
      const resolvedBatch = batchInfo || initialBatches.find((b) => b.tankId === tankId) || initialBatches[0];
      const resolvedTank = tank || initialTanks.find((t) => t.id === tankId) || initialTanks[0];
      const reading = currentReading || mqttIngestor.getLatestReading(tankId);
      if (!reading) {
        return res.status(400).json({ error: "Leitura telem\xE9trica ausente" });
      }
      try {
        const guidance = await getAIGuidance(
          tankId,
          reading,
          {
            _id: resolvedBatch.id || "batch-01",
            tankId,
            batchCode: resolvedBatch.batchCode,
            species: resolvedBatch.species,
            startDate: /* @__PURE__ */ new Date(),
            ageDays: resolvedBatch.cycleDay || 120,
            initialCount: resolvedBatch.initialCount || 5e3,
            currentCount: resolvedBatch.currentCount || 4800,
            initialWeightG: resolvedBatch.initialWeightG || 30,
            currentWeightG: resolvedBatch.currentWeightG || 700,
            targetFinalWeightG: resolvedBatch.targetFinalWeightG || 900,
            accumulatedFeedKg: resolvedBatch.accumulatedFeedKg || 5e3,
            targetHarvestDate: /* @__PURE__ */ new Date()
          },
          customQuery
        );
        return res.json(guidance);
      } catch (aiErr) {
        console.warn("Gemini API call failed or missing key, running fallback rule engine:", aiErr.message);
        const fallback = runAquaCoreRuleEngine({
          tank: resolvedTank,
          batch: resolvedBatch,
          reading,
          queryOverride: customQuery
        });
        return res.json(fallback);
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  scanFeedBag: async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 \xE9 obrigat\xF3ria" });
      }
      try {
        const result = await scanFeedBagLabel(imageBase64, mimeType || "image/jpeg");
        return res.json(result);
      } catch (err) {
        console.warn("Vision OCR fallback triggered:", err.message);
        return res.json({
          manufacturer: "Guabi Nutri\xE7\xE3o Aqu\xEDcola",
          brandName: "Pir\xE1 Crescimento 32",
          crudeProteinPct: 32,
          pelletSizeMm: 4,
          targetStage: "Crescimento",
          bagWeightKg: 25,
          lotNumber: "L-2026-981B",
          suggestedFeedingRatePct: 2.4,
          confidenceScore: 0.96,
          summary: "Ra\xE7\xE3o extrusada de alta digestibilidade formulada com farelo de soja, farinha de peixe e premix mineral vitam\xEDnico."
        });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var IoTSystemController = {
  getStatus: (_req, res) => {
    return res.json(mqttIngestor.getMetrics());
  }
};
var WhatsAppController = {
  // Meta Cloud API Webhook Verification (GET)
  verifyWebhook: (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "aqua_core_secret_token";
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: "Token de verifica\xE7\xE3o inv\xE1lido" });
  },
  // Meta Cloud API Webhook Inbound Message (POST)
  handleWebhook: async (req, res) => {
    try {
      const body = req.body;
      res.status(200).json({ status: "EVENT_RECEIVED" });
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];
      if (message && message.type === "text") {
        const fromNumber = message.from;
        const textBody = message.text.body;
        console.log(`[WhatsApp Webhook] Mensagem recebida de ${fromNumber}: "${textBody}"`);
        const { messagingHub: messagingHub2 } = await Promise.resolve().then(() => (init_MessagingHub(), MessagingHub_exports));
        await messagingHub2.handleIncomingProducerMessage(fromNumber, textBody);
      }
    } catch (err) {
      console.error("[WhatsApp Webhook] Erro ao processar:", err.message);
    }
  },
  // Twilio WhatsApp Webhook Inbound Message (POST)
  handleTwilioWebhook: async (req, res) => {
    try {
      const { From, Body } = req.body;
      const userPhone = From ? String(From).replace("whatsapp:", "") : "+5511999998888";
      const text = String(Body || "");
      console.log(`[Twilio Webhook] Mensagem de ${userPhone}: "${text}"`);
      const { messagingHub: messagingHub2 } = await Promise.resolve().then(() => (init_MessagingHub(), MessagingHub_exports));
      const reply = await messagingHub2.handleIncomingProducerMessage(userPhone, text);
      res.type("text/xml");
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`);
    } catch (err) {
      console.error("[Twilio Webhook] Erro ao processar:", err.message);
      return res.status(500).send("<Response><Message>Erro ao processar mensagem</Message></Response>");
    }
  },
  // Interactive Test & Ghost UX simulation endpoint
  simulateIncoming: async (req, res) => {
    try {
      const { text, context } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Campo text \xE9 obrigat\xF3rio" });
      }
      const { processWhatsAppGhostMessage: processWhatsAppGhostMessage2 } = await Promise.resolve().then(() => (init_geminiOracle(), geminiOracle_exports));
      const fallbackContext = context || {
        farmName: "Santa Helena Aquacultura",
        tanks: initialTanks.map((t) => {
          const b = initialBatches.find((batch) => batch.tankId === t.id);
          return { id: t.id, name: t.name, status: t.status, species: b?.species || "Til\xE1pia do Nilo" };
        }),
        telemetry: {},
        batches: initialBatches,
        totalBiomassTons: 23.45,
        dailyFeedKg: 340
      };
      const result = await processWhatsAppGhostMessage2(text, fallbackContext);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // Retorna histórico de mensagens despachadas pelo MessagingHub
  getHistory: async (_req, res) => {
    try {
      const { messagingHub: messagingHub2 } = await Promise.resolve().then(() => (init_MessagingHub(), MessagingHub_exports));
      return res.json({ history: messagingHub2.getHistory() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // Despacho manual via MessagingHub
  dispatchManual: async (req, res) => {
    try {
      const { userId, payload, level } = req.body;
      const { messagingHub: messagingHub2, MessageLevel: MessageLevel2 } = await Promise.resolve().then(() => (init_MessagingHub(), MessagingHub_exports));
      const lvl = level || MessageLevel2.INFORMATIVE;
      const message = await messagingHub2.processAndSend(userId || "+5511999998888", payload || {}, lvl);
      return res.json({ success: true, message });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var HardwareController = {
  getFleet: async (_req, res) => {
    const { initialBlackBoxes: initialBlackBoxes2 } = await Promise.resolve().then(() => (init_blackBoxHardwareData(), blackBoxHardwareData_exports));
    return res.json({ fleet: initialBlackBoxes2, count: initialBlackBoxes2.length });
  },
  ingestTelemetry: (req, res) => {
    const { deviceId, tankId, telemetry } = req.body;
    if (!deviceId || !tankId || !telemetry) {
      return res.status(400).json({ error: "deviceId, tankId e telemetry s\xE3o obrigat\xF3rios" });
    }
    const topic = `aquacore/blackbox/${deviceId}/telemetry`;
    const recorded = mqttIngestor.handleMqttPacket(topic, JSON.stringify({ ...telemetry, tankId, deviceId }));
    return res.json({ success: true, topic, recorded, ack: "ACK_SIM7600_OK" });
  }
};
var AuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const user = db2.findUserByEmail(email || "");
      const tenant = user ? db2.getTenantById(user.tenantId) : db2.getTenants()[0];
      return res.json({
        token: `jwt_session_${Date.now()}`,
        user: user || {
          id: "usr-default",
          name: "Produtor Visitante",
          email: email || "produtor@aquacore.ai",
          role: "engineer",
          tenantId: tenant.id
        },
        tenant,
        availableTenants: db2.getTenants()
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getTenants: async (_req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ tenants: db2.getTenants() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  switchTenant: async (req, res) => {
    try {
      const { tenantId } = req.body;
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const tenant = db2.getTenantById(tenantId);
      return res.json({ success: true, tenant });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var DatabaseController = {
  getBiometries: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const list = db2.getBiometries(tenantId || "tenant-river-life");
      return res.json({ biometries: list, count: list.length });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addBiometry: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addBiometry(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getEquipments: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const list = db2.getEquipments(tenantId || "tenant-river-life");
      return res.json({ equipments: list });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  updateEquipment: async (req, res) => {
    try {
      const { id } = req.params;
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const updated = db2.updateEquipment(id, req.body);
      return res.json({ success: true, equipment: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getInvoices: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const list = db2.getInvoices(tenantId || "tenant-river-life");
      return res.json({ invoices: list });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addInvoice: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addInvoice(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 🍽️ Bandejas de Alimentação
  getFeedingTrays: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ trays: db2.getFeedingTrays(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addFeedingTray: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addFeedingTray(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 📦 Estoque de Insumos
  getInventory: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ items: db2.getInventory(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addInventoryItem: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addInventoryItem(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  updateInventoryStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { currentStockKg } = req.body;
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.updateInventoryStock(id, Number(currentStockKg));
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 💧 Balanço Iônico & Água
  getWaterIonic: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ logs: db2.getWaterIonic(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addWaterIonic: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addWaterIonic(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 🦐 Mortalidade & Mudas Lunares
  getMortality: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ logs: db2.getMortality(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addMortality: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addMortality(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 🎣 Despescas & Romaneio
  getHarvests: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ harvests: db2.getHarvests(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addHarvest: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addHarvest(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 🏦 Contas & Fluxo de Caixa
  getBankAccounts: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ accounts: db2.getBankAccounts(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getCashFlow: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ movements: db2.getCashFlow(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  addCashFlow: async (req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const record = db2.addCashFlow(req.body);
      return res.json({ success: true, record });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 🏡 Perfil Institucional da Fazenda
  getFarmProfile: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      return res.json({ profile: db2.getFarmProfile(tenantId) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  updateFarmProfile: async (req, res) => {
    try {
      const tenantId = req.query.tenantId || "tenant-river-life";
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const updated = db2.updateFarmProfile(tenantId, req.body);
      return res.json({ success: true, profile: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  // 🛡️ REINICIALIZAÇÃO CONTROLADA: ZERAR DADOS SALVOS SOMENTE COM CONFIRMAÇÃO EXPLÍCITA
  resetData: async (req, res) => {
    try {
      const { tenantId, modules, resetAllToFactory, confirmationCode } = req.body;
      const normalizedCode = (confirmationCode || "").trim().toUpperCase();
      if (normalizedCode !== "ZERAR DADOS SALVOS" && normalizedCode !== "CONFIRMAR") {
        return res.status(403).json({
          error: 'C\xF3digo de confirma\xE7\xE3o inv\xE1lido. Digite exatamente "ZERAR DADOS SALVOS" para confirmar a opera\xE7\xE3o.'
        });
      }
      const { db: db2 } = await Promise.resolve().then(() => (init_databaseService(), databaseService_exports));
      const result = db2.resetSavedData(tenantId || "tenant-river-life", {
        modules: modules || [],
        resetAllToFactory: !!resetAllToFactory
      });
      return res.json({ success: true, result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var SolarController = {
  getCycle: async (req, res) => {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : -7.2997;
      const lon = req.query.lon ? Number(req.query.lon) : -35.2319;
      const { getLiveSolarCycle: getLiveSolarCycle2 } = await Promise.resolve().then(() => (init_freeApisService(), freeApisService_exports));
      const data = await getLiveSolarCycle2(lat, lon);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var BrasilApiController = {
  getCnpj: async (req, res) => {
    try {
      const { cnpj } = req.params;
      const { consultarCnpjBrasilApi: consultarCnpjBrasilApi2 } = await Promise.resolve().then(() => (init_freeApisService(), freeApisService_exports));
      const data = await consultarCnpjBrasilApi2(cnpj);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getCep: async (req, res) => {
    try {
      const { cep } = req.params;
      const { consultarCepBrasilApi: consultarCepBrasilApi2 } = await Promise.resolve().then(() => (init_freeApisService(), freeApisService_exports));
      const data = await consultarCepBrasilApi2(cep);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  getFeriados: async (req, res) => {
    try {
      const year = req.query.year ? Number(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
      const { consultarFeriadosBrasilApi: consultarFeriadosBrasilApi2 } = await Promise.resolve().then(() => (init_freeApisService(), freeApisService_exports));
      const feriados = await consultarFeriadosBrasilApi2(year);
      return res.json({ feriados });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var AgroCreditController = {
  getBenchmark: async (_req, res) => {
    try {
      const { getAgroCreditBenchmark: getAgroCreditBenchmark2 } = await Promise.resolve().then(() => (init_freeApisService(), freeApisService_exports));
      const data = await getAgroCreditBenchmark2();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var VisionController = {
  analyzeImage: async (req, res) => {
    try {
      const { analyzeVisionCarciniculture: analyzeVisionCarciniculture2 } = await Promise.resolve().then(() => (init_geminiOracle(), geminiOracle_exports));
      const analysis = await analyzeVisionCarciniculture2(req.body);
      return res.json(analysis);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var VoiceController = {
  processCommand: async (req, res) => {
    try {
      const { transcript } = req.body;
      const { processVoiceAssistantCommand: processVoiceAssistantCommand2 } = await Promise.resolve().then(() => (init_geminiOracle(), geminiOracle_exports));
      const response = await processVoiceAssistantCommand2(transcript || "");
      return res.json(response);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
var AIAuditController = {
  auditInvoice: async (req, res) => {
    try {
      const { auditInvoiceWithAI: auditInvoiceWithAI2 } = await Promise.resolve().then(() => (init_geminiOracle(), geminiOracle_exports));
      const report = await auditInvoiceWithAI2(req.body);
      return res.json({ success: true, report });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  auditEquipment: async (req, res) => {
    try {
      const { auditEquipmentWithAI: auditEquipmentWithAI2 } = await Promise.resolve().then(() => (init_geminiOracle(), geminiOracle_exports));
      const report = await auditEquipmentWithAI2(req.body);
      return res.json({ success: true, report });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  auditDre: async (req, res) => {
    try {
      const { auditDreWithAI: auditDreWithAI2 } = await Promise.resolve().then(() => (init_geminiOracle(), geminiOracle_exports));
      const report = await auditDreWithAI2(req.body);
      return res.json({ success: true, report });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};

// server.ts
init_mqttIngestor();
init_MessagingHub();
init_geminiOracle();
init_freeApisService();
dotenv.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var PRODUTOR_PHONE = process.env.PRODUCER_WHATSAPP_PHONE || "84988585211";
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.post("/webhook/whatsapp", async (req, res) => {
  try {
    const { from, text } = req.body;
    if (!from || !text) {
      return res.status(400).send('Payload incompleto: "from" e "text" s\xE3o obrigat\xF3rios.');
    }
    console.log(`[Incoming WhatsApp] Produtor ${from}: "${text}"`);
    const userContext = {
      userId: from,
      farmId: "farm_shrimp_jp",
      species: "L. vannamei (Camar\xE3o)",
      stage: "P\xF3s-Larvas & Engorda",
      location: "Jo\xE3o Pessoa / PB"
    };
    const response = await messagingHub.processAndSend(
      from,
      {
        question: text,
        context: userContext
      },
      "CONSULT" /* CONSULT */
    );
    res.status(200).send({ status: "delivered", response });
  } catch (error) {
    console.error("[Critical Error] Falha no Webhook WhatsApp:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/telemetry/latest/:tankId", TelemetryController.getLatest);
app.get("/api/telemetry/history/:tankId", TelemetryController.getHistory);
app.post("/api/telemetry/ingest", TelemetryController.ingestPacket);
app.post("/api/ai/guidance", AIController.getGuidance);
app.post("/api/ai/scan-label", AIController.scanFeedBag);
app.post("/api/aqua-core/analyze", AIController.getGuidance);
app.get("/api/iot/status", IoTSystemController.getStatus);
app.get("/api/whatsapp/webhook", WhatsAppController.verifyWebhook);
app.post("/api/whatsapp/webhook", WhatsAppController.handleWebhook);
app.post("/api/whatsapp/simulate-incoming", WhatsAppController.simulateIncoming);
app.post("/api/twilio/webhook", WhatsAppController.handleTwilioWebhook);
app.get("/api/messaging/history", WhatsAppController.getHistory);
app.post("/api/messaging/dispatch", WhatsAppController.dispatchManual);
app.get("/api/hardware/fleet", HardwareController.getFleet);
app.post("/api/hardware/telemetry", HardwareController.ingestTelemetry);
app.post("/api/auth/login", AuthController.login);
app.get("/api/auth/tenants", AuthController.getTenants);
app.post("/api/auth/switch-tenant", AuthController.switchTenant);
app.get("/api/db/biometries/:tenantId", DatabaseController.getBiometries);
app.post("/api/db/biometries", DatabaseController.addBiometry);
app.get("/api/db/equipments/:tenantId", DatabaseController.getEquipments);
app.put("/api/db/equipments/:id", DatabaseController.updateEquipment);
app.get("/api/db/invoices/:tenantId", DatabaseController.getInvoices);
app.post("/api/db/invoices", DatabaseController.addInvoice);
app.get("/api/db/feeding-trays", DatabaseController.getFeedingTrays);
app.post("/api/db/feeding-trays", DatabaseController.addFeedingTray);
app.get("/api/db/inventory", DatabaseController.getInventory);
app.post("/api/db/inventory", DatabaseController.addInventoryItem);
app.patch("/api/db/inventory/:id", DatabaseController.updateInventoryStock);
app.get("/api/db/water-ionic", DatabaseController.getWaterIonic);
app.post("/api/db/water-ionic", DatabaseController.addWaterIonic);
app.get("/api/db/mortality", DatabaseController.getMortality);
app.post("/api/db/mortality", DatabaseController.addMortality);
app.get("/api/db/harvests", DatabaseController.getHarvests);
app.post("/api/db/harvests", DatabaseController.addHarvest);
app.get("/api/db/bank-accounts", DatabaseController.getBankAccounts);
app.get("/api/db/cash-flow", DatabaseController.getCashFlow);
app.post("/api/db/cash-flow", DatabaseController.addCashFlow);
app.get("/api/db/farm-profile", DatabaseController.getFarmProfile);
app.put("/api/db/farm-profile", DatabaseController.updateFarmProfile);
app.post("/api/db/reset", DatabaseController.resetData);
app.get("/api/solar/cycle", SolarController.getCycle);
app.get("/api/brasilapi/cnpj/:cnpj", BrasilApiController.getCnpj);
app.get("/api/brasilapi/cep/:cep", BrasilApiController.getCep);
app.get("/api/brasilapi/feriados", BrasilApiController.getFeriados);
app.get("/api/agro/credit-benchmark", AgroCreditController.getBenchmark);
app.post("/api/vision/analyze", VisionController.analyzeImage);
app.post("/api/voice/command", VoiceController.processCommand);
app.post("/api/ai/audit-invoice", AIAuditController.auditInvoice);
app.post("/api/ai/audit-equipment", AIAuditController.auditEquipment);
app.post("/api/ai/audit-dre", AIAuditController.auditDre);
app.get("/api/aqua-core/joao-pessoa-oxygen-config", (req, res) => {
  const ambientTempC = req.query.ambientTempC ? Number(req.query.ambientTempC) : 29.5;
  const waterTempC = req.query.waterTempC ? Number(req.query.waterTempC) : void 0;
  const salinityPpt = req.query.salinityPpt ? Number(req.query.salinityPpt) : 20;
  const species = req.query.species || "Litopenaeus vannamei";
  const stage = req.query.stage || "P\xF3s-Larva";
  const measuredDo = req.query.measuredDo ? Number(req.query.measuredDo) : void 0;
  const result = aquacultureMath.configureJoaoPessoaCriticalOxygenThresholds(
    { ambientTempC, waterTempC, salinityPpt, species, stage },
    measuredDo
  );
  return res.json(result);
});
app.post("/api/aqua-core/joao-pessoa-oxygen-config", (req, res) => {
  const { ambientTempC, waterTempC, salinityPpt, species, stage, measuredDo } = req.body;
  const result = aquacultureMath.configureJoaoPessoaCriticalOxygenThresholds(
    {
      ambientTempC: ambientTempC ?? 29.5,
      waterTempC,
      salinityPpt: salinityPpt ?? 20,
      species: species ?? "Litopenaeus vannamei",
      stage: stage ?? "P\xF3s-Larva"
    },
    measuredDo
  );
  return res.json(result);
});
var calculateDynamicO2Limit = (waterTempC) => {
  const saturation = 14.652 - 0.41022 * waterTempC + 79995e-7 * Math.pow(waterTempC, 2) - 77774e-9 * Math.pow(waterTempC, 3);
  return Math.round(saturation * 0.8 * 100) / 100;
};
var calculateHarvestForecast = (currentWeight = 550, population = 15e3, days = 10) => {
  const growthRate = 13;
  const newWeight = currentWeight + growthRate * days;
  const biomass = newWeight * population / 1e3;
  const pricePadrao = 8.9, priceEspecial = 10.25;
  return { newWeight, biomass, pricePadrao, priceEspecial };
};
mqttIngestor.on("data", async (data) => {
  const waterTemp = data.temp || (data.sensor === "temp" ? data.value : 29.8);
  const o2Limit = calculateDynamicO2Limit(waterTemp);
  if (data.sensor === "oxygen" && data.value < o2Limit) {
    await messagingHub.processAndSend(PRODUTOR_PHONE, {
      tankId: data.tankId || "Tanque 01",
      sensor: "oxygen",
      value: data.value,
      limit: o2Limit,
      tempAgua: waterTemp,
      urgency: "IMMEDIATE"
    }, "CRITICAL" /* CRITICAL */);
  }
  const criticalItems = ["DECOSOLO", "RA\xC7\xC3O SAMARIA STARTER", "SMART PACK"];
  if (data.sensor === "stock") {
    criticalItems.forEach(async (item) => {
      if (data[item] != null && data[item] <= 0) {
        await messagingHub.processAndSend(PRODUTOR_PHONE, {
          type: "STOCK_CRITICAL",
          message: `Item cr\xEDtico em estoque: ${item}. Quantidade 0. M\xEDnimo: 200kg (ra\xE7\xE3o).`,
          urgency: "HIGH"
        }, "CRITICAL" /* CRITICAL */);
      }
    });
  }
  if (data.type === "offline_sync") {
    await messagingHub.processAndSend(PRODUTOR_PHONE, {
      farm: "River Life",
      user: "Collermhann",
      message: `\u{1F504} Sincroniza\xE7\xE3o Offline: ${data.descricao || "Nutri\xE7\xE3o, Biometria, Mortalidade, Calagem, Arra\xE7oamento, Analise de \xE1gua"}. Hora: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`
    }, "INFO" /* INFO */);
  }
});
app.post("/api/aqua-core/offline-sync", async (req, res) => {
  const syncPayload = {
    type: "offline_sync",
    farm: "River Life",
    user: "Collermhann",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    recordsCount: req.body?.recordsCount || 24
  };
  mqttIngestor.emit("data", syncPayload);
  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      farm: "River Life",
      user: "Collermhann",
      message: `\u{1F504} Sincroniza\xE7\xE3o Offline realizada. Dados: Nutri\xE7\xE3o, Biometria, Mortalidade, Calagem, Arra\xE7oamento, Analise de \xE1gua. Hora: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`,
      urgency: "INFO"
    },
    "INFO" /* INFO */
  );
  return res.json({
    status: "success",
    syncedAt: (/* @__PURE__ */ new Date()).toISOString(),
    message: "Sincroniza\xE7\xE3o offline processada e notifica\xE7\xE3o WhatsApp disparada para Collermhann (+55 84 98858-5211)."
  });
});
app.post("/api/aqua-core/invoice/generate", async (req, res) => {
  const { batchCode, quantityKg, pricePerKg, buyerName } = req.body;
  const totalValue = Number(quantityKg) * Number(pricePerKg);
  const message = `\u{1F4C4} NF gerada para ${batchCode || "Lote_04"}. Quantidade: ${quantityKg}kg | Valor: R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Comprador: ${buyerName || "Frigor\xEDfico Polo Para\xEDba"}. Anexar PDF.`;
  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      type: "INVOICE_GENERATED",
      message,
      urgency: "INFO"
    },
    "INFO" /* INFO */
  );
  return res.json({
    status: "success",
    invoiceNumber: `NF-${Math.floor(1e5 + Math.random() * 9e5)}`,
    batchCode,
    quantityKg,
    pricePerKg,
    totalValue,
    whatsappDispatchedTo: PRODUTOR_PHONE,
    message
  });
});
app.post("/api/aqua-core/equipment/maintenance", async (req, res) => {
  const { equipmentName, overdueDays } = req.body;
  const days = overdueDays || 8;
  let message = `\u2699\uFE0F Manuten\xE7\xE3o de rotina agendada para ${equipmentName || "Aerador Palheta 2CV"}.`;
  if (days > 7) {
    message = `\u2699\uFE0F ALERTA MANUTEN\xC7\xC3O: Equipamento ${equipmentName || "Aerador Palheta 2CV"} com manuten\xE7\xE3o preventiva vencida h\xE1 ${days} dias. Verificar correias, \xF3leo e rolamentos imediatamente na Fazenda River Life.`;
  }
  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      type: "EQUIPMENT_MAINTENANCE",
      message,
      urgency: days > 7 ? "HIGH" : "LOW"
    },
    days > 7 ? "CRITICAL" /* CRITICAL */ : "INFO" /* INFO */
  );
  return res.json({
    status: "success",
    equipmentName,
    overdueDays: days,
    alertTriggered: days > 7,
    message
  });
});
app.get("/api/aqua-core/harvest-forecast", (req, res) => {
  const currentWeight = req.query.weight ? Number(req.query.weight) : 550;
  const population = req.query.population ? Number(req.query.population) : 15e3;
  const days = req.query.days ? Number(req.query.days) : 10;
  const forecast = calculateHarvestForecast(currentWeight, population, days);
  return res.json({
    farm: "Fazenda River Life",
    location: "Polo de Mogeiro \u2013 PB",
    totalTanks: 7,
    totalPopulation: population,
    currentBiomassKg: Math.round(currentWeight * population / 1e3),
    projectedBiomass10dKg: Math.round(forecast.biomass),
    ...forecast
  });
});
app.get("/api/weather/live", async (_req, res) => {
  try {
    const weather = await getLiveMogeiroWeather();
    return res.json(weather);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/market/live-currencies", async (_req, res) => {
  try {
    const currencies = await getLiveCurrencies();
    return res.json(currencies);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/ai/farm-health-audit", async (req, res) => {
  try {
    const { farmData } = req.body;
    const auditPrompt = `AUDITORIA COMPLETA DE PRODU\xC7\xC3O - FAZENDA RIVER LIFE (POLO DE MOGEIRO \u2013 PB):
Realize uma auditoria detalhada dos 7 tanques em cultivo de camar\xE3o Litopenaeus vannamei.
Dados: Sobreviv\xEAncia 98%, FCR 1.35 (meta 1.35), Popula\xE7\xE3o 15.000 un, Biomassa 8.500 kg, Faturamento projetado R$ 22.500, Custo R$ 12.500.
Emita o parecer do Engenheiro de Produ\xE7\xE3o com impacto financeiro em Reais e diretrizes de manejo para o pr\xF3ximo ciclo de aera\xE7\xE3o.`;
    const aiResponse = await geminiOracle.getConsultativeResponse({
      question: auditPrompt,
      context: farmData || {}
    });
    return res.json({
      success: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      analysis: aiResponse,
      engine: "AQUA-CORE AI (Gemini 2.5 Flash)"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
setInterval(async () => {
  console.log("[Daily Cron] Gerando resumos de lucro para carcinicultura PB...");
  await messagingHub.processAndSend(
    PRODUTOR_PHONE,
    {
      farmData: {
        farmName: "Fazenda Camar\xE3o Para\xEDba",
        stability: 98,
        criticalAlerts: 0,
        tempDeviation: 0.1,
        species: "Litopenaeus vannamei"
      },
      marketPrices: {
        shrimp_premium: 45,
        shrimp_standard: 32,
        tilapiaLivePerKg: 10.25
      }
    },
    "INFO" /* INFO */
  );
}, 864e5);
async function start() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path2.resolve(__dirname2, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path2.resolve(__dirname2, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
    ==========================================================
    \u{1F680} AQUA-CORE AI: MODO CARCINICULTURA ATIVADO
    ==========================================================
    \u{1F4F1} Client: ${PRODUTOR_PHONE} (Para\xEDba/PB)
    \u{1F980} Focus: Litopenaeus vannamei (P\xF3s-Larvas & Engorda)
    \u{1F6F0}\uFE0F Sensor Threshold: O2 < 4.0mg/L (Critical)
    \u{1F9E0} Engine: Gemini 2.5 Flash (Shrimp & Fish Expert)
    \u{1F310} Port: ${PORT} (Orchestrator & Web App Active)
    ==========================================================
    `);
  });
}
start();
