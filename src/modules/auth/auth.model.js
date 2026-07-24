import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { USER_ROLES, USER_STATUS, COLLECTION_NAME } from './auth.constants.js';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    avatar: {
      public_id: {
        type: String,
        default: null
      },
      url: {
        type: String,
        default: null
      }
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.EMPLOYEE
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    },
    passwordChangedAt: {
      type: Date,
      default: null
    },
    refreshToken: {
      type: String,
      select: false
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
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
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

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ email: 1, isDeleted: 1 });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') && !this.isModified('refreshToken')) {
    return next();
  }

  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.passwordChangedAt = new Date();
    }

    if (this.isModified('refreshToken') && this.refreshToken) {
      const salt = await bcrypt.genSalt(10);
      this.refreshToken = await bcrypt.hash(this.refreshToken, salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareRefreshToken = async function(candidateToken) {
  return bcrypt.compare(candidateToken, this.refreshToken);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.statics.findByEmail = function(email) {
  const normalizedEmail = email.toLowerCase().trim();
  return this.findOne({ email: normalizedEmail, isDeleted: false }).select('+password');
};

userSchema.statics.findByIdWithPassword = function(id) {
  return this.findOne({ _id: id, isDeleted: false }).select('+password');
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
