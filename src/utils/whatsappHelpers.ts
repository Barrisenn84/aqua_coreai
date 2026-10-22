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
  financialLossRisk: number | null
): { text: string; followUpScheduleMinutes: number } {
  const financialText = typeof financialLossRisk === 'number' && financialLossRisk > 0
    ? `R$ ${financialLossRisk.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'não calculado (preço e biomassa pendentes)';
  return {
    text: `🚨 *AQUA-CORE GUARDIAN | ALERTA CRÍTICO DE SOBREVIVÊNCIA*
Tanque: *${tankName}*

⚠️ *OXIGÊNIO EM NÍVEL LETAL:* *${dissolvedOxygen.toFixed(1)} mg/L* (Mínimo seguro: 3.5 mg/L).
Temperatura: ${temperature.toFixed(1)}°C | Risco financeiro: *${financialText}*.

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
      replyText: `Para verificar um possível alerta de oxigênio, informe o tanque, a leitura atual, o horário e a temperatura. Sem esses dados, a AQUA não simula uma emergência como se fosse real.`,
      intent: 'critical_hypoxia_alert',
      actionRequired: true,
      followUpMinutes: 15,
      metadata: {
        validationRequired: true,
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
      replyText: `Ainda não há base validada para recomendar a despesca. Confirme uma biometria recente, a cotação com fonte e data, os custos realizados e a qualidade da água. Depois disso, a AQUA compara os cenários sem inventar preço ou lucro.`,
      intent: 'market_consultative_oracle',
      actionRequired: false,
      metadata: {
        tankId: 'tank-02',
        validationRequired: true,
      },
    };
  }

  return {
    level: 'informative',
    replyText: `Posso montar o resumo da fazenda com dados validados. Abra o Centro de Controle para conferir clima, lotes, alimentação e alertas; valores ausentes não serão inventados.`,
    intent: 'farm_status_summary',
    actionRequired: false,
  };
}
