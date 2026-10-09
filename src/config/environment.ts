export const config = {
  get port() {
    return typeof process !== 'undefined' && process.env?.PORT ? Number(process.env.PORT) : 3000;
  },
  get geminiApiKey() {
    return (
      (typeof process !== 'undefined' &&
        (process.env?.GEMINI_API_KEY ||
          process.env?.GOOGLE_API_KEY ||
          process.env?.VITE_GEMINI_API_KEY)) ||
      ''
    );
  },
  get producerPhone() {
    return (typeof process !== 'undefined' && process.env?.PRODUCER_WHATSAPP_PHONE) || '84988585211';
  },
  get systemPixKey() {
    return (typeof process !== 'undefined' && process.env?.SYSTEM_PIX_KEY) || 'financeiro@aquacore.ai';
  },
  get defaultTenantId() {
    return (typeof process !== 'undefined' && process.env?.DEFAULT_TENANT_ID) || 'tenant-river-life';
  },
  get defaultFarmId() {
    return (typeof process !== 'undefined' && process.env?.DEFAULT_FARM_ID) || 'farm_shrimp_jp';
  },
  geminiModel: 'gemini-3.8-flash',
  fallbackModels: ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'],
  redis: {
    ttlSeconds: 300,
    keyPrefix: 'aquacore:telemetry:',
  },
  mqtt: {
    brokerUrl: 'mqtt://iot.aquacore.gcp.internal:1883',
    topicPrefix: 'aquacore/farm-01/tanks/',
  },
  gcp: {
    projectId: 'aqua-core-global-prod',
    region: 'us-west2',
    cloudRunService: 'aquacore-api-engine',
    pubSubTopic: 'aquacore-sensor-critical-telemetry',
  },
};

export const environment = {
  ...config,
  get GEMINI_API_KEY() {
    return config.geminiApiKey;
  },
};

