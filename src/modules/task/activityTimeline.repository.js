import ActivityTimeline from './activityTimeline.model.js';

class ActivityTimelineRepository {
  async create(activityData) {
    return await ActivityTimeline.create(activityData);
  }

  async findById(id) {
    return await ActivityTimeline.findById(id)
      .populate('performedBy', 'firstName lastName email');
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0 } = options;
    return await ActivityTimeline.find(filter)
      .populate('performedBy', 'firstName lastName email')
      .sort(sort)
      .limit(limit)
      .skip(skip);
  }

  async updateById(id, updateData) {
    return await ActivityTimeline.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('performedBy', 'firstName lastName email');
  }

  async deleteById(id) {
    return await ActivityTimeline.findByIdAndDelete(id);
  }

  async exists(id) {
    return await ActivityTimeline.exists({ _id: id });
  }

  async count(filter = {}) {
    return await ActivityTimeline.countDocuments(filter);
  }

  async findByEntity(entityType, entityId) {
    return await ActivityTimeline.findByEntity(entityType, entityId);
  }

  async findByTask(taskId) {
    return await ActivityTimeline.findByTask(taskId);
  }

  async findByProject(projectId) {
    return await ActivityTimeline.findByProject(projectId);
  }

  async findByUser(userId) {
    return await ActivityTimeline.findByUser(userId);
  }

  async findByAction(action) {
    return await ActivityTimeline.find({ action })
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async findByDateRange(startDate, endDate) {
    return await ActivityTimeline.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async findByEntityType(entityType) {
    return await ActivityTimeline.find({ entityType })
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async getStatistics(entityType, entityId) {
    const pipeline = [
      { $match: { entityType, entityId } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await ActivityTimeline.aggregate(pipeline);
  }
}

export default new ActivityTimelineRepository();
