import db from "../config/db.js";

export async function getAttendance() {
    try {
    const [rows] = await db.query("SELECT member_id AS id, CONCAT(first_name, ' ', last_name) AS fullName, age_group FROM member_data");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Database error" });
  }
}