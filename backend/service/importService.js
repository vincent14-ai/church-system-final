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

      // If Excel gives a Date object
      if (value instanceof Date && !isNaN(value)) {
        return value.toISOString().split("T")[0];
      }

      // Normalize string (trim weird spaces)
      const str = String(value).trim();

      // Handle Excel-style date like "01-Apr-53" or "1-Apr-53"
      const excelMatch = str.match(/^(\d{1,2})[-\s]?([A-Za-z]{3,})[-\s]?(\d{2,4})$/);
      if (excelMatch) {
        let [_, day, monthStr, year] = excelMatch;
        const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth(); // Apr -> 3

        // Fix two-digit year: assume anything >= 30 is 1900s, else 2000s
        if (year.length === 2) {
          year = parseInt(year, 10);
          year = year >= 30 ? 1900 + year : 2000 + year;
        }

        return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }

      // Try normal JS date parsing
      const parsed = new Date(str);
      if (!isNaN(parsed)) {
        return parsed.toISOString().split("T")[0];
      }

      // Fallback: manual parsing for variants like "25-11-1985", "Nov 25 1985"
      const parts = str.split(/[\/\-\s,]+/);
      if (parts.length === 3) {
        let [a, b, c] = parts;
        // Detect order
        if (isNaN(a)) {
          // Month name first
          const monthIndex = new Date(`${a} 1, 2000`).getMonth();
          return `${c}-${String(monthIndex + 1).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
        } else if (isNaN(b)) {
          // Day first, month word second
          const monthIndex = new Date(`${b} 1, 2000`).getMonth();
          return `${c}-${String(monthIndex + 1).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
        } else {
          // All numbers → assume Y-M-D or D-M-Y depending on year length
          if (a.length === 4) {
            return `${a}-${b.padStart(2, "0")}-${c.padStart(2, "0")}`;
          } else {
            return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
          }
        }
      }

      return null;
    }

    function normalizeDateAttended(value) {
      if (!value) return null;

      // If it's already a Date object
      if (value instanceof Date && !isNaN(value)) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
      }

      const str = value.toString().trim();

      // --- CASE 1: Year only ---
      if (/^\d{4}$/.test(str)) {
        return `${str}-01`;
      }

      // --- CASE 2: Month-Year formats like "Jul-10" or "December 2014" ---
      const monthYearMatch = str.match(/^(?:([A-Za-z]+)|(\d{1,2}))[\s\/\-]+(\d{2,4})$/);
      if (monthYearMatch) {
        const monthName = monthYearMatch[1];
        const monthNum = monthYearMatch[2];
        let year = monthYearMatch[3];

        let month;
        if (monthName) {
          const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
          month = monthIndex + 1;
        } else {
          month = parseInt(monthNum, 10);
        }

        if (year.length === 2) {
          const yearNum = parseInt(year, 10);
          year = yearNum < 50 ? `20${year}` : `19${year}`;
        }

        return `${year}-${String(month).padStart(2, "0")}`;
      }

      // --- CASE 3: DD/MM/YYYY or MM/DD/YYYY strings ---
      const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (slashMatch) {
        const [_, day, month, year] = slashMatch;
        return `${year}-${String(month).padStart(2, "0")}`;
      }

      // --- CASE 4: fallback to JS Date parsing ---
      const parsed = new Date(str);
      if (!isNaN(parsed)) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
      }

      return null; // fallback
    }

    // Converts various date formats into "YYYY-MM-DD"
    function formatDate(value) {
      if (!value) return null;

      // If Excel/WPS gives a Date object
      if (value instanceof Date && !isNaN(value)) {
        return value.toISOString().split("T")[0];
      }

      const str = value.toString().trim();

      // Case 1: Full date recognized by JS
      let parsed = new Date(str);
      if (!isNaN(parsed)) return parsed.toISOString().split("T")[0];

      // Case 2: Month-Year like "December 2014" or "Dec-2014" or "12/2014"
      const monthYearMatch = str.match(/^(?:([A-Za-z]+)|(\d{1,2}))[\-\/\s]+(\d{4})$/);
      if (monthYearMatch) {
        const monthName = monthYearMatch[1];
        const monthNum = monthYearMatch[2];
        const year = monthYearMatch[3];

        let month;
        if (monthName) {
          month = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
        } else {
          month = parseInt(monthNum, 10);
        }

        return `${year}-${String(month).padStart(2, "0")}-01`; // default to first day
      }

      // Case 3: Short Excel-style like "01-Apr-53"
      const excelMatch = str.match(/^(\d{1,2})-([A-Za-z]+)-(\d{2,4})$/);
      if (excelMatch) {
        let [_, day, monthStr, year] = excelMatch;
        day = String(day).padStart(2, "0");
        const month = new Date(`${monthStr} 1, 2000`).getMonth() + 1;
        year = year.length === 2 ? "19" + year : year; // assume 1900s for two-digit years
        return `${year}-${String(month).padStart(2, "0")}-${day}`;
      }

      return null; // fallback
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
      // Raw value from backend
      const raw = row["households"] || row["Households (Format: Name - Relationship - DOB, comma separated)"];
      if (!raw) return [];

      // If already an array (e.g., parsed JSON)
      if (Array.isArray(raw)) return raw.map(formatHousehold);

      if (typeof raw === "string") {
        try {
          // Case 1: JSON string
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.map(formatHousehold);
        } catch {
          // Case 2: semicolon-separated (current DB format)
          if (raw.includes(";")) {
            return raw.split(";").map((entry) => {
              const match = entry.trim().match(/^(.*?)\s*-\s*(.*?)\s*\((.*?)\)$/);
              if (match) {
                const [_, name, relationship, dob] = match;
                return formatHousehold({ name, relationship, date_of_birth: formatDate(dob) });
              }
              return null;
            }).filter(Boolean);
          }

          // Case 3: comma-separated (legacy)
          return raw.split(",").map((entry) => {
            const [name, relationship, date_of_birth] = entry.split("-").map((s) => s?.trim());
            return formatHousehold({ name, relationship, date_of_birth: formatDate(date_of_birth) });
          });
        }
      }

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
