// Steps for state management using Redux Toolkit
// 1. Submit Action
// 2. Handle action in it's respective slice(reducer)
// 3. Update the store

import AuthReducer from "./Reducers/AuthReducer/index.js";
import PostReducer from "./Reducers/PostReducer/index.js";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: AuthReducer,
    post: PostReducer,
  },
});