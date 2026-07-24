import employeeRepository from '../employee/employee.repository.js';
import AppError from '../../core/errors/AppError.js';

class SearchService {
  async searchEmployees(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const regex = new RegExp(searchTerm, 'i');

    const searchQuery = {
      $or: [
        { employeeNumber: regex },
        { officialEmail: regex },
        { officialPhone: regex },
        { emergencyContact: regex },
        { emergencyPhone: regex },
        { cnicNumber: regex }
      ],
      isDeleted: false
    };

    const employees = await employeeRepository.findWithPagination(searchQuery, { page, limit, sort: { createdAt: -1 } });
    const total = await employeeRepository.countDocuments(searchQuery);

    return {
      employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: parseInt(page) < Math.ceil(total / limit),
        hasPrevious: parseInt(page) > 1
      }
    };
  }

  async searchByName(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const regex = new RegExp(searchTerm, 'i');

    const Employee = (await import('../employee/employee.model.js')).default;
    const User = (await import('../auth/auth.model.js')).default;

    const pipeline = [
      {
        $match: { isDeleted: false }
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          $or: [
            { 'user.firstName': regex },
            { 'user.lastName': regex },
            { 'user.fullName': { $regex: regex } }
          ]
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: '_id',
          as: 'designation'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    const employees = await Employee.aggregate(pipeline);
    const countPipeline = [
      {
        $match: { isDeleted: false }
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          $or: [
            { 'user.firstName': regex },
            { 'user.lastName': regex },
            { 'user.fullName': { $regex: regex } }
          ]
        }
      },
      {
        $count: 'total'
      }
    ];
    const countResult = await Employee.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    return {
      employees,
      count: employees.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: parseInt(page) < Math.ceil(total / limit),
        hasPrevious: parseInt(page) > 1
      }
    };
  }

  async filterEmployees(filters, options = {}) {
    const query = { isDeleted: false };
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    if (filters.department) query.department = filters.department;
    if (filters.designation) query.designation = filters.designation;
    if (filters.reportingManager) query.reportingManager = filters.reportingManager;
    if (filters.employmentType) query.employmentType = filters.employmentType;
    if (filters.employmentStatus) query.employmentStatus = filters.employmentStatus;
    if (filters.employmentStage) query.employmentStage = filters.employmentStage;
    if (filters.organizationLevel) query.organizationLevel = parseInt(filters.organizationLevel);
    if (filters.workLocation) query.workLocation = new RegExp(filters.workLocation, 'i');
    if (filters.officeShift) query.officeShift = new RegExp(filters.officeShift, 'i');
    if (filters.gender) query.gender = filters.gender;
    if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
    if (filters.nationality) query.nationality = new RegExp(filters.nationality, 'i');
    if (filters.isConfirmed !== undefined) query.isConfirmed = filters.isConfirmed === 'true';
    if (filters.isOnProbation !== undefined) query.isOnProbation = filters.isOnProbation === 'true';
    if (filters.isResigned !== undefined) query.isResigned = filters.isResigned === 'true';
    if (filters.isTerminated !== undefined) query.isTerminated = filters.isTerminated === 'true';
    if (filters.isDepartmentHead !== undefined) query.isDepartmentHead = filters.isDepartmentHead === 'true';
    if (filters.isTeamLead !== undefined) query.isTeamLead = filters.isTeamLead === 'true';

    if (filters.joiningDateFrom || filters.joiningDateTo) {
      query.joiningDate = {};
      if (filters.joiningDateFrom) query.joiningDate.$gte = new Date(filters.joiningDateFrom);
      if (filters.joiningDateTo) query.joiningDate.$lte = new Date(filters.joiningDateTo);
    }

    if (filters.ageFrom || filters.ageTo) {
      const today = new Date();
      const birthDateFrom = new Date(today.getFullYear() - (filters.ageTo || 100), today.getMonth(), today.getDate());
      const birthDateTo = new Date(today.getFullYear() - (filters.ageFrom || 0), today.getMonth(), today.getDate());
      query.dateOfBirth = { $gte: birthDateFrom, $lte: birthDateTo };
    }

    if (filters.createdDateFrom || filters.createdDateTo) {
      query.createdAt = {};
      if (filters.createdDateFrom) query.createdAt.$gte = new Date(filters.createdDateFrom);
      if (filters.createdDateTo) query.createdAt.$lte = new Date(filters.createdDateTo);
    }

    if (filters.updatedDateFrom || filters.updatedDateTo) {
      query.updatedAt = {};
      if (filters.updatedDateFrom) query.updatedAt.$gte = new Date(filters.updatedDateFrom);
      if (filters.updatedDateTo) query.updatedAt.$lte = new Date(filters.updatedDateTo);
    }

    if (filters.includeDeleted === 'true') {
      delete query.isDeleted;
    }

    const paginationOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    };

    const employees = await employeeRepository.findWithPagination(query, paginationOptions, filters.includeDeleted === 'true');
    const total = await employeeRepository.countDocuments(query, filters.includeDeleted === 'true');

    return {
      employees,
      pagination: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        total,
        totalPages: Math.ceil(total / paginationOptions.limit),
        hasNext: paginationOptions.page < Math.ceil(total / paginationOptions.limit),
        hasPrevious: paginationOptions.page > 1
      },
      appliedFilters: filters
    };
  }

  async getPaginatedEmployees(query = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const paginationOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    };

    const employees = await employeeRepository.findWithPagination(query, paginationOptions);
    const total = await employeeRepository.countDocuments(query);

    return {
      employees,
      pagination: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        total,
        totalPages: Math.ceil(total / paginationOptions.limit),
        hasNext: paginationOptions.page < Math.ceil(total / paginationOptions.limit),
        hasPrevious: paginationOptions.page > 1
      }
    };
  }

  async getSortedEmployees(sortBy, sortOrder = 'desc', options = {}) {
    const { page = 1, limit = 10 } = options;
    const sortOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    };

    const employees = await employeeRepository.findWithPagination({}, sortOptions);
    const total = await employeeRepository.countDocuments();

    return {
      employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: parseInt(page) < Math.ceil(total / limit),
        hasPrevious: parseInt(page) > 1
      }
    };
  }

  async bulkActivate(employeeIds, updatedBy) {
    const results = [];
    for (const employeeId of employeeIds) {
      try {
        const employee = await employeeRepository.updateById(employeeId, {
          employmentStatus: 'active',
          updatedBy
        });
        results.push({ employeeId, success: true, employee });
      } catch (error) {
        results.push({ employeeId, success: false, error: error.message });
      }
    }
    return {
      total: employeeIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkDeactivate(employeeIds, updatedBy) {
    const results = [];
    for (const employeeId of employeeIds) {
      try {
        const employee = await employeeRepository.updateById(employeeId, {
          employmentStatus: 'on_leave',
          updatedBy
        });
        results.push({ employeeId, success: true, employee });
      } catch (error) {
        results.push({ employeeId, success: false, error: error.message });
      }
    }
    return {
      total: employeeIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkDelete(employeeIds, deletedBy) {
    const results = [];
    for (const employeeId of employeeIds) {
      try {
        await employeeRepository.softDeleteById(employeeId, deletedBy);
        results.push({ employeeId, success: true });
      } catch (error) {
        results.push({ employeeId, success: false, error: error.message });
      }
    }
    return {
      total: employeeIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkRestore(employeeIds) {
    const results = [];
    for (const employeeId of employeeIds) {
      try {
        await employeeRepository.restoreById(employeeId);
        results.push({ employeeId, success: true });
      } catch (error) {
        results.push({ employeeId, success: false, error: error.message });
      }
    }
    return {
      total: employeeIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkChangeDepartment(employeeIds, newDepartmentId, updatedBy) {
    const Department = (await import('../department/department.model.js')).default;
    const departmentExists = await Department.exists({ _id: newDepartmentId, isDeleted: false });
    if (!departmentExists) {
      throw new AppError('Department not found', 404);
    }

    const results = [];
    for (const employeeId of employeeIds) {
      try {
        const employee = await employeeRepository.updateById(employeeId, {
          department: newDepartmentId,
          updatedBy
        });
        results.push({ employeeId, success: true, employee });
      } catch (error) {
        results.push({ employeeId, success: false, error: error.message });
      }
    }
    return {
      total: employeeIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async bulkChangeDesignation(employeeIds, newDesignationId, updatedBy) {
    const Designation = (await import('../designation/designation.model.js')).default;
    const designationExists = await Designation.exists({ _id: newDesignationId, isDeleted: false });
    if (!designationExists) {
      throw new AppError('Designation not found', 404);
    }

    const results = [];
    for (const employeeId of employeeIds) {
      try {
        const employee = await employeeRepository.updateById(employeeId, {
          designation: newDesignationId,
          updatedBy
        });
        results.push({ employeeId, success: true, employee });
      } catch (error) {
        results.push({ employeeId, success: false, error: error.message });
      }
    }
    return {
      total: employeeIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async getAnalytics() {
    const totalEmployees = await employeeRepository.countDocuments({ isDeleted: false });
    const activeEmployees = await employeeRepository.countDocuments({ employmentStatus: 'active', isDeleted: false });
    const onProbation = await employeeRepository.countDocuments({ isOnProbation: true, isDeleted: false });
    const resigned = await employeeRepository.countDocuments({ isResigned: true, isDeleted: false });
    const terminated = await employeeRepository.countDocuments({ isTerminated: true, isDeleted: false });

    const departmentDistribution = await employeeRepository.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      { $sort: { count: -1 } }
    ]);

    const designationDistribution = await employeeRepository.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$designation', count: { $sum: 1 } } },
      { $lookup: { from: 'designations', localField: '_id', foreignField: '_id', as: 'designation' } },
      { $unwind: { path: '$designation', preserveNullAndEmptyArrays: true } },
      { $sort: { count: -1 } }
    ]);

    const employmentTypes = await employeeRepository.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const genderRatio = await employeeRepository.aggregate([
      { $match: { isDeleted: false, gender: { $ne: null } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    const joiningTrends = await employeeRepository.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$joiningDate' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    const lifecycleStatistics = await employeeRepository.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$employmentStage', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const reportingStatistics = await employeeRepository.aggregate([
      { $match: { isDeleted: false, reportingManager: { $ne: null } } },
      { $group: { _id: '$reportingManager', reportCount: { $sum: 1 } } },
      { $sort: { reportCount: -1 } },
      { $limit: 10 }
    ]);

    const probationStatistics = await employeeRepository.aggregate([
      { $match: { isDeleted: false, isOnProbation: true } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$probationEndDate' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    return {
      overview: {
        totalEmployees,
        activeEmployees,
        onProbation,
        resigned,
        terminated,
        inactive: totalEmployees - activeEmployees
      },
      departmentDistribution,
      designationDistribution,
      employmentTypes,
      genderRatio,
      joiningTrends,
      lifecycleStatistics,
      reportingStatistics,
      probationStatistics
    };
  }

  async getDashboardData() {
    const total = await employeeRepository.countDocuments({ isDeleted: false });
    const active = await employeeRepository.countDocuments({ employmentStatus: 'active', isDeleted: false });
    const newHiresThisMonth = await employeeRepository.countDocuments({
      isDeleted: false,
      joiningDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const onProbation = await employeeRepository.countDocuments({ isOnProbation: true, isDeleted: false });
    const resignedThisMonth = await employeeRepository.countDocuments({
      isDeleted: false,
      isResigned: true,
      noticeStartDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const departmentCount = await (await import('../department/department.model.js')).default.countDocuments({ isDeleted: false });

    return {
      totalEmployees: total,
      activeEmployees: active,
      newHiresThisMonth,
      employeesOnProbation: onProbation,
      resignedThisMonth,
      totalDepartments: departmentCount,
      activeRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0
    };
  }

  async getDepartmentDashboardData(departmentId) {
    const Department = (await import('../department/department.model.js')).default;
    const departmentExists = await Department.exists({ _id: departmentId, isDeleted: false });
    if (!departmentExists) {
      throw new AppError('Department not found', 404);
    }

    const total = await employeeRepository.countByDepartment(departmentId);
    const active = await employeeRepository.countDocuments({ department: departmentId, employmentStatus: 'active', isDeleted: false });
    const onProbation = await employeeRepository.countDocuments({ department: departmentId, isOnProbation: true, isDeleted: false });
    const resigned = await employeeRepository.countDocuments({ department: departmentId, isResigned: true, isDeleted: false });

    return {
      totalEmployees: total,
      activeEmployees: active,
      employeesOnProbation: onProbation,
      resignedEmployees: resigned,
      activeRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0
    };
  }

  async exportEmployees(filters = {}, format = 'json') {
    const query = { isDeleted: false };
    
    if (filters.department) query.department = filters.department;
    if (filters.designation) query.designation = filters.designation;
    if (filters.employmentStatus) query.employmentStatus = filters.employmentStatus;
    if (filters.employmentType) query.employmentType = filters.employmentType;

    const employees = await employeeRepository.findAll(query);

    const exportData = employees.map(emp => ({
      employeeNumber: emp.employeeNumber,
      name: emp.user?.fullName || '',
      email: emp.officialEmail || '',
      phone: emp.officialPhone || '',
      department: emp.department?.name || '',
      designation: emp.designation?.title || '',
      employmentType: emp.employmentType,
      employmentStatus: emp.employmentStatus,
      employmentStage: emp.employmentStage,
      joiningDate: emp.joiningDate,
      workLocation: emp.workLocation || ''
    }));

    return {
      format,
      data: exportData,
      count: exportData.length,
      exportedAt: new Date()
    };
  }
}

export default new SearchService();
