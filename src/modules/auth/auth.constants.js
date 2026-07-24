export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CEO: 'CEO',
  HR_MANAGER: 'HR_MANAGER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  EMPLOYEE: 'EMPLOYEE',
  INTERN: 'INTERN'
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING'
};

export const COLLECTION_NAME = 'users';

export const AUTH_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_FETCHED: 'User fetched successfully',
  USERS_FETCHED: 'Users fetched successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET: 'Password reset successful',
  EMAIL_SENT: 'Email sent successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  PASSWORD_MISMATCH: 'Password does not match',
  OLD_PASSWORD_INCORRECT: 'Old password is incorrect',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  ACCOUNT_INACTIVE: 'Account is inactive',
  EMAIL_NOT_VERIFIED: 'Email not verified'
};

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
