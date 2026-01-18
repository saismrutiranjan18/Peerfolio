import {
  getAllPost,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
} from "../../Aciton/PostAction";
const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  posts: [],
  postFetched: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  loggedIn: false,
  postId: "",
  commentsByPost: {},
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: (state) => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
    // 👇 this is NEW: instantly add a post to top of list
    addNewPost: (state, action) => {
      state.posts = [action.payload, ...state.posts];
    },
    // 👇 also allow removing post instantly
    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch All Posts
      .addCase(getAllPost.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching posts...";
      })
      .addCase(getAllPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.posts = action.payload.posts;
        state.postFetched = true;
        state.message = "Posts fetched successfully";
      })
      .addCase(getAllPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          (typeof action.payload === "string"
            ? action.payload
            : action.payload?.message) || "Fetching posts failed";
      })
      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        // push new post to top of feed
        state.posts = [action.payload, ...state.posts];
        state.message = "Post created successfully";
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(
          (p) => p._id !== action.payload.postId
        );
        state.message = "Post deleted successfully";
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likes = likes;
        }
        state.message = "Like added successfully";
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }
        state.commentsByPost[postId].push(comment);
      })
      .addCase(getComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.commentsByPost[postId] = comments;
      });
  },
});

export const { reset, resetPostId, addNewPost, removePost } = postSlice.actions;

export default postSlice.reducer;