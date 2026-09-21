import { Router } from "express";
import { acceptJoinRequest, createGroup, DemoteFromAdmin, getJoinRequests, getMyGroups, joinGroup, leaveGroup, makeAdmin, rejectJoinRequest, removeFromGroup, transferOwnership, updateGroupLogo } from "../controller/relation.controller.js";
import verifyToken from "../middleware/verifyToken.middleware.js";

const router = Router();

router.post("/createGroup", verifyToken, createGroup); // tested
router.post("/joinGroup", verifyToken, joinGroup);
router.post("/leaveGroup", verifyToken, leaveGroup);
router.get("/getMyGroups", verifyToken, getMyGroups); // tested

router.get("/getJoinRequests", verifyToken, getJoinRequests);
router.post("/acceptJoinRequest", verifyToken, acceptJoinRequest);
router.post("/rejectJoinRequest", verifyToken, rejectJoinRequest);
router.post("/makeAdmin", verifyToken, makeAdmin);
router.post("/demoteFromAdmin", verifyToken, DemoteFromAdmin);
router.post("/removeFromGroup", verifyToken, removeFromGroup);
router.post("/transferOwnership", verifyToken, transferOwnership);
router.post("/updateGroupLogo", verifyToken, updateGroupLogo);

export default router;
