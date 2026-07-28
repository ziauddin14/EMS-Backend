import Logger from '../../core/utils/logger.js';

class KPIQueryOptimization {
  constructor() {
    this.logger = Logger;
  }

  // Optimize repository queries with lean, projection, and pagination
  getOptimizedQueryOptions(options = {}) {
    const {
      filter = {},
      sort = { createdAt: -1 },
      limit = 100,
      skip = 0,
      projection = {},
      lean = true,
      populate = []
    } = options;

    // Validate and sanitize limit
    const maxLimit = 1000;
    const validatedLimit = Math.min(limit, maxLimit);
    const validatedSkip = Math.max(0, skip);

    // Add isDeleted filter if not present
    const optimizedFilter = { ...filter };
    if (!optimizedFilter.isDeleted && optimizedFilter.isDeleted !== false) {
      optimizedFilter.isDeleted = false;
    }

    return {
      filter: optimizedFilter,
      sort,
      limit: validatedLimit,
      skip: validatedSkip,
      projection,
      lean,
      populate
    };
  }

  // Get optimized projection for common queries
  getProjection(type) {
    const projections = {
      // Minimal projection for list views
      minimal: {
        _id: 1,
        employee: 1,
        department: 1,
        year: 1,
        overallScore: 1,
        performanceGrade: 1,
        status: 1,
        createdAt: 1
      },
      // Standard projection for detail views
      standard: {
        _id: 1,
        employee: 1,
        department: 1,
        designation: 1,
        reportingManager: 1,
        year: 1,
        month: 1,
        quarter: 1,
        evaluationPeriod: 1,
        startDate: 1,
        endDate: 1,
        scores: 1,
        overallScore: 1,
        performanceGrade: 1,
        performanceStatus: 1,
        status: 1,
        approvalStatus: 1,
        createdAt: 1,
        updatedAt: 1
      },
      // Full projection for admin views
      full: {},
      // Dashboard projection
      dashboard: {
        _id: 1,
        employee: 1,
        department: 1,
        year: 1,
        overallScore: 1,
        performanceGrade: 1,
        performanceStatus: 1,
        status: 1,
        createdAt: 1
      },
      // Analytics projection
      analytics: {
        _id: 1,
        employee: 1,
        department: 1,
        designation: 1,
        year: 1,
        overallScore: 1,
        performanceGrade: 1,
        scores: 1,
        status: 1,
        createdAt: 1
      }
    };

    return projections[type] || projections.standard;
  }

  // Get optimized populate configuration
  getPopulateConfig(type) {
    const configs = {
      minimal: [
        { path: 'employee', select: '_id firstName lastName employeeId' },
        { path: 'department', select: '_id name' }
      ],
      standard: [
        { path: 'employee', select: '_id firstName lastName employeeId' },
        { path: 'department', select: '_id name' },
        { path: 'designation', select: '_id title' },
        { path: 'reportingManager', select: '_id firstName lastName employeeId' }
      ],
      full: [
        { path: 'employee', select: '_id firstName lastName employeeId email' },
        { path: 'department', select: '_id name' },
        { path: 'designation', select: '_id title' },
        { path: 'reportingManager', select: '_id firstName lastName employeeId' },
        { path: 'approvedBy', select: '_id firstName lastName employeeId' },
        { path: 'reviewedBy', select: '_id firstName lastName employeeId' },
        { path: 'createdBy', select: '_id firstName lastName employeeId' },
        { path: 'updatedBy', select: '_id firstName lastName employeeId' }
      ],
      dashboard: [
        { path: 'employee', select: '_id firstName lastName employeeId' },
        { path: 'department', select: '_id name' }
      ]
    };

    return configs[type] || configs.standard;
  }

  // Optimize query for large datasets with cursor-based pagination
  async getPaginatedResults(model, query, options = {}) {
    const {
      sort = { _id: 1 },
      limit = 100,
      cursor = null
    } = options;

    const filter = { ...query };
    
    // Add cursor filter for pagination
    if (cursor) {
      const sortField = Object.keys(sort)[0];
      const sortDirection = sort[sortField] === 1 ? '$gt' : '$lt';
      filter[sortField] = { [sortDirection]: cursor };
    }

    const results = await model.find(filter)
      .sort(sort)
      .limit(limit + 1) // Fetch one extra to determine if there are more results
      .lean();

    const hasMore = results.length > limit;
    const data = results.slice(0, limit);
    const nextCursor = hasMore ? data[data.length - 1][Object.keys(sort)[0]] : null;

    return {
      data,
      hasMore,
      nextCursor,
      count: data.length
    };
  }

