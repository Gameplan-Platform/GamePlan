import jwt from "jsonwebtoken";
import { config } from "../config/env";

type TokenPayload = {
    userId: string;
    role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiry,
    });
}

export function generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiry,
    });
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
}