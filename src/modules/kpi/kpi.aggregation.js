import Logger from '../../core/utils/logger.js';

class KPIAggregation {
  constructor() {
    this.logger = Logger;
  }

  // Optimized aggregation for department averages with projections
  async getDepartmentAverageOptimized(departmentId, year) {
    const KPI = (await import('./kpi.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          department: departmentId,
          year,
          isDeleted: false,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$department',
          averageScore: { $avg: '$overallScore' },
          totalEmployees: { $sum: 1 },
          maxScore: { $max: '$overallScore' },
          minScore: { $min: '$overallScore' },
          averageAttendance: { $avg: '$scores.attendance' },
          averageTask: { $avg: '$scores.task' },
          averageProductivity: { $avg: '$scores.productivity' },
          averageQuality: { $avg: '$scores.quality' },
          gradeDistribution: {
            $push: '$performanceGrade'
          }
        }
      },
      {
        $project: {
          _id: 0,
          departmentId: '$_id',
          averageScore: { $round: ['$averageScore', 2] },
          totalEmployees: 1,
          maxScore: { $round: ['$maxScore', 2] },
          minScore: { $round: ['$minScore', 2] },
          averageAttendance: { $round: ['$averageAttendance', 2] },
          averageTask: { $round: ['$averageTask', 2] },
          averageProductivity: { $round: ['$averageProductivity', 2] },
          averageQuality: { $round: ['$averageQuality', 2] },
          gradeDistribution: 1
        }
      }
    ];

