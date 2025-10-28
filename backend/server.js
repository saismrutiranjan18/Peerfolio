import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import postRoutes from "./routes/PostRoute.js";
import userRoutes from "./routes/UserRoute.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(postRoutes);
app.use(userRoutes);

const URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 8000;

main()
  .then(() => {
    console.log("Connection Successful!");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(URL);
}

app.get("/test", (req, res) => {
  res.json("All set");
});

app.listen(PORT, () => {
  console.log(`Listening to port : ${PORT}`);
});