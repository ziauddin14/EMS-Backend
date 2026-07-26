export const AttendanceUtils = {
  parseTime(timeString) {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  },

  formatTime(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  formatMinutesToHours(minutes) {
    if (!minutes) return 0;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return parseFloat(`${hours}.${mins.toString().padStart(2, '0')}`);
  },

  formatHoursToMinutes(hours) {
    if (!hours) return 0;
    const [h, m] = hours.toString().split('.').map(Number);
    return (h * 60) + (m || 0);
  },

  isValidTime(timeString) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  },

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  isFutureDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  },

  isPastDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date < today;
  },

  getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  getEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  getEndOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  getStartOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  getEndOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  subtractDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
  },

  getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  formatDateForDisplay(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateForInput(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  sanitizeLocationData(location) {
    if (!location) return null;
    return {
      type: location.type || 'office',
      coordinates: {
        latitude: location.coordinates?.latitude || null,
        longitude: location.coordinates?.longitude || null
      },
      address: location.address || null,
      geoFenceVerified: location.geoFenceVerified || false
    };
  },

  sanitizeDeviceData(device) {
    if (!device) return null;
    return {
      type: device.type || 'web',
      deviceId: device.deviceId || null,
      deviceName: device.deviceName || null,
      ipAddress: device.ipAddress || null,
      userAgent: device.userAgent || null
    };
  },

  extractDeviceInfo(userAgent) {
    if (!userAgent) {
      return {
        type: 'web',
        deviceName: 'Unknown',
        userAgent: null
      };
    }

    let type = 'web';
    let deviceName = 'Unknown';

    if (/mobile/i.test(userAgent)) {
      type = 'mobile';
      deviceName = 'Mobile Device';
    } else if (/tablet/i.test(userAgent)) {
      type = 'mobile';
      deviceName = 'Tablet';
    } else if (/biometric/i.test(userAgent)) {
      type = 'biometric';
      deviceName = 'Biometric Device';
    } else if (/kiosk/i.test(userAgent)) {
      type = 'kiosk';
      deviceName = 'Kiosk';
    }

    return {
      type,
      deviceName,
      userAgent
    };
  },

  getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.ip ||
           null;
  },

  validateCoordinates(latitude, longitude) {
    if (latitude === null || longitude === null) return false;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  },

  toRad(degrees) {
    return (degrees * Math.PI) / 180;
  },

  isWithinRadius(lat1, lon1, lat2, lon2, radiusMeters) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusMeters;
  },

  generateAttendanceId() {
    return `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  },

  parseShiftTime(timeString, date) {
    if (!timeString || !date) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  },

  formatDuration(minutes) {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  roundToNearestMinute(date) {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  },

  roundToNearestFiveMinutes(date) {
    const d = new Date(date);
    const minutes = d.getMinutes();
    const roundedMinutes = Math.round(minutes / 5) * 5;
    d.setMinutes(roundedMinutes, 0, 0);
    return d;
  },

  validateEmployeeStatus(employee) {
    if (!employee) {
      return { valid: false, error: 'Employee not found' };
    }

    if (employee.isDeleted) {
      return { valid: false, error: 'Employee has been deleted' };
    }

    if (!employee.isActive) {
      return { valid: false, error: 'Employee is inactive' };
    }

    if (employee.status === 'terminated') {
      return { valid: false, error: 'Employee has been terminated' };
    }

    return { valid: true };
  },

  validateShift(shift) {
    if (!shift) {
      return { valid: false, error: 'Shift not found' };
    }

    if (shift.isDeleted) {
      return { valid: false, error: 'Shift has been deleted' };
    }

    if (!shift.isActive) {
      return { valid: false, error: 'Shift is inactive' };
    }

    return { valid: true };
  },

  validatePolicy(policy) {
    if (!policy) {
      return { valid: false, error: 'Attendance policy not found' };
    }

    if (policy.isDeleted) {
      return { valid: false, error: 'Attendance policy has been deleted' };
    }

    if (!policy.isActive) {
      return { valid: false, error: 'Attendance policy is inactive' };
    }

    return { valid: true };
  },

  validateWorkingHours(workingMinutes, shift, policy) {
    if (workingMinutes < 0) {
      return { valid: false, error: 'Working minutes cannot be negative' };
    }

    if (shift && workingMinutes > shift.maximumWorkingMinutes * 60) {
      return { valid: false, error: 'Working minutes exceed maximum allowed' };
    }

    if (policy && workingMinutes > policy.maximumWorkingMinutes) {
      return { valid: false, error: 'Working minutes exceed policy limits' };
    }

    return { valid: true };
  },

  validateOvertime(overtimeMinutes, shift, policy) {
    if (overtimeMinutes < 0) {
      return { valid: false, error: 'Overtime minutes cannot be negative' };
    }

    if (shift && !shift.allowOvertime && overtimeMinutes > 0) {
      return { valid: false, error: 'Overtime not allowed for this shift' };
    }

    if (policy && overtimeMinutes > policy.maximumOvertimeMinutes) {
      return { valid: false, error: 'Overtime exceeds policy limits' };
    }

    return { valid: true };
  },

  validateBreakTiming(breakStart, breakEnd, checkIn, checkOut) {
    if (!breakStart) {
      return { valid: false, error: 'Break start time is required' };
    }

    const breakStartTime = new Date(breakStart);
    const checkInTime = checkIn ? new Date(checkIn) : null;
    const checkOutTime = checkOut ? new Date(checkOut) : null;

    if (checkInTime && breakStartTime < checkInTime) {
      return { valid: false, error: 'Break cannot start before check-in' };
    }

    if (breakEnd) {
      const breakEndTime = new Date(breakEnd);
      if (breakEndTime < breakStartTime) {
        return { valid: false, error: 'Break end time cannot be before break start time' };
      }

      if (checkOutTime && breakEndTime > checkOutTime) {
        return { valid: false, error: 'Break cannot end after check-out' };
      }
    }

    return { valid: true };
  },

  validateDuplicateCheckIn(employeeId, date, existingAttendance) {
    if (existingAttendance && existingAttendance.checkIn) {
      return { valid: false, error: 'Employee has already checked in today' };
    }
    return { valid: true };
  },

  validateDuplicateCheckOut(employeeId, date, existingAttendance) {
    if (existingAttendance && existingAttendance.checkOut) {
      return { valid: false, error: 'Employee has already checked out today' };
    }
    return { valid: true };
  },

  validateAttendanceDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      return { valid: false, error: 'Start date and end date are required' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return { valid: false, error: 'Start date cannot be after end date' };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (start > today) {
      return { valid: false, error: 'Cannot query future attendance records' };
    }

    const maxDateRange = 365;
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxDateRange) {
      return { valid: false, error: `Date range cannot exceed ${maxDateRange} days` };
    }

    return { valid: true };
  },

  sanitizeCheckInData(checkInData) {
    return {
      checkIn: checkInData.checkIn || new Date(),
      location: this.sanitizeLocationData(checkInData.location),
      device: this.sanitizeDeviceData(checkInData.device),
      ipAddress: checkInData.ipAddress || null,
      userAgent: checkInData.userAgent || null
    };
  },

  sanitizeCheckOutData(checkOutData) {
    return {
      checkOut: checkOutData.checkOut || new Date(),
      location: this.sanitizeLocationData(checkOutData.location),
      device: this.sanitizeDeviceData(checkOutData.device)
    };
  },

  sanitizeBreakData(breakData) {
    return {
      startTime: breakData.startTime || new Date(),
      endTime: breakData.endTime || null,
      reason: breakData.reason || null,
      type: breakData.type || 'regular'
    };
  },

  validateGeoFence(location, geoFenceConfig) {
    if (!geoFenceConfig || !geoFenceConfig.enabled) {
      return { valid: true };
    }

    if (!location || !location.coordinates) {
      return { valid: false, error: 'Location data is required for geo-fence validation' };
    }

    const { latitude, longitude, radius = 100 } = geoFenceConfig;
    const distance = this.calculateDistance(
      location.coordinates.latitude,
      location.coordinates.longitude,
      latitude,
      longitude
    );

    if (distance > radius) {
      return { valid: false, error: 'Location is outside allowed geo-fence radius' };
    }

    return { valid: true };
  },

  extractBrowserInfo(userAgent) {
    if (!userAgent) {
      return {
        browser: 'Unknown',
        version: 'Unknown',
        os: 'Unknown'
      };
    }

    let browser = 'Unknown';
    let version = 'Unknown';
    let os = 'Unknown';

    if (/chrome/i.test(userAgent)) {
      browser = 'Chrome';
      const match = userAgent.match(/chrome\/(\d+\.\d+\.\d+\.\d+)/i);
      if (match) version = match[1];
    } else if (/firefox/i.test(userAgent)) {
      browser = 'Firefox';
      const match = userAgent.match(/firefox\/(\d+\.\d+)/i);
      if (match) version = match[1];
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = 'Safari';
      const match = userAgent.match(/version\/(\d+\.\d+)/i);
      if (match) version = match[1];
    } else if (/edge/i.test(userAgent)) {
      browser = 'Edge';
      const match = userAgent.match(/edge\/(\d+\.\d+\.\d+\.\d+)/i);
      if (match) version = match[1];
    }

    if (/windows/i.test(userAgent)) {
      os = 'Windows';
    } else if (/mac/i.test(userAgent)) {
      os = 'MacOS';
    } else if (/linux/i.test(userAgent)) {
      os = 'Linux';
    } else if (/android/i.test(userAgent)) {
      os = 'Android';
    } else if (/ios/i.test(userAgent)) {
      os = 'iOS';
    }

    return { browser, version, os };
  },

  generateAuditTrail(action, userId, details = {}) {
    return {
      action,
      userId,
      timestamp: new Date(),
      details
    };
  },

  calculateAttendancePercentage(presentDays, totalDays) {
    if (totalDays === 0) return 0;
    return ((presentDays / totalDays) * 100).toFixed(2);
  },

  formatMonthlySummary(summary) {
    return {
      ...summary,
      attendancePercentage: this.calculateAttendancePercentage(summary.presentDays, summary.totalDays),
      averageWorkingHours: summary.totalDays > 0
        ? (summary.totalWorkingMinutes / summary.totalDays / 60).toFixed(2)
        : 0,
      totalWorkingHours: (summary.totalWorkingMinutes / 60).toFixed(2),
      totalOvertimeHours: (summary.totalOvertimeMinutes / 60).toFixed(2)
    };
  }
};

export default AttendanceUtils;
