import Meeting from './meeting.model.js';
import Agenda from './agenda.model.js';
import MeetingMinutes from './meetingMinutes.model.js';
import MeetingAttendance from './meetingAttendance.model.js';
import ActionItem from './actionItem.model.js';

class MeetingIndexes {
  static async createIndexes() {
    try {
      console.log('Creating Meeting Module Indexes...');

      // Meeting Indexes
      await Meeting.collection.createIndexes([
        { key: { meetingCode: 1 }, unique: true },
        { key: { organizer: 1, startTime: -1 } },
        { key: { participants: 1, startTime: -1 } },
        { key: { department: 1, startTime: -1 } },
        { key: { project: 1, startTime: -1 } },
        { key: { startTime: 1, endTime: 1 } },
        { key: { status: 1, startTime: -1 } },
        { key: { type: 1, startTime: -1 } },
        { key: { priority: 1, startTime: -1 } },
        { key: { mode: 1, startTime: -1 } },
        { key: { isDeleted: 1, startTime: -1 } },
        { key: { createdAt: -1 } },
        { key: { updatedAt: -1 } },
        { key: { tags: 1 } },
        { key: { title: 'text', description: 'text' } },
        { key: { startTime: 1, status: 1, isDeleted: 1 } },
        { key: { organizer: 1, status: 1, isDeleted: 1 } },
        { key: { department: 1, status: 1, isDeleted: 1 } }
      ]);

      // Agenda Indexes
      await Agenda.collection.createIndexes([
        { key: { meeting: 1, sequence: 1 } },
        { key: { meeting: 1, status: 1 } },
        { key: { presenter: 1, meeting: -1 } },
        { key: { status: 1, meeting: -1 } },
        { key: { isDeleted: 1, meeting: 1 } },
        { key: { createdAt: -1 } },
        { key: { updatedAt: -1 } },
        { key: { title: 'text', description: 'text' } }
      ]);

      // MeetingMinutes Indexes
      await MeetingMinutes.collection.createIndexes([
        { key: { meeting: 1 }, unique: true },
        { key: { meeting: 1, approvalStatus: 1 } },
        { key: { preparedBy: 1, createdAt: -1 } },
        { key: { approvalStatus: 1, createdAt: -1 } },
        { key: { followUpDate: 1, approvalStatus: 1 } },
        { key: { isDeleted: 1, meeting: 1 } },
        { key: { createdAt: -1 } },
        { key: { updatedAt: -1 } },
        { key: { summary: 'text', discussion: 'text' } }
      ]);

      // MeetingAttendance Indexes
      await MeetingAttendance.collection.createIndexes([
        { key: { meeting: 1, employee: 1 }, unique: true },
        { key: { meeting: 1, checkIn: -1 } },
        { key: { employee: 1, checkIn: -1 } },
        { key: { employee: 1, status: 1 } },
        { key: { meeting: 1, status: 1 } },
        { key: { checkIn: 1, status: 1 } },
        { key: { isDeleted: 1, meeting: 1 } },
        { key: { createdAt: -1 } },
        { key: { updatedAt: -1 } }
      ]);

      // ActionItem Indexes
      await ActionItem.collection.createIndexes([
        { key: { assignedEmployee: 1, dueDate: 1 } },
        { key: { assignedDepartment: 1, dueDate: 1 } },
        { key: { meeting: 1, dueDate: 1 } },
        { key: { minutes: 1, dueDate: 1 } },
        { key: { assignedEmployee: 1, status: 1 } },
        { key: { assignedDepartment: 1, status: 1 } },
        { key: { meeting: 1, status: 1 } },
        { key: { status: 1, priority: 1, dueDate: 1 } },
        { key: { dueDate: 1, status: 1 } },
        { key: { isDeleted: 1, assignedEmployee: 1 } },
        { key: { createdAt: -1 } },
        { key: { updatedAt: -1 } },
        { key: { dueDate: 1 } },
        { key: { completedAt: -1 } },
        { key: { title: 'text', description: 'text' } },
        { key: { assignedEmployee: 1, status: 1, isDeleted: 1 } },
        { key: { assignedDepartment: 1, status: 1, isDeleted: 1 } }
      ]);

      console.log('Meeting Module Indexes created successfully');
    } catch (error) {
      console.error('Error creating Meeting Module Indexes:', error);
      throw error;
    }
  }

  static async dropIndexes() {
    try {
      console.log('Dropping Meeting Module Indexes...');

      await Meeting.collection.dropIndexes();
      await Agenda.collection.dropIndexes();
      await MeetingMinutes.collection.dropIndexes();
      await MeetingAttendance.collection.dropIndexes();
      await ActionItem.collection.dropIndexes();

      console.log('Meeting Module Indexes dropped successfully');
    } catch (error) {
      console.error('Error dropping Meeting Module Indexes:', error);
      throw error;
    }
  }

