import jwt from 'jsonwebtoken';

import { JwtService, JwtPayload } from '../auth.service';
import { env } from '../../config';

jest.mock('../../config', () => ({
  env: {
    ACCESS_TOKEN_SECRET: 'access-secret',
    REFRESH_TOKEN_SECRET: 'refresh-secret',
    ACCESS_TOKEN_EXPIRES_IN: '1h',
    REFRESH_TOKEN_EXPIRES_DAYS: 7
  }
}));

describe('JwtService', () => {
  const mockPayload: JwtPayload = {
    userId: 1,
    email: 'test@example.com',
    role: 'user'
  };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct parameters', () => {
      const signSpy = jest
        .spyOn(jwt, 'sign')
        .mockReturnValue('accessToken' as any);

      const token = JwtService.generateAccessToken(mockPayload);

      expect(signSpy).toHaveBeenCalledWith(
        mockPayload,
        env.ACCESS_TOKEN_SECRET,
        expect.objectContaining({ expiresIn: '1h' })
      );
      expect(token).toBe('accessToken');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct parameters', () => {
      const signSpy = jest
        .spyOn(jwt, 'sign')
        .mockReturnValue('refreshToken' as any);

      const token = JwtService.generateRefreshToken(mockPayload);

      expect(signSpy).toHaveBeenCalledWith(
        mockPayload,
        env.REFRESH_TOKEN_SECRET,
        expect.objectContaining({ expiresIn: '7d' })
      );
      expect(token).toBe('refreshToken');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and return decoded access token', () => {
      const verifySpy = jest
        .spyOn(jwt, 'verify')
        .mockReturnValue(mockPayload as any);

      const decoded = JwtService.verifyAccessToken('mockAccessToken');

      expect(verifySpy).toHaveBeenCalledWith(
        'mockAccessToken',
        env.ACCESS_TOKEN_SECRET
      );
      expect(decoded).toEqual(mockPayload);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and return decoded refresh token', () => {
      const verifySpy = jest
        .spyOn(jwt, 'verify')
        .mockReturnValue(mockPayload as any);

      const decoded = JwtService.verifyRefreshToken('mockRefreshToken');

      expect(verifySpy).toHaveBeenCalledWith(
        'mockRefreshToken',
        env.REFRESH_TOKEN_SECRET
      );
      expect(decoded).toEqual(mockPayload);
    });
  });
});