    return await KPI.aggregate(pipeline);
  }

  // Optimized aggregation for yearly trends with early filtering
  async getYearlyTrendOptimized(employeeId, years = 5) {
    const KPI = (await import('./kpi.model.js')).default;
    const startYear = new Date().getFullYear() - years;
    
    const pipeline = [
      {
        $match: {
          employee: employeeId,
          year: { $gte: startYear },
          isDeleted: false,
          status: 'approved'
        }
      },
      {
        $sort: { year: 1, month: 1 }
      },
      {
        $group: {
          _id: '$year',
          averageScore: { $avg: '$overallScore' },
          maxScore: { $max: '$overallScore' },
          minScore: { $min: '$overallScore' },
          totalRecords: { $sum: 1 },
          grades: { $push: '$performanceGrade' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          averageScore: { $round: ['$averageScore', 2] },
          maxScore: { $round: ['$maxScore', 2] },
          minScore: { $round: ['$minScore', 2] },
          totalRecords: 1,
          grades: 1
        }
      },
      {
        $sort: { year: 1 }
      }
    ];

    return await KPI.aggregate(pipeline);
  }

  // Optimized aggregation for top performers with limit and projection
  async getTopPerformersOptimized(year, limit = 10) {
    const KPI = (await import('./kpi.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          year,
          isDeleted: false,
          status: 'approved'
        }
      },
      {
        $sort: { overallScore: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
          pipeline: [
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                employeeId: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          _id: 0,
          overallScore: 1,
          performanceGrade: 1,
          employee: 1,
          department: 1
        }
      }
    ];

    return await KPI.aggregate(pipeline);
  }

  // Optimized aggregation for organization overview with parallel processing
  async getOrganizationOverviewOptimized(year) {
    const KPI = (await import('./kpi.model.js')).default;
    const Goal = (await import('./goal.model.js')).default;
    const Appraisal = (await import('./appraisal.model.js')).default;
    const Reward = (await import('./reward.model.js')).default;
    const Warning = (await import('./warning.model.js')).default;

    const [kpiStats, goalStats, appraisalStats, rewardStats, warningStats] = await Promise.all([
      this.getKPIStatsOptimized(year),
      this.getGoalStatsOptimized(year),
      this.getAppraisalStatsOptimized(year),
      this.getRewardStatsOptimized(year),
      this.getWarningStatsOptimized(year)
    ]);

    return {
      year,
      kpi: kpiStats,
      goals: goalStats,
      appraisals: appraisalStats,
      rewards: rewardStats,
      warnings: warningStats
    };
  }

  // Optimized KPI statistics aggregation
  async getKPIStatsOptimized(year) {
    const KPI = (await import('./kpi.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          year,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          averageScore: { $avg: '$overallScore' },
          maxScore: { $max: '$overallScore' },
          minScore: { $min: '$overallScore' },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          gradeDistribution: {
            $push: '$performanceGrade'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalRecords: 1,
          averageScore: { $round: ['$averageScore', 2] },
          maxScore: { $round: ['$maxScore', 2] },
          minScore: { $round: ['$minScore', 2] },
          approvedCount: 1,
          pendingCount: 1,
          gradeDistribution: 1
        }
      }
    ];

    const result = await KPI.aggregate(pipeline);
    return result[0] || {};
  }

  // Optimized Goal statistics aggregation
  async getGoalStatsOptimized(year) {
    const Goal = (await import('./goal.model.js')).default;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const pipeline = [
      {
        $match: {
          startDate: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          completedGoals: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressGoals: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          overdueGoals: {
            $sum: { $cond: [{ $and: [{ $lt: ['$dueDate', new Date()] }, { $ne: ['$status', 'completed'] }] }, 1, 0] }
          },
          averageCompletion: { $avg: '$completionPercentage' }
        }
      },
      {
        $project: {
          _id: 0,
          totalGoals: 1,
          completedGoals: 1,
          inProgressGoals: 1,
          overdueGoals: 1,
          averageCompletion: { $round: ['$averageCompletion', 2] }
        }
      }
    ];

    const result = await Goal.aggregate(pipeline);
    return result[0] || {};
  }

  // Optimized Appraisal statistics aggregation
  async getAppraisalStatsOptimized(year) {
    const Appraisal = (await import('./appraisal.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          year,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalAppraisals: { $sum: 1 },
          completedAppraisals: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageRating: { $avg: '$finalRating' },
          promotionEligible: {
            $sum: { $cond: ['$promotion.eligible', 1, 0] }
          },
          incrementEligible: {
            $sum: { $cond: ['$increment.eligible', 1, 0] }
          },
          bonusEligible: {
            $sum: { $cond: ['$bonus.eligible', 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalAppraisals: 1,
          completedAppraisals: 1,
          averageRating: { $round: ['$averageRating', 2] },
          promotionEligible: 1,
          incrementEligible: 1,
          bonusEligible: 1
        }
      }
    ];

    const result = await Appraisal.aggregate(pipeline);
    return result[0] || {};
  }

  // Optimized Reward statistics aggregation
  async getRewardStatsOptimized(year) {
    const Reward = (await import('./reward.model.js')).default;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const pipeline = [
      {
        $match: {
          issuedDate: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalRewards: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          totalValue: { $sum: '$monetaryValue' },
          issuedRewards: {
            $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] }
          },
          pendingRewards: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalRewards: 1,
          totalPoints: 1,
          totalValue: 1,
          issuedRewards: 1,
          pendingRewards: 1
        }
      }
    ];

    const result = await Reward.aggregate(pipeline);
    return result[0] || {};
  }

  // Optimized Warning statistics aggregation
  async getWarningStatsOptimized(year) {
    const Warning = (await import('./warning.model.js')).default;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const pipeline = [
      {
        $match: {
          issuedDate: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalWarnings: { $sum: 1 },
          activeWarnings: {
            $sum: { $cond: [{ $eq: ['$resolved', false] }, 1, 0] }
          },
          resolvedWarnings: {
            $sum: { $cond: ['$resolved', true], 1, 0] }
          },
          criticalWarnings: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          highWarnings: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalWarnings: 1,
          activeWarnings: 1,
          resolvedWarnings: 1,
          criticalWarnings: 1,
          highWarnings: 1
        }
      }
    ];

    const result = await Warning.aggregate(pipeline);
    return result[0] || {};
  }

  // Optimized aggregation for performance heatmap with batch processing
  async getPerformanceHeatmapOptimized(year) {
    const Performance = (await import('./performance.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;
    
    const departments = await Department.find({ isDeleted: false }).select('_id name').lean();
    const heatmapData = [];

    for (const department of departments) {
      const pipeline = [
        {
          $match: {
            department: department._id,
            year,
            isDeleted: false,
            approvalStatus: 'approved'
          }
        },
        {
          $unwind: '$monthlyPerformance'
        },
        {
          $group: {
            _id: '$monthlyPerformance.month',
            averageScore: { $avg: '$monthlyPerformance.score' }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            averageScore: { $round: ['$averageScore', 2] }
          }
        }
      ];

      const monthlyData = await Performance.aggregate(pipeline);
      
      // Fill in missing months with 0
      const completeMonthlyData = [];
      for (let month = 1; month <= 12; month++) {
        const monthData = monthlyData.find(m => m.month === month);
        completeMonthlyData.push(monthData?.averageScore || 0);
      }

      heatmapData.push({
        departmentId: department._id,
        departmentName: department.name,
        monthlyScores: completeMonthlyData,
        averageScore: completeMonthlyData.reduce((sum, s) => sum + s, 0) / 12
      });
    }

    return heatmapData;
  }

  // Optimized aggregation for leaderboard with caching
  async getLeaderboardOptimized(year, limit = 50) {
    const Performance = (await import('./performance.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          year,
          isDeleted: false,
          approvalStatus: 'approved'
        }
      },
      {
        $sort: { 'yearlyPerformance.overallScore': -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
          pipeline: [
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                employeeId: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          _id: 0,
          employee: 1,
          department: 1,
          overallScore: '$yearlyPerformance.overallScore',
          grade: '$yearlyPerformance.grade',
          rank: { $add: [1, { $indexOfArray: [{ $range: [0, limit] }, 0 }] } }
        }
      }
    ];

    const results = await Performance.aggregate(pipeline);
    
    // Add rank after sorting
    return results.map((result, index) => ({
      ...result,
      rank: index + 1
    }));
  }

  // Optimized aggregation for department comparison with parallel execution
  async getDepartmentComparisonOptimized(year) {
    const Performance = (await import('./performance.model.js')).default;
    const Department = (await import('../department/department.model.js')).default;
    
    const departments = await Department.find({ isDeleted: false }).select('_id name').lean();
    
    const comparisonData = await Promise.all(
      departments.map(async (department) => {
        const pipeline = [
          {
            $match: {
              department: department._id,
              year,
              isDeleted: false,
              approvalStatus: 'approved'
            }
          },
          {
            $group: {
              _id: '$department',
              averageScore: { $avg: '$yearlyPerformance.overallScore' },
              totalEmployees: { $sum: 1 },
              maxScore: { $max: '$yearlyPerformance.overallScore' },
              minScore: { $min: '$yearlyPerformance.overallScore' },
              promotionEligible: {
                $sum: { $cond: ['$promotionEligible', 1, 0] }
              },
              bonusEligible: {
                $sum: { $cond: ['$bonusEligible', 1, 0] }
              }
            }
          },
          {
            $project: {
              _id: 0,
              departmentId: '$_id',
              averageScore: { $round: ['$averageScore', 2] },
              totalEmployees: 1,
              maxScore: { $round: ['$maxScore', 2] },
              minScore: { $round: ['$minScore', 2] },
              promotionEligible: 1,
              bonusEligible: 1
            }
          }
        ];

        const result = await Performance.aggregate(pipeline);
        return {
          departmentId: department._id,
          departmentName: department.name,
          ...result[0]
        };
      })
    );

    return comparisonData.sort((a, b) => b.averageScore - a.averageScore);
  }

  // Optimized aggregation for monthly trends with early projection
  async getMonthlyTrendOptimized(year) {
    const KPI = (await import('./kpi.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          year,
          isDeleted: false,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$month',
          averageScore: { $avg: '$overallScore' },
          totalRecords: { $sum: 1 },
          maxScore: { $max: '$overallScore' },
          minScore: { $min: '$overallScore' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          averageScore: { $round: ['$averageScore', 2] },
          totalRecords: 1,
          maxScore: { $round: ['$maxScore', 2] },
          minScore: { $round: ['$minScore', 2] }
        }
      }
    ];

    return await KPI.aggregate(pipeline);
  }

  // Optimized aggregation for quarterly trends with caching
  async getQuarterlyTrendOptimized(year) {
    const KPI = (await import('./kpi.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          year,
          isDeleted: false,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$quarter',
          averageScore: { $avg: '$overallScore' },
          totalRecords: { $sum: 1 },
          maxScore: { $max: '$overallScore' },
          minScore: { $min: '$overallScore' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          quarter: '$_id',
          averageScore: { $round: ['$averageScore', 2] },
          totalRecords: 1,
          maxScore: { $round: ['$maxScore', 2] },
          minScore: { $round: ['$minScore', 2] }
        }
      }
    ];

    return await KPI.aggregate(pipeline);
  }

  // Optimized aggregation for employee performance summary
  async getEmployeePerformanceSummaryOptimized(employeeId, year) {
    const Performance = (await import('./performance.model.js')).default;
    
    const pipeline = [
      {
        $match: {
          employee: employeeId,
          year,
          isDeleted: false,
          approvalStatus: 'approved'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
          pipeline: [
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                employeeId: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          _id: 0,
          employee: 1,
          department: 1,
          overallScore: '$yearlyPerformance.overallScore',
          grade: '$yearlyPerformance.grade',
          trend: '$yearlyPerformance.trend',
          improvementPercentage: '$yearlyPerformance.improvementPercentage',
          growthPercentage: '$yearlyPerformance.growthPercentage',
          rank: '$organizationRank',
          percentile: '$yearlyPerformance.percentile',
          promotionEligible: 1,
          bonusEligible: 1,
          appraisalEligible: 1
        }
      }
    ];

    const result = await Performance.aggregate(pipeline);
    return result[0] || null;
  }
}

const kpiAggregation = new KPIAggregation();
export default kpiAggregation;
