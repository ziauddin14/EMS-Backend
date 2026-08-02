import Logger from '../../core/utils/logger.js';
import AppError from '../../core/utils/appError.js';

class ExecutiveRepository {
  constructor() {
    this.logger = Logger;
  }

  // Generic Aggregation Method
  async aggregate(collection, pipeline, options = {}) {
    try {
      const { allowDiskUse = true, maxTimeMS = 30000 } = options;
      
      const result = await collection.aggregate(pipeline, {
        allowDiskUse,
        maxTimeMS
      }).toArray();
      
      return result;
    } catch (error) {
      this.logger.error('Error in aggregation:', error);
      throw new AppError('Aggregation failed', 500);
    }
  }

  // Aggregation with Cursor for Large Datasets
  async aggregateWithCursor(collection, pipeline, options = {}) {
    try {
      const { allowDiskUse = true, maxTimeMS = 30000, batchSize = 1000 } = options;
      
      const cursor = collection.aggregate(pipeline, {
        allowDiskUse,
        maxTimeMS,
        cursor: { batchSize }
      });
      
      return cursor;
    } catch (error) {
      this.logger.error('Error in aggregation with cursor:', error);
      throw new AppError('Aggregation with cursor failed', 500);
    }
  }

  // Generic Find with Projection
  async find(collection, filter = {}, projection = null, options = {}) {
    try {
      let query = collection.find(filter);
      
      if (projection) {
        query = query.select(projection);
      }
      
      if (options.lean) {
        query = query.lean();
      }
      
      if (options.sort) {
        query = query.sort(options.sort);
      }
      
      if (options.skip) {
        query = query.skip(options.skip);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.populate) {
        query = query.populate(options.populate);
      }
      
      return await query;
    } catch (error) {
      this.logger.error('Error in find:', error);
      throw new AppError('Find operation failed', 500);
    }
  }

  // Generic Find One
  async findOne(collection, filter = {}, projection = null, options = {}) {
    try {
      let query = collection.findOne(filter);
      
      if (projection) {
        query = query.select(projection);
      }
      
      if (options.lean) {
        query = query.lean();
      }
      
      if (options.populate) {
        query = query.populate(options.populate);
      }
      
      return await query;
    } catch (error) {
      this.logger.error('Error in findOne:', error);
      throw new AppError('FindOne operation failed', 500);
    }
  }

  // Generic Count
  async count(collection, filter = {}) {
    try {
      return await collection.countDocuments(filter);
    } catch (error) {
      this.logger.error('Error in count:', error);
      throw new AppError('Count operation failed', 500);
    }
  }

  // Generic Exists
  async exists(collection, filter = {}) {
    try {
      return await collection.exists(filter);
    } catch (error) {
      this.logger.error('Error in exists:', error);
      throw new AppError('Exists operation failed', 500);
    }
  }

  // Generic Distinct
  async distinct(collection, field, filter = {}) {
    try {
      return await collection.distinct(field, filter);
    } catch (error) {
      this.logger.error('Error in distinct:', error);
      throw new AppError('Distinct operation failed', 500);
    }
  }

  // Bulk Write Operations
  async bulkWrite(collection, operations, options = {}) {
    try {
      const { ordered = false } = options;
      return await collection.bulkWrite(operations, { ordered });
    } catch (error) {
      this.logger.error('Error in bulkWrite:', error);
      throw new AppError('Bulk write operation failed', 500);
    }
  }

  // Optimized Pipeline Builder
  buildOptimizedPipeline(basePipeline, options = {}) {
    const { matchFilter = true, projectFields = true, optimize = true } = options;
    
    let pipeline = [...basePipeline];
    
    if (optimize && matchFilter) {
      // Add isDeleted filter at the beginning if not present
      const hasDeletedFilter = pipeline.some(stage => 
        stage.$match && (stage.$match.isDeleted !== undefined || stage.$match['isDeleted'] !== undefined)
      );
      
      if (!hasDeletedFilter) {
        pipeline.unshift({ $match: { isDeleted: false } });
      }
    }
    
    if (optimize && projectFields) {
      // Add projection at the end if not present
      const hasProjection = pipeline.some(stage => stage.$project);
      if (!hasProjection) {
        pipeline.push({ $project: { _id: 1 } });
      }
    }
    
    return pipeline;
  }

