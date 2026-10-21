import { NextFunction, Request, Response } from 'express';

interface SessionUser {
  tenantId: string;
  role: string;
}

export function tenantScopeMiddleware(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).user as SessionUser | undefined;
  if (!session) {
    return res.status(401).json({ success: false, error: 'Autenticação necessária.' });
  }

  const requestedTenantId =
    req.params?.tenantId ||
    (req.query?.tenantId as string | undefined) ||
    req.body?.tenantId;

  if (
    requestedTenantId &&
    session.role !== 'superadmin_owner' &&
    requestedTenantId !== session.tenantId
  ) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado aos dados de outra organização.',
    });
  }

  if (req.body && typeof req.body === 'object') {
    req.body.tenantId = requestedTenantId || session.tenantId;
  }
  if (req.params && Object.hasOwn(req.params, 'tenantId')) {
    req.params.tenantId = requestedTenantId || session.tenantId;
  }
  if (req.query && typeof req.query === 'object') {
    (req.query as Record<string, unknown>).tenantId = requestedTenantId || session.tenantId;
  }

  return next();
}
