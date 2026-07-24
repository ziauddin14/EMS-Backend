import dashboardRepository from './dashboard.repository.js';
import employeeRepository from '../employee/employee.repository.js';
import AppError from '../../core/errors/AppError.js';

class DashboardService {
  async getCEODashboard(filters = {}) {
    const totalEmployees = await dashboardRepository.getEmployeeCount(filters);
    const departmentsCount = await dashboardRepository.getDepartmentCount();
    const designationsCount = await dashboardRepository.getDesignationCount();
    const internCount = await dashboardRepository.getInternCount();
    const probationEmployees = await dashboardRepository.getProbationEmployees();
    const resignedEmployees = await dashboardRepository.getResignedCount();
    const terminatedEmployees = await dashboardRepository.getTerminatedCount();
    const onLeave = await dashboardRepository.getOnLeaveCount();
    const activeEmployees = await dashboardRepository.getActiveCount();

    const monthlyHiring = await dashboardRepository.getMonthlyHiring(12);
    const monthlyResignation = await dashboardRepository.getMonthlyResignation(12);
    const departmentDistribution = await dashboardRepository.getDepartmentDistribution();
    const designationDistribution = await dashboardRepository.getDesignationDistribution();
    const lifecycleDistribution = await dashboardRepository.getEmployeesByStage();
    const organizationGrowth = await dashboardRepository.getOrganizationGrowth(12);

    const topDepartments = await dashboardRepository.getTopDepartments(5);
    const topManagers = await dashboardRepository.getTopManagers(5);
    const recentEmployees = await dashboardRepository.getRecentEmployees(10);
    const upcomingConfirmations = await dashboardRepository.getUpcomingConfirmations(30);
    const upcomingBirthdays = await dashboardRepository.getUpcomingBirthdays(30);
    const upcomingWorkAnniversaries = await dashboardRepository.getUpcomingWorkAnniversaries(30);

    return {
      overview: {
        totalEmployees,
        departmentsCount,
        designationsCount,
        internCount,
        probationEmployees,
        resignedEmployees,
        terminatedEmployees,
        onLeave,
        activeEmployees
      },
      trends: {
        monthlyHiring,
        monthlyResignation,
        organizationGrowth
      },
      distribution: {
        departmentDistribution,
        designationDistribution,
        lifecycleDistribution
      },
      rankings: {
        topDepartments,
        topManagers
      },
      upcoming: {
        upcomingConfirmations,
        upcomingBirthdays,
        upcomingWorkAnniversaries
      },
      recent: {
        recentEmployees
      }
    };
  }

  async getHRDashboard(filters = {}) {
    const pendingConfirmations = await dashboardRepository.getPendingConfirmations();
    const probationEmployees = await dashboardRepository.getProbationEmployees();
    const upcomingExits = await dashboardRepository.getUpcomingExits(30);
    const hiringTrends = await dashboardRepository.getMonthlyHiring(6);
    const genderDistribution = await dashboardRepository.getGenderDistribution();
    const ageDistribution = await dashboardRepository.getAgeDistribution();
    const employmentTypes = await dashboardRepository.getEmployeesByType();
    const lifecycleStatistics = await dashboardRepository.getEmployeesByStage();
    const departmentDistribution = await dashboardRepository.getDepartmentDistribution();

    return {
      pendingActions: {
        pendingConfirmations,
        probationEmployees,
        upcomingExits
      },
      trends: {
        hiringTrends
      },
      demographics: {
        genderDistribution,
        ageDistribution
      },
      distribution: {
        employmentTypes,
        lifecycleStatistics,
        departmentDistribution
      }
    };
  }

  async getManagerDashboard(managerId, filters = {}) {
    const manager = await employeeRepository.findById(managerId);
    if (!manager) {
      throw new AppError('Manager not found', 404);
    }

    const directReports = await dashboardRepository.getDirectReports(managerId);
    const teamStatistics = await dashboardRepository.getTeamStatistics(managerId);
    const teamMembers = await employeeRepository.findDirectReports(managerId);

    const activeTeam = teamMembers.filter(emp => emp.employmentStatus === 'active').length;
    const onLeaveTeam = teamMembers.filter(emp => emp.employmentStatus === 'on_leave').length;
    const probationTeam = teamMembers.filter(emp => emp.isOnProbation).length;

    return {
      manager: {
        employeeNumber: manager.employeeNumber,
        name: manager.user?.fullName,
        designation: manager.designation,
        department: manager.department
      },
      teamOverview: {
        totalDirectReports: directReports,
        activeTeam,
        onLeaveTeam,
        probationTeam
      },
      teamStatistics,
      teamMembers: teamMembers.map(emp => ({
        employeeNumber: emp.employeeNumber,
        name: emp.user?.fullName,
        employmentStatus: emp.employmentStatus,
        employmentStage: emp.employmentStage,
        designation: emp.designation
      }))
    };
  }

