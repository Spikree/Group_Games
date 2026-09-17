import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import connectDb from "./libs/connectToDb.js";
import cookieParser from "cookie-parser"

import UserRouter from "./routes/user.route.js"

dotenv.config();
const app = express();
app.use(cors());
const port = 2000;
app.use(express.json());
app.use(cookieParser());

connectDb();

app.get('/', (req, res) => {
  res.send("backend working");
});

app.use("/user", UserRouter);

app.listen(port, () => {
  console.log(`backend running on port ${port}`);
});
