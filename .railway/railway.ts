import { defineRailway, project, service, volume } from 'railway/iac';

export default defineRailway(() => {
  const appData = volume('aqua-core-data', {
    region: 'us-east4-eqdc4a',
    sizeMB: 1024,
  });

  const web = service('aqua_coreai', {
    build: 'npm run build',
    start: 'npm start',
    healthcheck: '/api/health',
    healthcheckTimeout: 100,
    replicas: 1,
    env: {
      NODE_ENV: 'production',
    },
    volumeMounts: {
      '/data': appData,
    },
  });

  return project('aqua-core-ai', {
    resources: [web, appData],
  });
});
