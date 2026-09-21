import { Router } from "express";
import { checkAuth, login, logout, register } from "../controller/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import verifyToken from "../middleware/verifyToken.middleware.js";

const router = Router();

router.post("/register", upload.single("profilePicture"), register); // tested
router.post("/login", login); // tested
router.post("/logout", verifyToken, logout); // tested
router.post("/checkAuth", verifyToken, checkAuth); // tested

export default router;
