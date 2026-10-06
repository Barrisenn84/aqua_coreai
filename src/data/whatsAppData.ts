import { IWhatsAppMessage } from '../models/aquacultureModels';

export const initialWhatsAppMessages: IWhatsAppMessage[] = [
  {
    id: 'wa-001',
    sender: 'aqua-core-ai',
    senderName: 'AQUA-CORE AI 🟢',
    timestamp: '07:00',
    content: `☀️ *AQUA-CORE | The Daily Digest (07:00)*
Fazenda: *Santa Helena Aquacultura*

• *Biomassa Viva em Água:* 23.45 toneladas
• *FCR Médio Global:* 1.34 (Meta: 1.40)
• *Lucro Líquido Projetado:* R$ 138.450,00
• *Status dos Sensores:* 4 Caixas Pretas HaaS 4G conectadas (100% online)
• *Próxima Biometria Sugerida:* Quinta-feira (Tanque 02)

💡 *Recomendação do Engenheiro:* Manter primeiro trato às 08:30 após estabilização do oxigênio fotossintético. Para consultar dosagens ou registrar eventos, responda esta mensagem.`,
    level: 'informative',
    deliveryStatus: 'read',
  },
  {
    id: 'wa-002',
    sender: 'producer',
    senderName: 'Produtor (Você)',
    timestamp: '08:15',
    content: 'Quanto de ração coloco no Lote B hoje?',
    level: 'consultative',
    deliveryStatus: 'read',
  },
  {
    id: 'wa-003',
    sender: 'aqua-core-ai',
    senderName: 'AQUA-CORE AI 🟢',
    timestamp: '08:15',
    content: `🔮 *THE ORACLE (Manejo Nutricional)*
Lote: *Lote B (Tanque 02)*

• *Dose recomendada hoje:* *12.4 kg* de ração 32% PB.
• *Justificativa Zootécnica:* Água a *27.8°C* com O₂ a *5.8 mg/L*. Metabolismo acelerado em +14% pela curva TGD.
• *Divisão do Trato:*
  - 1º Trato (08:30): 4.1 kg
  - 2º Trato (12:30): 4.5 kg
  - 3º Trato (16:30): 3.8 kg

*Economia esperada:* Zero desperdício no fundo do tanque, prevenindo pico de amônia.`,
    level: 'consultative',
    tankId: 'tank-02',
    deliveryStatus: 'read',
    metadata: {
      temperature: 27.8,
      recommendedFeedKg: 12.4,
    },
  },
  {
    id: 'wa-004',
    sender: 'aqua-core-ai',
    senderName: 'AQUA-CORE AI 🟢',
    timestamp: '09:42',
    content: `🚨 *AQUA-CORE GUARDIAN | ALERTA CRÍTICO DE SOBREVIVÊNCIA*
Tanque: *Tanque 04 (Lote D - Terminação)*

⚠️ *OXIGÊNIO EM NÍVEL LETAL:* *2.4 mg/L* (Mínimo seguro: 3.5 mg/L).
Temperatura: 29.2°C | Risco financeiro iminente: *R$ 14.800,00* em biomassa.

*AÇÃO CORRETIVA IMEDIATA:*
1. LIGUE OS AERADORES DO TANQUE AGORA.
2. Suspenda imediatamente qualquer arraçoamento programado.

⏱️ *Loop de Contingência:* A IA está monitorando a telemetria via 4G minuto a minuto. Vou monitorar a subida e te aviso em *15 minutos*.`,
    level: 'critical',
    tankId: 'tank-04',
    actionRequired: true,
    followUpScheduleMinutes: 15,
    deliveryStatus: 'read',
    metadata: {
      dissolvedOxygen: 2.4,
      financialImpactEstimated: 'R$ 14.800,00',
    },
  },
  {
    id: 'wa-005',
    sender: 'producer',
    senderName: 'Produtor (Você)',
    timestamp: '09:43',
    content: 'Acabei de ligar os 2 aeradores do tanque 4!',
    level: 'critical',
    deliveryStatus: 'read',
  },
  {
    id: 'wa-006',
    sender: 'aqua-core-ai',
    senderName: 'AQUA-CORE AI 🟢',
    timestamp: '09:44',
    content: `✅ *COMANDO CONFIRMADO:* Telemetria 4G da Caixa Preta detectou aumento da turbulência na sonda.
Taxa atual de reoxigenação: +0.32 mg/L a cada 5 min.
Próxima checagem de segurança programada para às *09:59*.`,
    level: 'critical',
    tankId: 'tank-04',
    deliveryStatus: 'read',
  },
];
