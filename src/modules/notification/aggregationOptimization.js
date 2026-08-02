/**
 * Aggregation Pipeline Optimization Strategies
 * 
 * Best practices for MongoDB aggregation pipelines in the Notification module
 * Optimized for performance with millions of records
 */

class AggregationOptimizer {
  /**
   * General Optimization Principles
   */
  static getOptimizationPrinciples() {
    return {
      matchEarly: 'Place $match as early as possible to reduce document count',
      projectEarly: 'Use $project early to limit fields processed',
      useIndexes: 'Ensure aggregation stages use indexed fields',
      limitResults: 'Always use $limit to prevent large result sets',
      useCursor: 'Use cursor for large result sets instead of toArray',
      allowDiskUse: 'Set allowDiskUse: true for large aggregations',
      avoidUnwind: 'Avoid $unwind on large arrays unless necessary',
      useLookup: 'Use $lookup sparingly, consider embedding instead',
      useFacet: 'Use $facet for parallel aggregations',
      useBucket: 'Use $bucket/$bucketAuto for grouping',
      useGraphLookup: 'Use $graphLookup for hierarchical data',
      useMerge: 'Use $merge for output to collections',
      useOut: 'Use $out for一次性 aggregation to new collection'
    };
  }

  /**
   * Optimized Notification Aggregation Patterns
   */
  static getNotificationAggregationPatterns() {
    return {
      // Time series with early date filtering
      timeSeriesOptimized: [
        {
          $match: {
            createdAt: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ],

      // Category breakdown with projection
      categoryBreakdownOptimized: [
        {
          $match: {
            createdAt: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $project: {
            category: 1,
            readStatus: 1
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ],

      // Multi-facet aggregation for dashboard
      dashboardStatsOptimized: [
        {
          $match: {
            recipient: '$userId',
            isDeleted: false
          }
        },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  unread: {
                    $sum: { $cond: [{ $eq: ['$readStatus', 'unread'] }, 1, 0] }
                  },
                  read: {
                    $sum: { $cond: [{ $eq: ['$readStatus', 'read'] }, 1, 0] }
                  }
                }
              }
            ],
            byCategory: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            byPriority: [
              {
                $group: {
                  _id: '$priority',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            recent: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $project: {
                  title: 1,
                  message: 1,
                  priority: 1,
                  createdAt: 1
                }
              }
            ]
          }
        }
      ],

      // Channel breakdown with optimized unwind
      channelBreakdownOptimized: [
        {
          $match: {
            createdAt: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false,
            channels: { $exists: true, $ne: [] }
          }
        },
        {
          $project: {
            channels: 1
          }
        },
        { $unwind: '$channels' },
        {
          $group: {
            _id: '$channels',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]
    };
  }

  /**
   * Optimized Audit Aggregation Patterns
   */
  static getAuditAggregationPatterns() {
    return {
      // User activity summary with early filtering
      userActivitySummaryOptimized: [
        {
          $match: {
            performedBy: '$userId',
            timestamp: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successful: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            highImpact: {
              $sum: { $cond: [{ $eq: ['$impact', 'high'] }, 1, 0] }
            },
            criticalImpact: {
              $sum: { $cond: [{ $eq: ['$impact', 'critical'] }, 1, 0] }
            },
            uniqueModules: { $addToSet: '$module' },
            uniqueActions: { $addToSet: '$action' }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            successful: 1,
            failed: 1,
            highImpact: 1,
            criticalImpact: 1,
            moduleCount: { $size: '$uniqueModules' },
            actionCount: { $size: '$uniqueActions' }
          }
        }
      ],

      // Entity history with projection
      entityHistoryOptimized: [
        {
          $match: {
            entity: '$entity',
            entityId: '$entityId',
            isDeleted: false
          }
        },
        {
          $project: {
            action: 1,
            performedBy: 1,
            performedByName: 1,
            timestamp: 1,
            oldData: 1,
            newData: 1,
            changes: 1,
            status: 1,
            impact: 1
          }
        },
        { $sort: { timestamp: -1 } },
        { $limit: 50 }
      ],

      // Security trends with compound grouping
      securityTrendsOptimized: [
        {
          $match: {
            module: 'authentication',
            timestamp: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
              },
              action: '$action'
            },
            count: { $sum: 1 },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.date': 1, count: -1 } }
      ],

      // Multi-facet audit dashboard
      auditDashboardOptimized: [
        {
          $match: {
            timestamp: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  successful: {
                    $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                  },
                  failed: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                  }
                }
              }
            ],
            byModule: [
              {
                $group: {
                  _id: '$module',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            byAction: [
              {
                $group: {
                  _id: '$action',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            byImpact: [
              {
                $group: {
                  _id: '$impact',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            failed: [
              { $match: { status: 'failed' } },
              { $sort: { timestamp: -1 } },
              { $limit: 10 }
            ],
            highImpact: [
              { $match: { impact: { $in: ['high', 'critical'] } } },
              { $sort: { timestamp: -1 } },
              { $limit: 10 }
            ]
          }
        }
      ]
    };
  }

  /**
   * Optimized Activity Aggregation Patterns
   */
  static getActivityAggregationPatterns() {
    return {
      // Heatmap with optimized date extraction
      heatmapOptimized: [
        {
          $match: {
            user: '$userId',
            timestamp: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
              },
              hour: { $hour: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1, '_id.hour': 1 } }
      ],

      // Leaderboard with early projection
      leaderboardOptimized: [
        {
          $match: {
            timestamp: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $project: {
            user: 1,
            userName: 1,
            userEmail: 1,
            userRole: 1,
            status: 1
          }
        },
        {
          $group: {
            _id: '$user',
            userName: { $first: '$userName' },
            userEmail: { $first: '$userEmail' },
            userRole: { $first: '$userRole' },
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $sort: { total: -1 }
        },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            user: '$_id',
            userName: 1,
            userEmail: 1,
            userRole: 1,
            total: 1,
            completed: 1,
            completionRate: {
              $multiply: [
                { $divide: ['$completed', '$total'] },
                100
              ]
            }
          }
        }
      ],

      // Activity timeline with bucket
      activityTimelineOptimized: [
        {
          $match: {
            timestamp: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $bucketAuto: {
            groupBy: '$timestamp',
            buckets: 50,
            output: {
              count: { $sum: 1 },
              activities: {
                $push: {
                  type: 1,
                  module: 1,
                  title: 1,
                  timestamp: 1
                }
              }
            }
          }
        },
        { $sort: { _id: -1 } }
      ],

      // Multi-facet activity dashboard
      activityDashboardOptimized: [
        {
          $match: {
            timestamp: { $gte: '$startDate', $lte: '$endDate' },
            isDeleted: false
          }
        },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  active: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                  },
                  completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                  },
                  failed: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                  }
                }
              }
            ],
            byType: [
              {
                $group: {
                  _id: '$type',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            byModule: [
              {
                $group: {
                  _id: '$module',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            byStatus: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            recent: [
              { $sort: { timestamp: -1 } },
              { $limit: 20 }
            ]
          }
        }
      ]
    };
  }

  /**
   * Performance Tips
   */
  static getPerformanceTips() {
    return {
      useCoveredQueries: 'Ensure aggregation stages only use indexed fields',
      limitPipelineStages: 'Keep pipeline stages to minimum necessary',
      avoidLargeArrays: 'Avoid aggregating on large arrays',
      useExplain: 'Use explain() to analyze query performance',
      monitorMemory: 'Monitor memory usage with allowDiskUse',
      useHint: 'Use hint() to force index usage if needed',
      batchOperations: 'Use bulk operations for multiple writes',
      useBulkWrite: 'Use bulkWrite for multiple updates',
      avoidNPlusOne: 'Avoid N+1 queries, use aggregation instead',
      useCaching: 'Cache frequently accessed aggregation results',
      useMaterializedViews: 'Consider materialized views for complex aggregations'
    };
  }

  /**
   * Cursor-based aggregation for large datasets
   */
  static getCursorBasedAggregation(collection, pipeline, options = {}) {
    const {
      batchSize = 1000,
      maxTimeMS = 30000,
      allowDiskUse = true
    } = options;

    return collection.aggregate(pipeline, {
      allowDiskUse,
      maxTimeMS,
      cursor: { batchSize }
    });
  }

  /**
   * Pagination for aggregation results
   */
  static getPaginatedAggregation(collection, pipeline, page = 1, limit = 100) {
    const skip = (page - 1) * limit;

    return [
      ...pipeline,
      { $facet: {
        data: [
          { $skip: skip },
          { $limit: limit }
        ],
        total: [
          { $count: 'total' }
        ]
      }}
    ];
  }
}

export default AggregationOptimizer;
