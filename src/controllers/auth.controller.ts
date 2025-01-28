require('dotenv').config();
import { Request, Response,NextFunction } from 'express';
import {User} from '../models/User.model'
import { z } from 'zod';
const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';
import passport from '../config/passport';

const SECRET = process.env.SECRET_KEY as string;
const COOKIE_NAME = "auth_token";
const isProduction = process.env.NODE_ENV === "production";

const inputSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").transform(name => name.trim().toLowerCase()),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
  });

exports.signUp = async (req: Request, res: Response) => {
    const validatedData = inputSchema.parse(req.body);
    console.log("reached here1")
    const {name, email, password} = validatedData;
    try {
        console.log("reached here2")
        const existingUser = await User.findOne({name})
        console.log("reached here3")
        if(existingUser){
            res.status(400).json("user already exists")
        }

        const myEncPassword = await bcrypt.hash(password,10)
        const newUser = new User({name, email, password: myEncPassword})
        console.log("reached here")
        await newUser.save()
       console.log("reached here4")
        const token = jwt.sign(
            {userId: newUser._id},
            SECRET,
            {expiresIn: '30d',}
        )
        console.log("reached here 5")


        const oldToken = req.signedCookies[`${COOKIE_NAME}`];
        if (oldToken) {
            res.clearCookie(`${COOKIE_NAME}`);
        }

        const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        const expires = new Date(Date.now() + expiresInMilliseconds);
        console.log("reached here 6")
        res.cookie(`${COOKIE_NAME}`, token, {
          domain: isProduction ? "dev-blogg.vercel.app" : undefined,
          expires,
          httpOnly: true,
          signed: true,
          secure: isProduction,
          sameSite : isProduction ? "none" : "lax"
      });
      console.log("reached here 7")

      res.status(200).json({message:`${newUser.name} has been successfully logged in.`,id:newUser._id})

    } catch (error) {
        console.log(req.body)
        res.status(500).json({ error: error });
    }
}

exports.login = async (req: Request, res: Response) => {
    try {
        const {name, password} = req.body
        const user = await User.findOne({name})
        if(!user){
            return res.status(400).json({error: "User with this name does not exist"})
        }

        if(!(name && (await bcrypt.compare(password, user.password)))){
            return res.status(400).json('Invalid email or password')
        }

        const token =  jwt.sign(
            {userId: user._id},
            SECRET,
            {expiresIn: '30d'}
        )
        console.log("reached here 1")

        const oldToken = req.signedCookies[`${COOKIE_NAME}`];
        if (oldToken) {
            res.clearCookie(`${COOKIE_NAME}`);
        }
        console.log("reached here 2")


        const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        const expires = new Date(Date.now() + expiresInMilliseconds);

        res.cookie(`${COOKIE_NAME}`, token, {
          domain: isProduction ? "dev-blogg.vercel.app" : undefined,
          expires,
          httpOnly: true,
          signed: true,
          secure: isProduction,
          sameSite : isProduction ? "none" : "lax"
      });
      console.log("reached here 3")

      res.status(200).json({message:`${user.name} has been successfully logged in.`,id:user._id})
      console.log("wadwdwadwaawdwa")

    } catch (error:any) {
        console.log({message:`${error.message}`})
    }
}

exports.verifyUser = async (
    req : Request,
    res : Response,
    next : NextFunction
  ) =>{
    try {
        if(!res.locals.jwtData){
            console.log(res.locals.jwtData)
            return res.status(403).json({message : "Not authorised."})
        }
        console.log("Dwadwad")
        const existingUser = await User.findById(res.locals.jwtData);
        if(!existingUser){
            return res.status(401).json({
                message : "User not registered or Token malfunctioned."
            })
        }

        if(existingUser._id?.toString() != res.locals.jwtData){
            return res.status(401).send("Permissions did not match.");
        }
        console.log("DAdwadwadddd")
        return res.status(200).json({
            message : "User successfully verified.",
            id : existingUser._id,
            username : existingUser.name
        });
    }
    catch (error : any) {
        console.log(`Error in logging in user : ${error.message}`);

        return res.status(500).json({
            message : "Error in verifying in user",
            reason : error.message
        })
    }
  };


//GOOGLE oAUth 2.0
exports.googleCallback = [
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        if (!user) {
          res.status(401).json({ message: 'User not authenticated.' });
          return;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, SECRET as string, { expiresIn: '30d' });

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
        res.redirect('http://dev-blogg.vercel.app');
      } catch (error) {
        console.error('Google callback error:', error);
        res.status(500).json({ message: 'Internal server error.' });
      }
    },
  ];

  exports.githubCallback = [
    passport.authenticate('github', { failureRedirect: '/' }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        if (!user) {
          res.status(401).json({ message: 'User not authenticated.' });
          return;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, SECRET as string, { expiresIn: '30d' });

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
      } catch (error) {
        console.error('Github callback error:', error);
        res.status(500).json({ message: 'Internal server error.' });
      }
    },
  ];




exports.logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const oldToken = req.signedCookies[`${COOKIE_NAME}`];

        if (oldToken) {
            res.clearCookie(`${COOKIE_NAME}`, {
                httpOnly: true,
                signed: true,
                secure: isProduction,
                sameSite : isProduction ? "none" : "lax"
            });
        }

        return res.status(200).json({
            message: "User successfully logged out.",
        });
    } catch (error: any) {
        console.error(`Error in logging out user: ${error.message}`);

        return res.status(500).json({
            message: "Error in logging out user",
            reason: error.message,
        });
    }
};