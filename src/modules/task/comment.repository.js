import Comment from './comment.model.js';

class CommentRepository {
  async create(commentData) {
    return await Comment.create(commentData);
  }

  async findById(id) {
    return await Comment.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('mentionedEmployees', 'firstName lastName employeeId')
      .populate('parentComment', 'content createdBy');
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0 } = options;
    return await Comment.find({ ...filter, isDeleted: false })
      .populate('createdBy', 'firstName lastName')
      .populate('mentionedEmployees', 'firstName lastName employeeId')
      .populate('parentComment', 'content createdBy')
      .sort(sort)
      .limit(limit)
      .skip(skip);
  }

  async updateById(id, updateData) {
    return await Comment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('mentionedEmployees', 'firstName lastName employeeId')
      .populate('parentComment', 'content createdBy');
  }

  async softDelete(id, deletedBy) {
    return await Comment.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy
      },
      { new: true }
    );
  }

  async restore(id) {
    return await Comment.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      { new: true }
    );
  }

  async exists(id) {
    return await Comment.exists({ _id: id, isDeleted: false });
  }

  async count(filter = {}) {
    return await Comment.countDocuments({ ...filter, isDeleted: false });
  }

  async findByTask(taskId) {
    return await Comment.findByTask(taskId);
  }

  async countByTask(taskId) {
    return await Comment.countByTask(taskId);
  }

  async findByCreatedBy(userId) {
    return await Comment.find({ createdBy: userId, isDeleted: false })
      .populate('createdBy', 'firstName lastName')
      .populate('mentionedEmployees', 'firstName lastName employeeId')
      .sort({ createdAt: -1 });
  }

  async findByMentionedEmployee(employeeId) {
    return await Comment.find({ mentionedEmployees: employeeId, isDeleted: false })
      .populate('createdBy', 'firstName lastName')
      .populate('mentionedEmployees', 'firstName lastName employeeId')
      .sort({ createdAt: -1 });
  }
}

export default new CommentRepository();
