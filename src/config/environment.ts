export const config = {
  port: typeof process !== 'undefined' && process.env?.PORT ? Number(process.env.PORT) : 3000,
  geminiApiKey: typeof process !== 'undefined' && process.env?.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : '',
  geminiModel: 'gemini-3.8-flash',
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
  GEMINI_API_KEY: config.geminiApiKey,
};
