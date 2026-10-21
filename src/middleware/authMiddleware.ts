import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  getJwtSecret,
  isDemoAuthEnabled,
  SESSION_COOKIE_NAME,
} from '../config/auth';

interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const cookies: Record<string, string> = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex <= 0) continue;
    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      // Ignora cookies malformados em vez de transformar a requisição em erro 500.
    }
  }
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';
  const token = bearerToken || cookies[SESSION_COOKIE_NAME] || '';

  if (!token && isDemoAuthEnabled()) {
    (req as any).user = {
      userId: 'usr-01',
      tenantId: 'tenant-river-life',
      role: 'owner',
    };
    return next();
  }

  if (!token) {
    return _res.status(401).json({
      success: false,
      error: 'Autenticação necessária.',
    });
  }

  // Tokens legados só são aceitos no ambiente local de demonstração.
  if (token.startsWith('jwt_session_') && isDemoAuthEnabled()) {
    (req as any).user = {
      userId: 'usr-01',
      tenantId: 'tenant-river-life',
      role: 'owner',
    };
    return next();
  }

  const secret = getJwtSecret();
  if (!secret) {
    return _res.status(503).json({
      success: false,
      error: 'Autenticação não configurada no servidor.',
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    if (!decoded.userId || !decoded.tenantId || !decoded.role) {
      return _res.status(401).json({ success: false, error: 'Sessão inválida.' });
    }
    (req as any).user = decoded;
    return next();
  } catch {
    return _res.status(401).json({ success: false, error: 'Sessão inválida ou expirada.' });
  }
};
