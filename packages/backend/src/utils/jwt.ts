import jwt from "jsonwebtoken";
import { config } from "../config/env";

export type AuthTokenPayload = {
  userId: string;
  role: string;

};

export function generateAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });
}

export function generateRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as AuthTokenPayload;
}