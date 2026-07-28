import Goal from './goal.model.js';

class GoalRepository {
  async create(goalData) {
    return await Goal.create(goalData);
  }

  async findById(id) {
    return await Goal.findById(id)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('project', 'projectCode name')
      .populate('reviewer', 'firstName lastName employeeId')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName employeeId')
      .populate('parentGoal', 'goalNumber title')
      .populate('subGoals', 'goalNumber title')
      .populate('dependencies', 'goalNumber title')
      .lean();
  }

  async findOne(filter = {}) {
    return await Goal.findOne({ ...filter, isDeleted: false })
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('project', 'projectCode name')
      .populate('reviewer', 'firstName lastName employeeId')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await Goal.find({ ...filter, isDeleted: false }, projection)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('project', 'projectCode name')
      .populate('reviewer', 'firstName lastName employeeId')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await Goal.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('project', 'projectCode name')
      .populate('reviewer', 'firstName lastName employeeId')
      .lean();
  }

  async updateOne(filter, updateData) {
    return await Goal.findOneAndUpdate(
      { ...filter, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id, deletedBy) {
    return await Goal.findByIdAndUpdate(
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
    return await Goal.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null
      },
      { new: true }
    );
  }

  async count(filter = {}) {
    return await Goal.countDocuments({ ...filter, isDeleted: false });
  }

  async exists(filter = {}) {
    return await Goal.exists({ ...filter, isDeleted: false });
  }

  async deleteMany(filter) {
    return await Goal.deleteMany({ ...filter, isDeleted: false });
  }

  async updateMany(filter, updateData) {
    return await Goal.updateMany({ ...filter, isDeleted: false }, updateData);
  }

  async aggregate(pipeline) {
    return await Goal.aggregate(pipeline);
  }

  async distinct(field, filter = {}) {
    return await Goal.distinct(field, { ...filter, isDeleted: false });
  }

  async findByOwner(ownerId, options = {}) {
    const { status, type, year, priority } = options;
    const filter = { owner: ownerId, isDeleted: false };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      filter.startDate = { $gte: startDate, $lte: endDate };
    }
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findByDepartment(departmentId, options = {}) {
    const { status, type, year } = options;
    const filter = { department: departmentId, isDeleted: false };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      filter.startDate = { $gte: startDate, $lte: endDate };
    }
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findByReviewer(reviewerId, options = {}) {
    const { status, approvalStatus } = options;
    const filter = { reviewer: reviewerId, isDeleted: false };
    
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findByProject(projectId, options = {}) {
    const { status } = options;
    const filter = { project: projectId, isDeleted: false };
    
    if (status) filter.status = status;
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findByType(type, options = {}) {
    const { status, department } = options;
    const filter = { type, isDeleted: false };
    
    if (status) filter.status = status;
    if (department) filter.department = department;
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findByStatus(status, options = {}) {
    const { department, owner, priority } = options;
    const filter = { status, isDeleted: false };
    
    if (department) filter.department = department;
    if (owner) filter.owner = owner;
    if (priority) filter.priority = priority;
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findOverdue(options = {}) {
    const { department, owner } = options;
    const filter = {
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] },
      isDeleted: false
    };
    
    if (department) filter.department = department;
    if (owner) filter.owner = owner;
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findDueSoon(days = 7, options = {}) {
    const { department, owner } = options;
    const date = new Date();
    date.setDate(date.getDate() + days);
    
    const filter = {
      dueDate: { $gte: new Date(), $lte: date },
      status: { $nin: ['completed', 'cancelled'] },
      isDeleted: false
    };
    
    if (department) filter.department = department;
    if (owner) filter.owner = owner;
    
    return await Goal.find(filter)
      .populate('owner', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ dueDate: 1 })
      .lean();
  }

  async findByParent(parentGoalId) {
    return await Goal.find({ parentGoal: parentGoalId, isDeleted: false })
      .populate('owner', 'firstName lastName employeeId')
      .sort({ dueDate: 1 })
      .lean();
  }

  async getDepartmentGoalSummary(departmentId, year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return await Goal.aggregate([
      {
        $match: {
          department: departmentId,
          startDate: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalWeightage: { $sum: '$weightage' },
          avgCompletion: { $avg: '$completionPercentage' }
        }
      }
    ]);
  }

  async getOwnerGoalSummary(ownerId, year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return await Goal.aggregate([
      {
        $match: {
          owner: ownerId,
          startDate: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalWeightage: { $sum: '$weightage' },
          avgCompletion: { $avg: '$completionPercentage' }
        }
      }
    ]);
  }
}

const goalRepository = new GoalRepository();
export default goalRepository;
