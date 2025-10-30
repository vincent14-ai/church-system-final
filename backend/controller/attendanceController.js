import { setAttendance, getAttendanceByDate, getAttendanceSummaryByDate, getFilteredAttendance } from "../service/attendanceService.js";

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

export async function readFilteredAttendance(req, res) {
  try {
    const filters = {
      ageGroup: req.query.ageGroup || "all",
      memberStatus: req.query.memberStatus || "all",
      dateFrom: req.query.dateFrom || null,
      dateTo: req.query.dateTo || null
    };

    console.log("📥 Filters received:", filters);

    const data = await getFilteredAttendance(filters);
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching filtered attendance:", err);
    res.status(500).json({ error: "Failed to fetch filtered attendance" });
  }
}