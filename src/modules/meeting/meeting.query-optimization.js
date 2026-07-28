class MeetingQueryOptimization {
  // Lean Query Helper
  static lean(query) {
    return query.lean();
  }

  // Projection Helper
  static project(query, fields) {
    return query.select(fields);
  }

  // Pagination Helper
  static paginate(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

  // Sort Helper
  static sort(query, sortOptions) {
    return query.sort(sortOptions);
  }

  // Filter Helper
  static filter(query, filterOptions) {
    return query.where(filterOptions);
  }

  // Populate Helper
  static populate(query, populateOptions) {
    if (Array.isArray(populateOptions)) {
      return query.populate(populateOptions);
    }
    return query.populate(populateOptions);
  }

  // Compound Query Builder
  static buildQuery(model, options = {}) {
    let query = model.find(options.filter || {});

    if (options.projection) {
      query = this.project(query, options.projection);
    }

    if (options.sort) {
      query = this.sort(query, options.sort);
    }

    if (options.skip !== undefined) {
      query = query.skip(options.skip);
    }

    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    if (options.lean) {
      query = this.lean(query);
    }

    if (options.populate) {
      query = this.populate(query, options.populate);
    }

    return query;
  }

  // Batch Processing Helper
  static async processInBatches(items, batchSize, processor) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(item => processor(item)));
      results.push(...batchResults);
    }
    return results;
  }

  // Aggregation Pipeline Optimizer
  static optimizeAggregation(pipeline) {
    // Add $match with isDeleted: false if not present
    const hasDeletedFilter = pipeline.some(stage => 
      stage.$match && (stage.$match.isDeleted !== undefined || stage.$match['isDeleted'] !== undefined)
    );

    if (!hasDeletedFilter) {
      pipeline.unshift({ $match: { isDeleted: false } });
    }

    // Add projection to limit fields if not present
    const hasProjection = pipeline.some(stage => stage.$project);
    if (!hasProjection) {
      pipeline.push({ $project: { _id: 1 } });
    }

    return pipeline;
  }

  // Query Statistics
  static async getQueryStats(query) {
    const start = Date.now();
    const result = await query;
    const duration = Date.now() - start;
    
    return {
      duration,
      resultCount: Array.isArray(result) ? result.length : 1,
      timestamp: new Date()
    };
  }

  // Memory Usage Optimization
  static optimizeForMemory(query) {
    return query
      .lean()
      .select({ _id: 1 }); // Select only essential fields initially
  }

  // Cursor-based Pagination for Large Datasets
  static async cursorPaginate(model, options = {}) {
    const { filter = {}, sort = { _id: 1 }, limit = 100, lastId = null } = options;
    
    let query = model.find(filter).sort(sort).limit(limit + 1);
    
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

  // Parallel Query Execution
  static async executeParallel(queries) {
    return Promise.all(queries);
  }

  // Query Caching Strategy
  static cacheKey(model, query) {
    return `${model.collection.name}:${JSON.stringify(query)}`;
  }

  // Optimized Date Range Query
  static optimizeDateRangeQuery(model, dateField, startDate, endDate) {
    return model.find({
      [dateField]: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      isDeleted: false
    }).lean();
  }

  // Optimized Count Query
  static async optimizedCount(model, filter = {}) {
    return model.countDocuments({
      ...filter,
      isDeleted: false
    });
  }

  // Optimized Exists Query
  static async optimizedExists(model, filter = {}) {
    return model.exists({
      ...filter,
      isDeleted: false
    });
  }

  // Bulk Write Optimization
  static async optimizedBulkWrite(model, operations) {
    return model.bulkWrite(operations, { ordered: false });
  }

  // Index Hint for Query Optimization
  static withIndexHint(query, indexName) {
    return query.hint(indexName);
  }

  // Explain Query Plan
  static async explainQuery(query) {
    return query.explain('executionStats');
  }

  // Query Performance Analyzer
  static async analyzeQueryPerformance(query) {
    const explain = await this.explainQuery(query);
    
    return {
      executionTimeMillis: explain.executionStats.executionTimeMillis,
      totalDocsExamined: explain.executionStats.totalDocsExamined,
      totalKeysExamined: explain.executionStats.totalKeysExamined,
      indexUsed: explain.executionStats.indexesUsed,
      stage: explain.executionStats.executionStages[0].stage,
      filter: explain.executionStats.filter,
      winningPlan: explain.executionStats.winningPlan
    };
  }

  // Projection Strategies
  static projectionStrategies = {
    minimal: { _id: 1, meetingCode: 1, title: 1, startTime: 1, endTime: 1, status: 1 },
    standard: { _id: 1, meetingCode: 1, title: 1, description: 1, type: 1, status: 1, startTime: 1, endTime: 1, organizer: 1, participants: 1 },
    detailed: { _id: 1, meetingCode: 1, title: 1, description: 1, type: 1, category: 1, mode: 1, platform: 1, status: 1, priority: 1, startTime: 1, endTime: 1, duration: 1, organizer: 1, host: 1, participants: 1, department: 1, project: 1 },
    full: {}
  };

  // Get optimized projection based on use case
  static getProjection(useCase = 'standard') {
    return this.projectionStrategies[useCase] || this.projectionStrategies.standard;
  }

  // Query Timeout Protection
  static withTimeout(query, timeoutMs = 30000) {
    return query.maxTimeMS(timeoutMs);
  }

  // Read Preference for Scalability
  static withReadPreference(query, preference = 'secondaryPreferred') {
    return query.readPref(preference);
  }

  // Write Concern for Durability
  static withWriteConcern(model, concern = 'majority') {
    return model.writeConcern(concern);
  }

  // Optimized Aggregation for Large Datasets
  static optimizedLargeDatasetAggregation(model, pipeline, options = {}) {
    const { allowDiskUse = true, maxTimeMS = 30000, batchSize = 1000 } = options;
    
    return model.aggregate(pipeline, {
      allowDiskUse,
      maxTimeMS,
      cursor: { batchSize }
    });
  }

  // Query Result Streaming for Large Results
  static async streamResults(query, chunkSize = 100, processor) {
    const cursor = query.cursor();
    let results = [];
    
    for await (const doc of cursor) {
      results.push(doc);
      
      if (results.length >= chunkSize) {
        await processor(results);
        results = [];
      }
    }
    
    if (results.length > 0) {
      await processor(results);
    }
  }

  // Optimized Lookup for Population
  static optimizedLookup(from, localField, foreignField, as, projection = null) {
    const lookup = {
      from,
      localField,
      foreignField,
      as
    };
    
    if (projection) {
      lookup.pipeline = [{ $project: projection }];
    }
    
    return lookup;
  }

  // Optimized Unwind for Arrays
  static optimizedUnwind(path, preserveNullAndEmptyArrays = false) {
    return { $unwind: { path, preserveNullAndEmptyArrays } };
  }

  // Optimized Group for Aggregation
  static optimizedGroup(_id, accumulators) {
    return { $group: { _id, ...accumulators } };
  }

  // Optimized Faceted Search
  static optimizedFacet(model, filter, facets) {
    const pipeline = [
      { $match: { ...filter, isDeleted: false } },
      { $facet: facets }
    ];
    
    return model.aggregate(pipeline);
  }

  // Optimized Text Search
  static optimizedTextSearch(model, searchText, fields = ['title', 'description']) {
    return model.find(
      { $text: { $search: searchText } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  }

  // Optimized Geo Queries (if needed)
  static optimizedGeoNear(model, coordinates, maxDistance, options = {}) {
    return model.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates },
          maxDistance,
          distanceField: 'distance',
          spherical: true,
          ...options
        }
      }
    ]);
  }

  // Query Result Compression
  static compressResult(result) {
    // Remove undefined and null values
    const clean = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(clean).filter(v => v !== null && v !== undefined);
      }
      if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
          const value = clean(obj[key]);
          if (value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});
      }
      return obj;
    };
    
    return clean(result);
  }

  // Query Result Transformation
  static transformResult(result, transformer) {
    if (Array.isArray(result)) {
      return result.map(transformer);
    }
    return transformer(result);
  }

  // Optimized Distinct Query
  static async optimizedDistinct(model, field, filter = {}) {
    return model.distinct(field, {
      ...filter,
      isDeleted: false
    });
  }

  // Optimized Sample for Random Selection
  static async optimizedSample(model, size, filter = {}) {
    return model.aggregate([
      { $match: { ...filter, isDeleted: false } },
      { $sample: { size } }
    ]);
  }

  // Query Result Caching Strategy
  static cacheResults(cache, key, result, ttl = 300) {
    cache.set(key, JSON.stringify(result), 'EX', ttl);
  }

  static getCachedResults(cache, key) {
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Query Result Validation
  static validateResult(result, schema) {
    // Implement validation logic based on schema
    return result;
  }

  // Query Error Handling
  static handleQueryError(error) {
    if (error.name === 'MongoTimeoutError') {
      throw new Error('Query timeout exceeded');
    }
    if (error.name === 'MongoError' && error.code === 11000) {
      throw new Error('Duplicate key error');
    }
    throw error;
  }

  // Query Retry Strategy
  static async withRetry(query, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await query;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  // Optimized Query Builder Pattern
  static QueryBuilder(model) {
    return {
      filter(filter) {
        this._filter = filter;
        return this;
      },
      
      project(projection) {
        this._projection = projection;
        return this;
      },
      
      sort(sort) {
        this._sort = sort;
        return this;
      },
      
      paginate(page, limit) {
        this._skip = (page - 1) * limit;
        this._limit = limit;
        return this;
      },
      
      lean(lean = true) {
        this._lean = lean;
        return this;
      },
      
      populate(populate) {
        this._populate = populate;
        return this;
      },
      
      async execute() {
        let query = model.find(this._filter || {});
        
        if (this._projection) {
          query = query.select(this._projection);
        }
        
        if (this._sort) {
          query = query.sort(this._sort);
        }
        
        if (this._skip !== undefined) {
          query = query.skip(this._skip);
        }
        
        if (this._limit !== undefined) {
          query = query.limit(this._limit);
        }
        
        if (this._lean) {
          query = query.lean();
        }
        
        if (this._populate) {
          query = query.populate(this._populate);
        }
        
        return await query;
      }
    };
  }
}

export default MeetingQueryOptimization;