  static async getIndexStats() {
    try {
      const [meetingStats, agendaStats, minutesStats, attendanceStats, actionItemStats] = await Promise.all([
        Meeting.collection.indexInformation(),
        Agenda.collection.indexInformation(),
        MeetingMinutes.collection.indexInformation(),
        MeetingAttendance.collection.indexInformation(),
        ActionItem.collection.indexInformation()
      ]);

      return {
        meeting: meetingStats,
        agenda: agendaStats,
        minutes: minutesStats,
        attendance: attendanceStats,
        actionItem: actionItemStats
      };
    } catch (error) {
      console.error('Error getting Meeting Module Index Stats:', error);
      throw error;
    }
  }

  static async optimizeIndexes() {
    try {
      console.log('Optimizing Meeting Module Indexes...');

      // Rebuild indexes for better performance
      await Meeting.collection.reIndex();
      await Agenda.collection.reIndex();
      await MeetingMinutes.collection.reIndex();
      await MeetingAttendance.collection.reIndex();
      await ActionItem.collection.reIndex();

      console.log('Meeting Module Indexes optimized successfully');
    } catch (error) {
      console.error('Error optimizing Meeting Module Indexes:', error);
      throw error;
    }
  }

  // Index Usage Analysis
  static async analyzeIndexUsage() {
    try {
      const stats = await this.getIndexStats();
      
      return {
        meeting: {
          totalIndexes: Object.keys(stats.meeting).length,
          indexes: Object.keys(stats.meeting).map(key => ({
            name: key,
            keys: stats.meeting[key].key
          }))
        },
        agenda: {
          totalIndexes: Object.keys(stats.agenda).length,
          indexes: Object.keys(stats.agenda).map(key => ({
            name: key,
            keys: stats.agenda[key].key
          }))
        },
        minutes: {
          totalIndexes: Object.keys(stats.minutes).length,
          indexes: Object.keys(stats.minutes).map(key => ({
            name: key,
            keys: stats.minutes[key].key
          }))
        },
        attendance: {
          totalIndexes: Object.keys(stats.attendance).length,
          indexes: Object.keys(stats.attendance).map(key => ({
            name: key,
            keys: stats.attendance[key].key
          }))
        },
        actionItem: {
          totalIndexes: Object.keys(stats.actionItem).length,
          indexes: Object.keys(stats.actionItem).map(key => ({
            name: key,
            keys: stats.actionItem[key].key
          }))
        }
      };
    } catch (error) {
      console.error('Error analyzing Meeting Module Index Usage:', error);
      throw error;
    }
  }

  // Recommended Indexes for Large Scale
  static getRecommendedIndexes() {
    return {
      meeting: [
        { key: { meetingCode: 1 }, unique: true, description: 'Unique meeting code lookup' },
        { key: { organizer: 1, startTime: -1 }, description: 'Organizer meetings by date' },
        { key: { participants: 1, startTime: -1 }, description: 'Participant meetings by date' },
        { key: { department: 1, startTime: -1 }, description: 'Department meetings by date' },
        { key: { startTime: 1, endTime: 1 }, description: 'Time range queries' },
        { key: { status: 1, startTime: -1 }, description: 'Status-based queries' },
        { key: { isDeleted: 1, startTime: -1 }, description: 'Soft delete filtering' },
        { key: { title: 'text', description: 'text' }, description: 'Full-text search' }
      ],
      agenda: [
        { key: { meeting: 1, sequence: 1 }, description: 'Meeting agenda ordering' },
        { key: { meeting: 1, status: 1 }, description: 'Meeting agenda by status' },
        { key: { presenter: 1, meeting: -1 }, description: 'Presenter agendas' }
      ],
      minutes: [
        { key: { meeting: 1 }, unique: true, description: 'Unique minutes per meeting' },
        { key: { approvalStatus: 1, createdAt: -1 }, description: 'Approval workflow' },
        { key: { preparedBy: 1, createdAt: -1 }, description: 'Preparer history' }
      ],
      attendance: [
        { key: { meeting: 1, employee: 1 }, unique: true, description: 'Unique attendance record' },
        { key: { employee: 1, checkIn: -1 }, description: 'Employee attendance history' },
        { key: { checkIn: 1, status: 1 }, description: 'Attendance by date and status' }
      ],
      actionItem: [
        { key: { assignedEmployee: 1, dueDate: 1 }, description: 'Employee action items by due date' },
        { key: { assignedDepartment: 1, dueDate: 1 }, description: 'Department action items by due date' },
        { key: { status: 1, priority: 1, dueDate: 1 }, description: 'Priority-based queries' },
        { key: { dueDate: 1, status: 1 }, description: 'Overdue detection' }
      ]
    };
  }
}

export default MeetingIndexes;
