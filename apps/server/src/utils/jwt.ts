import jwt from "jsonwebtoken";
import type { User } from "@pomodoro/shared";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function tokenToUser(payload: TokenPayload): User {
  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
  };
}
