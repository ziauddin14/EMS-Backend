import authService from './auth.service.js';
import { ApiResponse } from '../../core/responses/index.js';
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from './auth.cookies.js';
import logger from '../../config/logger.js';

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.registerUser(req.body);
      return ApiResponse.created(res, 'Registration successful. Please verify your email.', { user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const deviceInfo = {
        deviceName: req.headers['user-agent'] || 'Unknown',
        browser: req.headers['user-agent'] || 'Unknown',
        os: req.headers['user-agent'] || 'Unknown',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown'
      };

      const { user, accessToken, refreshToken, session, tokenFamily, deviceId } = 
        await authService.loginUser(email, password, deviceInfo);

      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      return ApiResponse.success(res, 'Login successful', {
        user,
        tokenFamily,
        deviceId,
        sessionId: session._id
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { userId, sessionId } = req.user;
      await authService.logoutUser(userId, sessionId);
      clearAuthCookies(res);
      return ApiResponse.success(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const { userId } = req.user;
      await authService.logoutAllDevices(userId);
      clearAuthCookies(res);
      return ApiResponse.success(res, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const { sessionId } = req.user;

      const result = await authService.refreshAccessToken(refreshToken, sessionId);

      setAccessTokenCookie(res, result.accessToken);
      setRefreshTokenCookie(res, result.refreshToken);

      return ApiResponse.success(res, 'Token refreshed successfully', {
        tokenFamily: result.tokenFamily,
        deviceId: result.deviceId
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const { resetToken } = await authService.forgotPassword(email);

      logger.info(`Password reset token generated for ${email}: ${resetToken}`);

      return ApiResponse.success(res, 'Password reset token sent to email', {
        message: 'If the email exists, a reset token has been sent'
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return ApiResponse.success(res, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { userId } = req.user;
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(userId, oldPassword, newPassword);
      return ApiResponse.success(res, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);
      return ApiResponse.success(res, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const user = await authService.getUserById(userId);
      return ApiResponse.success(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const user = await authService.updateUser(userId, req.body);
      return ApiResponse.success(res, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const { userId } = req.user;
      await authService.deleteUser(userId);
      clearAuthCookies(res);
      return ApiResponse.success(res, 'Account deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers(req.query);
      return ApiResponse.success(res, 'Users retrieved successfully', { users });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id);
      return ApiResponse.success(res, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await authService.updateUser(id, req.body);
      return ApiResponse.success(res, 'User updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await authService.deleteUser(id);
      return ApiResponse.success(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
