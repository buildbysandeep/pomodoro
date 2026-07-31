import jwt from "jsonwebtoken";
import type { User } from "@pomodoro/shared";

const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    if (!JWT_SECRET) return null;
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function tokenToUser(payload: TokenPayload): User {
  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
  };
}
