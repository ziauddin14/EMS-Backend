import mongoose from 'mongoose';

const COLLECTION_NAME = 'checklists';

const checklistSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Checklist title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: null
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    order: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

checklistSchema.index({ task: 1, isDeleted: 1 });
checklistSchema.index({ task: 1, isCompleted: 1, isDeleted: 1 });
checklistSchema.index({ isDeleted: 1, order: 1 });

checklistSchema.pre('save', function(next) {
  if (this.isModified('isCompleted') && this.isCompleted) {
    this.completedAt = new Date();
  }
  next();
});

checklistSchema.statics.findByTask = function(taskId) {
  return this.find({ task: taskId, isDeleted: false }).sort({ order: 1 });
};

checklistSchema.statics.countByTask = function(taskId) {
  return this.countDocuments({ task: taskId, isDeleted: false });
};

checklistSchema.statics.countCompletedByTask = function(taskId) {
  return this.countDocuments({ task: taskId, isCompleted: true, isDeleted: false });
};

const Checklist = mongoose.model('Checklist', checklistSchema);

export default Checklist;
