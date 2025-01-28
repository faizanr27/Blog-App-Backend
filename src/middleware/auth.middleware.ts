import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
require('dotenv').config()
import { COOKIE_NAME } from '../utils/constant';

declare global {
  namespace Express {
      interface Request {
          userId?: string;
      }
  }
}

const JWT_SECRET = process.env.SECRET_KEY as string;

export const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
    try {
      const requestAuthorization = req.signedCookies[`${COOKIE_NAME}`];

      if (!requestAuthorization) {
        console.log("No token provided in signed cookies.");
        return res.status(401).json({ message: "No token provided. Incorrect Authentication." });
      }

      const decodedInfo = jwt.verify(requestAuthorization as string, JWT_SECRET as string) as JwtPayload;

      if (!decodedInfo || !decodedInfo.userId) {
        console.log("Token verification failed or userId missing in token.");
        return res.status(401).json({ message: "Incorrect Authentication" });
      }
      console.log(decodedInfo)

      res.locals.jwtData = decodedInfo.userId; // Set userId in res.locals
      console.log("Decoded JWT Data:", res.locals.jwtData);

      return next(); // Proceed to the next middleware
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        console.error("Invalid token:", error.message);
        return res.status(401).json({ message: "Invalid token" });
      } else if (error.name === "TokenExpiredError") {
        console.error("Token has expired:", error.message);
        return res.status(401).json({ message: "Token has expired" });
      } else {
        console.error("Error verifying token:", error.message);
        return res.status(500).json({ message: "Internal server error", reason: error.message });
      }
    }
  };

  export default { verifyToken };