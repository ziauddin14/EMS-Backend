import Employee from '../employee/employee.model.js';
import Department from '../department/department.model.js';
import Designation from '../designation/designation.model.js';

class DashboardRepository {
  async getEmployeeCount(filters = {}) {
    const matchStage = { isDeleted: false, ...filters };
    return Employee.countDocuments(matchStage);
  }

  async getDepartmentCount() {
    return Department.countDocuments({ isDeleted: false });
  }

  async getDesignationCount() {
    return Designation.countDocuments({ isDeleted: false });
  }

  async getEmployeesByStatus() {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$employmentStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }

  async getEmployeesByType() {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }

  async getEmployeesByStage() {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$employmentStage', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }

  async getDepartmentDistribution() {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: '$department.name', count: 1 } },
      { $sort: { count: -1 } }
    ]);
  }

  async getDesignationDistribution() {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$designation', count: { $sum: 1 } } },
      { $lookup: { from: 'designations', localField: '_id', foreignField: '_id', as: 'designation' } },
      { $unwind: { path: '$designation', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, title: '$designation.title', count: 1 } },
      { $sort: { count: -1 } }
    ]);
  }

  async getGenderDistribution() {
    return Employee.aggregate([
      { $match: { isDeleted: false, gender: { $ne: null } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }

  async getMonthlyHiring(months = 12) {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { 
          _id: { 
            $dateToString: { format: '%Y-%m', date: '$joiningDate' } 
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: -1 } },
      { $limit: months }
    ]);
  }

  async getMonthlyResignation(months = 12) {
    return Employee.aggregate([
      { $match: { isDeleted: false, isResigned: true, noticeStartDate: { $ne: null } } },
      { $group: { 
          _id: { 
            $dateToString: { format: '%Y-%m', date: '$noticeStartDate' } 
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: -1 } },
      { $limit: months }
    ]);
  }

  async getProbationEmployees() {
    return Employee.countDocuments({ isDeleted: false, isOnProbation: true });
  }

  async getUpcomingConfirmations(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return Employee.aggregate([
      { 
        $match: { 
          isDeleted: false, 
          isOnProbation: true,
          probationEndDate: { $gte: new Date(), $lte: futureDate }
        } 
      },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
        employeeNumber: 1,
        name: '$user.fullName',
        probationEndDate: 1,
        department: 1,
        designation: 1
      }},
      { $sort: { probationEndDate: 1 } }
    ]);
  }

  async getUpcomingBirthdays(days = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return Employee.aggregate([
      { $match: { isDeleted: false, dateOfBirth: { $ne: null } } },
      { $addFields: {
        nextBirthday: {
          $dateFromParts: {
            year: { $year: today },
            month: { $month: '$dateOfBirth' },
            day: { $dayOfMonth: '$dateOfBirth' }
          }
        }
      }},
      { $match: {
        nextBirthday: { $gte: today, $lte: futureDate }
      }},
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
        employeeNumber: 1,
        name: '$user.fullName',
        nextBirthday: 1,
        department: 1,
        designation: 1
      }},
      { $sort: { nextBirthday: 1 } }
    ]);
  }

  async getUpcomingWorkAnniversaries(days = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return Employee.aggregate([
      { $match: { isDeleted: false, joiningDate: { $ne: null } } },
      { $addFields: {
        anniversaryDate: {
          $dateFromParts: {
            year: { $year: today },
            month: { $month: '$joiningDate' },
            day: { $dayOfMonth: '$joiningDate' }
          }
        }
      }},
      { $match: {
        anniversaryDate: { $gte: today, $lte: futureDate }
      }},
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
        employeeNumber: 1,
        name: '$user.fullName',
        anniversaryDate: 1,
        joiningDate: 1,
        department: 1,
        designation: 1
      }},
      { $sort: { anniversaryDate: 1 } }
    ]);
  }

  async getRecentEmployees(limit = 10) {
    return Employee.find({ isDeleted: false })
      .populate('user')
      .populate('department')
      .populate('designation')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getTopDepartments(limit = 5) {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
      { $unwind: '$department' },
      { $project: { _id: 1, name: '$department.name', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
  }

  async getTopManagers(limit = 5) {
    return Employee.aggregate([
      { $match: { isDeleted: false, reportingManager: { $ne: null } } },
      { $group: { _id: '$reportingManager', reportCount: { $sum: 1 } } },
      { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'manager' } },
      { $unwind: '$manager' },
      { $lookup: { from: 'users', localField: 'manager.user', foreignField: '_id', as: 'manager.user' } },
      { $unwind: '$manager.user' },
      { $project: {
        _id: 1,
        name: '$manager.user.fullName',
        employeeNumber: '$manager.employeeNumber',
        reportCount: 1
      }},
      { $sort: { reportCount: -1 } },
      { $limit: limit }
    ]);
  }

  async getDirectReports(managerId) {
    return Employee.countDocuments({ reportingManager: managerId, isDeleted: false });
  }

  async getTeamStatistics(managerId) {
    return Employee.aggregate([
      { $match: { reportingManager: managerId, isDeleted: false } },
      { $group: { _id: '$employmentStatus', count: { $sum: 1 } } }
    ]);
  }

  async getDepartmentStatistics(departmentId) {
    return Employee.aggregate([
      { $match: { department: departmentId, isDeleted: false } },
      { $facet: {
        total: [{ $count: 'count' }],
        byStatus: [
          { $group: { _id: '$employmentStatus', count: { $sum: 1 } } }
        ],
        byType: [
          { $group: { _id: '$employmentType', count: { $sum: 1 } } }
        ],
        byStage: [
          { $group: { _id: '$employmentStage', count: { $sum: 1 } } }
        ]
      }}
    ]);
  }

  async getEmployeeStatistics(employeeId) {
    const employee = await Employee.findOne({ _id: employeeId, isDeleted: false })
      .populate('user')
      .populate('department')
      .populate('designation')
      .populate('reportingManager');
    
    if (!employee) return null;

    const directReports = await Employee.countDocuments({ reportingManager: employeeId, isDeleted: false });
    
    return {
      employee,
      directReports,
      yearsOfService: employee.yearsOfService || 0,
      isConfirmed: employee.isConfirmed,
      isOnProbation: employee.isOnProbation
    };
  }

  async getAgeDistribution() {
    return Employee.aggregate([
      { $match: { isDeleted: false, dateOfBirth: { $ne: null } } },
      { $addFields: {
        age: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$dateOfBirth'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        }
      }},
      { $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 25] }, then: '18-24' },
              { case: { $lt: ['$age', 30] }, then: '25-29' },
              { case: { $lt: ['$age', 35] }, then: '30-34' },
              { case: { $lt: ['$age', 40] }, then: '35-39' },
              { case: { $lt: ['$age', 45] }, then: '40-44' },
              { case: { $lt: ['$age', 50] }, then: '45-49' },
              { case: { $lt: ['$age', 55] }, then: '50-54' },
              { case: { $gte: ['$age', 55] }, then: '55+' }
            ],
            default: 'Unknown'
          }
        },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
  }

  async getOrganizationGrowth(months = 12) {
    return Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$joiningDate' } },
          hired: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: months }
    ]);
  }

  async getPendingConfirmations() {
    return Employee.countDocuments({ isDeleted: false, isOnProbation: true });
  }

  async getUpcomingExits(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return Employee.countDocuments({
      isDeleted: false,
      isResigned: true,
      lastWorkingDate: { $gte: new Date(), $lte: futureDate }
    });
  }

  async getInternCount() {
    return Employee.countDocuments({ isDeleted: false, employmentType: 'intern' });
  }

  async getResignedCount() {
    return Employee.countDocuments({ isDeleted: false, isResigned: true });
  }

  async getTerminatedCount() {
    return Employee.countDocuments({ isDeleted: false, isTerminated: true });
  }

  async getOnLeaveCount() {
    return Employee.countDocuments({ isDeleted: false, employmentStatus: 'on_leave' });
  }

  async getActiveCount() {
    return Employee.countDocuments({ isDeleted: false, employmentStatus: 'active' });
  }

  async getFilteredEmployeeCount(filters) {
    return Employee.countDocuments({ isDeleted: false, ...filters });
  }

  async getEmployeesByDateRange(startDate, endDate) {
    return Employee.aggregate([
      { $match: { 
          isDeleted: false,
          joiningDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$joiningDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

export default new DashboardRepository();
