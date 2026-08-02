import { z } from 'zod';
import { 
  HEALTH_CATEGORY, 
  KPI_CATEGORY, 
  INSIGHT_TYPE, 
  RISK_LEVEL, 
  REPORT_TYPE, 
  REPORT_PERIOD, 
  ANALYTICS_TYPE, 
  TIME_PERIOD, 
  COMPARISON_TYPE, 
  DATA_GRANULARITY,
  PERFORMANCE_TIER,
  PIPELINE_STAGE,
  ATTRITION_RISK_FACTOR,
  HIRING_RECOMMENDATION,
  CAPACITY_STATUS,
  ORGANIZATION_RISK_CATEGORY
} from './executive.constants.js';

// Health Score Validation
export const healthScoreSchema = z.object({
  category: z.enum(Object.values(HEALTH_CATEGORY)),
  entityId: z.string().optional(),
  entityType: z.enum(['organization', 'department', 'branch', 'employee']).optional(),
  score: z.number().min(0).max(100),
  components: z.record(z.string(), z.number()).optional(),
  calculatedAt: z.date().optional(),
  period: z.enum(Object.values(TIME_PERIOD)).optional()
});

// KPI Validation
export const kpiSchema = z.object({
  category: z.enum(Object.values(KPI_CATEGORY)),
  metric: z.string(),
  value: z.number(),
  target: z.number().optional(),
  previousValue: z.number().optional(),
  change: z.number().optional(),
  changePercent: z.number().optional(),
  entityId: z.string().optional(),
  entityType: z.enum(['organization', 'department', 'branch', 'employee']).optional(),
  period: z.enum(Object.values(TIME_PERIOD)),
  calculatedAt: z.date().optional()
});

// Insight Validation
export const insightSchema = z.object({
  type: z.enum(Object.values(INSIGHT_TYPE)),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000).optional(),
  data: z.array(z.any()).optional(),
  recommendations: z.array(z.string()).optional(),
  riskLevel: z.enum(Object.values(RISK_LEVEL)).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  entityId: z.string().optional(),
  entityType: z.enum(['organization', 'department', 'branch', 'employee']).optional(),
  generatedAt: z.date().optional(),
  validUntil: z.date().optional()
});

// Report Validation
export const reportSchema = z.object({
  type: z.enum(Object.values(REPORT_TYPE)),
  period: z.enum(Object.values(REPORT_PERIOD)),
  startDate: z.date(),
  endDate: z.date(),
  filters: z.record(z.string(), z.any()).optional(),
  includeCharts: z.boolean().optional(),
  includeTables: z.boolean().optional(),
  format: z.enum(['pdf', 'excel', 'json', 'html']).optional(),
  generatedBy: z.string().optional(),
  generatedAt: z.date().optional()
});

// Analytics Validation
export const analyticsSchema = z.object({
  type: z.enum(Object.values(ANALYTICS_TYPE)),
  startDate: z.date(),
  endDate: z.date(),
  granularity: z.enum(Object.values(DATA_GRANULARITY)).optional(),
  comparison: z.enum(Object.values(COMPARISON_TYPE)).optional(),
  comparisonPeriod: z.object({
    startDate: z.date(),
    endDate: z.date()
  }).optional(),
  filters: z.record(z.string(), z.any()).optional(),
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional()
});

// Dashboard Validation
export const dashboardSchema = z.object({
  widgetType: z.enum(['kpi_card', 'chart', 'table', 'heatmap', 'gauge', 'progress']),
  title: z.string().min(1).max(100),
  dataSource: z.string(),
  config: z.record(z.any()).optional(),
  refreshInterval: z.number().optional(),
  position: z.object({
    row: z.number(),
    col: z.number(),
    rowSpan: z.number().optional(),
    colSpan: z.number().optional()
  }).optional()
});

