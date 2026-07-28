import Appraisal from './appraisal.model.js';

class AppraisalRepository {
  async create(appraisalData) {
    return await Appraisal.create(appraisalData);
  }

  async findById(id) {
    return await Appraisal.findById(id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('hrReviewer', 'firstName lastName employeeId')
      .populate('ceoReviewer', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName employeeId')
      .lean();
  }

  async findOne(filter = {}) {
    return await Appraisal.findOne({ ...filter, isDeleted: false })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .populate('designation', 'title')
      .lean();
  }

  async findAll(options = {}) {
    const { filter = {}, sort = { createdAt: -1 }, limit = 100, skip = 0, projection = {} } = options;
    return await Appraisal.find({ ...filter, isDeleted: false }, projection)
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
    return await Appraisal.findByIdAndUpdate(
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
    return await Appraisal.findOneAndUpdate(
      { ...filter, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id, deletedBy) {
    return await Appraisal.findByIdAndUpdate(
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
    return await Appraisal.findByIdAndUpdate(
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
    return await Appraisal.countDocuments({ ...filter, isDeleted: false });
  }

  async exists(filter = {}) {
    return await Appraisal.exists({ ...filter, isDeleted: false });
  }

  async deleteMany(filter) {
    return await Appraisal.deleteMany({ ...filter, isDeleted: false });
  }

  async updateMany(filter, updateData) {
    return await Appraisal.updateMany({ ...filter, isDeleted: false }, updateData);
  }

  async aggregate(pipeline) {
    return await Appraisal.aggregate(pipeline);
  }

  async distinct(field, filter = {}) {
    return await Appraisal.distinct(field, { ...filter, isDeleted: false });
  }

  async findByEmployee(employeeId, options = {}) {
    const { year, periodType, status, type } = options;
    const filter = { employee: employeeId, isDeleted: false };
    
    if (year) filter.year = year;
    if (periodType) filter.periodType = periodType;
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    return await Appraisal.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByDepartment(departmentId, options = {}) {
    const { year, periodType, status } = options;
    const filter = { department: departmentId, isDeleted: false };
    
    if (year) filter.year = year;
    if (periodType) filter.periodType = periodType;
    if (status) filter.status = status;
    
    return await Appraisal.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByManager(managerId, options = {}) {
    const { year, periodType, status } = options;
    const filter = { reportingManager: managerId, isDeleted: false };
    
    if (year) filter.year = year;
    if (periodType) filter.periodType = periodType;
    if (status) filter.status = status;
    
    return await Appraisal.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByHR(hrId, options = {}) {
    const { year, status } = options;
    const filter = { hrReviewer: hrId, isDeleted: false };
    
    if (year) filter.year = year;
    if (status) filter.status = status;
    
    return await Appraisal.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByStatus(status, options = {}) {
    const { department, year, approvalStatus } = options;
    const filter = { status, isDeleted: false };
    
    if (department) filter.department = department;
    if (year) filter.year = year;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    
    return await Appraisal.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ year: -1, startDate: -1 })
      .lean();
  }

  async findByPeriod(year, periodType, periodValue) {
    const filter = { year, periodType, isDeleted: false };
    
    if (periodType === 'monthly') {
      filter.month = periodValue;
    } else if (periodType === 'quarterly') {
      filter.quarter = periodValue;
    }
    
    return await Appraisal.find(filter)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .sort({ finalRating: -1 })
      .lean();
  }

  async getTopPerformers(year, limit = 10) {
    return await Appraisal.find({
      year,
      isDeleted: false,
      status: 'completed',
      approvalStatus: 'approved'
    })
      .sort({ finalRating: -1 })
      .limit(limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getLowPerformers(year, limit = 10) {
    return await Appraisal.find({
      year,
      isDeleted: false,
      status: 'completed',
      approvalStatus: 'approved'
    })
      .sort({ finalRating: 1 })
      .limit(limit)
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getDepartmentAverage(departmentId, year) {
    const filter = { department: departmentId, year, isDeleted: false, status: 'completed' };
    return await Appraisal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          averageRating: { $avg: '$finalRating' },
          totalEmployees: { $sum: 1 },
          maxRating: { $max: '$finalRating' },
          minRating: { $min: '$finalRating' }
        }
      }
    ]);
  }

  async getPromotionEligible(year) {
    return await Appraisal.find({
      year,
      isDeleted: false,
      status: 'completed',
      approvalStatus: 'approved',
      'promotion.eligible': true
    })
      .sort({ finalRating: -1 })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }

  async getIncrementEligible(year) {
    return await Appraisal.find({
      year,
      isDeleted: false,
      status: 'completed',
      approvalStatus: 'approved',
      'increment.eligible': true
    })
      .sort({ finalRating: -1 })
      .populate('employee', 'firstName lastName employeeId')
      .populate('department', 'name')
      .lean();
  }
}

const appraisalRepository = new AppraisalRepository();
export default appraisalRepository;
