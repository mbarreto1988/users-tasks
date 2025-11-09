import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../config';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export class JwtService {
  static generateAccessToken(payload: JwtPayload): string {
    const options = {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN || '1h'
    } as SignOptions;

    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET as jwt.Secret, options);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    const options = {
      expiresIn: `${env.REFRESH_TOKEN_EXPIRES_DAYS || 7}d`
    } as SignOptions;

    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET as jwt.Secret, options);
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET as jwt.Secret
    ) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(
      token,
      env.REFRESH_TOKEN_SECRET as jwt.Secret
    ) as JwtPayload;
  }
}
