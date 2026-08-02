class ExecutiveUtils {
  // Date Utilities
  static startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static startOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static startOfQuarter(date) {
    const d = new Date(date);
    const month = d.getMonth();
    const quarterStart = Math.floor(month / 3) * 3;
    d.setMonth(quarterStart);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfQuarter(date) {
    const d = new Date(date);
    const month = d.getMonth();
    const quarterEnd = Math.floor(month / 3) * 3 + 2;
    d.setMonth(quarterEnd + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static startOfYear(date) {
    const d = new Date(date);
    d.setMonth(0);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfYear(date) {
    const d = new Date(date);
    d.setMonth(11);
    d.setDate(31);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  static addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  static addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }

  static subtractDays(date, days) {
    return this.addDays(date, -days);
  }

  static subtractMonths(date, months) {
    return this.addMonths(date, -months);
  }

  static subtractYears(date, years) {
    return this.addYears(date, -years);
  }

  static getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getMonthsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  }

  static getYearsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end.getFullYear() - start.getFullYear();
  }

  // Period Utilities
  static getPeriodDates(period, customStartDate = null, customEndDate = null) {
    const now = new Date();
    
    switch (period) {
      case 'today':
        return { startDate: this.startOfDay(now), endDate: this.endOfDay(now) };
      case 'yesterday':
        const yesterday = this.subtractDays(now, 1);
        return { startDate: this.startOfDay(yesterday), endDate: this.endOfDay(yesterday) };
      case 'last_7_days':
        return { startDate: this.startOfDay(this.subtractDays(now, 7)), endDate: this.endOfDay(now) };
      case 'last_30_days':
        return { startDate: this.startOfDay(this.subtractDays(now, 30)), endDate: this.endOfDay(now) };
      case 'last_90_days':
        return { startDate: this.startOfDay(this.subtractDays(now, 90)), endDate: this.endOfDay(now) };
      case 'this_month':
        return { startDate: this.startOfMonth(now), endDate: this.endOfMonth(now) };
      case 'last_month':
        const lastMonth = this.subtractMonths(now, 1);
        return { startDate: this.startOfMonth(lastMonth), endDate: this.endOfMonth(lastMonth) };
      case 'this_quarter':
        return { startDate: this.startOfQuarter(now), endDate: this.endOfQuarter(now) };
      case 'last_quarter':
        const lastQuarter = this.subtractMonths(now, 3);
        return { startDate: this.startOfQuarter(lastQuarter), endDate: this.endOfQuarter(lastQuarter) };
      case 'this_year':
        return { startDate: this.startOfYear(now), endDate: this.endOfYear(now) };
      case 'last_year':
        const lastYear = this.subtractYears(now, 1);
        return { startDate: this.startOfYear(lastYear), endDate: this.endOfYear(lastYear) };
      case 'custom':
        return { startDate: new Date(customStartDate), endDate: new Date(customEndDate) };
      default:
        return { startDate: this.startOfMonth(now), endDate: this.endOfMonth(now) };
    }
  }

  // Validation Utilities
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  static isValidDate(date) {
    return !isNaN(new Date(date).getTime());
  }

  static isValidNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  static isValidPercentage(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  }

  // String Utilities
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static camelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  static snakeCase(str) {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  static kebabCase(str) {
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  static truncate(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }

  static slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  // Array Utilities
  static unique(array) {
    return [...new Set(array)];
  }

  static chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  }

  static sum(array, key) {
    return array.reduce((sum, item) => sum + (item[key] || 0), 0);
  }

  static average(array, key) {
    if (array.length === 0) return 0;
    return this.sum(array, key) / array.length;
  }

  static max(array, key) {
    return Math.max(...array.map(item => item[key] || 0));
  }

  static min(array, key) {
    return Math.min(...array.map(item => item[key] || 0));
  }

  static median(array, key) {
    if (array.length === 0) return 0;
    const sorted = [...array].sort((a, b) => (a[key] || 0) - (b[key] || 0));
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid][key] : (sorted[mid - 1][key] + sorted[mid][key]) / 2;
  }

  // Object Utilities
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static mergeDeep(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  static isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  static isEmpty(obj) {
    if (Array.isArray(obj)) return obj.length === 0;
    if (this.isObject(obj)) return Object.keys(obj).length === 0;
    return !obj;
  }

  static pick(obj, keys) {
    return keys.reduce((result, key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  }

  static omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  }

  // Number Utilities
  static round(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  static floor(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  static ceil(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.ceil(value * factor) / factor;
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min, max) {
    return Math.floor(this.random(min, max + 1));
  }

  static percentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  static percentageChange(value, previous) {
    if (previous === 0) return value > 0 ? 100 : 0;
    return ((value - previous) / previous) * 100;
  }

  // Color Utilities
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  static rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  static interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return this.rgbToHex(r, g, b);
  }

  // ID Utilities
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Debounce and Throttle
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Async Utilities
  static async parallel(promises) {
    return Promise.all(promises);
  }

  static async parallelLimit(promises, limit) {
    const results = [];
    const executing = [];
    
    for (const promise of promises) {
      const p = Promise.resolve(promise).then(result => {
        executing.splice(executing.indexOf(p), 1);
        return result;
      });
      
      executing.push(p);
      results.push(p);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
    
    return Promise.all(results);
  }

  static async retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  // Cache Utilities
  static createCache(ttl = 300000) {
    const cache = new Map();
    
    return {
      set(key, value) {
        cache.set(key, {
          value,
          expires: Date.now() + ttl
        });
      },
      get(key) {
        const item = cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expires) {
          cache.delete(key);
          return null;
        }
        return item.value;
      },
      has(key) {
        return this.get(key) !== null;
      },
      delete(key) {
        cache.delete(key);
      },
      clear() {
        cache.clear();
      }
    };
  }

  // Validation Helper for Executive Module
  static validateExecutiveData(data, schema) {
    const errors = [];
    
    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
        
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
        
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export Utilities
  static exportToCSV(data, filename) {
    if (!data || data.length === 0) return null;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  static exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  }
}

export default ExecutiveUtils;
