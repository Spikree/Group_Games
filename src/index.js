import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import connectDb from "./libs/connectToDb.js";

dotenv.config();
const app = express();
app.use(cors());
const port = 2000;

connectDb();

app.get('/', (req, res) => {
  res.send("backend working");
});

app.listen(port, () => {
  console.log(`backend running on port ${port}`);
});
