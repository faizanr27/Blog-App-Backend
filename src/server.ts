import express, { Request, Response, NextFunction } from 'express';
const cors = require('cors')
import dotenv from 'dotenv';
// import postRoutes from './routes/post.Routes';
import authRoutes from './routes/auth.Routes';
import cookieParser from "cookie-parser";
import protectedRoutes from './routes/protected.Routes';
import passport from 'passport'
import session from 'express-session';
import connectDb from './db/db';
import MongoStore from 'connect-mongo';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const corsOptions = {

    origin: ['https://dev-blogg.vercel.app','http://localhost:5173'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true

};

app.use(cors(corsOptions));
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.URI!,
            ttl: 14 * 24 * 60 * 60
        })
    })
);
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(cookieParser(process.env.COOKIE_SECRET));;

// Routes
app.use('/', protectedRoutes);
// app.use('/api', postRoutes);
app.use('/api/auth', authRoutes);

// Database Connection
connectDb();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
