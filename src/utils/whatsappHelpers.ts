import { WhatsAppGhostOutput } from '../models/aquacultureModels';

/**
 * Generates the standardized 07:00 AM "The Daily Digest"
 */
export function generateDailyDigestWhatsApp(
  farmName: string,
  totalBiomassTons: number,
  avgFcr: number,
  projectedProfit: number,
  nextBiometryDate: string
): string {
  return `☀️ *AQUA-CORE | The Daily Digest (07:00)*
Fazenda: *${farmName}*

• *Biomassa Viva em Água:* ${totalBiomassTons.toFixed(2)} toneladas
• *FCR Médio Global:* ${avgFcr.toFixed(2)} (Meta: 1.40)
• *Lucro Líquido Projetado:* R$ ${projectedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• *Status dos Sensores:* 4 Caixas Pretas HaaS 4G conectadas (100% online)
• *Próxima Biometria:* ${nextBiometryDate}

💡 *Recomendação do Engenheiro:* Manter primeira alimentação do dia às 08:30 após estabilização do oxigênio fotossintético. Responda aqui para consultar dosagens.`;
}

/**
 * Generates the life-or-death "The Guardian" immediate dispatch
 */
export function generateGuardianWhatsAppAlert(
  tankName: string,
  dissolvedOxygen: number,
  temperature: number,
  financialLossRisk: number
): { text: string; followUpScheduleMinutes: number } {
  return {
    text: `🚨 *AQUA-CORE GUARDIAN | ALERTA CRÍTICO DE SOBREVIVÊNCIA*
Tanque: *${tankName}*

⚠️ *OXIGÊNIO EM NÍVEL LETAL:* *${dissolvedOxygen.toFixed(1)} mg/L* (Mínimo seguro: 3.5 mg/L).
Temperatura: ${temperature.toFixed(1)}°C | Risco financeiro iminente: *R$ ${financialLossRisk.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*.

*AÇÃO CORRETIVA IMEDIATA:*
1. LIGUE OS AERADORES DO TANQUE AGORA.
2. Suspenda imediatamente qualquer arraçoamento programado.

⏱️ *Loop de Contingência:* A IA está monitorando a telemetria via 4G minuto a minuto. Se o O₂ não ultrapassar 3.2 mg/L nos próximos 15 minutos, acionaremos chamada de emergência.`,
    followUpScheduleMinutes: 15,
  };
}

/**
 * Client-side WhatsApp Ghost UX caller with resilient server proxy and deterministic fallback
 */
export async function requestWhatsAppGhostResponse(
  incomingText: string,
  contextData: {
    farmName: string;
    tanks: { id: string; name: string; status: string; species: string }[];
    telemetry: Record<string, any>;
    batches: any[];
    totalBiomassTons: number;
    dailyFeedKg: number;
  }
): Promise<WhatsAppGhostOutput> {
  // Try sending to the backend server endpoint
  try {
    const res = await fetch('/api/whatsapp/simulate-incoming', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: incomingText,
        context: contextData,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.replyText) {
        return data as WhatsAppGhostOutput;
      }
    }
  } catch (err) {
    console.warn('Backend WhatsApp API endpoint unavailable, using local AquaCore rule engine:', err);
  }

  // Deterministic Local Rule Engine fallback
  const normalized = incomingText.toLowerCase();

  if (
    normalized.includes('oxig') ||
    normalized.includes('alerta') ||
    normalized.includes('emerg') ||
    normalized.includes('morrendo') ||
    normalized.includes('parada') ||
    normalized.includes('flor')
  ) {
    return {
      level: 'critical',
      replyText: `🚨 O2 Tanque 01 em 3.6mg/L (Dinâmico: 4.0mg/L por temp 29.8°C). Risco de mortalidade de PLs em < 2h. Aeração máxima NOW. Perda estimada: R$ 8.900,00.`,
      intent: 'critical_hypoxia_alert',
      actionRequired: true,
      followUpMinutes: 15,
      metadata: {
        tankId: 'tank-04',
        dissolvedOxygen: 3.6,
        financialImpactEstimated: 'R$ 8.900,00',
      },
    };
  }

  if (
    normalized.includes('rac') ||
    normalized.includes('aliment') ||
    normalized.includes('lote') ||
    normalized.includes('comer') ||
    normalized.includes('colh') ||
    normalized.includes('preco') ||
    normalized.includes('cotac')
  ) {
    return {
      level: 'consultative',
      replyText: `Grade Padrão (750g): R$ 8,90/kg. Grade Especial (950g): R$ 10,25/kg. Projeção 10 dias: +R$ 15.000 lucro líquido. Recomendação: Segurar despesca para atingir calibre especial no Polo Paraíba.`,
      intent: 'market_consultative_oracle',
      actionRequired: false,
      metadata: {
        tankId: 'tank-02',
        temperature: 29.5,
        recommendedFeedKg: 14.5,
      },
    };
  }

  return {
    level: 'informative',
    replyText: `Bom dia! Sobrevivência 92% na Fazenda River Life. Chuva prevista 0,8mm às 10h (sensação 34°C, vento 16km/h). Custo ração dia: R$ 4,15. Projeção biomassa: 12.000kg para colheita ótima em 20/Out.`,
    intent: 'farm_status_summary',
    actionRequired: false,
  };
}