  async getDepartmentDashboard(departmentId, filters = {}) {
    const Department = (await import('../department/department.model.js')).default;
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const departmentStatistics = await dashboardRepository.getDepartmentStatistics(departmentId);
    const departmentEmployees = await employeeRepository.findByDepartment(departmentId);

    return {
      department: {
        name: department.name,
        code: department.code
      },
      statistics: departmentStatistics,
      employees: {
        total: departmentEmployees.length,
        active: departmentEmployees.filter(emp => emp.employmentStatus === 'active').length,
        onProbation: departmentEmployees.filter(emp => emp.isOnProbation).length,
        onLeave: departmentEmployees.filter(emp => emp.employmentStatus === 'on_leave').length
      }
    };
  }

  async getEmployeeDashboard(employeeId) {
    const employeeStatistics = await dashboardRepository.getEmployeeStatistics(employeeId);
    if (!employeeStatistics) {
      throw new AppError('Employee not found', 404);
    }

    const { employee, directReports, yearsOfService, isConfirmed, isOnProbation } = employeeStatistics;

    const profileCompletion = this.calculateProfileCompletion(employee);

    return {
      employee: {
        employeeNumber: employee.employeeNumber,
        name: employee.user?.fullName,
        email: employee.officialEmail,
        phone: employee.officialPhone,
        department: employee.department?.name,
        designation: employee.designation?.title,
        employmentType: employee.employmentType,
        employmentStatus: employee.employmentStatus,
        employmentStage: employee.employmentStage,
        joiningDate: employee.joiningDate
      },
      statistics: {
        yearsOfService,
        directReports,
        isConfirmed,
        isOnProbation
      },
      profile: {
        completion: profileCompletion,
        isComplete: profileCompletion === 100
      }
    };
  }

