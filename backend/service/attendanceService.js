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

export async function getFilteredAttendance(filters) {
  const { ageGroup, status, dateFrom, dateTo } = filters;

  const whereClauses = [];
  const params = [];

  if (ageGroup && ageGroup !== "all") {
    whereClauses.push("m.age_group = ?");
    params.push(ageGroup);
  }

  if (status && status !== "all") {
    whereClauses.push("a.status = ?");
    params.push(status);
  }

  if (dateFrom && dateTo) {
    whereClauses.push("DATE(a.date) BETWEEN ? AND ?");
    params.push(dateFrom, dateTo);
  } else if (dateFrom) {
    whereClauses.push("DATE(a.date) >= ?");
    params.push(dateFrom);
  } else if (dateTo) {
    whereClauses.push("DATE(a.date) <= ?");
    params.push(dateTo);
  }

  const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  // Query attendance joined with member data
  const [records] = await db.query(
    `
    SELECT 
      a.member_id AS id,
      CONCAT(m.first_name, ' ', m.last_name) AS fullName,
      m.age_group AS ageGroup,
      m.member_status AS memberStatus,
      a.date,
      a.status
    FROM attendance a
    JOIN member_data m ON a.member_id = m.member_id
    ${whereSQL}
    ORDER BY a.date DESC
    `,
    params
  );

  // Compute summary counts
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const totalCount = records.length;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return {
    records,
    summary: { presentCount, absentCount, totalCount, rate }
  };
}

