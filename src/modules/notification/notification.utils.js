// Notification Module Utilities

class NotificationUtils {
  // Date Utilities
  static startOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static startOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfWeek(date = new Date()) {
    const d = this.startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static startOfMonth(date = new Date()) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static endOfMonth(date = new Date()) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  static addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  static addHours(date, hours) {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
  }

  static addMinutes(date, minutes) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  }

  static daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneDay);
  }

  static hoursBetween(date1, date2) {
    const oneHour = 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneHour);
  }

  static minutesBetween(date1, date2) {
    const oneMinute = 60 * 1000;
    return Math.round((date2 - date1) / oneMinute);
  }

  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  static formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return this.formatDate(date);
  }

  // String Utilities
  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static truncate(str, length = 100) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }

  static slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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

  // Array Utilities
  static chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static unique(array) {
    return [...new Set(array)];
  }

  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  }

  static sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      if (order === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
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
  static round(num, decimals = 2) {
    return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
  }

  static clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min, max) {
    return Math.floor(this.random(min, max + 1));
  }

  static percentage(value, total) {
    if (total === 0) return 0;
    return this.round((value / total) * 100);
  }

  static percentageChange(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return this.round(((newValue - oldValue) / Math.abs(oldValue)) * 100);
  }

  // IP Address Utilities
  static isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  }

  static anonymizeIP(ip) {
    if (!this.isValidIP(ip)) return ip;
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }

  // User Agent Utilities
  static parseUserAgent(userAgent) {
    const browser = {
      name: 'Unknown',
      version: 'Unknown'
    };
    const os = {
      name: 'Unknown',
      version: 'Unknown'
    };

    // Browser detection
    if (userAgent.includes('Chrome')) {
      browser.name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
      if (match) browser.version = match[1];
    } else if (userAgent.includes('Firefox')) {
      browser.name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      if (match) browser.version = match[1];
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser.name = 'Safari';
      const match = userAgent.match(/Version\/(\d+\.\d+)/);
      if (match) browser.version = match[1];
    } else if (userAgent.includes('Edge')) {
      browser.name = 'Edge';
      const match = userAgent.match(/Edge\/(\d+\.\d+\.\d+\.\d+)/);
      if (match) browser.version = match[1];
    }

    // OS detection
    if (userAgent.includes('Windows')) {
      os.name = 'Windows';
      if (userAgent.includes('Windows 10')) os.version = '10';
      else if (userAgent.includes('Windows 11')) os.version = '11';
    } else if (userAgent.includes('Mac OS X')) {
      os.name = 'macOS';
      const match = userAgent.match(/Mac OS X (\d+_\d+_\d+)/);
      if (match) os.version = match[1].replace(/_/g, '.');
    } else if (userAgent.includes('Linux')) {
      os.name = 'Linux';
    } else if (userAgent.includes('Android')) {
      os.name = 'Android';
      const match = userAgent.match(/Android (\d+\.\d+)/);
      if (match) os.version = match[1];
    } else if (userAgent.includes('iOS')) {
      os.name = 'iOS';
      const match = userAgent.match(/OS (\d+_\d+)/);
      if (match) os.version = match[1].replace(/_/g, '.');
    }

    return { browser, os };
  }

  // Device Detection
  static detectDevice(userAgent) {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Location Utilities
  static isValidLatitude(lat) {
    return lat >= -90 && lat <= 90;
  }

  static isValidLongitude(lng) {
    return lng >= -180 && lng <= 180;
  }

  static formatLocation(location) {
    if (!location) return null;
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    return parts.join(', ') || null;
  }

  // Async Utilities
  static async parallel(tasks, concurrency = 10) {
    const results = [];
    const executing = [];

    for (const task of tasks) {
      const promise = task().then(result => {
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });

      results.push(promise);
      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    return Promise.all(results);
  }

  static async retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  }

  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  // Cache Utilities
  static createCache(ttl = 300000) {
    const cache = new Map();
    const timers = new Map();

    return {
      get(key) {
        return cache.get(key);
      },
      set(key, value, customTtl = ttl) {
        cache.set(key, value);
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
        }
        if (customTtl > 0) {
          const timer = setTimeout(() => {
            cache.delete(key);
            timers.delete(key);
          }, customTtl);
          timers.set(key, timer);
        }
      },
      delete(key) {
        cache.delete(key);
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
      },
      clear() {
        cache.clear();
        timers.forEach(timer => clearTimeout(timer));
        timers.clear();
      },
      has(key) {
        return cache.has(key);
      },
      size() {
        return cache.size;
      }
    };
  }

  // Export Utilities
  static toCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => {
      const value = row[header];
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  static toJSON(data) {
    return JSON.stringify(data, null, 2);
  }

  static fromJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }

  // Encryption Utilities (placeholder - actual implementation would use crypto)
  static hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  static maskEmail(email) {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) return `${username}@${domain}`;
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }

  static maskPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    const visibleDigits = digits.slice(-4);
    const maskedDigits = '*'.repeat(digits.length - 4);
    return maskedDigits + visibleDigits;
  }
}

export default NotificationUtils;
