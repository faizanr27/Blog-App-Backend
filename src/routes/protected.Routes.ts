import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
const {verifyToken} = require('../middleware/auth.middleware')
require('dotenv').config

router.get('/', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Protected route accessed' });
    });

    export default router;