import { Router } from "express";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementPostLikes,
} from "../Controller/PostController.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/post", upload.single("media"), createPost);
router.get("/get_all_posts", getAllPosts);
router.post("/delete_post", deletePost);
router.post("/create_comment", createComment);
router.get("/get_all_comments", getAllComments);
router.delete("/delete_comments", deleteComment);
router.post("/increment_post_likes", incrementPostLikes);

export default router;