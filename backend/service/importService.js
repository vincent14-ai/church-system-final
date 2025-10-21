import XLSX from "xlsx";
import fs from "fs";
import { addMember } from "./memberService.js";

export async function importMembersFromExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheet = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { defval: null }
    );

    let importedCount = 0;

    // Helper function to normalize headers
    function normalizeRow(row) {
      return {
        last_name: row.last_name || row.Last_Name || row["Last Name"] || "",
        first_name: row.first_name || row.First_Name || row["First Name"] || "",
        date_of_birth: row.date_of_birth || row.Date_of_Birth || row["DOB"] || "",
        gender: row.gender || row.Gender || "",
        marital_status: row.marital_status || row.Marital_Status || row["Marital Status"] || "",
        age_group: row.age_group || row.Age_Group || row["Age Group"] || "",
        address: row.address || row.Address || "",
        contact_number: row.contact_number || row.Contact_No || row["Contact No."] || "",

        // Split these two distinct fields correctly:
        prev_church_attendee: row.prev_church_attendee || row.Prev_Church_Attendee || row["Previous Church Attendee?"] || "",
        prev_church: row.prev_church || row.Prev_Church || row["Previous Church Name"] || "",

        invited_by: row.invited_by || row.Invited_By || row["Invited By"] || "",
        date_attended: row.date_attended || row.Date_Attended || row["Date Attendded"] || "",
        attending_cell_group: row.attending_cell_group || row.Attending_Cell_Group || row["Attending Cellgroup?"] || "",
        cell_leader_name: row.cell_leader_name || row.Cellgroup_Leader || row["Cellgroup Leader"] || "",
        church_ministry: row.church_ministry || row.Church_Ministry || row["Ministry"] || "",
        consolidation: row.consolidation || row.Consolidation || row["Consolidation"] || "",
        reason: row.reason || row.Reason || row["Reason"] || "",
        water_baptized: row.water_baptized || row.Water_Baptized || row["Water Baptized"] || "",
        willing_training: row.willing_training || row.Willing_Training || row["Willing to Train?"] || "",
        member_status: row.member_status || row.Member_Status || row["Member Status"] || "",

        // Parse possible complex fields
        spiritual_trainings: parseField(row.Trainings || row.trainings),
        household_members: parseField(row.Households || row.households),
      };
    }


    for (const rawRow of sheet) {
      try {
        const row = normalizeRow(rawRow);
        console.log("Importing:", row.first_name, row.last_name);

        await addMember(row);
        importedCount++;
      } catch (err) {
        console.error("Row import failed:", err.message);
      }
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: `Successfully imported ${importedCount} members` });

  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ message: "Failed to import Excel file", error: error.message });
  }
}

// Helper to parse possible JSON fields
function parseField(field) {
  if (!field) return null;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  }
  return field;
}
