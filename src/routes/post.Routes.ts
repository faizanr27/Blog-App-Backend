import express from 'express';
const router = express.Router();
import {verifyToken} from '../middleware/auth.middleware'
const postController = require('../controllers/post.controller')

router.post('/createpost', verifyToken, postController.createPost)
router.get('/Posts', postController.getAllPost)
router.get('/userPost', verifyToken, postController.getAllUserPost)
router.get('/Post/:id', postController.getSinglePost)

export default router