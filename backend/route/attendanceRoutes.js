import express from "express";
import { createAttendance, fetchAttendance, readFilteredAttendance } from "../controller/attendanceController.js";

const router = express.Router();

router.post("/create", createAttendance);
router.get("/get", fetchAttendance);
router.get("/filter", readFilteredAttendance);

export default router;
