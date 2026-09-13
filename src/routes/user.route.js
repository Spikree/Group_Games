import { Router } from "express";
import { register } from "../controller/user.controller";
import upload from "../middleware/multer.middleware";

const router = Router();

router.post("/register",upload.single("profilePicture"),register);
