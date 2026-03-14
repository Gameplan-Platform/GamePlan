import jwt from "jsonwebtoken";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,

  jwt: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    accessExpiry: requireEnv("ACCESS_TOKEN_EXPIRY") as jwt.SignOptions["expiresIn"],
    refreshExpiry: requireEnv("REFRESH_TOKEN_EXPIRY") as jwt.SignOptions["expiresIn"],
  },
};