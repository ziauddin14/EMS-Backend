import express from 'express';
import authController from './auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authController.changePassword);
router.post('/verify-email', authController.verifyEmail);

router.get('/profile', authController.getProfile);
router.patch('/profile', authController.updateProfile);
router.delete('/account', authController.deleteAccount);

router.get('/users', authController.getAllUsers);
router.get('/users/:id', authController.getUserById);
router.patch('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);

export default router;
