import { getMembers } from "../service/memberService.js"; // your existing function
import { generateMemberReport } from "../service/exportService.js";

export async function exportMembers(req, res) {
  try {
    // Accept filters either from query (GET) or body (POST)
    const filters = req.method === "GET" ? req.query : req.body;

    console.log("Export requested with filters:", filters); // helpful during testing

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
