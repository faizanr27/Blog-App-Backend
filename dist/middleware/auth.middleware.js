"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require('dotenv').config();
const constant_1 = require("../utils/constant");
const JWT_SECRET = process.env.SECRET_KEY;
const verifyToken = (req, res, next) => {
    try {
        const requestAuthorization = req.signedCookies[`${constant_1.COOKIE_NAME}`];
        if (!requestAuthorization) {
            console.log("No token provided in signed cookies.");
            return res.status(401).json({ message: "No token provided. Incorrect Authentication." });
        }
        const decodedInfo = jsonwebtoken_1.default.verify(requestAuthorization, JWT_SECRET);
        if (!decodedInfo || !decodedInfo.userId) {
            console.log("Token verification failed or userId missing in token.");
            return res.status(401).json({ message: "Incorrect Authentication" });
        }
        console.log(decodedInfo);
        res.locals.jwtData = decodedInfo.userId; // Set userId in res.locals
        console.log("Decoded JWT Data:", res.locals.jwtData);
        return next(); // Proceed to the next middleware
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            console.error("Invalid token:", error.message);
            return res.status(401).json({ message: "Invalid token" });
        }
        else if (error.name === "TokenExpiredError") {
            console.error("Token has expired:", error.message);
            return res.status(401).json({ message: "Token has expired" });
        }
        else {
            console.error("Error verifying token:", error.message);
            return res.status(500).json({ message: "Internal server error", reason: error.message });
        }
    }
};
exports.verifyToken = verifyToken;
exports.default = { verifyToken: exports.verifyToken };
