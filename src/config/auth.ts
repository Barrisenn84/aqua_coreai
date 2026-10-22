import { randomBytes } from 'crypto';

export const SESSION_COOKIE_NAME = 'aquacore_session';
export const MIN_JWT_SECRET_LENGTH = 7;

const ephemeralDevelopmentSecret = randomBytes(48).toString('hex');

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT !== undefined;
}

export function isDemoAuthEnabled(): boolean {
  if (isProductionEnvironment()) return false;
  return process.env.ALLOW_INSECURE_DEMO_AUTH !== 'false' && Boolean(process.env.DEMO_AUTH_PASSWORD?.trim());
}

export function getDemoAuthPassword(): string {
  return process.env.DEMO_AUTH_PASSWORD?.trim() || '';
}

export function getJwtSecret(): string | null {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret && configuredSecret.length >= MIN_JWT_SECRET_LENGTH && /^[A-Za-z0-9]+$/.test(configuredSecret)) {
    return configuredSecret;
  }

  return isDemoAuthEnabled() ? ephemeralDevelopmentSecret : null;
}

/** Public-safe status used by the login screen; never returns secret values. */
export function isProductionAuthConfigured(): boolean {
  return Boolean(
    getJwtSecret() &&
    process.env.ADMIN_EMAIL?.trim() &&
    process.env.ADMIN_PASSWORD_HASH?.trim(),
  );
}
