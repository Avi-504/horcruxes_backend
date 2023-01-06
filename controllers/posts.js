// This file contains controller(logic) for the posts route

import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    const total = await PostMessage.countDocuments({});
    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex); // -1 -> descending order(oldest to newest)
    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// QUERY -> /posts?page=1 -> req.query -> { page: "1" } -> req.query.page (used when we want to filter data)
// PARAMS -> /posts/123 -> req.params -> { id: "123" } -> req.params.id (used when we want to get a specific resource)

export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostMessage.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  try {
    const title = new RegExp(searchQuery, "i"); // i -> case insensitive/ignore case
    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }], // $or -> or operator find me the posts where the title matches the searchQuery or the tags matches the tags
    }); // $in -> in operator find me the posts where the tags matches the tags in the array
    res.json({ data: posts });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const postBody = req.body;
    const newPost = new PostMessage({
      ...postBody,
      creator: req.userId,
      createdAt: new Date().toISOString(),
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const post = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).send("No post with that id");
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(
      _id,
      { ...post, _id },
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("No post with that id");
    }
    await PostMessage.findByIdAndRemove(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    // check if user is authenticated we have req.userId because of the auth middleware
    if (!req.userId) return res.json({ message: "Unauthenticated" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("No post with that id");
    }
    const post = await PostMessage.findById(id);

    // check if the user has already liked the post
    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
      // like the post
      post.likes.push(req.userId);
    } else {
      // dislike the post
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    if (!req.userId) return res.json({ message: "Unauthenticated" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("No post with that id");
    }
    const post = await PostMessage.findById(id);
    post.comments.push(value);
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
