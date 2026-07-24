import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
  generateTokenFamily,
  generateSecureTokenId,
  getTokenExpiration
} from './token.utils.js';
import sessionService from './session.service.js';
import { authConfig } from './auth.config.js';

class TokenService {
  async generateTokenPair(payload) {
    const tokenFamily = generateTokenFamily();
    const deviceId = generateSecureTokenId();

    const accessToken = generateAccessToken({
      ...payload,
      deviceId,
      tokenFamily
    });

    const refreshToken = generateRefreshToken({
      ...payload,
      deviceId,
      tokenFamily
    });

    return {
      accessToken,
      refreshToken,
      tokenFamily,
      deviceId
    };
  }

  async rotateRefreshToken(oldRefreshToken, session) {
    const decoded = verifyRefreshToken(oldRefreshToken);
    const isValid = await compareRefreshToken(oldRefreshToken, session.hashedRefreshToken);

    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    const newTokenFamily = generateTokenFamily();
    const newDeviceId = generateSecureTokenId();

    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      deviceId: newDeviceId,
      tokenFamily: newTokenFamily
    });

    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      deviceId: newDeviceId,
      tokenFamily: newTokenFamily
    });

    const hashedNewRefreshToken = await hashRefreshToken(newRefreshToken);

    await sessionService.updateSession(session._id, {
      hashedRefreshToken: hashedNewRefreshToken,
      deviceId: newDeviceId,
      tokenFamily: newTokenFamily,
      lastUsedAt: new Date()
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenFamily: newTokenFamily,
      deviceId: newDeviceId
    };
  }

  async verifyTokenPair(accessToken, refreshToken) {
    try {
      const accessPayload = verifyAccessToken(accessToken);
      const refreshPayload = verifyRefreshToken(refreshToken);

      if (accessPayload.userId !== refreshPayload.userId) {
        throw new Error('Token mismatch');
      }

      return {
        valid: true,
        userId: accessPayload.userId,
        deviceId: accessPayload.deviceId,
        tokenFamily: accessPayload.tokenFamily
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  async invalidateSession(sessionId) {
    return sessionService.revokeSession(sessionId);
  }

  async invalidateAllSessions(userId) {
    return sessionService.revokeAllUserSessions(userId);
  }

  async validateActiveSession(sessionId) {
    return sessionService.validateActiveSession(sessionId);
  }

  async refreshSessionExpiry(sessionId, newExpiryDate) {
    return sessionService.updateSession(sessionId, { expiresAt: newExpiryDate });
  }

  async createSessionWithTokens(userId, deviceInfo) {
    const tokenFamily = generateTokenFamily();
    const deviceId = generateSecureTokenId();

    const sessionData = {
      userId,
      hashedRefreshToken: null,
      deviceId,
      deviceName: deviceInfo.deviceName || null,
      browser: deviceInfo.browser || null,
      operatingSystem: deviceInfo.os || null,
      ipAddress: deviceInfo.ip || null,
      userAgent: deviceInfo.userAgent || null,
      tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const session = await sessionService.createSession(sessionData);

    const accessToken = generateAccessToken({
      userId,
      sessionId: session._id,
      deviceId,
      tokenFamily
    });

    const refreshToken = generateRefreshToken({
      userId,
      sessionId: session._id,
      deviceId,
      tokenFamily
    });

    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    await sessionService.updateSession(session._id, { hashedRefreshToken });

    return {
      accessToken,
      refreshToken,
      session,
      tokenFamily,
      deviceId
    };
  }

  async verifyRefreshTokenAgainstSession(refreshToken, session) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const isValid = await compareRefreshToken(refreshToken, session.hashedRefreshToken);

      if (!isValid || !session.isActive()) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: decoded.userId,
        deviceId: decoded.deviceId,
        tokenFamily: decoded.tokenFamily
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

export default new TokenService();
