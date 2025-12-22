import express from "express";
import { exportAttendance, exportMembers, exportMemberTemplate } from "../controller/exportController.js";

const router = express.Router();

router.get("/members/export", exportMembers);   // supports query string params
router.post("/members/export", exportMembers);  // supports JSON filters in body
router.get("/attendance/export", exportAttendance);   // supports query string params
router.post("/attendance/export", exportAttendance);  // supports JSON filters in body
router.get("/members/template", exportMemberTemplate);

export default router;