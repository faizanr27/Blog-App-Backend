import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import passport from '../config/passport';
const authController = require('../controllers/auth.controller')
import {verifyToken} from '../middleware/auth.middleware'

router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', verifyToken, authController.logout)
router.get('/status', verifyToken,  authController.verifyUser)

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback', authController.googleCallback)
router.get(
  '/github',
  passport.authenticate('github')
);
router.get('/github/callback', authController.githubCallback)

export default router