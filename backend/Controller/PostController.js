import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";
import Comment from "../models/CommentModel.js";

export const createPost = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
    });

    await post.save();
    const populatedPost = await post.populate(
      "userId",
      "name userName profilePicture"
    );
    return res
      .status(201)
      .json({ message: "Post created successfully", post: populatedPost });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name userName profilePicture");
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { token, postId } = req.body;

    if (!token || !postId) {
      return res
        .status(400)
        .json({ message: "Token and Post ID are required" });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const { token, postId, commentBody } = req.body;

    if (!token || !postId || !commentBody) {
      return res
        .status(400)
        .json({ message: "Token, Post ID, and comment are required" });
    }

    // Validate user
    const user = await User.findOne({ token }).select(
      "_id name userName profilePicture"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create new comment
    const newComment = new Comment({
      userId: user._id,
      postId,
      body: commentBody,
    });

    await newComment.save();

    // ✅ Populate user info in response for frontend display
    const populatedComment = await Comment.findById(newComment._id).populate(
      "userId",
      "name userName profilePicture"
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId })
      .populate("userId", "name userName profilePicture")
      .sort({ _id: -1 });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { token, postId, commentId } = req.body;

    if (!token || !postId || !commentId) {
      return res
        .status(400)
        .json({ message: "Token, Post ID, and Comment ID are required" });
    }

    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    comment.remove();
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const incrementPostLikes = async (req, res) => {
  try {
    const { token, postId } = req.body;

    if (!token || !postId) {
      return res
        .status(400)
        .json({ message: "Token and Post ID are required" });
    }

    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Check if user already liked
    const alreadyLiked = post.likes.includes(user._id);

    if (alreadyLiked) {
      // remove like (unlike)
      post.likes = post.likes.filter(
        (id) => id.toString() !== user._id.toString()
      );
    } else {
      // add like
      post.likes.push(user._id);
    }

    await post.save();

    return res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes, // send updated likes array
    });
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};