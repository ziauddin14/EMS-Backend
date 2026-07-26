import { ATTENDANCE_STATUS, APPROVAL_STATUS } from './attendance.constants.js';

export const AttendanceHelpers = {
  determineAttendanceStatus(attendance, shift) {
    if (!attendance || !shift) {
      return ATTENDANCE_STATUS.PENDING;
    }

    if (attendance.isHoliday) {
      return ATTENDANCE_STATUS.HOLIDAY;
    }

    if (attendance.isWeekend) {
      return ATTENDANCE_STATUS.WEEKEND;
    }

    if (!attendance.checkIn) {
      return ATTENDANCE_STATUS.ABSENT;
    }

    if (attendance.lateMinutes > shift.lateAfterMinutes) {
      if (attendance.workingMinutes < shift.halfDayMinutes) {
        return ATTENDANCE_STATUS.HALF_DAY;
      }
      return ATTENDANCE_STATUS.LATE;
    }

    if (attendance.workingMinutes < shift.minimumWorkingMinutes) {
      return ATTENDANCE_STATUS.HALF_DAY;
    }

    if (attendance.overtimeMinutes > 0) {
      return ATTENDANCE_STATUS.OVERTIME;
    }

    return ATTENDANCE_STATUS.PRESENT;
  },

  calculateWorkingMinutes(checkIn, checkOut, breakMinutes = 0) {
    if (!checkIn || !checkOut) return 0;

    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime - checkInTime;
    const totalMinutes = Math.floor(diffMs / 60000);

    return Math.max(0, totalMinutes - breakMinutes);
  },

  calculateLateMinutes(checkIn, shiftStartTime, graceMinutes = 0) {
    if (!checkIn || !shiftStartTime) return 0;

    const checkInTime = new Date(checkIn);
    const shiftTime = new Date(shiftStartTime);
    const graceTime = graceMinutes * 60000;

    if (checkInTime <= new Date(shiftTime.getTime() + graceTime)) {
      return 0;
    }

    const diffMs = checkInTime - shiftTime;
    return Math.floor(diffMs / 60000);
  },

  calculateEarlyExitMinutes(checkOut, shiftEndTime) {
    if (!checkOut || !shiftEndTime) return 0;

    const checkOutTime = new Date(checkOut);
    const shiftTime = new Date(shiftEndTime);

    if (checkOutTime >= shiftTime) {
      return 0;
    }

    const diffMs = shiftTime - checkOutTime;
    return Math.floor(diffMs / 60000);
  },

  calculateOvertimeMinutes(checkOut, shiftEndTime, allowOvertime = true) {
    if (!checkOut || !shiftEndTime || !allowOvertime) return 0;

    const checkOutTime = new Date(checkOut);
    const shiftTime = new Date(shiftEndTime);

    if (checkOutTime <= shiftTime) {
      return 0;
    }

    const diffMs = checkOutTime - shiftTime;
    return Math.floor(diffMs / 60000);
  },

  isWithinGeoFence(userLocation, geoFenceConfig) {
    if (!geoFenceConfig || !geoFenceConfig.enabled) {
      return true;
    }

    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return false;
    }

    const { latitude, longitude, radius = 100 } = geoFenceConfig;
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude
    );

    return distance <= radius;
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

  formatTime(date) {
    if (!date) return null;
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  isWeekend(date, weeklyOffDays = [6]) {
    if (!date) return false;
    const day = new Date(date).getDay();
    return weeklyOffDays.includes(day);
  },

  isHoliday(date, holidays = []) {
    if (!date || !holidays.length) return false;
    const checkDate = new Date(date).toDateString();
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date).toDateString();
      return holidayDate === checkDate;
    });
  },

  canRequestAdjustment(attendance, maxCorrectionDays = 7) {
    if (!attendance) return false;

    const attendanceDate = new Date(attendance.attendanceDate);
    const today = new Date();
    const diffDays = Math.floor((today - attendanceDate) / (1000 * 60 * 60 * 24));

    return diffDays <= maxCorrectionDays && attendance.approvalStatus !== APPROVAL_STATUS.APPROVED;
  },

  needsApproval(attendance, policy) {
    if (!attendance || !policy) return false;

    if (attendance.adjustmentRequested) return true;
    if (attendance.isManualEntry && policy.requireManagerApproval) return true;
    if (attendance.lateMinutes > policy.lateAfterMinutes && policy.requireManagerApproval) return true;
    if (attendance.earlyExitMinutes > 30 && policy.requireManagerApproval) return true;
    if (attendance.overtimeMinutes > policy.maximumOvertimeMinutes && policy.requireHRApproval) return true;

    return false;
  },

  getAttendanceSummary(attendances) {
    if (!attendances || attendances.length === 0) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        leave: 0,
        holiday: 0,
        weekend: 0,
        overtime: 0,
        totalWorkingMinutes: 0,
        totalOvertimeMinutes: 0
      };
    }

    return attendances.reduce((summary, attendance) => {
      summary.total++;
      summary.totalWorkingMinutes += attendance.workingMinutes || 0;
      summary.totalOvertimeMinutes += attendance.overtimeMinutes || 0;

      switch (attendance.attendanceStatus) {
        case ATTENDANCE_STATUS.PRESENT:
          summary.present++;
          break;
        case ATTENDANCE_STATUS.ABSENT:
          summary.absent++;
          break;
        case ATTENDANCE_STATUS.LATE:
          summary.late++;
          break;
        case ATTENDANCE_STATUS.HALF_DAY:
          summary.halfDay++;
          break;
        case ATTENDANCE_STATUS.LEAVE:
          summary.leave++;
          break;
        case ATTENDANCE_STATUS.HOLIDAY:
          summary.holiday++;
          break;
        case ATTENDANCE_STATUS.WEEKEND:
          summary.weekend++;
          break;
        case ATTENDANCE_STATUS.OVERTIME:
          summary.overtime++;
          break;
      }

      return summary;
    }, {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      leave: 0,
      holiday: 0,
      weekend: 0,
      overtime: 0,
      totalWorkingMinutes: 0,
      totalOvertimeMinutes: 0
    });
  },

  validateCheckInTime(checkIn, shift) {
    if (!checkIn || !shift) return { valid: true };

    const checkInTime = new Date(checkIn);
    const shiftStartTime = new Date(shift.startTime);
    const shiftEndTime = new Date(shift.endTime);

    if (shift.allowNightShift) {
      return { valid: true };
    }

    if (checkInTime > shiftEndTime && !shift.allowFlexibleCheckIn) {
      return {
        valid: false,
        error: 'Check-in time is after shift end time'
      };
    }

    return { valid: true };
  },

  validateCheckOutTime(checkOut, checkIn, shift) {
    if (!checkOut) return { valid: true };

    const checkOutTime = new Date(checkOut);

    if (checkIn) {
      const checkInTime = new Date(checkIn);
      if (checkOutTime < checkInTime) {
        return {
          valid: false,
          error: 'Check-out time cannot be before check-in time'
        };
      }
    }

    if (shift && !shift.allowFlexibleCheckOut) {
      const shiftStartTime = new Date(shift.startTime);
      if (checkOutTime < shiftStartTime) {
        return {
          valid: false,
          error: 'Check-out time cannot be before shift start time'
        };
      }
    }

    return { valid: true };
  },

  calculateTotalBreakMinutes(breaks) {
    if (!breaks || breaks.length === 0) return 0;

    return breaks.reduce((total, breakRecord) => {
      if (breakRecord.startTime && breakRecord.endTime) {
        const start = new Date(breakRecord.startTime);
        const end = new Date(breakRecord.endTime);
        const diffMs = end - start;
        return total + Math.floor(diffMs / 60000);
      }
      return total;
    }, 0);
  },

  validateBreakStart(attendance) {
    if (!attendance || !attendance.checkIn) {
      return {
        valid: false,
        error: 'Cannot start break before check-in'
      };
    }

    if (attendance.checkOut) {
      return {
        valid: false,
        error: 'Cannot start break after check-out'
      };
    }

    if (attendance.breaks && attendance.breaks.length > 0) {
      const activeBreak = attendance.breaks.find(b => !b.endTime);
      if (activeBreak) {
        return {
          valid: false,
          error: 'Cannot start multiple active breaks'
        };
      }
    }

    return { valid: true };
  },

  validateBreakEnd(attendance) {
    if (!attendance || !attendance.breaks || attendance.breaks.length === 0) {
      return {
        valid: false,
        error: 'No active break found'
      };
    }

    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (!activeBreak) {
      return {
        valid: false,
        error: 'No active break found'
      };
    }

    return { valid: true };
  },

  calculateNetWorkingTime(workingMinutes, breakMinutes) {
    return Math.max(0, workingMinutes - breakMinutes);
  },

  determineRemoteAttendance(location, policy) {
    if (!location || !policy) return false;

    if (location.type === 'remote' || location.type === 'field' || location.type === 'client_site') {
      return policy.allowRemoteAttendance;
    }

    return false;
  },

  determineWorkFromHome(location, policy) {
    if (!location || !policy) return false;

    if (location.type === 'remote' && location.address) {
      return policy.allowRemoteAttendance;
    }

    return false;
  },

  calculateAttendanceMetrics(attendance, shift, policy) {
    if (!attendance || !shift) {
      return {
        workingMinutes: 0,
        workingHours: 0,
        breakMinutes: 0,
        lateMinutes: 0,
        earlyExitMinutes: 0,
        overtimeMinutes: 0,
        netWorkingMinutes: 0,
        attendanceStatus: ATTENDANCE_STATUS.PENDING
      };
    }

    const checkIn = attendance.checkIn ? new Date(attendance.checkIn) : null;
    const checkOut = attendance.checkOut ? new Date(attendance.checkOut) : null;
    const shiftStartTime = shift.startTime ? new Date(shift.startTime) : null;
    const shiftEndTime = shift.endTime ? new Date(shift.endTime) : null;

    const breakMinutes = this.calculateTotalBreakMinutes(attendance.breaks);
    const workingMinutes = this.calculateWorkingMinutes(attendance.checkIn, attendance.checkOut, breakMinutes);
    const lateMinutes = this.calculateLateMinutes(attendance.checkIn, shift.startTime, shift.graceMinutes);
    const earlyExitMinutes = this.calculateEarlyExitMinutes(attendance.checkOut, shift.endTime);
    const overtimeMinutes = this.calculateOvertimeMinutes(attendance.checkOut, shift.endTime, shift.allowOvertime);
    const netWorkingMinutes = this.calculateNetWorkingTime(workingMinutes, breakMinutes);

    const attendanceStatus = this.determineAttendanceStatus(
      {
        ...attendance,
        workingMinutes,
        lateMinutes,
        overtimeMinutes
      },
      shift
    );

    return {
      workingMinutes,
      workingHours: (workingMinutes / 60).toFixed(2),
      breakMinutes,
      lateMinutes,
      earlyExitMinutes,
      overtimeMinutes,
      netWorkingMinutes,
      attendanceStatus
    };
  },

  validateAttendanceDate(date, employee) {
    if (!date || !employee) return { valid: true };

    const attendanceDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (attendanceDate > today) {
      return {
        valid: false,
        error: 'Future attendance records are not allowed'
      };
    }

    if (employee.dateOfJoining) {
      const joiningDate = new Date(employee.dateOfJoining);
      if (attendanceDate < joiningDate) {
        return {
          valid: false,
          error: 'Attendance date cannot be before joining date'
        };
      }
    }

    if (employee.terminationDate) {
      const terminationDate = new Date(employee.terminationDate);
      if (attendanceDate > terminationDate) {
        return {
          valid: false,
          error: 'Attendance date cannot be after termination date'
        };
      }
    }

    return { valid: true };
  },

  canCheckIn(employee, policy) {
    if (!employee || !policy) return false;

    if (!employee.isActive || employee.isDeleted) {
      return false;
    }

    if (employee.status === 'inactive') {
      return false;
    }

    return true;
  },

  canCheckOut(attendance) {
    if (!attendance) return false;

    if (!attendance.checkIn) {
      return false;
    }

    if (attendance.checkOut) {
      return false;
    }

    if (attendance.breaks && attendance.breaks.length > 0) {
      const activeBreak = attendance.breaks.find(b => !b.endTime);
      if (activeBreak) {
        return false;
      }
    }

    return true;
  },

  getBreakDuration(breakRecord) {
    if (!breakRecord || !breakRecord.startTime || !breakRecord.endTime) return 0;

    const start = new Date(breakRecord.startTime);
    const end = new Date(breakRecord.endTime);
    const diffMs = end - start;
    return Math.floor(diffMs / 60000);
  },

  formatBreakSummary(breaks) {
    if (!breaks || breaks.length === 0) {
      return {
        totalBreaks: 0,
        totalBreakMinutes: 0,
        averageBreakMinutes: 0
      };
    }

    const totalBreakMinutes = this.calculateTotalBreakMinutes(breaks);
    const completedBreaks = breaks.filter(b => b.endTime);

    return {
      totalBreaks: breaks.length,
      completedBreaks: completedBreaks.length,
      totalBreakMinutes,
      averageBreakMinutes: completedBreaks.length > 0
        ? Math.round(totalBreakMinutes / completedBreaks.length)
        : 0
    };
  }
};

export default AttendanceHelpers;
