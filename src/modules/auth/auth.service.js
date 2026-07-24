import authRepository from './auth.repository.js';
import sessionService from './session.service.js';
import tokenService from './token.service.js';
import { generateSecureTokenId, hashRefreshToken, compareRefreshToken } from './token.utils.js';
import { AUTH_MESSAGES, USER_STATUS } from './auth.constants.js';
import AppError from '../../core/errors/AppError.js';

class AuthService {
  async registerUser(userData) {
    const existingUser = await authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError(AUTH_MESSAGES.USER_ALREADY_EXISTS, 409);
    }
    return authRepository.create(userData);
  }

  async loginUser(email, password, deviceInfo) {
    const user = await authRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      if (user.status === USER_STATUS.SUSPENDED) {
        throw new AppError(AUTH_MESSAGES.ACCOUNT_SUSPENDED, 403);
      }
      if (user.status === USER_STATUS.INACTIVE) {
        throw new AppError(AUTH_MESSAGES.ACCOUNT_INACTIVE, 403);
      }
      if (!user.isEmailVerified) {
        throw new AppError(AUTH_MESSAGES.EMAIL_NOT_VERIFIED, 403);
      }
    }

    if (user.isDeleted) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, 404);
    }

    const { accessToken, refreshToken, session, tokenFamily, deviceId } = 
      await tokenService.createSessionWithTokens(user._id, deviceInfo);

    await authRepository.updateLastLogin(user._id);

    return {
      user,
      accessToken,
      refreshToken,
      session,
      tokenFamily,
      deviceId
    };
  }

  async logoutUser(userId, sessionId) {
    await sessionService.revokeSession(sessionId);
  }

  async logoutAllDevices(userId) {
    await sessionService.revokeAllUserSessions(userId);
  }

  async refreshAccessToken(refreshToken, sessionId) {
    const session = await sessionService.getSessionById(sessionId);
    if (!session || !session.isActive()) {
      throw new AppError(AUTH_MESSAGES.INVALID_TOKEN, 401);
    }

    const result = await tokenService.rotateRefreshToken(refreshToken, session);
    return result;
  }

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, 404);
    }

    const resetToken = generateSecureTokenId();
    const hashedResetToken = await hashRefreshToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await authRepository.updateById(user._id, {
      resetToken: hashedResetToken,
      resetTokenExpiry
    });

    return { resetToken };
  }

  async resetPassword(token, newPassword) {
    const user = await authRepository.findOne({ resetToken: { $exists: true } });
    if (!user) {
      throw new AppError(AUTH_MESSAGES.INVALID_TOKEN, 401);
    }

    const isTokenValid = await compareRefreshToken(token, user.resetToken);
    if (!isTokenValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_TOKEN, 401);
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      throw new AppError(AUTH_MESSAGES.TOKEN_EXPIRED, 401);
    }

    await authRepository.updatePassword(user._id, newPassword);
    await sessionService.revokeAllUserSessions(user._id);
    await authRepository.updateById(user._id, { resetToken: null, resetTokenExpiry: null });
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await authRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, 404);
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new AppError(AUTH_MESSAGES.OLD_PASSWORD_INCORRECT, 400);
    }

    await authRepository.updatePassword(userId, newPassword);
    await sessionService.revokeAllUserSessions(userId);
  }

  async verifyEmail(token) {
    const user = await authRepository.findOne({ 
      emailVerificationToken: { $exists: true },
      isEmailVerified: false 
    });
    if (!user) {
      throw new AppError(AUTH_MESSAGES.INVALID_TOKEN, 401);
    }

    const isTokenValid = await compareRefreshToken(token, user.emailVerificationToken);
    if (!isTokenValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_TOKEN, 401);
    }

    await authRepository.updateById(user._id, { 
      isEmailVerified: true,
      emailVerificationToken: null,
      status: USER_STATUS.ACTIVE
    });
  }

  async getUserById(userId) {
    return authRepository.findById(userId);
  }

  async updateUser(userId, updateData) {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    return authRepository.updateById(userId, filteredData);
  }

  async deleteUser(userId) {
    return authRepository.softDeleteById(userId);
  }

  async getAllUsers(query) {
    return authRepository.findAll(query);
  }
}

export default new AuthService();
