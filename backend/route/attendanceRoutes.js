import { Router } from "express";
import { readAttendance } from "../controller/attendanceContoller.js";

const router = Router();

// GET /api/attendance
router.get("/", readAttendance);   
router.get("/", readAttendance);   

export default router;
