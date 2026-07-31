import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function expressAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
