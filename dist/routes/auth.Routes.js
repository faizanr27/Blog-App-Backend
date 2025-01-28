"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const passport_1 = __importDefault(require("../config/passport"));
const authController = require('../controllers/auth.controller');
const auth_middleware_1 = require("../middleware/auth.middleware");
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', auth_middleware_1.verifyToken, authController.logout);
router.get('/status', auth_middleware_1.verifyToken, authController.verifyUser);
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', authController.googleCallback);
router.get('/github', passport_1.default.authenticate('github'));
router.get('/github/callback', authController.githubCallback);
exports.default = router;
