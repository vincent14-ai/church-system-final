import XLSX from "xlsx";
import fs from "fs";
import { addMember } from "./memberService.js";

export async function importMembersFromExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });

    let importedCount = 0;

    // --- Utility functions ---
    const normalizeBoolean = (value) => {
      if (typeof value === "number") return value ? 1 : 0;
      if (typeof value === "string") {
        return value.trim().toLowerCase() === "yes" ? 1 : 0;
      }
      return 0;
    };

    const formatDate = (value) => {
      if (!value) return null;

      if (value instanceof Date) {
        return value.toISOString().split("T")[0];
      }

      if (typeof value === "string") {
        const [day, month, year] = value.split(/[\/\-]/);
        if (day && month && year) {
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }

      if (typeof value === "number") {
        const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
        return jsDate.toISOString().split("T")[0];
      }

      return null;
    };

    // --- Normalize fields ---
    function normalizeRow(row) {
      const normalized = {
        last_name: row["Last Name"] || "",
        first_name: row["First Name"] || "",
        date_of_birth: formatDate(row["DOB (YYYY-MM-DD)"]),
        gender: row["Gender"] || "",
        marital_status: row["Marital Status"] || "",
        age_group: row["Age Group"] || "",
        address: row["Address"] || "",
        contact_number: row["Contact No."] || "",
        prev_church_attendee: normalizeBoolean(row["Previous Church Attendee?"]),
        prev_church: row["Previous Church Name"] || "",
        invited_by: row["Invited By"] || "",
        date_attended: row["Date Attended (YYYY-MM)"],
        attending_cell_group: normalizeBoolean(row["Attending Cellgroup?"]),
        cell_leader_name: row["Cellgroup Leader"] || "",
        church_ministry: row["Ministry"] || "",
        consolidation: row["Consolidation"] || "",
        reason: row["Reason"] || "",
        water_baptized: normalizeBoolean(row["Water Baptized?"]),
        willing_training: normalizeBoolean(row["Willing to Train?"]),
        member_status: row["Member Status"] || "",
      };

      // 🔹 Normalize spiritual trainings
      normalized.spiritual_trainings = normalizeTrainings(row);

      // 🔹 Normalize households (if columns provided)
      normalized.household_members = normalizeHouseholds(row);

      return normalized;
    }

    // --- Convert training columns into object with flags ---
    function normalizeTrainings(row) {
      const trainingObject = {};
      const trainingTypes = [
        "Life Class",
        "SOL 1",
        "SOL 2",
        "SOL 3",
      ];

      for (const type of trainingTypes) {
        const yesNo = row[type];
        const year = row[`${type} Year`];
        trainingObject[type.replace(/\s+/g, "")] = yesNo?.toString().toLowerCase() === "yes";
        trainingObject[`${type.replace(/\s+/g, "")}Year`] = year || null;
      }

      return trainingObject;
    }

    // --- Convert household columns into an array of objects ---
    function normalizeHouseholds(row) {
      // Support either JSON or delimited string
      const raw = row["Households (Format: Name - Relationship - DOB, comma separated)"];
      if (!raw) return [];

      if (typeof raw === "string") {
        try {
          // Case 1: valid JSON string
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.map(formatHousehold);
        } catch {
          // Case 2: comma-separated (like “Jane Doe - Wife - 1990-03-12, John - Son - 2015-06-21”)
          return raw.split(",").map((entry) => {
            const [name, relationship, date_of_birth] = entry.split("-").map((s) => s?.trim());
            return formatHousehold({ name, relationship, date_of_birth: formatDate(date_of_birth) });
          });
        }
      }

      if (Array.isArray(raw)) return raw.map(formatHousehold);
      return [];
    }

    function formatHousehold(h) {
      return {
        name: h.name || "",
        relationship: h.relationship || "",
        date_of_birth: formatDate(h.date_of_birth),
      };
    }

    // --- Process all rows ---
    for (const rawRow of sheet) {
      try {
        const row = normalizeRow(rawRow);
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