  // Cross-Module Aggregation Helper
  async crossModuleAggregation(pipelines, options = {}) {
    try {
      const { allowDiskUse = true, maxTimeMS = 60000 } = options;
      
      const results = await Promise.all(
        pipelines.map(({ collection, pipeline }) =>
          this.aggregate(collection, pipeline, { allowDiskUse, maxTimeMS })
        )
      );
      
      return results;
    } catch (error) {
      this.logger.error('Error in cross-module aggregation:', error);
      throw new AppError('Cross-module aggregation failed', 500);
    }
  }

  // Date Range Filter Builder
  buildDateRangeFilter(dateField, startDate, endDate) {
    return {
      [dateField]: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  }

  // Period Filter Builder
  buildPeriodFilter(dateField, period) {
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'yesterday':
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_30_days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
        break;
      case 'last_quarter':
        const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3;
        startDate = new Date(now.getFullYear(), lastQuarterStart, 1);
        endDate = new Date(now.getFullYear(), lastQuarterStart + 3, 0);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    return this.buildDateRangeFilter(dateField, startDate, endDate);
  }

  // Group By Builder
  buildGroupBy(groupByFields, aggregations) {
    const _id = {};
    groupByFields.forEach(field => {
      _id[field] = `$${field}`;
    });
    
    return {
      $group: {
        _id,
        ...aggregations
      }
    };
  }

  // Lookup Builder for Population
  buildLookup(from, localField, foreignField, as, pipeline = null) {
    const lookup = {
      $lookup: {
        from,
        localField,
        foreignField,
        as
      }
    };
    
    if (pipeline) {
      lookup.$lookup.pipeline = pipeline;
    }
    
    return lookup;
  }

  // Unwind Builder
  buildUnwind(path, preserveNullAndEmptyArrays = false) {
    return {
      $unwind: {
        path,
        preserveNullAndEmptyArrays
      }
    };
  }

  // Facet Builder for Multi-Faceted Queries
  buildFacet(facets) {
    return {
      $facet: facets
    };
  }

  // Project Builder
  buildProject(projection) {
    return {
      $project: projection
    };
  }

  // Sort Builder
  buildSort(sortFields) {
    const sort = {};
    Object.entries(sortFields).forEach(([field, direction]) => {
      sort[field] = direction === 'desc' ? -1 : 1;
    });
    return {
      $sort: sort
    };
  }

  // Limit Builder
  buildLimit(limit) {
    return {
      $limit: limit
    };
  }

  // Skip Builder
  buildSkip(skip) {
    return {
      $skip: skip
    };
  }

  // Add Fields Builder
  buildAddFields(fields) {
    return {
      $addFields: fields
    };
  }

  // Match Builder
  buildMatch(filter) {
    return {
      $match: filter
    };
  }

  // Redact Builder for Conditional Logic
  buildRedact(expression) {
    return {
      $redact: expression
    };
  }

  // Sample Builder for Random Selection
  buildSample(size) {
    return {
      $sample: { size }
    };
  }

  // Pagination Helper
  async paginate(collection, filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, projection = null } = options;
    
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.find(collection, filter, projection, { skip, limit, sort, lean: true }),
      this.count(collection, filter)
    ]);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Cursor-based Pagination for Large Datasets
  async cursorPaginate(collection, filter = {}, options = {}) {
    const { limit = 100, sort = { _id: 1 }, lastId = null, projection = null } = options;
    
    let query = collection.find(filter);
    
    if (projection) {
      query = query.select(projection);
    }
    
    query = query.sort(sort).limit(limit + 1);
    
    if (lastId) {
      query = query.where('_id').gt(lastId);
    }
    
    const results = await query.lean();
    const hasNext = results.length > limit;
    
    if (hasNext) {
      results.pop();
    }
    
    return {
      results,
      nextCursor: hasNext ? results[results.length - 1]._id : null,
      hasNext
    };
  }

  // Stream Results for Large Datasets
  async streamResults(collection, filter = {}, options = {}) {
    const { batchSize = 1000, projection = null } = options;
    
    const cursor = collection.find(filter)
      .select(projection || {})
      .lean()
      .cursor({ batchSize });
    
    return cursor;
  }

  // Bulk Insert
  async bulkInsert(collection, documents) {
    try {
      return await collection.insertMany(documents, { ordered: false });
    } catch (error) {
      this.logger.error('Error in bulkInsert:', error);
      throw new AppError('Bulk insert failed', 500);
    }
  }

  // Bulk Update
  async bulkUpdate(collection, filter, update) {
    try {
      return await collection.updateMany(filter, update);
    } catch (error) {
      this.logger.error('Error in bulkUpdate:', error);
      throw new AppError('Bulk update failed', 500);
    }
  }

  // Bulk Delete (Soft Delete)
  async bulkSoftDelete(collection, filter, deletedBy) {
    try {
      return await collection.updateMany(filter, {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy
        }
      });
    } catch (error) {
      this.logger.error('Error in bulkSoftDelete:', error);
      throw new AppError('Bulk soft delete failed', 500);
    }
  }

  // Index Hint for Query Optimization
  async withIndexHint(collection, query, indexName) {
    try {
      return await collection.find(query).hint(indexName);
    } catch (error) {
      this.logger.error('Error with index hint:', error);
      throw new AppError('Query with index hint failed', 500);
    }
  }

  // Explain Query Plan
  async explainQuery(collection, query, options = {}) {
    try {
      return await collection.find(query).explain('executionStats');
    } catch (error) {
      this.logger.error('Error explaining query:', error);
      throw new AppError('Query explanation failed', 500);
    }
  }

  // Statistics Helper
  async getStatistics(collection, field, filter = {}) {
    try {
      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            sum: { $sum: `$${field}` },
            avg: { $avg: `$${field}` },
            min: { $min: `$${field}` },
            max: { $max: `$${field}` }
          }
        }
      ];
      
      const result = await this.aggregate(collection, pipeline);
      return result[0] || { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    } catch (error) {
      this.logger.error('Error getting statistics:', error);
      throw new AppError('Statistics calculation failed', 500);
    }
  }

  // Histogram Helper
  async getHistogram(collection, field, filter = {}, bins = 10) {
    try {
      const pipeline = [
        { $match: filter },
        {
          $bucket: {
            groupBy: `$${field}`,
            boundaries: this.generateBoundaries(field, bins),
            default: 'other',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ];
      
      return await this.aggregate(collection, pipeline);
    } catch (error) {
      this.logger.error('Error getting histogram:', error);
      throw new AppError('Histogram calculation failed', 500);
    }
  }

  // Generate Boundaries for Bucket
  generateBoundaries(field, bins) {
    // This would typically be based on min/max values
    // For now, return a default range
    const boundaries = [];
    const step = 100 / bins;
    for (let i = 0; i <= bins; i++) {
      boundaries.push(i * step);
    }
    return boundaries;
  }

  // Time Series Aggregation Helper
  async timeSeriesAggregation(collection, dateField, filter = {}, granularity = 'daily', options = {}) {
    try {
      const { valueField = null, aggregation = 'count' } = options;
      
      let dateFormat;
      switch (granularity) {
        case 'hourly':
          dateFormat = '%Y-%m-%d-%H';
          break;
        case 'daily':
          dateFormat = '%Y-%m-%d';
          break;
        case 'weekly':
          dateFormat = '%Y-%U';
          break;
        case 'monthly':
          dateFormat = '%Y-%m';
          break;
        case 'quarterly':
          dateFormat = '%Y-%Q';
          break;
        case 'yearly':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }
      
      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: `$${dateField}`
              }
            },
            ...(valueField ? {
              value: {
                [aggregation === 'sum' ? '$sum' : aggregation === 'avg' ? '$avg' : '$sum']:
                  aggregation === 'count' ? 1 : `$${valueField}`
              }
            } : {
              count: { $sum: 1 }
            })
          }
        },
        { $sort: { _id: 1 } }
      ];
      
      return await this.aggregate(collection, pipeline);
    } catch (error) {
      this.logger.error('Error in time series aggregation:', error);
      throw new AppError('Time series aggregation failed', 500);
    }
  }

  // Multi-Collection Join Helper
  async multiCollectionJoin(pipelines) {
    try {
      const results = await Promise.all(
        pipelines.map(({ collection, pipeline }) =>
          this.aggregate(collection, pipeline)
        )
      );
      
      return results;
    } catch (error) {
      this.logger.error('Error in multi-collection join:', error);
      throw new AppError('Multi-collection join failed', 500);
    }
  }

  // Cache-aware Query Helper
  async cachedQuery(cache, cacheKey, queryFn, ttl = 300) {
    try {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      const result = await queryFn();
      cache.set(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      this.logger.error('Error in cached query:', error);
      throw new AppError('Cached query failed', 500);
    }
  }
}

const executiveRepository = new ExecutiveRepository();
export default executiveRepository;
