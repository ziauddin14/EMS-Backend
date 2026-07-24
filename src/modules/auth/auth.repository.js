import User from './auth.model.js';

class AuthRepository {
  async findById(id) {
    return User.findOne({ _id: id, isDeleted: false });
  }

  async findByIdWithPassword(id) {
    return User.findByIdWithPassword(id);
  }

  async findByEmail(email) {
    return User.findByEmail(email);
  }

  async findByEmailWithPassword(email) {
    return User.findByEmail(email);
  }

  async create(userData) {
    return User.create(userData);
  }

  async updateById(id, updateData) {
    return User.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true, runValidators: true });
  }

  async softDeleteById(id, deletedBy) {
    return User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.softDeleteById(id);
  }

  async findAll(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return User.find(query);
    }
    return User.find({ ...query, isDeleted: false });
  }

  async findOne(query, includeDeleted = false) {
    if (includeDeleted) {
      return User.findOne(query);
    }
    return User.findOne({ ...query, isDeleted: false });
  }

  async updateLastLogin(userId) {
    return User.findOneAndUpdate({ _id: userId, isDeleted: false }, { lastLogin: new Date() }, { new: true });
  }

  async updatePassword(userId, newPassword) {
    return User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { password: newPassword, passwordChangedAt: new Date() },
      { new: true }
    );
  }

  async countDocuments(query = {}, includeDeleted = false) {
    if (includeDeleted) {
      return User.countDocuments(query);
    }
    return User.countDocuments({ ...query, isDeleted: false });
  }

  async exists(query, includeDeleted = false) {
    if (includeDeleted) {
      return User.exists(query);
    }
    return User.exists({ ...query, isDeleted: false });
  }
}

export default new AuthRepository();
