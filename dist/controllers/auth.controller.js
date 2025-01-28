"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const User_model_1 = require("../models/User.model");
const zod_1 = require("zod");
const bcrypt = require('bcryptjs');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("../config/passport"));
const SECRET = process.env.SECRET_KEY;
const COOKIE_NAME = "auth_token";
const isProduction = process.env.NODE_ENV === "production";
const inputSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters").transform(name => name.trim().toLowerCase()),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters")
});
exports.signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = inputSchema.parse(req.body);
    console.log("reached here1");
    const { name, email, password } = validatedData;
    try {
        console.log("reached here2");
        const existingUser = yield User_model_1.User.findOne({ name });
        console.log("reached here3");
        if (existingUser) {
            res.status(400).json("user already exists");
        }
        const myEncPassword = yield bcrypt.hash(password, 10);
        const newUser = new User_model_1.User({ name, email, password: myEncPassword });
        console.log("reached here");
        yield newUser.save();
        console.log("reached here4");
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, SECRET, { expiresIn: '30d', });
        console.log("reached here 5");
        const oldToken = req.signedCookies[`${COOKIE_NAME}`];
        if (oldToken) {
            res.clearCookie(`${COOKIE_NAME}`);
        }
        const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        const expires = new Date(Date.now() + expiresInMilliseconds);
        console.log("reached here 6");
        res.cookie(`${COOKIE_NAME}`, token, {
            domain: isProduction ? "dev-blogg.vercel.app" : undefined,
            expires,
            httpOnly: true,
            signed: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        console.log("reached here 7");
        res.status(200).json({ message: `${newUser.name} has been successfully logged in.`, id: newUser._id });
    }
    catch (error) {
        console.log(req.body);
        res.status(500).json({ error: error });
    }
});
exports.login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password } = req.body;
        const user = yield User_model_1.User.findOne({ name });
        if (!user) {
            return res.status(400).json({ error: "User with this name does not exist" });
        }
        if (!(name && (yield bcrypt.compare(password, user.password)))) {
            return res.status(400).json('Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, SECRET, { expiresIn: '30d' });
        console.log("reached here 1");
        const oldToken = req.signedCookies[`${COOKIE_NAME}`];
        if (oldToken) {
            res.clearCookie(`${COOKIE_NAME}`);
        }
        console.log("reached here 2");
        const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        const expires = new Date(Date.now() + expiresInMilliseconds);
        res.cookie(`${COOKIE_NAME}`, token, {
            domain: isProduction ? "dev-blogg.vercel.app" : undefined,
            expires,
            httpOnly: true,
            signed: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        console.log("reached here 3");
        res.status(200).json({ message: `${user.name} has been successfully logged in.`, id: user._id });
        console.log("wadwdwadwaawdwa");
    }
    catch (error) {
        console.log({ message: `${error.message}` });
    }
});
exports.verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!res.locals.jwtData) {
            console.log(res.locals.jwtData);
            return res.status(403).json({ message: "Not authorised." });
        }
        console.log("Dwadwad");
        const existingUser = yield User_model_1.User.findById(res.locals.jwtData);
        if (!existingUser) {
            return res.status(401).json({
                message: "User not registered or Token malfunctioned."
            });
        }
        if (((_a = existingUser._id) === null || _a === void 0 ? void 0 : _a.toString()) != res.locals.jwtData) {
            return res.status(401).send("Permissions did not match.");
        }
        console.log("DAdwadwadddd");
        return res.status(200).json({
            message: "User successfully verified.",
            id: existingUser._id,
            username: existingUser.name
        });
    }
    catch (error) {
        console.log(`Error in logging in user : ${error.message}`);
        return res.status(500).json({
            message: "Error in verifying in user",
            reason: error.message
        });
    }
});
//GOOGLE oAUth 2.0
exports.googleCallback = [
    passport_1.default.authenticate('google', { failureRedirect: '/' }),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: 'User not authenticated.' });
                return;
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, SECRET, { expiresIn: '30d' });
            // Clear old token if it exists
            const oldToken = req.signedCookies[`${COOKIE_NAME}`];
            if (oldToken) {
                res.clearCookie(`${COOKIE_NAME}`);
            }
            // Set cookie expiration and cookie itself
            const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days
            const expires = new Date(Date.now() + expiresInMilliseconds);
            res.cookie(`${COOKIE_NAME}`, token, {
                domain: isProduction ? "dev-blogg.vercel.app" : undefined,
                expires,
                httpOnly: true,
                signed: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
            });
            console.log('Successfully authenticated, redirecting...');
            // res.redirect('http://localhost:5173/');
            res.redirect('https://dev-blogg.vercel.app/');
        }
        catch (error) {
            console.error('Google callback error:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }),
];
exports.githubCallback = [
    passport_1.default.authenticate('github', { failureRedirect: '/' }),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: 'User not authenticated.' });
                return;
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, SECRET, { expiresIn: '30d' });
            // Clear old token if it exists
            const oldToken = req.signedCookies[`${COOKIE_NAME}`];
            if (oldToken) {
                res.clearCookie(`${COOKIE_NAME}`);
            }
            // Set cookie expiration and cookie itself
            const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days
            const expires = new Date(Date.now() + expiresInMilliseconds);
            res.cookie(`${COOKIE_NAME}`, token, {
                domain: isProduction ? "dev-blogg.vercel.app" : undefined,
                expires,
                httpOnly: true,
                signed: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
            });
            console.log('Successfully authenticated, redirecting...');
            // res.redirect('http://localhost:5173/dashboard');
            res.redirect('https://dev-blogg.vercel.app');
        }
        catch (error) {
            console.error('Github callback error:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }),
];
exports.logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const oldToken = req.signedCookies[`${COOKIE_NAME}`];
        if (oldToken) {
            res.clearCookie(`${COOKIE_NAME}`, {
                httpOnly: true,
                signed: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax"
            });
        }
        return res.status(200).json({
            message: "User successfully logged out.",
        });
    }
    catch (error) {
        console.error(`Error in logging out user: ${error.message}`);
        return res.status(500).json({
            message: "Error in logging out user",
            reason: error.message,
        });
    }
});
