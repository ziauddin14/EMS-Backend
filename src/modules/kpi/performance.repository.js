import Performance from './performance.model.js';

class PerformanceRepository {
  async create(performanceData) {
    return await Performance.create(performanceData);
  }

  async findById(id) {
    return await Performance.findById(id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName employeeId')
      .lean();
  }

  async findOne(filter = {}) {
    return await Performance.findOne({ ...filter, isDeleted: false })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await Performance.find({ ...filter, isDeleted: false }, projection)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await Performance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .lean();
  }

  async updateOne(filter, updateData) {
    return await Performance.findOneAndUpdate(
      { ...filter, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id, deletedBy) {
    return await Performance.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy
      },
      { new: true }
    );
  }

  async softDeleteById(id, deletedBy) {
    return await this.softDelete(id, deletedBy);
  }

  async restore(id) {
    return await Performance.findByIdAndUpdate(
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
    return await Performance.countDocuments({ ...filter, isDeleted: false });
  }

  async exists(filter = {}) {
    return await Performance.exists({ ...filter, isDeleted: false });
  }

  async deleteMany(filter) {
    return await Performance.deleteMany({ ...filter, isDeleted: false });
  }

  async updateMany(filter, updateData) {
    return await Performance.updateMany({ ...filter, isDeleted: false }, updateData);
  }

  async aggregate(pipeline) {
    return await Performance.aggregate(pipeline);
  }

  async distinct(field, filter = {}) {
    return await Performance.distinct(field, { ...filter, isDeleted: false });
  }

  async findByEmployee(employeeId, options = {}) {
    const { year, periodType } = options;
    const filter = { employee: employeeId, isDeleted: false };
    
    if (year) filter.year = year;
    if (periodType) filter.periodType = periodType;
    
    return await Performance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByDepartment(departmentId, options = {}) {
    const { year, periodType } = options;
    const filter = { department: departmentId, isDeleted: false };
    
    if (year) filter.year = year;
    if (periodType) filter.periodType = periodType;
    
    return await Performance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByManager(managerId, options = {}) {
    const { year, periodType } = options;
    const filter = { reportingManager: managerId, isDeleted: false };
    
    if (year) filter.year = year;
    if (periodType) filter.periodType = periodType;
    
    return await Performance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByDesignation(designationId, options = {}) {
    const { year, periodType } = options;
    const filter = { designation: designationId, isDeleted: false };
    
    if (year) filter.year = year;
    if (periodType) filter.periodType = periodType;
    
    return await Performance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByYear(year, options = {}) {
    const { department, periodType } = options;
    const filter = { year, isDeleted: false };
    
    if (department) filter.department = department;
    if (periodType) filter.periodType = periodType;
    
    return await Performance.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ 'yearlyPerformance.overallScore': -1 })
      .lean();
  }

  async getTopPerformers(year, limit = 10) {
    return await Performance.find({
      year,
      isDeleted: false,
      approvalStatus: 'approved'
    })
      .sort({ 'yearlyPerformance.overallScore': -1 })
      .limit(limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getLowPerformers(year, limit = 10) {
    return await Performance.find({
      year,
      isDeleted: false,
      approvalStatus: 'approved'
    })
      .sort({ 'yearlyPerformance.overallScore': 1 })
      .limit(limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getPromotionEligible(year) {
    return await Performance.find({
      year,
      isDeleted: false,
      promotionEligible: true,
      approvalStatus: 'approved'
    })
      .sort({ 'yearlyPerformance.overallScore': -1 })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getBonusEligible(year) {
    return await Performance.find({
      year,
      isDeleted: false,
      bonusEligible: true,
      approvalStatus: 'approved'
    })
      .sort({ 'yearlyPerformance.overallScore': -1 })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getDepartmentRankings(departmentId, year) {
    return await Performance.find({
      department: departmentId,
      year,
      isDeleted: false,
      approvalStatus: 'approved'
    })
      .sort({ 'yearlyPerformance.overallScore': -1 })
      .populate('employee', 'firstName lastName employeeId')
      .lean();
  }

  async getDesignationRankings(designationId, year) {
    return await Performance.find({
      designation: designationId,
      year,
      isDeleted: false,
      approvalStatus: 'approved'
    })
      .sort({ 'yearlyPerformance.overallScore': -1 })
      .populate('employee', 'firstName lastName employeeId')
      .lean();
  }

  async getHistoricalTrend(employeeId, years = 5) {
    const startYear = new Date().getFullYear() - years;
    return await Performance.find({
      employee: employeeId,
      year: { $gte: startYear },
      isDeleted: false,
      approvalStatus: 'approved'
    })
      .sort({ year: 1 })
      .lean();
  }

  async getDepartmentAverage(departmentId, year) {
    const filter = { department: departmentId, year, isDeleted: false, approvalStatus: 'approved' };
    return await Performance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          averageScore: { $avg: '$yearlyPerformance.overallScore' },
          totalEmployees: { $sum: 1 },
          maxScore: { $max: '$yearlyPerformance.overallScore' },
          minScore: { $min: '$yearlyPerformance.overallScore' },
          promotionEligibleCount: { $sum: { $cond: ['$promotionEligible', 1, 0] } },
          bonusEligibleCount: { $sum: { $cond: ['$bonusEligible', 1, 0] } }
        }
      }
    ]);
  }
}

const performanceRepository = new PerformanceRepository();
export default performanceRepository;
