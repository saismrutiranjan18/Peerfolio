import {
  getAboutUser,
  getAllUsers,
  getConnectionRequest,
  getMyConnectionRequest,
  loginUser,
  registerUser,
} from "@/Config/Redux/Aciton/AuthAction/index.js";

const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  user: undefined,
  isError: false,
  isLoading: false,
  isSuccess: false,
  loggedIn: false,
  profileFetched: false,
  isTokenThere: false,
  message: "",
  connections: [],
  connectionRequests: [],
  allUsers: [],
  allProfileFetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => initialState,
    handleLoggedInUser: (state) => {
      state.message = "hello";
    },
    emptyMessage: (state) => {
      state.message = "";
    },
    isTokenValidThere: (state, action) => {
      state.isTokenThere = true;
    },
    isTokenNotValidThere: (state, action) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking on the door";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.isError = false;
        state.message = "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          (typeof action.payload === "string"
            ? action.payload
            : action.payload?.message) || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering user";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "Registration successful";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          (typeof action.payload === "string"
            ? action.payload
            : action.payload?.message) || "Registration failed";
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.profileFetched = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.allUsers = action.payload;
        state.allProfileFetched = true;
      })
      .addCase(getConnectionRequest.fulfilled, (state, action) => {
        state.connections = action.payload || [];
      })
      .addCase(getConnectionRequest.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(getMyConnectionRequest.fulfilled, (state, action) => {
        state.connectionRequests = action.payload;
      })
      .addCase(getMyConnectionRequest.rejected, (state, action) => {
        state.message = action.payload;
      });
  },
});

export const {
  emptyMessage,
  reset,
  handleLoggedInUser,
  isTokenNotValidThere,
  isTokenValidThere,
} = authSlice.actions;

export default authSlice.reducer;