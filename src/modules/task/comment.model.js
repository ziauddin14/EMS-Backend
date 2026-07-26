import mongoose from 'mongoose';

const COLLECTION_NAME = 'comments';

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task is required'],
      index: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    mentionedEmployees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
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

commentSchema.index({ task: 1, isDeleted: 1 });
commentSchema.index({ task: 1, createdAt: -1, isDeleted: 1 });
commentSchema.index({ createdBy: 1, isDeleted: 1 });
commentSchema.index({ parentComment: 1, isDeleted: 1 });

commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

commentSchema.statics.findByTask = function(taskId) {
  return this.find({ task: taskId, isDeleted: false })
    .populate('createdBy', 'firstName lastName')
    .populate('mentionedEmployees', 'firstName lastName employeeId')
    .populate('parentComment', 'content createdBy')
    .sort({ createdAt: -1 });
};

commentSchema.statics.countByTask = function(taskId) {
  return this.countDocuments({ task: taskId, isDeleted: false });
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
