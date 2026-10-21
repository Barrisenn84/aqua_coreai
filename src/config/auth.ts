import { randomBytes } from 'crypto';

export const SESSION_COOKIE_NAME = 'aquacore_session';

const ephemeralDevelopmentSecret = randomBytes(48).toString('hex');

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT !== undefined;
}

export function isDemoAuthEnabled(): boolean {
  if (isProductionEnvironment()) return false;
  return process.env.ALLOW_INSECURE_DEMO_AUTH !== 'false';
}

export function getJwtSecret(): string | null {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  return isDemoAuthEnabled() ? ephemeralDevelopmentSecret : null;
}
