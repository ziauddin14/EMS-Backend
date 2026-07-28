import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Logger from '../../core/utils/logger.js';

// File Export Utilities
export const exportToCSV = async (data, filename) => {
  try {
    const csvWriter = createObjectCsvWriter({
      path: filename,
      header: Object.keys(data[0] || {}).map(key => ({ id: key, title: key }))
    });

    await csvWriter.writeRecords(data);
    Logger.info(`Data exported to CSV: ${filename}`);
    return filename;
  } catch (error) {
    Logger.error('Error exporting to CSV:', error);
    throw error;
  }
};

export const exportToExcel = async (data, filename) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key,
        key: key
      }));

      worksheet.addRows(data);
    }

    await workbook.xlsx.writeFile(filename);
    Logger.info(`Data exported to Excel: ${filename}`);
    return filename;
  } catch (error) {
    Logger.error('Error exporting to Excel:', error);
    throw error;
  }
};

export const exportToPDF = async (data, filename, title = 'Report') => {
  try {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filename);
    doc.pipe(stream);

    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      let y = 100;

      // Draw headers
      headers.forEach((header, index) => {
        doc.fontSize(12).text(header, 50 + (index * 100), y);
      });

      y += 30;

      // Draw data
      data.forEach(row => {
        headers.forEach((header, index) => {
          doc.fontSize(10).text(String(row[header] || ''), 50 + (index * 100), y);
        });
        y += 20;
      });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        Logger.info(`Data exported to PDF: ${filename}`);
        resolve(filename);
      });
      stream.on('error', reject);
    });
  } catch (error) {
    Logger.error('Error exporting to PDF:', error);
    throw error;
  }
};

// File Import Utilities
export const importFromCSV = async (filename) => {
  try {
    const results = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          Logger.info(`Data imported from CSV: ${filename}`);
          resolve(results);
        })
        .on('error', reject);
    });
  } catch (error) {
    Logger.error('Error importing from CSV:', error);
    throw error;
  }
};

export const importFromExcel = async (filename) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filename);

    const worksheet = workbook.worksheets[0];
    const data = [];
    const headers = [];

    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber - 1]] = cell.value;
        });
        data.push(rowData);
      }
    });

    Logger.info(`Data imported from Excel: ${filename}`);
    return data;
  } catch (error) {
    Logger.error('Error importing from Excel:', error);
    throw error;
  }
};

// Date Utilities
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;

  const d = new Date(date);
  
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

export const parseDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return null;

  let year, month, day;

  switch (format) {
    case 'YYYY-MM-DD':
      [year, month, day] = dateString.split('-').map(Number);
      break;
    case 'DD/MM/YYYY':
      [day, month, year] = dateString.split('/').map(Number);
      break;
    case 'MM/DD/YYYY':
      [month, day, year] = dateString.split('/').map(Number);
      break;
    default:
      [year, month, day] = dateString.split('-').map(Number);
  }

  return new Date(year, month - 1, day);
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Number Utilities
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return 0;
  return Number(number).toFixed(decimals);
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

export const roundTo = (number, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
};

// String Utilities
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const truncateString = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Array Utilities
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const sortByProperty = (array, property, order = 'asc') => {
  return array.sort((a, b) => {
    if (order === 'asc') {
      return a[property] > b[property] ? 1 : -1;
    } else {
      return a[property] < b[property] ? 1 : -1;
    }
  });
};

export const groupByProperty = (array, property) => {
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

export const uniqueArray = (array) => {
  return [...new Set(array)];
};

// Object Utilities
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const mergeObjects = (target, source) => {
  return Object.assign({}, target, source);
};

export const pickProperties = (obj, properties) => {
  return properties.reduce((result, property) => {
    if (obj.hasOwnProperty(property)) {
      result[property] = obj[property];
    }
    return result;
  }, {});
};

export const omitProperties = (obj, properties) => {
  const result = { ...obj };
  properties.forEach(property => {
    delete result[property];
  });
  return result;
};

// Validation Utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (date) => {
  return !isNaN(Date.parse(date));
};

// Performance Utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const asyncMap = async (array, callback) => {
  const results = [];
  for (let index = 0; index < array.length; index++) {
    results.push(await callback(array[index], index, array));
  }
  return results;
};

export const asyncFilter = async (array, callback) => {
  const results = [];
  for (let index = 0; index < array.length; index++) {
    if (await callback(array[index], index, array)) {
      results.push(array[index]);
    }
  }
  return results;
};

// Error Handling Utilities
export const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Logging Utilities
export const logInfo = (message, data = null) => {
  Logger.info(message, data);
};

export const logError = (message, error = null) => {
  Logger.error(message, error);
};

export const logWarn = (message, data = null) => {
  Logger.warn(message, data);
};

export const logDebug = (message, data = null) => {
  Logger.debug(message, data);
};
