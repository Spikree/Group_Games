import { Router } from "express";
import { login, logout, register } from "../controller/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import verifyToken from "../middleware/verifyToken.middleware.js";

const router = Router();

router.post("/register", upload.single("profilePicture"), register);
router.post("/login", login);
router.post("/logout",verifyToken, logout);

export default router;
