import Reward from './reward.model.js';

class RewardRepository {
  async create(rewardData) {
    return await Reward.create(rewardData);
  }

  async findById(id) {
    return await Reward.findById(id)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('project', 'projectCode name')
      .populate('team', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .populate('nominatedBy', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName employeeId')
      .lean();
  }

  async findOne(filter = {}) {
    return await Reward.findOne({ ...filter, isDeleted: false })
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await Reward.find({ ...filter, isDeleted: false }, projection)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await Reward.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('issuedBy', 'firstName lastName employeeId')
      .lean();
  }

  async updateOne(filter, updateData) {
    return await Reward.findOneAndUpdate(
      { ...filter, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id, deletedBy) {
    return await Reward.findByIdAndUpdate(
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
    return await Reward.findByIdAndUpdate(
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
    return await Reward.countDocuments({ ...filter, isDeleted: false });
  }

  async exists(filter = {}) {
    return await Reward.exists({ ...filter, isDeleted: false });
  }

  async deleteMany(filter) {
    return await Reward.deleteMany({ ...filter, isDeleted: false });
  }

  async updateMany(filter, updateData) {
    return await Reward.updateMany({ ...filter, isDeleted: false }, updateData);
  }

  async aggregate(pipeline) {
    return await Reward.aggregate(pipeline);
  }

  async distinct(field, filter = {}) {
    return await Reward.distinct(field, { ...filter, isDeleted: false });
  }

  async findByRecipient(recipientId, options = {}) {
    const { type, status, year, startDate, endDate } = options;
    const filter = { recipient: recipientId, isDeleted: false };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    if (startDate && endDate) {
      filter.issuedDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    return await Reward.find(filter)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByDepartment(departmentId, options = {}) {
    const { type, status, year } = options;
    const filter = { department: departmentId, isDeleted: false };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Reward.find(filter)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByIssuer(issuerId, options = {}) {
    const { type, status, year } = options;
    const filter = { issuedBy: issuerId, isDeleted: false };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Reward.find(filter)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByType(type, options = {}) {
    const { status, department, year } = options;
    const filter = { type, isDeleted: false };
    
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Reward.find(filter)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByStatus(status, options = {}) {
    const { department, type, year } = options;
    const filter = { status, isDeleted: false };
    
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      filter.issuedDate = { $gte: start, $lte: end };
    }
    
    return await Reward.find(filter)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByProject(projectId, options = {}) {
    const { status, type } = options;
    const filter = { project: projectId, isDeleted: false };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    return await Reward.find(filter)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async findByTeam(teamId, options = {}) {
    const { status, type } = options;
    const filter = { team: teamId, isDeleted: false };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    return await Reward.find(filter)
      .populate('recipient', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ issuedDate: -1 })
      .lean();
  }

  async getTopRewarded(year, limit = 10) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    return await Reward.aggregate([
      {
        $match: {
          issuedDate: { $gte: start, $lte: end },
          isDeleted: false,
          status: 'issued'
        }
      },
      {
        $group: {
          _id: '$recipient',
          totalRewards: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          totalValue: { $sum: '$monetaryValue' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ]);
  }

  async getDepartmentRewards(departmentId, year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    return await Reward.aggregate([
      {
        $match: {
          department: departmentId,
          issuedDate: { $gte: start, $lte: end },
          isDeleted: false,
          status: 'issued'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          totalValue: { $sum: '$monetaryValue' }
        }
      }
    ]);
  }

  async getRewardStats(year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    return await Reward.aggregate([
      {
        $match: {
          issuedDate: { $gte: start, $lte: end },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          issued: { $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          totalPoints: { $sum: '$points' },
          totalValue: { $sum: '$monetaryValue' }
        }
      }
    ]);
  }
}

const rewardRepository = new RewardRepository();
export default rewardRepository;
