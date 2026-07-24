import express from 'express';
import authController from './auth.controller.js';
import { authenticate, optionalAuth } from './auth.middleware.js';
import { authorize } from './role.middleware.js';
import { USER_ROLES } from './auth.constants.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/refresh-token', authenticate, authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/verify-email', authController.verifyEmail);

router.get('/me', authenticate, authController.getProfile);
router.patch('/profile', authenticate, authController.updateProfile);
router.delete('/account', authenticate, authController.deleteAccount);

router.get('/users', authenticate, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER), authController.getAllUsers);
router.get('/users/:id', authenticate, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER), authController.getUserById);
router.patch('/users/:id', authenticate, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER), authController.updateUser);
router.delete('/users/:id', authenticate, authorize(USER_ROLES.SUPER_ADMIN), authController.deleteUser);

export default router;
