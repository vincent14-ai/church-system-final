import { getAttendance } from "../service/attendanceService.js";

export async function readAttendance(req, res) {
  try {
    const attendance = await getAttendance();
    res.json(attendance);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
}