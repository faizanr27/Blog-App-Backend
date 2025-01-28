import { Request, Response } from "express";
import Post from "../models/Post.model";


// Create a new post
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    console.log(title, description);
    console.log(res.locals.jwtData)

    if (!res.locals.jwtData) {
      res.status(401).json({ message: "Unauthorized: userId is missing" });
      return;
    }

    const newPost = new Post({ title, description, userId: res.locals.jwtData });
    await newPost.save();

    console.log(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Get all posts by different users
export const getAllPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Get all posts by the logged-in user
export const getAllUserPost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!res.locals.jwtData) {
      res.status(401).json({ message: "Unauthorized: userId is missing" });
      return;
    }

    const posts = await Post.find({ userId: res.locals.jwtData });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// Get a single post by ID
export const getSinglePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
