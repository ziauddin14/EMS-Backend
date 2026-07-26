import { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORY } from './task.constants.js';
import { PROJECT_STATUS, PROJECT_PRIORITY } from '../project/project.constants.js';
import AppError from '../../core/errors/AppError.js';

class SearchService {
  async globalSearch(query, filters = {}, options = {}) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    const searchRegex = new RegExp(query, 'i');
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const tasks = await Task.find({
      isDeleted: false,
      $or: [
        { title: searchRegex },
        { taskNumber: searchRegex },
        { description: searchRegex },
        { labels: searchRegex }
      ],
      ...(filters.department && { department: filters.department }),
      ...(filters.project && { project: filters.project }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority })
    })
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('project', 'name projectCode')
      .limit(limit)
      .skip(skip);

    const projects = await Project.find({
      isDeleted: false,
      $or: [
        { name: searchRegex },
        { projectCode: searchRegex },
        { description: searchRegex }
      ],
      ...(filters.department && { department: filters.department }),
      ...(filters.status && { status: filters.status })
    })
      .populate('projectManager', 'firstName lastName')
      .limit(limit)
      .skip(skip);

    const employees = await Employee.find({
      isDeleted: false,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex }
      ]
    })
      .populate('department', 'name')
      .limit(limit)
      .skip(skip);

    const departments = await Department.find({
      isDeleted: false,
      $or: [
        { name: searchRegex },
        { departmentCode: searchRegex }
      ]
    })
      .limit(limit)
      .skip(skip);

    return {
      query,
      results: {
        tasks: tasks.map(t => ({
          type: 'task',
          id: t._id,
          title: t.title,
          taskNumber: t.taskNumber,
          status: t.status,
          priority: t.priority,
          assignedTo: t.assignedTo,
          project: t.project
        })),
        projects: projects.map(p => ({
          type: 'project',
          id: p._id,
          name: p.name,
          projectCode: p.projectCode,
          status: p.status,
          projectManager: p.projectManager
        })),
        employees: employees.map(e => ({
          type: 'employee',
          id: e._id,
          name: `${e.firstName} ${e.lastName}`,
          employeeId: e.employeeId,
          email: e.email,
          department: e.department
        })),
        departments: departments.map(d => ({
          type: 'department',
          id: d._id,
          name: d.name,
          departmentCode: d.departmentCode
        }))
      },
      summary: {
        totalTasks: tasks.length,
        totalProjects: projects.length,
        totalEmployees: employees.length,
        totalDepartments: departments.length,
        totalResults: tasks.length + projects.length + employees.length + departments.length
      }
    };
  }

  async searchTasks(query, filters = {}, options = {}) {
    const Task = (await import('./task.model.js')).default;

    const searchRegex = new RegExp(query, 'i');
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const matchFilter = {
      isDeleted: false,
      $or: [
        { title: searchRegex },
        { taskNumber: searchRegex },
        { description: searchRegex },
        { labels: searchRegex }
      ]
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.assignedTo) matchFilter.assignedTo = filters.assignedTo;
    if (filters.status) matchFilter.status = filters.status;
    if (filters.priority) matchFilter.priority = filters.priority;
    if (filters.category) matchFilter.category = filters.category;
    if (filters.labels && filters.labels.length > 0) {
      matchFilter.labels = { $in: filters.labels };
    }
    if (filters.dueDateFrom || filters.dueDateTo) {
      matchFilter.dueDate = {};
      if (filters.dueDateFrom) matchFilter.dueDate.$gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) matchFilter.dueDate.$lte = new Date(filters.dueDateTo);
    }
    if (filters.createdFrom || filters.createdTo) {
      matchFilter.createdAt = {};
      if (filters.createdFrom) matchFilter.createdAt.$gte = new Date(filters.createdFrom);
      if (filters.createdTo) matchFilter.createdAt.$lte = new Date(filters.createdTo);
    }
    if (filters.isOverdue === 'true') {
      matchFilter.dueDate = { $lt: new Date() };
      matchFilter.status = { $ne: TASK_STATUS.COMPLETED };
    }

    const tasks = await Task.find(matchFilter)
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('reviewer', 'firstName lastName')
      .populate('project', 'name projectCode')
      .populate('department', 'name')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalCount = await Task.countDocuments(matchFilter);

    return {
      query,
      filters,
      results: tasks,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async searchProjects(query, filters = {}, options = {}) {
    const Project = (await import('../project/project.model.js')).default;

    const searchRegex = new RegExp(query, 'i');
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const matchFilter = {
      isDeleted: false,
      $or: [
        { name: searchRegex },
        { projectCode: searchRegex },
        { description: searchRegex }
      ]
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.projectManager) matchFilter.projectManager = filters.projectManager;
    if (filters.status) matchFilter.status = filters.status;
    if (filters.priority) matchFilter.priority = filters.priority;
    if (filters.startDateFrom || filters.startDateTo) {
      matchFilter.startDate = {};
      if (filters.startDateFrom) matchFilter.startDate.$gte = new Date(filters.startDateFrom);
      if (filters.startDateTo) matchFilter.startDate.$lte = new Date(filters.startDateTo);
    }
    if (filters.endDateFrom || filters.endDateTo) {
      matchFilter.endDate = {};
      if (filters.endDateFrom) matchFilter.endDate.$gte = new Date(filters.endDateFrom);
      if (filters.endDateTo) matchFilter.endDate.$lte = new Date(filters.endDateTo);
    }

    const projects = await Project.find(matchFilter)
      .populate('projectManager', 'firstName lastName')
      .populate('department', 'name')
      .populate('teamLeads', 'firstName lastName')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalCount = await Project.countDocuments(matchFilter);

    return {
      query,
      filters,
      results: projects,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async searchEmployees(query, filters = {}, options = {}) {
    const Employee = (await import('../employee/employee.model.js')).default;

    const searchRegex = new RegExp(query, 'i');
    const { limit = 50, skip = 0, sort = { firstName: 1 } } = options;

    const matchFilter = {
      isDeleted: false,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ]
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.status) matchFilter.status = filters.status;
    if (filters.designation) matchFilter.designation = filters.designation;

    const employees = await Employee.find(matchFilter)
      .populate('department', 'name')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalCount = await Employee.countDocuments(matchFilter);

    return {
      query,
      filters,
      results: employees,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async searchDepartments(query, filters = {}, options = {}) {
    const Department = (await import('../department/department.model.js')).default;

    const searchRegex = new RegExp(query, 'i');
    const { limit = 50, skip = 0, sort = { name: 1 } } = options;

    const matchFilter = {
      isDeleted: false,
      $or: [
        { name: searchRegex },
        { departmentCode: searchRegex }
      ]
    };

    if (filters.status) matchFilter.status = filters.status;

    const departments = await Department.find(matchFilter)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalCount = await Department.countDocuments(matchFilter);

    return {
      query,
      filters,
      results: departments,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async searchByLabels(labels, filters = {}, options = {}) {
    const Task = (await import('./task.model.js')).default;

    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const matchFilter = {
      isDeleted: false,
      labels: { $in: Array.isArray(labels) ? labels : [labels] }
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.status) matchFilter.status = filters.status;

    const tasks = await Task.find(matchFilter)
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalCount = await Task.countDocuments(matchFilter);

    return {
      labels,
      filters,
      results: tasks,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async searchByCategory(category, filters = {}, options = {}) {
    const Task = (await import('./task.model.js')).default;

    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    const matchFilter = {
      isDeleted: false,
      category
    };

    if (filters.department) matchFilter.department = filters.department;
    if (filters.project) matchFilter.project = filters.project;
    if (filters.status) matchFilter.status = filters.status;
    if (filters.priority) matchFilter.priority = filters.priority;

    const tasks = await Task.find(matchFilter)
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalCount = await Task.countDocuments(matchFilter);

    return {
      category,
      filters,
      results: tasks,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async searchByDateRange(entityType, startDate, endDate, filters = {}, options = {}) {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const WorkLog = (await import('../worklog/worklog.model.js')).default;

    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let results = [];
    let totalCount = 0;

    if (entityType === 'task' || entityType === 'all') {
      const taskMatchFilter = {
        isDeleted: false,
        createdAt: { $gte: start, $lte: end }
      };

      if (filters.department) taskMatchFilter.department = filters.department;
      if (filters.project) taskMatchFilter.project = filters.project;
      if (filters.status) taskMatchFilter.status = filters.status;

      const tasks = await Task.find(taskMatchFilter)
        .populate('assignedTo', 'firstName lastName')
        .populate('project', 'name')
        .sort(sort)
        .limit(limit)
        .skip(skip);

      if (entityType === 'task') {
        totalCount = await Task.countDocuments(taskMatchFilter);
        results = tasks;
      } else {
        results.push(...tasks.map(t => ({ type: 'task', data: t })));
      }
    }

    if (entityType === 'project' || entityType === 'all') {
      const projectMatchFilter = {
        isDeleted: false,
        createdAt: { $gte: start, $lte: end }
      };

      if (filters.department) projectMatchFilter.department = filters.department;
      if (filters.status) projectMatchFilter.status = filters.status;

      const projects = await Project.find(projectMatchFilter)
        .populate('projectManager', 'firstName lastName')
        .sort(sort)
        .limit(limit)
        .skip(skip);

      if (entityType === 'project') {
        totalCount = await Project.countDocuments(projectMatchFilter);
        results = projects;
      } else {
        results.push(...projects.map(p => ({ type: 'project', data: p })));
      }
    }

    if (entityType === 'worklog' || entityType === 'all') {
      const worklogMatchFilter = {
        isDeleted: false,
        workDate: { $gte: start, $lte: end }
      };

      if (filters.employee) worklogMatchFilter.employee = filters.employee;
      if (filters.project) worklogMatchFilter.project = filters.project;

      const workLogs = await WorkLog.find(worklogMatchFilter)
        .populate('employee', 'firstName lastName')
        .populate('task', 'title')
        .populate('project', 'name')
        .sort(sort)
        .limit(limit)
        .skip(skip);

      if (entityType === 'worklog') {
        totalCount = await WorkLog.countDocuments(worklogMatchFilter);
        results = workLogs;
      } else {
        results.push(...workLogs.map(w => ({ type: 'worklog', data: w })));
      }
    }

    return {
      entityType,
      dateRange: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      filters,
      results,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async advancedSearch(searchCriteria, options = {}) {
    const {
      query,
      entityType = 'all',
      filters = {},
      dateRange = {},
      sort = { createdAt: -1 },
      limit = 50,
      skip = 0
    } = searchCriteria;

    let results = [];
    let totalCount = 0;

    if (entityType === 'all' || entityType === 'task') {
      const taskResults = await this.searchTasks(query || '', filters, { sort, limit, skip });
      if (entityType === 'task') {
        return taskResults;
      }
      results.push(...taskResults.results.map(t => ({ type: 'task', data: t })));
      totalCount += taskResults.pagination.total;
    }

    if (entityType === 'all' || entityType === 'project') {
      const projectResults = await this.searchProjects(query || '', filters, { sort, limit, skip });
      if (entityType === 'project') {
        return projectResults;
      }
      results.push(...projectResults.results.map(p => ({ type: 'project', data: p })));
      totalCount += projectResults.pagination.total;
    }

    if (entityType === 'all' || entityType === 'employee') {
      const employeeResults = await this.searchEmployees(query || '', filters, { sort, limit, skip });
      if (entityType === 'employee') {
        return employeeResults;
      }
      results.push(...employeeResults.results.map(e => ({ type: 'employee', data: e })));
      totalCount += employeeResults.pagination.total;
    }

    if (dateRange.startDate && dateRange.endDate) {
      const dateResults = await this.searchByDateRange(
        entityType,
        dateRange.startDate,
        dateRange.endDate,
        filters,
        { sort, limit, skip }
      );
      if (entityType !== 'all') {
        return dateResults;
      }
      results.push(...dateResults.results);
    }

    return {
      searchCriteria,
      results,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    };
  }

  async saveSearchFilter(userId, filterConfig) {
    const User = (await import('../user/user.model.js')).default;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const savedFilter = {
      name: filterConfig.name,
      entityType: filterConfig.entityType,
      query: filterConfig.query,
      filters: filterConfig.filters,
      dateRange: filterConfig.dateRange,
      createdAt: new Date()
    };

    if (!user.savedSearchFilters) {
      user.savedSearchFilters = [];
    }

    user.savedSearchFilters.push(savedFilter);
    await user.save();

    return savedFilter;
  }

  async getSavedSearchFilters(userId) {
    const User = (await import('../user/user.model.js')).default;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.savedSearchFilters || [];
  }

  async deleteSavedSearchFilter(userId, filterId) {
    const User = (await import('../user/user.model.js')).default;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.savedSearchFilters = user.savedSearchFilters.filter(
      (f, index) => index.toString() !== filterId.toString()
    );

    await user.save();

    return { success: true };
  }

  async getSearchSuggestions(query, entityType = 'all') {
    const Task = (await import('./task.model.js')).default;
    const Project = (await import('../project/project.model.js')).default;
    const Employee = (await import('../employee/employee.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;

    const searchRegex = new RegExp(query, 'i');
    const suggestions = [];

    if (entityType === 'all' || entityType === 'task') {
      const tasks = await Task.find({
        isDeleted: false,
        title: searchRegex
      }).select('title taskNumber').limit(5);

      suggestions.push(...tasks.map(t => ({
        type: 'task',
        value: t.title,
        id: t._id,
        metadata: { taskNumber: t.taskNumber }
      })));
    }

    if (entityType === 'all' || entityType === 'project') {
      const projects = await Project.find({
        isDeleted: false,
        name: searchRegex
      }).select('name projectCode').limit(5);

      suggestions.push(...projects.map(p => ({
        type: 'project',
        value: p.name,
        id: p._id,
        metadata: { projectCode: p.projectCode }
      })));
    }

    if (entityType === 'all' || entityType === 'employee') {
      const employees = await Employee.find({
        isDeleted: false,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex }
        ]
      }).select('firstName lastName employeeId').limit(5);

      suggestions.push(...employees.map(e => ({
        type: 'employee',
        value: `${e.firstName} ${e.lastName}`,
        id: e._id,
        metadata: { employeeId: e.employeeId }
      })));
    }

    if (entityType === 'all' || entityType === 'department') {
      const departments = await Department.find({
        isDeleted: false,
        name: searchRegex
      }).select('name departmentCode').limit(5);

      suggestions.push(...departments.map(d => ({
        type: 'department',
        value: d.name,
        id: d._id,
        metadata: { departmentCode: d.departmentCode }
      })));
    }

    return {
      query,
      suggestions: suggestions.slice(0, 10)
    };
  }
}

export default new SearchService();
