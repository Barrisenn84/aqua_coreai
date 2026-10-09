import { GeminiOracle } from '../ai/geminiOracle';
import { MqttIngestor } from '../iot/mqttIngestor';

export enum MessageLevel {
  INFO = 'INFO',
  INFORMATIVE = 'INFO',
  CONSULT = 'CONSULT',
  CONSULTATIVE = 'CONSULT',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'CRITICAL',
}

export interface DispatchedLogItem {
  id: string;
  userId: string;
  level: MessageLevel;
  message: string;
  timestamp: string;
  channel: 'whatsapp_meta' | 'whatsapp_twilio' | 'simulated';
  status: 'sent' | 'delivered' | 'failed';
}

/**
 * PILAR 1: O HUB DE CONECTIVIDADE (The Bridge)
 * O coração do sistema como Orquestrador de Mensageria.
 * Interliga: Sensores IoT (MQTT) + Entradas Manuais (WhatsApp) + Cognição (Gemini AI) + Saída (Meta/Twilio API).
 */
export class MessagingHub {
  private oracle = new GeminiOracle();
  private history: DispatchedLogItem[] = [];
  private listeners: ((item: DispatchedLogItem) => void)[] = [];

  // Função principal que decide o que enviar ao produtor
  async processAndSend(userId: string, payload: any, level: MessageLevel): Promise<string> {
    console.log(`[Hub] Processando mensagem nível ${level} para usuário ${userId}`);

    let finalMessage = '';

    switch (level) {
      case MessageLevel.CRITICAL:
        // A IA gera um comando de sobrevivência imediato
        finalMessage = await this.oracle.generateCriticalAlert(payload);
        await this.dispatchToWhatsApp(userId, `⚠️ ${finalMessage}`, level);
        break;

      case MessageLevel.CONSULTATIVE:
        // A IA responde a uma dúvida técnica do produtor
        finalMessage = await this.oracle.getConsultativeResponse(payload);
        await this.dispatchToWhatsApp(userId, `💡 ${finalMessage}`, level);
        break;

      case MessageLevel.INFORMATIVE:
        // O "Daily Digest" - Resumo de lucro e estabilidade
        finalMessage = await this.oracle.generateDailyDigest(payload);
        await this.dispatchToWhatsApp(userId, `🌅 ${finalMessage}`, level);
        break;
    }

    return finalMessage;
  }

  /**
   * Despacho para a API do WhatsApp (Meta Graph API / Twilio)
   */
  async dispatchToWhatsApp(
    userId: string,
    message: string,
    level: MessageLevel = MessageLevel.INFORMATIVE
  ): Promise<void> {
    console.log(`[WhatsApp API] Enviando para ${userId}: ${message}`);

    const logItem: DispatchedLogItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      level,
      message,
      timestamp: new Date().toISOString(),
      channel: 'simulated',
      status: 'delivered',
    };

    // 1. Meta WhatsApp Cloud API real integration if configured
    const metaToken = process.env.WHATSAPP_TOKEN;
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (metaToken && metaPhoneId) {
      try {
        const cleanPhone = userId.replace(/\D/g, '');
        const metaRes = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${metaToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: { preview_url: false, body: message },
          }),
        });

        if (metaRes.ok) {
          logItem.channel = 'whatsapp_meta';
          logItem.status = 'sent';
          console.log(`[Meta Cloud API] Mensagem entregue com sucesso para ${cleanPhone}`);
        } else {
          console.warn('[Meta Cloud API] Resposta de erro da Meta:', await metaRes.text());
        }
      } catch (err: any) {
        console.error('[Meta Cloud API] Erro ao disparar mensagem:', err.message);
      }
    }

    // 2. Twilio WhatsApp API real integration if configured
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    if (twilioAccountSid && twilioAuthToken) {
      try {
        const toParam = userId.startsWith('whatsapp:') ? userId : `whatsapp:${userId}`;
        const basicAuth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
        const formParams = new URLSearchParams({
          From: twilioFrom,
          To: toParam,
          Body: message,
        });

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${basicAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formParams.toString(),
          }
        );

        if (twilioRes.ok) {
          logItem.channel = 'whatsapp_twilio';
          logItem.status = 'sent';
          console.log(`[Twilio WhatsApp] Mensagem despachada para ${toParam}`);
        }
      } catch (err: any) {
        console.error('[Twilio WhatsApp] Erro no envio:', err.message);
      }
    }

    // Store in circular buffer (max 100 items)
    this.history.unshift(logItem);
    if (this.history.length > 100) this.history.pop();

    // Notify listeners
    this.listeners.forEach((fn) => {
      try {
        fn(logItem);
      } catch (e) {
        console.error('[MessagingHub] Erro em listener:', e);
      }
    });
  }

  /**
   * Processador de mensagens recebidas do Produtor via WhatsApp
   * Analisa a intenção e responde no nível apropriado
   */
  async handleIncomingProducerMessage(userId: string, incomingText: string, context?: any): Promise<string> {
    const textLower = incomingText.toLowerCase();

    // 1. Se contém indícios de anomalia grave ou oxigênio crítico
    if (textLower.includes('oxig') || textLower.includes('alerta') || textLower.includes('emerg') || textLower.includes('morrendo')) {
      return this.processAndSend(
        userId,
        {
          tankName: 'Tanque 04',
          dissolvedOxygen: 2.4,
          temperature: 28.5,
          financialRisk: 'R$ 14.800',
          query: incomingText,
        },
        MessageLevel.CRITICAL
      );
    }

    // 2. Se for sobre nutrição / manejo / ração / peso
    if (textLower.includes('rac') || textLower.includes('aliment') || textLower.includes('lote') || textLower.includes('trato')) {
      return this.processAndSend(
        userId,
        {
          lot: 'Lote B (Tanque 02)',
          species: 'Litopenaeus vannamei',
          temperature: 27.8,
          biomassKg: 6420,
          query: incomingText,
        },
        MessageLevel.CONSULTATIVE
      );
    }

    // 3. Resumo matinal ou status geral
    return this.processAndSend(
      userId,
      {
        farmName: context?.farmName || 'Santa Helena Aquacultura',
        totalBiomassTons: context?.totalBiomassTons || 23.4,
        avgFcr: context?.avgFcr || 1.34,
        nextBiometryDate: 'Quinta-feira, 07:00h',
      },
      MessageLevel.INFORMATIVE
    );
  }

  getHistory(): DispatchedLogItem[] {
    return [...this.history];
  }

  onDispatch(listener: (item: DispatchedLogItem) => void) {
    this.listeners.push(listener);
  }
}

export const messagingHub = new MessagingHub();
