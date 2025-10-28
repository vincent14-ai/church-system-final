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

    function normalizeDate(value) {
      if (!value) return null;

      // If Excel gives you a Date object (sometimes it does!)
      if (value instanceof Date && !isNaN(value)) {
        return value.toISOString().split("T")[0];
      }

      // If it's a string like "November 25, 1985" or "Nov 25, 1985"
      const parsed = new Date(value);
      if (!isNaN(parsed)) {
        return parsed.toISOString().split("T")[0];
      }

      // Fallback: try manual parsing if Excel made it weird
      const parts = value.split(/[\/\-\s,]+/); // handles "Nov 25 1985", "25-11-1985", etc.
      if (parts.length === 3) {
        let [month, day, year] = parts;
        // If month is word, convert it to number
        if (isNaN(month)) {
          const monthIndex = new Date(`${month} 1, 2000`).getMonth();
          month = monthIndex + 1;
        }
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }

      return null; // fallback if it's totally unrecognizable
    }

    function normalizeDateAttended(value) {
      if (!value) return null;

      // Excel sometimes gives actual Date objects
      if (value instanceof Date && !isNaN(value)) {
        return value.toISOString().split("T")[0];
      }

      const str = value.toString().trim();

      // --- CASE 1: Year only ---
      if (/^\d{4}$/.test(str)) {
        // just a year
        return `${str}-01`; // or `${str}-01-01` if you prefer full date
      }

      // --- CASE 2: Month and Year ---
      // Handles "November/2014", "Nov 2014", "11/2014"
      const monthYearMatch = str.match(
        /^(?:([A-Za-z]+)|(\d{1,2}))[\s\/\-]+(\d{4})$/
      );
      if (monthYearMatch) {
        const monthName = monthYearMatch[1];
        const monthNum = monthYearMatch[2];
        const year = monthYearMatch[3];

        let month;
        if (monthName) {
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
          month = monthIndex + 1;
        } else {
          month = parseInt(monthNum, 10);
        }

        return `${year}-${String(month).padStart(2, "0")}`;
        // or `${year}-${String(month).padStart(2, "0")}-01` if you want full date format
      }

      // --- CASE 3: Full date (November 25, 1985 or 11/25/1985) ---
      const parsed = new Date(str);
      if (!isNaN(parsed)) {
        return parsed.toISOString().split("T")[0];
      }

      return null; // fallback if unrecognizable
    }


    // --- Normalize fields ---
    function normalizeRow(row) {
      const normalized = {
        last_name: row["Last Name"] || "",
        first_name: row["First Name"] || "",
        date_of_birth: normalizeDate(row["DOB"]),
        gender: row["Gender"] || "",
        marital_status: row["Marital Status"] || "",
        age_group: row["Age Group"] || "",
        address: row["Address"] || "",
        contact_number: row["Contact No."] || "",
        prev_church_attendee: normalizeBoolean(row["Previous Church Attendee?"]),
        prev_church: row["Previous Church Name"] || "",
        invited_by: row["Invited By"] || "",
        date_attended: normalizeDateAttended(row["Date Attended"]),
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
      const trainingTypes = ["Life Class", "SOL 1", "SOL 2", "SOL 3"];

      for (const type of trainingTypes) {
        const value = row[type];
        if (value) {
          trainingObject[type.replace(/\s+/g, "")] = true;   // completed
          trainingObject[`${type.replace(/\s+/g, "")}Year`] = value.toString();
        } else {
          trainingObject[type.replace(/\s+/g, "")] = false;  // not completed
          trainingObject[`${type.replace(/\s+/g, "")}Year`] = null;
        }
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