// Organization Health Query Validation
export const organizationHealthQuerySchema = z.object({
  category: z.enum(Object.values(HEALTH_CATEGORY)).optional(),
  entityId: z.string().optional(),
  entityType: z.enum(['organization', 'department', 'branch', 'employee']).optional(),
  period: z.enum(Object.values(TIME_PERIOD)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// KPI Query Validation
export const kpiQuerySchema = z.object({
  category: z.enum(Object.values(KPI_CATEGORY)).optional(),
  metric: z.string().optional(),
  entityId: z.string().optional(),
  entityType: z.enum(['organization', 'department', 'branch', 'employee']).optional(),
  period: z.enum(Object.values(TIME_PERIOD)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// Insight Query Validation
export const insightQuerySchema = z.object({
  type: z.enum(Object.values(INSIGHT_TYPE)).optional(),
  riskLevel: z.enum(Object.values(RISK_LEVEL)).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  entityId: z.string().optional(),
  entityType: z.enum(['organization', 'department', 'branch', 'employee']).optional(),
  limit: z.number().min(1).max(100).optional()
});

// Report Query Validation
export const reportQuerySchema = z.object({
  type: z.enum(Object.values(REPORT_TYPE)),
  period: z.enum(Object.values(REPORT_PERIOD)),
  startDate: z.string(),
  endDate: z.string(),
  format: z.enum(['pdf', 'excel', 'json', 'html']).optional(),
  filters: z.record(z.string(), z.any()).optional()
});

// Analytics Query Validation
export const analyticsQuerySchema = z.object({
  type: z.enum(Object.values(ANALYTICS_TYPE)),
  startDate: z.string(),
  endDate: z.string(),
  granularity: z.enum(Object.values(DATA_GRANULARITY)).optional(),
  comparison: z.enum(Object.values(COMPARISON_TYPE)).optional(),
  comparisonStartDate: z.string().optional(),
  comparisonEndDate: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  groupBy: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional()
});

// Pipeline Query Validation
export const pipelineQuerySchema = z.object({
  type: z.enum(['promotion', 'training', 'succession', 'leadership']),
  stage: z.string().optional(),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  limit: z.number().min(1).max(100).optional()
});

// Ranking Query Validation
export const rankingQuerySchema = z.object({
  type: z.enum(['department', 'branch']),
  metric: z.string(),
  period: z.enum(Object.values(TIME_PERIOD)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(50).optional()
});

// Performance Tier Query Validation
export const performanceTierQuerySchema = z.object({
  tier: z.enum(['elite', 'high', 'average', 'below_average', 'low']).optional(),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  period: z.enum(Object.values(TIME_PERIOD)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional()
});

// Attrition Risk Query Validation
export const attritionRiskQuerySchema = z.object({
  riskLevel: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  factor: z.enum(Object.values(ATTRITION_RISK_FACTOR)).optional(),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  limit: z.number().min(1).max(100).optional()
});

// Hiring Recommendation Query Validation
export const hiringRecommendationQuerySchema = z.object({
  recommendation: z.enum(Object.values(HIRING_RECOMMENDATION)).optional(),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  limit: z.number().min(1).max(100).optional()
});

// Capacity Query Validation
export const capacityQuerySchema = z.object({
  status: z.enum(Object.values(CAPACITY_STATUS)).optional(),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  period: z.enum(Object.values(TIME_PERIOD)).optional()
});

// Organization Risk Query Validation
export const organizationRiskQuerySchema = z.object({
  category: z.enum(Object.values(ORGANIZATION_RISK_CATEGORY)).optional(),
  riskLevel: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  limit: z.number().min(1).max(100).optional()
});

// Pagination Query Validation
export const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val) || 1),
  limit: z.string().optional().transform(val => parseInt(val) || 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Date Range Query Validation
export const dateRangeQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string()
});

// Export all schemas
export const executiveValidationSchemas = {
  healthScoreSchema,
  kpiSchema,
  insightSchema,
  reportSchema,
  analyticsSchema,
  dashboardSchema,
  organizationHealthQuerySchema,
  kpiQuerySchema,
  insightQuerySchema,
  reportQuerySchema,
  analyticsQuerySchema,
  pipelineQuerySchema,
  rankingQuerySchema,
  performanceTierQuerySchema,
  attritionRiskQuerySchema,
  hiringRecommendationQuerySchema,
  capacityQuerySchema,
  organizationRiskQuerySchema,
  paginationQuerySchema,
  dateRangeQuerySchema
};
