import EmployeeLifecycle from './employeeLifecycle.model.js';

class EmployeeLifecycleRepository {
  async create(eventData) {
    return EmployeeLifecycle.create(eventData);
  }

  async findById(id) {
    return EmployeeLifecycle.findById(id).populate('employee').populate('changedBy');
  }

  async findByEmployee(employeeId) {
    return EmployeeLifecycle.findByEmployee(employeeId).populate('changedBy').sort({ effectiveDate: -1 });
  }

  async findByEventType(eventType) {
    return EmployeeLifecycle.findByEventType(eventType).populate('employee').populate('changedBy');
  }

  async findByStage(stage) {
    return EmployeeLifecycle.findByStage(stage).populate('employee').populate('changedBy');
  }

  async findByDateRange(startDate, endDate) {
    return EmployeeLifecycle.findByDateRange(startDate, endDate).populate('employee').populate('changedBy');
  }

  async findAll(query = {}) {
    return EmployeeLifecycle.find(query).populate('employee').populate('changedBy').sort({ effectiveDate: -1 });
  }

  async findOne(query) {
    return EmployeeLifecycle.findOne(query).populate('employee').populate('changedBy');
  }

  async updateById(id, updateData) {
    return EmployeeLifecycle.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('employee').populate('changedBy');
  }

  async deleteById(id) {
    return EmployeeLifecycle.findByIdAndDelete(id);
  }

  async countDocuments(query = {}) {
    return EmployeeLifecycle.countDocuments(query);
  }

  async exists(query) {
    return EmployeeLifecycle.exists(query);
  }

  async countByEventType(eventType) {
    return EmployeeLifecycle.countByEventType(eventType);
  }

  async countByStage(stage) {
    return EmployeeLifecycle.countByStage(stage);
  }

  async findWithPagination(query = {}, options = {}) {
    const { page = 1, limit = 10, sort = { effectiveDate: -1 } } = options;
    const skip = (page - 1) * limit;

    return EmployeeLifecycle.find(query)
      .populate('employee')
      .populate('changedBy')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async getEmployeeHistory(employeeId) {
    return EmployeeLifecycle.findByEmployee(employeeId).populate('changedBy').sort({ effectiveDate: -1 });
  }

  async getLatestEvent(employeeId) {
    return EmployeeLifecycle.findOne({ employee: employeeId }).sort({ effectiveDate: -1 }).populate('changedBy');
  }

  async getStatistics() {
    const total = await EmployeeLifecycle.countDocuments();
    const confirm = await EmployeeLifecycle.countByEventType('confirm');
    const probationStart = await EmployeeLifecycle.countByEventType('probation_start');
    const probationComplete = await EmployeeLifecycle.countByEventType('probation_complete');
    const promote = await EmployeeLifecycle.countByEventType('promote');
    const transfer = await EmployeeLifecycle.countByEventType('transfer');
    const suspend = await EmployeeLifecycle.countByEventType('suspend');
    const resume = await EmployeeLifecycle.countByEventType('resume');
    const resign = await EmployeeLifecycle.countByEventType('resign');
    const noticeStart = await EmployeeLifecycle.countByEventType('notice_start');
    const exitComplete = await EmployeeLifecycle.countByEventType('exit_complete');
    const terminate = await EmployeeLifecycle.countByEventType('terminate');
    const rehire = await EmployeeLifecycle.countByEventType('rehire');

    const byStage = await EmployeeLifecycle.aggregate([
      { $group: { _id: '$newStage', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      total,
      byEventType: {
        confirm,
        probationStart,
        probationComplete,
        promote,
        transfer,
        suspend,
        resume,
        resign,
        noticeStart,
        exitComplete,
        terminate,
        rehire
      },
      byStage
    };
  }
}

export default new EmployeeLifecycleRepository();