  // Optimize bulk operations with batch processing
  async processInBatches(items, batchSize, processor) {
    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.all(
          batch.map(item => processor(item))
        );
        results.push(...batchResults);
      } catch (error) {
        this.logger.error(`Batch processing error at batch ${Math.floor(i / batchSize)}:`, error);
        errors.push({
          batch: Math.floor(i / batchSize),
          error: error.message,
          items: batch
        });
      }
    }

    return {
      results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length
    };
  }

  // Optimize aggregation with early filtering and projection
  optimizeAggregationPipeline(pipeline) {
    // Ensure $match is first stage for early filtering
    const matchStage = pipeline.find(stage => stage.$match);
    if (matchStage && pipeline[0].$match !== matchStage.$match) {
      pipeline = [{ $match: matchStage.$match }, ...pipeline.filter(stage => !stage.$match)];
    }

    // Add $project before $group if no projection exists
    const hasProject = pipeline.some(stage => stage.$project);
    const hasGroup = pipeline.some(stage => stage.$group);
    
    if (hasGroup && !hasProject) {
      const groupIndex = pipeline.findIndex(stage => stage.$group);
      pipeline.splice(groupIndex, 0, {
        $project: {
          _id: 1,
          employee: 1,
          department: 1,
          year: 1,
          overallScore: 1,
          performanceGrade: 1,
          status: 1,
          isDeleted: 1
        }
      });
    }

    // Add limit stage if not present for large datasets
    const hasLimit = pipeline.some(stage => stage.$limit);
    if (!hasLimit) {
      pipeline.push({ $limit: 10000 });
    }

    return pipeline;
  }

  // Cache query results for frequently accessed data
  createCacheKey(model, query, options) {
    return `${model}_${JSON.stringify(query)}_${JSON.stringify(options)}`;
  }

  // Optimize memory usage for large result sets
  async streamResults(model, query, options = {}, processor) {
    const { batchSize = 100 } = options;
    
    let skip = 0;
    let hasMore = true;
    let totalProcessed = 0;

    while (hasMore) {
      const results = await model.find(query)
        .skip(skip)
        .limit(batchSize)
        .lean();

      if (results.length === 0) {
        hasMore = false;
        break;
      }

      await processor(results);
      
      totalProcessed += results.length;
      skip += batchSize;
      hasMore = results.length === batchSize;
    }

    return totalProcessed;
  }

  // Optimize concurrent queries with parallel execution
  async executeParallelQueries(queries) {
    return await Promise.all(
      queries.map(query => query())
    );
  }

  // Validate and sanitize query filters
  sanitizeFilter(filter) {
    const sanitized = { ...filter };
    
    // Remove potentially dangerous operators
    const dangerousKeys = ['$where', '$expr', '$jsonSchema', '$mod'];
    dangerousKeys.forEach(key => {
      if (sanitized[key]) {
        this.logger.warn(`Removed dangerous filter key: ${key}`);
        delete sanitized[key];
      }
    });

    // Ensure isDeleted is set
    if (sanitized.isDeleted === undefined) {
      sanitized.isDeleted = false;
    }

    return sanitized;
  }

  // Optimize date range queries
  optimizeDateRangeFilter(startDate, endDate, dateField = 'createdAt') {
    if (!startDate && !endDate) return {};

    const filter = {};
    if (startDate) {
      filter[dateField] = { ...filter[dateField], $gte: new Date(startDate) };
    }
    if (endDate) {
      filter[dateField] = { ...filter[dateField], $lte: new Date(endDate) };
    }

    return filter;
  }

  // Get query statistics for monitoring
  async getQueryStats(model, query) {
    const startTime = Date.now();
    
    const count = await model.countDocuments(query);
    const executionTime = Date.now() - startTime;

    return {
      count,
      executionTime,
      estimatedMemory: count * 1024, // Rough estimate in bytes
      queryComplexity: this.calculateQueryComplexity(query)
    };
  }

  // Calculate query complexity score
  calculateQueryComplexity(query) {
    let complexity = 0;
    
    // Count filter conditions
    const filterKeys = Object.keys(query);
    complexity += filterKeys.length * 2;
    
    // Check for nested conditions
    filterKeys.forEach(key => {
      if (typeof query[key] === 'object' && query[key] !== null) {
        const operators = Object.keys(query[key]).filter(k => k.startsWith('$'));
        complexity += operators.length * 3;
      }
    });

    return complexity;
  }

  // Recommend query optimizations
  recommendOptimizations(queryStats) {
    const recommendations = [];

    if (queryStats.executionTime > 1000) {
      recommendations.push({
        type: 'performance',
        message: 'Query execution time exceeds 1 second. Consider adding indexes or optimizing filters.',
        severity: 'high'
      });
    }

    if (queryStats.count > 10000) {
      recommendations.push({
        type: 'pagination',
        message: 'Large result set detected. Implement cursor-based pagination.',
        severity: 'medium'
      });
    }

    if (queryStats.queryComplexity > 20) {
      recommendations.push({
        type: 'complexity',
        message: 'Query complexity is high. Consider simplifying filters or using aggregation.',
        severity: 'medium'
      });
    }

    if (queryStats.estimatedMemory > 10 * 1024 * 1024) { // 10MB
      recommendations.push({
        type: 'memory',
        message: 'Estimated memory usage is high. Use projection to limit returned fields.',
        severity: 'high'
      });
    }

    return recommendations;
  }

  // Apply query optimizations based on recommendations
  applyOptimizations(query, recommendations) {
    let optimizedQuery = { ...query };

    recommendations.forEach(rec => {
      switch (rec.type) {
        case 'memory':
          // Add projection to limit fields
          optimizedQuery.projection = this.getProjection('minimal');
          break;
        case 'pagination':
          // Add limit if not present
          if (!optimizedQuery.limit) {
            optimizedQuery.limit = 100;
          }
          break;
        case 'complexity':
          // Simplify query by removing optional filters
          delete optimizedQuery.optionalField;
          break;
      }
    });

    return optimizedQuery;
  }
}

const kpiQueryOptimization = new KPIQueryOptimization();
export default kpiQueryOptimization;
