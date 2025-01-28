"use strict";
// const Post = require('../models/Post.model')
// exports.createPost = async (req,res) => {
//     try {
//         const {title, description} = req.body
//         console.log(title,description)
//         const newpost = new Post({title, description, userId: req.userId})
//         await newpost.save()
//         console.log(newpost)
//         res.status(201).json(newpost);
//     } catch (error) {
//         res.status(500).json({ message: "Server error." });
//     }
// }
// //Get all the post by different users
// exports.getAllPost = async (req,res) => {
//     try {
//         const posts = await Post.find();
//         res.json(posts);
//       } catch (err) {
//         res.status(500).json({ message: "Server error." });
//       }
// }
// exports.getAllUserPost = async (req,res) => {
//     try {
//         const posts = await Post.find({userId: req.userId});
//         res.json(posts);
//       } catch (err) {
//         res.status(500).json({ message: "Server error." });
//       }
// }
// exports.getSinglePost = async (req,res) => {
//     try {
//         const post = await Post.findById(req.params.id)
//         if(!post){
//             return res.status(404).send('post not found')
//         }
//         res.status(201).send(post)
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// }
