import { getMembers } from "../service/memberService.js"; // your existing function
import { getFilteredAttendance } from "../service/attendanceService.js";
import { generateMemberReport, generateMemberTemplate, generateAttendanceReport } from "../service/exportService.js";

export async function exportMembers(req, res) {
  try {
    // Accept filters either from query (GET) or body (POST)
    const filters = req.method === "GET" ? req.query : req.body;

    // Pass filters to your existing getMembers function
    const members = await getMembers(filters);

    const buffer = await generateMemberReport(members);

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=members_report.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ message: "Failed to export Excel" });
  }
}

export async function exportAttendance(req, res) {
  try {
    // Get filters from body (POST) or query (GET)
    const filters = req.method === "GET" ? req.query : req.body;

    // Fetch filtered data
    const attendance = await getFilteredAttendance(filters);

    // Generate Excel buffer (pass only the records)
    const buffer = await generateAttendanceReport(attendance.records);

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_report.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ message: "Failed to export Excel" });
  }
}

export async function exportMemberTemplate(req, res) {
  try {
    const buffer = await generateMemberTemplate();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=members_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (error) {
    console.error("Template Export Error:", error);
    res.status(500).json({ message: "Failed to generate Excel template" });
  }
}