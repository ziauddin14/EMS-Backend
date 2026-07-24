import sessionRepository from './session.repository.js';
import { authConfig } from './auth.config.js';

class SessionService {
  async createSession(sessionData) {
    const activeSessionCount = await sessionRepository.countActiveSessions(sessionData.userId);
    
    if (activeSessionCount >= authConfig.session.maxSessionsPerUser) {
      await sessionRepository.revokeOtherSessions(sessionData.userId);
    }

    return sessionRepository.createSession(sessionData);
  }

  async getSessionById(sessionId) {
    return sessionRepository.findById(sessionId);
  }

  async getUserSessions(userId) {
    return sessionRepository.findByUser(userId);
  }

  async getSessionByTokenFamily(tokenFamily) {
    return sessionRepository.findByTokenFamily(tokenFamily);
  }

  async updateSession(sessionId, updateData) {
    return sessionRepository.updateSession(sessionId, updateData);
  }

  async revokeSession(sessionId) {
    return sessionRepository.revokeSession(sessionId);
  }

  async revokeAllUserSessions(userId) {
    return sessionRepository.revokeAllSessions(userId);
  }

  async revokeOtherUserSessions(userId, currentSessionId) {
    return sessionRepository.revokeOtherSessions(userId, currentSessionId);
  }

  async cleanupExpiredSessions() {
    return sessionRepository.deleteExpiredSessions();
  }

  async cleanupRevokedSessions() {
    return sessionRepository.deleteRevokedSessions();
  }

  async updateSessionLastUsed(sessionId) {
    return sessionRepository.updateLastUsed(sessionId);
  }

  async getActiveSessionCount(userId) {
    return sessionRepository.countActiveSessions(userId);
  }

  async validateActiveSession(sessionId) {
    const session = await sessionRepository.findById(sessionId);
    if (!session) return false;
    return session.isActive();
  }

  async getSessionByDevice(userId, deviceId) {
    return sessionRepository.findActiveSessionByUserAndDevice(userId, deviceId);
  }

  async deleteSession(sessionId) {
    return sessionRepository.deleteSession(sessionId);
  }

  async deleteAllUserSessions(userId) {
    return sessionRepository.deleteAllSessions(userId);
  }
}

export default new SessionService();
