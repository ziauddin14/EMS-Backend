import KPI from './kpi.model.js';

class KPIRepository {
  async create(kpiData) {
    return await KPI.create(kpiData);
  }

  async findById(id) {
    return await KPI.findById(id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName employeeId')
      .lean();
  }

  async findOne(filter = {}) {
    return await KPI.findOne({ ...filter, isDeleted: false })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .populate('reportingManager', 'firstName lastName employeeId')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await KPI.find({ ...filter, isDeleted: false }, projection)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .populate('reportingManager', 'firstName lastName employeeId')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();
  }

  async updateById(id, updateData) {
    return await KPI.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .populate('reportingManager', 'firstName lastName employeeId')
      .lean();
  }

  async updateOne(filter, updateData) {
    return await KPI.findOneAndUpdate(
      { ...filter, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id, deletedBy) {
    return await KPI.findByIdAndUpdate(
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
    return await KPI.findByIdAndUpdate(
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
    return await KPI.countDocuments({ ...filter, isDeleted: false });
  }

  async exists(filter = {}) {
    return await KPI.exists({ ...filter, isDeleted: false });
  }

  async deleteMany(filter) {
    return await KPI.deleteMany({ ...filter, isDeleted: false });
  }

  async updateMany(filter, updateData) {
    return await KPI.updateMany({ ...filter, isDeleted: false }, updateData);
  }

  async aggregate(pipeline) {
    return await KPI.aggregate(pipeline);
  }

  async distinct(field, filter = {}) {
    return await KPI.distinct(field, { ...filter, isDeleted: false });
  }

  async findByEmployee(employeeId, options = {}) {
    const { year, month, quarter, evaluationPeriod } = options;
    const filter = { employee: employeeId, isDeleted: false };
    
    if (year) filter.year = year;
    if (month) filter.month = month;
    if (quarter) filter.quarter = quarter;
    if (evaluationPeriod) filter.evaluationPeriod = evaluationPeriod;
    
    return await KPI.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, month: -1 })
      .lean();
  }

  async findByDepartment(departmentId, options = {}) {
    const { year, month, quarter, evaluationPeriod } = options;
    const filter = { department: departmentId, isDeleted: false };
    
    if (year) filter.year = year;
    if (month) filter.month = month;
    if (quarter) filter.quarter = quarter;
    if (evaluationPeriod) filter.evaluationPeriod = evaluationPeriod;
    
    return await KPI.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, month: -1 })
      .lean();
  }

  async findByManager(managerId, options = {}) {
    const { year, month, quarter, evaluationPeriod } = options;
    const filter = { reportingManager: managerId, isDeleted: false };
    
    if (year) filter.year = year;
    if (month) filter.month = month;
    if (quarter) filter.quarter = quarter;
    if (evaluationPeriod) filter.evaluationPeriod = evaluationPeriod;
    
    return await KPI.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, month: -1 })
      .lean();
  }

  async findByPeriod(year, periodType, periodValue) {
    const filter = { year, isDeleted: false };
    
    if (periodType === 'monthly') {
      filter.month = periodValue;
    } else if (periodType === 'quarterly') {
      filter.quarter = periodValue;
    }
    
    return await KPI.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ overallScore: -1 })
      .lean();
  }

  async findByGrade(grade, year) {
    const filter = { performanceGrade: grade, isDeleted: false };
    if (year) filter.year = year;
    return await KPI.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, month: -1 })
      .lean();
  }

  async findByStatus(status, approvalStatus) {
    const filter = { status, isDeleted: false };
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    return await KPI.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getTopPerformers(year, limit = 10) {
    return await KPI.find({ year, isDeleted: false, status: 'approved' })
      .sort({ overallScore: -1 })
      .limit(limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getLowPerformers(year, limit = 10) {
    return await KPI.find({ year, isDeleted: false, status: 'approved' })
      .sort({ overallScore: 1 })
      .limit(limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getDepartmentAverage(departmentId, year) {
    const filter = { department: departmentId, year, isDeleted: false, status: 'approved' };
    return await KPI.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          averageScore: { $avg: '$overallScore' },
          totalEmployees: { $sum: 1 },
          maxScore: { $max: '$overallScore' },
          minScore: { $min: '$overallScore' }
        }
      }
    ]);
  }

  async getYearlyTrend(employeeId, years = 5) {
    const startYear = new Date().getFullYear() - years;
    return await KPI.find({
      employee: employeeId,
      year: { $gte: startYear },
      isDeleted: false,
      status: 'approved'
    })
      .sort({ year: 1, month: 1 })
      .lean();
  }
}

const kpiRepository = new KPIRepository();
export default kpiRepository;
