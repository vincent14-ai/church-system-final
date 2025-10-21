import { Router } from "express";
import { createMember, readMembers, readMembersForAttendance } from "../controller/memberController.js";

const router = Router();

// POST /api/members
router.post("/", createMember);
router.get("/", readMembers);   
router.get("/attendance", readMembersForAttendance);

export default router;
