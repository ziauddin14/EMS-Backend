import Session from './session.model.js';

class SessionRepository {
  async createSession(sessionData) {
    return Session.create(sessionData);
  }

  async findById(sessionId) {
    return Session.findById(sessionId);
  }

  async findByUser(userId) {
    return Session.findActiveByUser(userId);
  }

  async findByTokenFamily(tokenFamily) {
    return Session.findByTokenFamily(tokenFamily);
  }

  async findByDeviceId(deviceId) {
    return Session.findOne({ deviceId, isRevoked: false });
  }

  async updateSession(sessionId, updateData) {
    return Session.findByIdAndUpdate(sessionId, updateData, { new: true, runValidators: true });
  }

  async revokeSession(sessionId) {
    return Session.findByIdAndUpdate(sessionId, { isRevoked: true }, { new: true });
  }

  async revokeAllSessions(userId) {
    return Session.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  async revokeOtherSessions(userId, currentSessionId) {
    return Session.updateMany(
      { userId, _id: { $ne: currentSessionId }, isRevoked: false },
      { isRevoked: true }
    );
  }

  async deleteExpiredSessions() {
    const expiryDate = new Date();
    return Session.deleteMany({ expiresAt: { $lt: expiryDate } });
  }

  async deleteRevokedSessions() {
    return Session.deleteMany({ isRevoked: true });
  }

  async updateLastUsed(sessionId) {
    return Session.findByIdAndUpdate(sessionId, { lastUsedAt: new Date() }, { new: true });
  }

  async countActiveSessions(userId) {
    return Session.countActiveByUser(userId);
  }

  async countAllSessions(userId) {
    return Session.countDocuments({ userId });
  }

  async findActiveSessionByUserAndDevice(userId, deviceId) {
    return Session.findOne({
      userId,
      deviceId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });
  }

  async deleteSession(sessionId) {
    return Session.findByIdAndDelete(sessionId);
  }

  async deleteAllSessions(userId) {
    return Session.deleteMany({ userId });
  }
}

export default new SessionRepository();
