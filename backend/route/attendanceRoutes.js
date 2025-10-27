import express from "express";
import { createAttendance, fetchAttendance } from "../controller/attendanceController.js";

const router = express.Router();

router.post("/create", createAttendance);
router.get("/get", fetchAttendance);

export default router;
