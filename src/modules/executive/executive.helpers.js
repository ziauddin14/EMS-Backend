import { HEALTH_SCORE_RANGE, PERFORMANCE_TIER, RISK_LEVEL } from './executive.constants.js';

class ExecutiveHelpers {
  // Health Score Helpers
  static getHealthScoreLabel(score) {
    const range = Object.values(HEALTH_SCORE_RANGE).find(
      r => score >= r.min && score <= r.max
    );
    return range ? range.label : 'Unknown';
  }

  static getHealthScoreColor(score) {
    const range = Object.values(HEALTH_SCORE_RANGE).find(
      r => score >= r.min && score <= r.max
    );
    return range ? range.color : '#9CA3AF';
  }

  static calculateHealthScore(components, weightage) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(components).forEach(([key, value]) => {
      const weight = weightage[key.toUpperCase()] || weightage[key] || 0;
      totalScore += value * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  static getHealthStatus(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'satisfactory';
    if (score >= 50) return 'needs_improvement';
    return 'poor';
  }

  // Performance Tier Helpers
  static getPerformanceTierLabel(score) {
    const tier = Object.values(PERFORMANCE_TIER).find(
      t => score >= t.min && score <= t.max
    );
    return tier ? tier.label : 'Unknown';
  }

  static getPerformanceTierColor(score) {
    const tier = Object.values(PERFORMANCE_TIER).find(
      t => score >= t.min && score <= t.max
    );
    return tier ? tier.color : '#9CA3AF';
  }

  // Risk Level Helpers
  static getRiskLevelLabel(level) {
    const risk = Object.values(RISK_LEVEL).find(
      r => r.value === level || r.label.toLowerCase() === level.toLowerCase()
    );
    return risk ? risk.label : 'Unknown';
  }

  static getRiskLevelColor(level) {
    const risk = Object.values(RISK_LEVEL).find(
      r => r.value === level || r.label.toLowerCase() === level.toLowerCase()
    );
    return risk ? risk.color : '#9CA3AF';
  }

  // KPI Helpers
  static calculateKPIChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  static getKPIDirection(change) {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'stable';
  }

  static formatKPIValue(value, metric) {
    if (metric.includes('rate') || metric.includes('ratio') || metric.includes('percentage')) {
      return `${value.toFixed(1)}%`;
    }
    if (metric.includes('score')) {
      return value.toFixed(1);
    }
    if (metric.includes('count') || metric.includes('total')) {
      return Math.round(value).toLocaleString();
    }
    if (metric.includes('duration') || metric.includes('time')) {
      return `${Math.round(value)}h`;
    }
    return value.toFixed(2);
  }

  // Trend Helpers
  static calculateTrend(data, metric) {
    if (data.length < 2) return { direction: 'stable', change: 0 };
    
    const recent = data.slice(-3);
    const older = data.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, d) => sum + (d[metric] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + (d[metric] || 0), 0) / older.length;
    
    const change = this.calculateKPIChange(recentAvg, olderAvg);
    const direction = this.getTrendDirection(change, data);
    
    return { direction, change, recentAvg, olderAvg };
  }

  static getTrendDirection(change, data) {
    if (Math.abs(change) < 5) return 'stable';
    
    const variance = this.calculateVariance(data);
    if (variance > 20) return 'volatile';
    
    return change > 0 ? 'up' : 'down';
  }

  static calculateVariance(data) {
    if (data.length < 2) return 0;
    
    const values = data.map(d => d.value || d.score || 0);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  // Ranking Helpers
  static calculateRankings(items, metric, order = 'desc') {
    return items
      .map(item => ({
        ...item,
        rank: 0
      }))
      .sort((a, b) => {
        const aVal = a[metric] || 0;
        const bVal = b[metric] || 0;
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }

  static getRankChange(currentRank, previousRank) {
    if (!previousRank) return 'new';
    if (currentRank < previousRank) return 'up';
    if (currentRank > previousRank) return 'down';
    return 'stable';
  }

  // Pipeline Helpers
  static calculatePipelineStageCount(employees, stageField) {
    return employees.reduce((acc, employee) => {
      const stage = employee[stageField] || 'unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});
  }

  static getPipelineConversionRate(pipeline, fromStage, toStage) {
    const fromCount = pipeline[fromStage] || 0;
    const toCount = pipeline[toStage] || 0;
    
    if (fromCount === 0) return 0;
    return Math.round((toCount / fromCount) * 100);
  }

  // Attrition Risk Helpers
  static calculateAttritionRiskScore(employee) {
    let riskScore = 0;
    
    // Performance factor
    if (employee.performanceScore < 60) riskScore += 20;
    else if (employee.performanceScore < 70) riskScore += 10;
    
    // Tenure factor
    const tenure = this.calculateTenure(employee.joiningDate);
    if (tenure < 6) riskScore += 15;
    else if (tenure > 36 && !employee.lastPromotionDate) riskScore += 20;
    
    // Engagement factor
    if (employee.engagementScore < 50) riskScore += 25;
    else if (employee.engagementScore < 70) riskScore += 15;
    
    // Workload factor
    if (employee.workloadScore > 80) riskScore += 10;
    
    // Compensation factor
    if (employee.compensationBelowMarket) riskScore += 15;
    
    return Math.min(riskScore, 100);
  }

  static calculateTenure(joiningDate) {
    const join = new Date(joiningDate);
    const now = new Date();
    const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    return months;
  }

  // Capacity Helpers
  static calculateCapacityUtilization(currentLoad, maxCapacity) {
    if (maxCapacity === 0) return 0;
    return Math.round((currentLoad / maxCapacity) * 100);
  }

  static getCapacityStatus(utilization) {
    if (utilization < 60) return 'under_utilized';
    if (utilization < 80) return 'optimal';
    if (utilization < 90) return 'near_capacity';
    if (utilization < 100) return 'at_capacity';
    return 'over_capacity';
  }

  // Organization Risk Helpers
  static calculateOrganizationRiskScore(risks) {
    let totalRisk = 0;
    let riskCount = 0;
    
    Object.values(risks).forEach(risk => {
      totalRisk += risk.score || 0;
      riskCount++;
    });
    
    return riskCount > 0 ? Math.round(totalRisk / riskCount) : 0;
  }

  static getOrganizationRiskCategory(riskScore) {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    if (riskScore >= 20) return 'low';
    return 'minimal';
  }

  // Data Formatting Helpers
  static formatNumber(value, decimals = 0) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  static formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  static formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
  }

  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    if (format === 'YYYY-MM-DD') {
      return d.toISOString().split('T')[0];
    }
    if (format === 'MM/DD/YYYY') {
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
    if (format === 'DD/MM/YYYY') {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    
    return d.toISOString().split('T')[0];
  }

  static formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  // Chart Data Helpers
  static formatChartData(data, xField, yField) {
    return data.map(item => ({
      x: item[xField],
      y: item[yField]
    }));
  }

  static formatMultiLineChartData(data, xField, seriesField, yField) {
    const series = {};
    
    data.forEach(item => {
      const seriesName = item[seriesField];
      if (!series[seriesName]) {
        series[seriesName] = [];
      }
      series[seriesName].push({
        x: item[xField],
        y: item[yField]
      });
    });
    
    return Object.keys(series).map(name => ({
      name,
      data: series[name]
    }));
  }

  static formatPieChartData(data, labelField, valueField) {
    return data.map(item => ({
      label: item[labelField],
      value: item[valueField]
    }));
  }

  // Comparison Helpers
  static compareWithTarget(current, target) {
    const difference = current - target;
    const percentage = target > 0 ? (difference / target) * 100 : 0;
    
    return {
      current,
      target,
      difference,
      percentage: Math.round(percentage),
      status: current >= target ? 'on_track' : 'behind'
    };
  }

  static compareWithBenchmark(current, benchmark) {
    const difference = current - benchmark;
    const percentage = benchmark > 0 ? (difference / benchmark) * 100 : 0;
    
    return {
      current,
      benchmark,
      difference,
      percentage: Math.round(percentage),
      status: current >= benchmark ? 'above' : 'below'
    };
  }

  // Aggregation Helpers
  static aggregateByField(data, field, aggregation = 'sum') {
    const grouped = {};
    
    data.forEach(item => {
      const key = item[field];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });\n    \n    const result = {};\n    Object.entries(grouped).forEach(([key, items]) => {\n      switch (aggregation) {\n        case 'sum':\n          result[key] = items.reduce((sum, item) => sum + (item.value || 0), 0);\n          break;\n        case 'avg':\n          result[key] = items.reduce((sum, item) => sum + (item.value || 0), 0) / items.length;\n          break;\n        case 'count':\n          result[key] = items.length;\n          break;\n        case 'min':\n          result[key] = Math.min(...items.map(item => item.value || 0));\n          break;\n        case 'max':\n          result[key] = Math.max(...items.map(item => item.value || 0));\n          break;\n        default:\n          result[key] = items.length;\n      }\n    });\n    \n    return result;\n  }\n\n  static aggregateByDate(data, dateField, aggregation = 'sum', granularity = 'daily') {\n    const grouped = {};\n    \n    data.forEach(item => {\n      const date = new Date(item[dateField]);\n      let key;\n      \n      switch (granularity) {\n        case 'hourly':\n          key = date.toISOString().substring(0, 13);\n          break;\n        case 'daily':\n          key = date.toISOString().split('T')[0];\n          break;\n        case 'weekly':\n          const weekStart = new Date(date);\n          weekStart.setDate(date.getDate() - date.getDay());\n          key = weekStart.toISOString().split('T')[0];\n          break;\n        case 'monthly':\n          key = date.toISOString().substring(0, 7);\n          break;\n        case 'quarterly':\n          const quarter = Math.floor(date.getMonth() / 3) + 1;\n          key = `${date.getFullYear()}-Q${quarter}`;\n          break;\n        case 'yearly':\n          key = date.getFullYear().toString();\n          break;\n        default:\n          key = date.toISOString().split('T')[0];\n      }\n      \n      if (!grouped[key]) {\n        grouped[key] = [];\n      }\n      grouped[key].push(item);\n    });\n    \n    return this.aggregateByField(\n      Object.keys(grouped).map(key => ({ date: key, value: grouped[key].reduce((sum, item) => sum + (item.value || 0), 0) })),\n      'date',\n      aggregation\n    );\n  }\n\n  // Percentile Helpers\n  static calculatePercentile(data, percentile) {\n    const sorted = [...data].sort((a, b) => a - b);\n    const index = (percentile / 100) * (sorted.length - 1);\n    \n    if (index === Math.floor(index)) {\n      return sorted[index];\n    }\n    \n    const lower = sorted[Math.floor(index)];\n    const upper = sorted[Math.ceil(index)];\n    return lower + (upper - lower) * (index - Math.floor(index));\n  }\n\n  static calculateMedian(data) {\n    return this.calculatePercentile(data, 50);\n  }\n\n  static calculateStandardDeviation(data) {\n    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;\n    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;\n    return Math.sqrt(variance);\n  }\n\n  // Dashboard Widget Helpers\n  static formatWidgetData(widgetType, data) {\n    switch (widgetType) {\n      case 'kpi_card':\n        return {\n          value: data.value,\n          label: data.label,\n          change: data.change,\n          trend: data.trend\n        };\n      case 'chart':\n        return {\n          type: data.chartType,\n          data: data.chartData,\n          options: data.chartOptions\n        };\n      case 'table':\n        return {\n          columns: data.columns,\n          rows: data.rows,\n          pagination: data.pagination\n        };\n      case 'heatmap':\n        return {\n          data: data.heatmapData,\n          xAxis: data.xAxis,\n          yAxis: data.yAxis\n        };\n      case 'gauge':\n        return {\n          value: data.value,\n          min: data.min || 0,\n          max: data.max || 100,\n          thresholds: data.thresholds\n        };\n      case 'progress':\n        return {\n          value: data.value,\n          total: data.total,\n          label: data.label,\n          color: data.color\n        };\n      default:\n        return data;\n    }\n  }\n\n  // Alert Helpers\n  static checkAlertThresholds(metrics, thresholds) {\n    const alerts = [];\n    \n    Object.entries(metrics).forEach(([key, value]) => {\n      const threshold = thresholds[key];\n      if (!threshold) return;\n      \n      if (threshold.critical !== undefined && value <= threshold.critical) {\n        alerts.push({\n          metric: key,\n          level: 'critical',\n          value,\n          threshold: threshold.critical,\n          message: `${key} is critically low: ${value}`\n        });\n      } else if (threshold.warning !== undefined && value <= threshold.warning) {\n        alerts.push({\n          metric: key,\n          level: 'warning',\n          value,\n          threshold: threshold.warning,\n          message: `${key} is below warning threshold: ${value}`\n        });\n      }\n    });\n    \n    return alerts;\n  }\n}\n\nexport default ExecutiveHelpers;\n
