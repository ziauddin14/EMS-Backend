import mongoose from 'mongoose';

const COLLECTION_NAME = 'employee_lifecycle_events';

const lifecycleEventSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    previousStage: {
      type: String,
      default: null
    },
    newStage: {
      type: String,
      required: [true, 'New stage is required']
    },
    eventType: {
      type: String,
      enum: ['confirm', 'probation_start', 'probation_complete', 'promote', 'transfer', 'suspend', 'resume', 'resign', 'notice_start', 'exit_complete', 'terminate', 'rehire'],
      required: [true, 'Event type is required']
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Changed by is required'],
      index: true
    },
    reason: {
      type: String,
      trim: true,
      default: null
    },
    remarks: {
      type: String,
      trim: true,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

lifecycleEventSchema.index({ employee: 1, effectiveDate: -1 });
lifecycleEventSchema.index({ eventType: 1, effectiveDate: -1 });
lifecycleEventSchema.index({ newStage: 1, effectiveDate: -1 });
lifecycleEventSchema.index({ changedBy: 1, effectiveDate: -1 });
lifecycleEventSchema.index({ effectiveDate: -1 });

lifecycleEventSchema.virtual('stageTransition').get(function() {
  return {
    from: this.previousStage,
    to: this.newStage
  };
});

lifecycleEventSchema.methods.isPromotion = function() {
  return this.eventType === 'promote';
};

lifecycleEventSchema.methods.isTermination = function() {
  return this.eventType === 'terminate';
};

lifecycleEventSchema.methods.isResignation = function() {
  return this.eventType === 'resign';
};

lifecycleEventSchema.methods.isTransfer = function() {
  return this.eventType === 'transfer';
};

lifecycleEventSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employee: employeeId }).sort({ effectiveDate: -1 });
};

lifecycleEventSchema.statics.findByEventType = function(eventType) {
  return this.find({ eventType }).sort({ effectiveDate: -1 });
};

lifecycleEventSchema.statics.findByStage = function(stage) {
  return this.find({ newStage: stage }).sort({ effectiveDate: -1 });
};

lifecycleEventSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    effectiveDate: { $gte: startDate, $lte: endDate }
  }).sort({ effectiveDate: -1 });
};

lifecycleEventSchema.statics.countByEventType = function(eventType) {
  return this.countDocuments({ eventType });
};

lifecycleEventSchema.statics.countByStage = function(stage) {
  return this.countDocuments({ newStage: stage });
};

lifecycleEventSchema.query.byEmployee = function(employeeId) {
  return this.where({ employee: employeeId });
};

lifecycleEventSchema.query.byEventType = function(eventType) {
  return this.where({ eventType });
};

lifecycleEventSchema.query.byStage = function(stage) {
  return this.where({ newStage: stage });
};

lifecycleEventSchema.methods.toJSON = function() {
  const event = this.toObject();
  delete event.__v;
  return event;
};

const EmployeeLifecycle = mongoose.model('EmployeeLifecycle', lifecycleEventSchema);

export default EmployeeLifecycle;
