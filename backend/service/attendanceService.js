import db from "../config/db.js";
import { normalizeToLocalDate } from "../utils/date.js";

export async function setAttendance(member_id, date, status) {
  try {
    const [existing] = await db.query(
      "SELECT * FROM attendance WHERE member_id = ? AND date = ?",
      [member_id, date]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE attendance SET status = ? WHERE member_id = ? AND date = ?",
        [status, member_id, date]
      );
    } else {
      await db.query(
        "INSERT INTO attendance (member_id, date, status) VALUES (?, ?, ?)",
        [member_id, date, status]
      );
    }

    return { success: true, message: "Attendance saved." };
  } catch (err) {
    console.error("Error saving attendance:", err);
    throw err;
  }
}

export async function getAttendanceByDate(date) {
  // Normalize to local date only (YYYY-MM-DD)
  const normalizedDate = normalizeToLocalDate(date);
  console.log("Normalized date for record query:", normalizedDate);

  const [records] = await db.query(
    `
    SELECT 
      a.member_id AS id,
      CONCAT(m.first_name, ' ', m.last_name) AS fullName,
      m.age_group AS ageGroup,
      a.date,
      a.status
    FROM attendance a
    JOIN member_data m ON a.member_id = m.member_id
    WHERE DATE(a.date) = ?
    ORDER BY m.last_name, m.first_name
    `,
    [normalizedDate]
  );

  return records;
}

export async function getAttendanceSummaryByDate(date) {
  const normalizedDate = normalizeToLocalDate(date);
  console.log("Normalized date for summary query:", normalizedDate);

  const [rows] = await db.query(
    `
    SELECT 
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS presentCount,
      SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absentCount,
      COUNT(*) AS totalCount
    FROM attendance a
    WHERE DATE(a.date) = ?
    `,
    [normalizedDate]
  );

  return rows[0];
}
