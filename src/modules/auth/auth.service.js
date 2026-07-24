import authRepository from './auth.repository.js';
import { AUTH_MESSAGES } from './auth.constants.js';

class AuthService {
  async registerUser(userData) {
    return authRepository.create(userData);
  }

  async loginUser(email, password) {
    const user = await authRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    return user;
  }

  async logoutUser(userId) {
    await authRepository.updateRefreshToken(userId, null);
  }

  async refreshAccessToken(refreshToken) {
    return null;
  }

  async forgotPassword(email) {
    return null;
  }

  async resetPassword(token, newPassword) {
    return null;
  }

  async changePassword(userId, oldPassword, newPassword) {
    return null;
  }

  async verifyEmail(token) {
    return null;
  }

  async getUserById(userId) {
    return authRepository.findById(userId);
  }

  async updateUser(userId, updateData) {
    return authRepository.updateById(userId, updateData);
  }

  async deleteUser(userId) {
    return authRepository.deleteById(userId);
  }

  async getAllUsers(query) {
    return authRepository.findAll(query);
  }
}

export default new AuthService();
