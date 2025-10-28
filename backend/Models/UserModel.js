import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "default.jpg",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    token: {
      type: String,
      default: ``,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;