import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação ausente ou mal formatado.',
      details: 'É necessário fornecer um token JWT válido no header Authorization: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  // Permite bypass de tokens de sessão legados/demo no ambiente de desenvolvimento
  if (token.startsWith('jwt_session_') && process.env.NODE_ENV !== 'production') {
    (req as any).user = {
      userId: 'usr-01',
      tenantId: 'tenant-river-life',
      role: 'owner',
    };
    return next();
  }

  const secret = process.env.JWT_SECRET || 'aqua_core_default_secret_key_change_me';

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Injeta as informações do usuário e tenant na requisição para uso nos controllers
    (req as any).user = decoded;

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação inválido ou expirado.',
      details: err.message,
    });
  }
};
