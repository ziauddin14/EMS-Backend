import Checklist from './checklist.model.js';

class ChecklistRepository {
  async create(checklistData) {
    return await Checklist.create(checklistData);
  }

  async findById(id) {
    return await Checklist.findById(id);
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { order: 1 }, limit = 100, skip = 0 } = options;
    return await Checklist.find({ ...filter, isDeleted: false })
      .sort(sort)
      .limit(limit)
      .skip(skip);
  }

  async updateById(id, updateData) {
    return await Checklist.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async softDelete(id, deletedBy) {
    return await Checklist.findByIdAndUpdate(
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
    return await Checklist.findByIdAndUpdate(
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
    return await Checklist.exists({ _id: id, isDeleted: false });
  }

  async count(filter = {}) {
    return await Checklist.countDocuments({ ...filter, isDeleted: false });
  }

  async findByTask(taskId) {
    return await Checklist.findByTask(taskId);
  }

  async countByTask(taskId) {
    return await Checklist.countByTask(taskId);
  }

  async countCompletedByTask(taskId) {
    return await Checklist.countCompletedByTask(taskId);
  }
}

export default new ChecklistRepository();
