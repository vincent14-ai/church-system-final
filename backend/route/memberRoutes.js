import { Router } from "express";
import { createMember, readMembers, readMembersForAttendance, deleteMember, getMemberById, updateMember } from "../controller/memberController.js";

const router = Router();

// POST /api/members
router.post("/", createMember);
router.get("/", readMembers);   
router.get("/attendance", readMembersForAttendance);
router.get("/:member_id", getMemberById);
router.put("/:member_id", updateMember);
router.delete("/:member_id", deleteMember);

export default router;