  calculateProfileCompletion(employee) {
    let completedFields = 0;
    const totalFields = 10;

    if (employee.employeeNumber) completedFields++;
    if (employee.officialEmail) completedFields++;
    if (employee.officialPhone) completedFields++;
    if (employee.department) completedFields++;
    if (employee.designation) completedFields++;
    if (employee.dateOfBirth) completedFields++;
    if (employee.gender) completedFields++;
    if (employee.nationality) completedFields++;
    if (employee.currentAddress) completedFields++;
    if (employee.emergencyContact) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  async getStatistics(filters = {}) {
    const totalEmployees = await dashboardRepository.getEmployeeCount(filters);
    const activeEmployees = await dashboardRepository.getActiveCount();
    const onProbation = await dashboardRepository.getProbationEmployees();
    const onLeave = await dashboardRepository.getOnLeaveCount();
    const resigned = await dashboardRepository.getResignedCount();
    const terminated = await dashboardRepository.getTerminatedCount();

    const byStatus = await dashboardRepository.getEmployeesByStatus();
    const byType = await dashboardRepository.getEmployeesByType();
    const byStage = await dashboardRepository.getEmployeesByStage();
    const byDepartment = await dashboardRepository.getDepartmentDistribution();
    const byDesignation = await dashboardRepository.getDesignationDistribution();

    return {
      overview: {
        totalEmployees,
        activeEmployees,
        onProbation,
        onLeave,
        resigned,
        terminated
      },
      breakdown: {
        byStatus,
        byType,
        byStage,
        byDepartment,
        byDesignation
      }
    };
  }

  async getChartData(chartType, filters = {}) {
    let data = [];

    switch (chartType) {
      case 'hiring_trend':
        data = await dashboardRepository.getMonthlyHiring(12);
        break;
      case 'resignation_trend':
        data = await dashboardRepository.getMonthlyResignation(12);
        break;
      case 'department_distribution':
        data = await dashboardRepository.getDepartmentDistribution();
        break;
      case 'designation_distribution':
        data = await dashboardRepository.getDesignationDistribution();
        break;
      case 'gender_distribution':
        data = await dashboardRepository.getGenderDistribution();
        break;
      case 'age_distribution':
        data = await dashboardRepository.getAgeDistribution();
        break;
      case 'employment_type':
        data = await dashboardRepository.getEmployeesByType();
        break;
      case 'lifecycle_stage':
        data = await dashboardRepository.getEmployeesByStage();
        break;
      case 'organization_growth':
        data = await dashboardRepository.getOrganizationGrowth(12);
        break;
      default:
        throw new AppError('Invalid chart type', 400);
    }

    return {
      chartType,
      data,
      filters
    };
  }

  async getFilteredDashboard(filters = {}) {
    const filteredCount = await dashboardRepository.getFilteredEmployeeCount(filters);
    const departmentDistribution = await dashboardRepository.getDepartmentDistribution();
    const designationDistribution = await dashboardRepository.getDesignationDistribution();
    const employmentTypes = await dashboardRepository.getEmployeesByType();
    const employmentStages = await dashboardRepository.getEmployeesByStage();

    return {
      filters,
      summary: {
        totalEmployees: filteredCount
      },
      distribution: {
        departmentDistribution,
        designationDistribution,
        employmentTypes,
        employmentStages
      }
    };
  }

  async getTeamLeadDashboard(teamLeadId, filters = {}) {
    const teamLead = await employeeRepository.findById(teamLeadId);
    if (!teamLead) {
      throw new AppError('Team lead not found', 404);
    }

    const directReports = await dashboardRepository.getDirectReports(teamLeadId);
    const teamStatistics = await dashboardRepository.getTeamStatistics(teamLeadId);
    const teamMembers = await employeeRepository.findDirectReports(teamLeadId);

    return {
      teamLead: {
        employeeNumber: teamLead.employeeNumber,
        name: teamLead.user?.fullName,
        designation: teamLead.designation,
        department: teamLead.department
      },
      teamOverview: {
        totalTeamMembers: directReports,
        activeTeam: teamMembers.filter(emp => emp.employmentStatus === 'active').length,
        onLeaveTeam: teamMembers.filter(emp => emp.employmentStatus === 'on_leave').length
      },
      teamStatistics,
      teamMembers: teamMembers.map(emp => ({
        employeeNumber: emp.employeeNumber,
        name: emp.user?.fullName,
        employmentStatus: emp.employmentStatus,
        designation: emp.designation
      }))
    };
  }

  async getDashboardByRole(role, userId, filters = {}) {
    switch (role) {
      case 'ceo':
        return this.getCEODashboard(filters);
      case 'hr':
        return this.getHRDashboard(filters);
      case 'manager':
      case 'department_head':
        const employee = await employeeRepository.findByUser(userId);
        if (!employee) {
          throw new AppError('Employee not found', 404);
        }
        return this.getManagerDashboard(employee._id, filters);
      case 'team_lead':
        const teamLead = await employeeRepository.findByUser(userId);
        if (!teamLead) {
          throw new AppError('Team lead not found', 404);
        }
        return this.getTeamLeadDashboard(teamLead._id, filters);
      case 'employee':
        const emp = await employeeRepository.findByUser(userId);
        if (!emp) {
          throw new AppError('Employee not found', 404);
        }
        return this.getEmployeeDashboard(emp._id);
      default:
        return this.getEmployeeDashboard(userId);
    }
  }

  async getOrganizationOverview() {
    const totalEmployees = await dashboardRepository.getEmployeeCount();
    const departments = await dashboardRepository.getDepartmentCount();
    const designations = await dashboardRepository.getDesignationCount();
    const active = await dashboardRepository.getActiveCount();
    const onProbation = await dashboardRepository.getProbationEmployees();
    const onLeave = await dashboardRepository.getOnLeaveCount();
    const resigned = await dashboardRepository.getResignedCount();
    const terminated = await dashboardRepository.getTerminatedCount();

    const monthlyHiring = await dashboardRepository.getMonthlyHiring(6);
    const departmentDistribution = await dashboardRepository.getDepartmentDistribution();

    return {
      overview: {
        totalEmployees,
        departments,
        designations,
        active,
        onProbation,
        onLeave,
        resigned,
        terminated
      },
      trends: {
        monthlyHiring
      },
      distribution: {
        departmentDistribution
      }
    };
  }

  async getQuickStatistics() {
    const total = await dashboardRepository.getEmployeeCount();
    const active = await dashboardRepository.getActiveCount();
    const onProbation = await dashboardRepository.getProbationEmployees();
    const onLeave = await dashboardRepository.getOnLeaveCount();
    const resigned = await dashboardRepository.getResignedCount();
    const terminated = await dashboardRepository.getTerminatedCount();

    return {
      total,
      active,
      onProbation,
      onLeave,
      resigned,
      terminated
    };
  }
}

export default new DashboardService();
