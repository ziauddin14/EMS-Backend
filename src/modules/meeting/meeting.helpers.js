import { MEETING_STATUS, MEETING_PRIORITY, ATTENDANCE_STATUS, ACTION_ITEM_STATUS, ACTION_ITEM_PRIORITY } from './meeting.constants.js';

// Meeting Helpers
export const meetingHelpers = {
  // Check if meeting can be modified
  canModifyMeeting(meeting) {
    return meeting.status !== MEETING_STATUS.COMPLETED && meeting.status !== MEETING_STATUS.CANCELLED;
  },

  // Check if meeting can be started
  canStartMeeting(meeting) {
    return meeting.status === MEETING_STATUS.SCHEDULED;
  },

  // Check if meeting can be completed
  canCompleteMeeting(meeting) {
    return meeting.status === MEETING_STATUS.IN_PROGRESS;
  },

  // Check if meeting can be cancelled
  canCancelMeeting(meeting) {
    return meeting.status !== MEETING_STATUS.COMPLETED && meeting.status !== MEETING_STATUS.CANCELLED;
  },

  // Get meeting status color
  getMeetingStatusColor(status) {
    const colors = {
      [MEETING_STATUS.DRAFT]: '#9ca3af',
      [MEETING_STATUS.SCHEDULED]: '#3b82f6',
      [MEETING_STATUS.IN_PROGRESS]: '#f59e0b',
      [MEETING_STATUS.COMPLETED]: '#10b981',
      [MEETING_STATUS.CANCELLED]: '#ef4444',
      [MEETING_STATUS.POSTPONED]: '#8b5cf6',
      [MEETING_STATUS.NO_SHOW]: '#6b7280'
    };
    return colors[status] || '#9ca3af';
  },

  // Get meeting priority color
  getMeetingPriorityColor(priority) {
    const colors = {
      [MEETING_PRIORITY.LOW]: '#10b981',
      [MEETING_PRIORITY.MEDIUM]: '#f59e0b',
      [MEETING_PRIORITY.HIGH]: '#ef4444',
      [MEETING_PRIORITY.URGENT]: '#7c2d12'
    };
    return colors[priority] || '#9ca3af';
  },

  // Calculate meeting duration in hours
  calculateDurationInHours(minutes) {
    return (minutes / 60).toFixed(1);
  },

  // Format meeting time
  formatMeetingTime(date, timezone = 'UTC') {
    return new Date(date).toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Format meeting date
  formatMeetingDate(date, timezone = 'UTC') {
    return new Date(date).toLocaleDateString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format meeting datetime
  formatMeetingDateTime(date, timezone = 'UTC') {
    return new Date(date).toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Check if meeting is upcoming
  isMeetingUpcoming(meeting) {
    return new Date(meeting.startTime) > new Date() && meeting.status === MEETING_STATUS.SCHEDULED;
  },

  // Check if meeting is in progress
  isMeetingInProgress(meeting) {
    const now = new Date();
    return now >= new Date(meeting.startTime) && now <= new Date(meeting.endTime) && meeting.status === MEETING_STATUS.IN_PROGRESS;
  },

  // Check if meeting is past
  isMeetingPast(meeting) {
    return new Date(meeting.endTime) < new Date();
  },

  // Check if meeting is overdue
  isMeetingOverdue(meeting) {
    return new Date(meeting.endTime) < new Date() && meeting.status !== MEETING_STATUS.COMPLETED;
  },

  // Get meeting time remaining
  getMeetingTimeRemaining(meeting) {
    const now = new Date();
    const endTime = new Date(meeting.endTime);
    const remaining = endTime - now;
    
    if (remaining <= 0) return '0 minutes';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  // Get meeting time elapsed
  getMeetingTimeElapsed(meeting) {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const elapsed = now - startTime;
    
    if (elapsed <= 0) return '0 minutes';
    
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  // Validate meeting time conflict
  hasTimeConflict(meeting1, meeting2) {
    const start1 = new Date(meeting1.startTime);
    const end1 = new Date(meeting1.endTime);
    const start2 = new Date(meeting2.startTime);
    const end2 = new Date(meeting2.endTime);
    
    return (start1 < end2) && (end1 > start2);
  },

  // Get meeting participants count
  getParticipantsCount(meeting) {
    return meeting.participants ? meeting.participants.length : 0;
  },

  // Check if employee is participant
  isParticipant(meeting, employeeId) {
    return meeting.participants && meeting.participants.includes(employeeId);
  },

  // Check if employee is organizer
  isOrganizer(meeting, employeeId) {
    return meeting.organizer && meeting.organizer.toString() === employeeId.toString();
  },

  // Check if employee is host
  isHost(meeting, employeeId) {
    return meeting.host && meeting.host.toString() === employeeId.toString();
  },

  // Get meeting role for employee
  getMeetingRole(meeting, employeeId) {
    if (this.isOrganizer(meeting, employeeId)) return 'organizer';
    if (this.isHost(meeting, employeeId)) return 'host';
    if (this.isParticipant(meeting, employeeId)) return 'participant';
    return null;
  }
};

// Agenda Helpers
export const agendaHelpers = {
  // Calculate total estimated time for agenda
  calculateTotalEstimatedTime(agendas) {
    return agendas.reduce((total, agenda) => total + (agenda.estimatedTime || 0), 0);
  },

  // Get agenda completion percentage
  getAgendaCompletionPercentage(agendas) {
    if (!agendas || agendas.length === 0) return 0;
    const completed = agendas.filter(a => a.status === 'completed').length;
    return Math.round((completed / agendas.length) * 100);
  },

  // Get current agenda item
  getCurrentAgenda(agendas) {
    return agendas.find(a => a.status === 'in_progress') || null;
  },

  // Get next agenda item
  getNextAgenda(agendas) {
    const currentIndex = agendas.findIndex(a => a.status === 'in_progress');
    if (currentIndex === -1) {
      return agendas.find(a => a.status === 'approved') || null;
    }
    return agendas[currentIndex + 1] || null;
  },

  // Check if agenda can be modified
  canModifyAgenda(agenda) {
    return agenda.status !== 'completed' && agenda.status !== 'cancelled';
  },

  // Sort agendas by sequence
  sortAgendasBySequence(agendas) {
    return [...agendas].sort((a, b) => a.sequence - b.sequence);
  }
};

// Attendance Helpers
export const attendanceHelpers = {
  // Get attendance status color
  getAttendanceStatusColor(status) {
    const colors = {
      [ATTENDANCE_STATUS.PRESENT]: '#10b981',
      [ATTENDANCE_STATUS.ABSENT]: '#ef4444',
      [ATTENDANCE_STATUS.LATE]: '#f59e0b',
      [ATTENDANCE_STATUS.EXCUSED]: '#3b82f6',
      [ATTENDANCE_STATUS.NO_SHOW]: '#6b7280'
    };
    return colors[status] || '#9ca3af';
  },

  // Calculate attendance rate
  calculateAttendanceRate(attendances) {
    if (!attendances || attendances.length === 0) return 0;
    const present = attendances.filter(a => a.status === ATTENDANCE_STATUS.PRESENT || a.status === ATTENDANCE_STATUS.LATE).length;
    return Math.round((present / attendances.length) * 100);
  },

  // Calculate average participation score
  calculateAverageParticipationScore(attendances) {
    if (!attendances || attendances.length === 0) return 0;
    const total = attendances.reduce((sum, a) => sum + (a.participationScore || 0), 0);
    return Math.round(total / attendances.length);
  },

  // Get attendance summary
  getAttendanceSummary(attendances) {
    if (!attendances || attendances.length === 0) {
      return { present: 0, absent: 0, late: 0, excused: 0, noShow: 0, total: 0 };
    }

    return {
      present: attendances.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
      absent: attendances.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
      late: attendances.filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
      excused: attendances.filter(a => a.status === ATTENDANCE_STATUS.EXCUSED).length,
      noShow: attendances.filter(a => a.status === ATTENDANCE_STATUS.NO_SHOW).length,
      total: attendances.length
    };
  },

  // Check if attendance can be modified
  canModifyAttendance(attendance) {
    return attendance.status !== ATTENDANCE_STATUS.PRESENT && attendance.status !== ATTENDANCE_STATUS.ABSENT;
  },

  // Get late attendance threshold
  getLateThreshold(meeting) {
    return new Date(meeting.startTime.getTime() + 5 * 60 * 1000); // 5 minutes
  },

  // Check if check-in is late
  isLateCheckIn(checkInTime, meetingStartTime) {
    const threshold = new Date(meetingStartTime.getTime() + 5 * 60 * 1000);
    return checkInTime > threshold;
  },

  // Calculate late minutes
  calculateLateMinutes(checkInTime, meetingStartTime) {
    if (checkInTime <= meetingStartTime) return 0;
    return Math.round((checkInTime - meetingStartTime) / (1000 * 60));
  },

  // Check if check-out is early
  isEarlyCheckOut(checkOutTime, meetingEndTime) {
    const threshold = new Date(meetingEndTime.getTime() - 5 * 60 * 1000);
    return checkOutTime < threshold;
  }
};

// Action Item Helpers
export const actionItemHelpers = {
  // Get action item status color
  getActionItemStatusColor(status) {
    const colors = {
      [ACTION_ITEM_STATUS.NOT_STARTED]: '#9ca3af',
      [ACTION_ITEM_STATUS.IN_PROGRESS]: '#3b82f6',
      [ACTION_ITEM_STATUS.COMPLETED]: '#10b981',
      [ACTION_ITEM_STATUS.ON_HOLD]: '#f59e0b',
      [ACTION_ITEM_STATUS.CANCELLED]: '#ef4444',
      [ACTION_ITEM_STATUS.OVERDUE]: '#7c2d12'
    };
    return colors[status] || '#9ca3af';
  },

  // Get action item priority color
  getActionItemPriorityColor(priority) {
    const colors = {
      [ACTION_ITEM_PRIORITY.LOW]: '#10b981',
      [ACTION_ITEM_PRIORITY.MEDIUM]: '#f59e0b',
      [ACTION_ITEM_PRIORITY.HIGH]: '#ef4444',
      [ACTION_ITEM_PRIORITY.CRITICAL]: '#7c2d12'
    };
    return colors[priority] || '#9ca3af';
  },

  // Calculate completion percentage
  calculateCompletionPercentage(actionItems) {
    if (!actionItems || actionItems.length === 0) return 0;
    const total = actionItems.reduce((sum, item) => sum + (item.completionPercentage || 0), 0);
    return Math.round(total / actionItems.length);
  },

  // Get action item summary
  getActionItemSummary(actionItems) {
    if (!actionItems || actionItems.length === 0) {
      return { notStarted: 0, inProgress: 0, completed: 0, onHold: 0, cancelled: 0, overdue: 0, total: 0 };
    }

    return {
      notStarted: actionItems.filter(a => a.status === ACTION_ITEM_STATUS.NOT_STARTED).length,
      inProgress: actionItems.filter(a => a.status === ACTION_ITEM_STATUS.IN_PROGRESS).length,
      completed: actionItems.filter(a => a.status === ACTION_ITEM_STATUS.COMPLETED).length,
      onHold: actionItems.filter(a => a.status === ACTION_ITEM_STATUS.ON_HOLD).length,
      cancelled: actionItems.filter(a => a.status === ACTION_ITEM_STATUS.CANCELLED).length,
      overdue: actionItems.filter(a => a.status === ACTION_ITEM_STATUS.OVERDUE).length,
      total: actionItems.length
    };
  },

  // Check if action item can be modified
  canModifyActionItem(actionItem) {
    return actionItem.status !== ACTION_ITEM_STATUS.COMPLETED && actionItem.status !== ACTION_ITEM_STATUS.CANCELLED;
  },

  // Check if action item is overdue
  isActionItemOverdue(actionItem) {
    return new Date(actionItem.dueDate) < new Date() && actionItem.status !== ACTION_ITEM_STATUS.COMPLETED;
  },

  // Get days until due
  getDaysUntilDue(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Get due date status
  getDueDateStatus(dueDate) {
    const days = this.getDaysUntilDue(dueDate);
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days <= 7) return 'this week';
    return 'future';
  },

  // Sort action items by priority
  sortByPriority(actionItems) {
    const priorityOrder = {
      [ACTION_ITEM_PRIORITY.CRITICAL]: 0,
      [ACTION_ITEM_PRIORITY.HIGH]: 1,
      [ACTION_ITEM_PRIORITY.MEDIUM]: 2,
      [ACTION_ITEM_PRIORITY.LOW]: 3
    };
    return [...actionItems].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  },

  // Sort action items by due date
  sortByDueDate(actionItems) {
    return [...actionItems].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
};

// Minutes Helpers
export const minutesHelpers = {
  // Check if minutes can be modified
  canModifyMinutes(minutes) {
    return minutes.approvalStatus !== 'approved';
  },

  // Check if minutes can be approved
  canApproveMinutes(minutes) {
    return minutes.approvalStatus === 'pending_review' || minutes.approvalStatus === 'draft';
  },

  // Get approval status color
  getApprovalStatusColor(status) {
    const colors = {
      draft: '#9ca3af',
      pending_review: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#9ca3af';
  },

  // Count decisions
  countDecisions(minutes) {
    return minutes.decisions ? minutes.decisions.length : 0;
  },

  // Count risks
  countRisks(minutes) {
    return minutes.risks ? minutes.risks.length : 0;
  },

  // Count action items
  countActionItems(minutes) {
    return minutes.actionItems ? minutes.actionItems.length : 0;
  }
};

// Export all helpers
export const helpers = {
  meeting: meetingHelpers,
  agenda: agendaHelpers,
  attendance: attendanceHelpers,
  actionItem: actionItemHelpers,
  minutes: minutesHelpers
};

export default helpers;
