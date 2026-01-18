import clientServer from "@/Config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPost = createAsyncThunk(
  "post/getAllPost",

  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_all_posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("body", body);
      formData.append("token", localStorage.getItem("token"));

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return thunkAPI.fulfillWithValue(response.data.post);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/delete",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.post("/delete_post", {
        token: localStorage.getItem("token"),
        postId: postId,
      });

      if (response.status === 200) {
        return thunkAPI.fulfillWithValue({ postId });
      } else {
        return thunkAPI.rejectWithValue("Failed to delete post");
      }
    } catch (err) {
      return thunkAPI.rejectWithValue("Something went wrong!");
    }
  }
);

export const toggleLike = createAsyncThunk(
  "post/toggleLike",
  async ({ postId, token }, thunkAPI) => {
    try {
      const response = await clientServer.post("/increment_post_likes", {
        postId,
        token,
      });
      return thunkAPI.fulfillWithValue({ postId, likes: response.data.likes });
    } catch (err) {
      return thunkAPI.rejectWithValue("Error toggling like");
    }
  }
);

export const addComment = createAsyncThunk(
  "post/addComment",
  async ({ postId, commentBody }, thunkAPI) => {
    try {
      const response = await clientServer.post("/create_comment", {
        token: localStorage.getItem("token"),
        postId,
        commentBody,
      });

      return thunkAPI.fulfillWithValue({
        postId,
        comment: response.data.comment,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue("Error making comment");
    }
  }
);

export const getComments = createAsyncThunk(
  "post/getComment",
  async ({ postId }, thunkAPI) => {
    try {
      const response = await clientServer.get(
        `/get_all_comments?postId=${postId}`
      );

      return thunkAPI.fulfillWithValue({
        postId,
        comments: response.data.comments,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue("Error getting comments");
    }
  }
);