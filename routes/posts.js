// This file is responsible for handling all the routes related to posts

import express from "express";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostsBySearch,
  getPost,
  commentPost,
} from "../controllers/posts.js";

import auth from "../middleware/auth.js";

const router = express.Router();

// this order of routes is important because the first route that matches the request will be executed (specific routes first then general)
// the /search route is a specific route so it should be placed before the general routes i.e /:id
// if we place the /:id route before the /search route, the /search route will never be executed because the /:id route will always match the request
router.get("/search", getPostsBySearch);
router.get("/", getPosts);
router.get("/:id", getPost);

// apply the auth middleware to all the routes below
router.post("/", auth, createPost);

router.patch("/:id", auth, updatePost);

router.delete("/:id", auth, deletePost);

router.patch("/:id/likePost", auth, likePost);

router.patch("/:id/commentPost", auth, commentPost);

export default router;
