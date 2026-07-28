import { MEETING_CODE_FORMAT, SUPPORTED_TIMEZONES, DEFAULT_TIMEZONE } from './meeting.constants.js';

// Meeting Code Generator
export const generateMeetingCode = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MTG-${year}${month}${day}-${random}`;
};

// Timezone Utilities
export const timezoneUtils = {
  // Validate timezone
  isValidTimezone(timezone) {
    return SUPPORTED_TIMEZONES.includes(timezone);
  },

  // Convert time between timezones
  convertTime(date, fromTimezone, toTimezone) {
    const options = {
      timeZone: toTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date(date));
    
    const yearPart = parts.find(p => p.type === 'year').value;
    const monthPart = parts.find(p => p.type === 'month').value;
    const dayPart = parts.find(p => p.type === 'day').value;
    const hourPart = parts.find(p => p.type === 'hour').value;
    const minutePart = parts.find(p => p.type === 'minute').value;
    const secondPart = parts.find(p => p.type === 'second').value;
    
    return new Date(`${yearPart}-${monthPart}-${dayPart}T${hourPart}:${minutePart}:${secondPart}`);
  },

  // Get current time in timezone
  getCurrentTimeInTimezone(timezone = DEFAULT_TIMEZONE) {
    return this.convertTime(new Date(), DEFAULT_TIMEZONE, timezone);
  },

  // Format date in timezone
  formatDateInTimezone(date, timezone = DEFAULT_TIMEZONE, format = 'full') {
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    if (format === 'date') {
      delete options.hour;
      delete options.minute;
      delete options.hour12;
    } else if (format === 'time') {
      delete options.year;
      delete options.month;
      delete options.day;
    }
    
    return new Date(date).toLocaleString('en-US', options);
  },

  // Get timezone offset
  getTimezoneOffset(timezone = DEFAULT_TIMEZONE) {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate - utcDate) / (1000 * 60);
  }
};

// Date Utilities
export const dateUtils = {
  // Add days to date
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Add hours to date
  addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },

  // Add minutes to date
  addMinutes(date, minutes) {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  },

  // Subtract days from date
  subtractDays(date, days) {
    return this.addDays(date, -days);
  },

  // Get start of day
  startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of day
  endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get start of week
  startOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of week
  endOfWeek(date) {
    const result = this.startOfWeek(date);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get start of month
  startOfMonth(date) {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of month
  endOfMonth(date) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get start of quarter
  startOfQuarter(date) {
    const result = new Date(date);
    const month = result.getMonth();
    const quarterStart = Math.floor(month / 3) * 3;
    result.setMonth(quarterStart);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of quarter
  endOfQuarter(date) {
    const result = this.startOfQuarter(date);
    result.setMonth(result.getMonth() + 3);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get start of year
  startOfYear(date) {
    const result = new Date(date);
    result.setMonth(0);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of year
  endOfYear(date) {
    const result = new Date(date);
    result.setMonth(11);
    result.setDate(31);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Get difference in days
  diffInDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneDay);
  },

  // Get difference in hours
  diffInHours(date1, date2) {
    const oneHour = 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneHour);
  },

  // Get difference in minutes
  diffInMinutes(date1, date2) {
    const oneMinute = 60 * 1000;
    return Math.round((date2 - date1) / oneMinute);
  },

  // Check if same day
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  },

  // Check if same week
  isSameWeek(date1, date2) {
    const start1 = this.startOfWeek(date1);
    const start2 = this.startOfWeek(date2);
    return start1.getTime() === start2.getTime();
  },

  // Check if same month
  isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
  },

  // Check if same year
  isSameYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear();
  },

  // Format date
  formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // Parse date string
  parseDate(dateString, format = 'YYYY-MM-DD') {
    if (format === 'YYYY-MM-DD') {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  }
};

// Duration Utilities
export const durationUtils = {
  // Convert minutes to hours
  minutesToHours(minutes) {
    return minutes / 60;
  },

  // Convert hours to minutes
  hoursToMinutes(hours) {
    return hours * 60;
  },

  // Format duration
  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  },

  // Parse duration string
  parseDuration(durationString) {
    const hoursMatch = durationString.match(/(\d+)h/);
    const minutesMatch = durationString.match(/(\d+)m/);
    
    let totalMinutes = 0;
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }
    
    return totalMinutes;
  },

  // Calculate duration between two dates
  calculateDuration(startDate, endDate) {
    const diff = endDate - startDate;
    return Math.round(diff / (1000 * 60));
  },

  // Validate duration
  isValidDuration(minutes) {
    return minutes >= 15 && minutes <= 480;
  }
};

// Recurring Meeting Utilities
export const recurringUtils = {
  // Calculate next occurrence
  getNextOccurrence(meeting, pattern) {
    const lastDate = new Date(meeting.endTime);
    
    switch (pattern) {
      case 'daily':
        return dateUtils.addDays(lastDate, 1);
      case 'weekly':
        return dateUtils.addDays(lastDate, 7);
      case 'bi_weekly':
        return dateUtils.addDays(lastDate, 14);
      case 'monthly':
        return dateUtils.addMonths(lastDate, 1);
      case 'quarterly':
        return dateUtils.addMonths(lastDate, 3);
      case 'yearly':
        return dateUtils.addMonths(lastDate, 12);
      default:
        return lastDate;
    }
  },

  // Generate recurring dates
  generateRecurringDates(meeting, pattern, endDate) {
    const dates = [];
    let currentDate = new Date(meeting.endTime);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      currentDate = this.getNextOccurrence({ endTime: currentDate }, pattern);
      if (currentDate <= end) {
        dates.push(new Date(currentDate));
      }
    }
    
    return dates;
  },

  // Calculate number of occurrences
  calculateOccurrences(meeting, pattern, endDate) {
    return this.generateRecurringDates(meeting, pattern, endDate).length;
  }
};

// Add months helper for dateUtils
dateUtils.addMonths = function(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Validation Utilities
export const validationUtils = {
  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate URL
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Validate phone number
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  // Validate date range
  isValidDateRange(startDate, endDate) {
    return startDate < endDate;
  },

  // Validate meeting time
  isValidMeetingTime(startTime, endTime) {
    return startTime < endTime && this.isValidDateRange(startTime, endTime);
  },

  // Validate participant count
  isValidParticipantCount(count, meetingType) {
    const limits = {
      one_on_one: 2,
      team: 25,
      department: 50,
      all_hands: 500,
      board: 20
    };
    const limit = limits[meetingType] || 10;
    return count <= limit;
  },

  // Sanitize input
  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  },

  // Validate object ID
  isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
};

// Export all utilities
export const utils = {
  meetingCode: { generateMeetingCode },
  timezone: timezoneUtils,
  date: dateUtils,
  duration: durationUtils,
  recurring: recurringUtils,
  validation: validationUtils
};

export default utils;
