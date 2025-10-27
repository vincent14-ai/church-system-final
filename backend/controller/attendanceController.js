import { setAttendance, getAttendanceByDate, getAttendanceSummaryByDate } from "../service/attendanceService.js";

export async function createAttendance(req, res) {
  try {
    const { member_id, date, status } = req.body;
    const result = await setAttendance(member_id, date, status);
    res.json(result);
  } catch (err) {
    console.error("Error saving attendance:", err);
    res.status(500).json({ error: "Failed to save attendance" });
  }
}

export async function fetchAttendance(req, res) {
  try {
    let { date } = req.query;

    date = date.split("T")[0];

    const records = await getAttendanceByDate(date);
    const summary = await getAttendanceSummaryByDate(date);

    res.json({ records, summary });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Database error" });
  }
}
