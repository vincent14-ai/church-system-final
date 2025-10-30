import ExcelJS from "exceljs";

export async function generateMemberReport(members) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Members");

  // Set up header row
  worksheet.columns = [
    { header: "Last Name", key: "last_name", width: 20 },
    { header: "First Name", key: "first_name", width: 20 },
    { header: "DOB", key: "date_of_birth", width: 15 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Marital Status", key: "marital_status", width: 15 },
    { header: "Age Group", key: "age_group", width: 15 },
    { header: "Address", key: "address", width: 25 },
    { header: "Contact No.", key: "contact_number", width: 20 },
    { header: "Previous Church Attendee?", key: "prev_church_attendee", width: 20 },
    { header: "Previous Church Name", key: "prev_church_name", width: 20 },
    { header: "Invited By", key: "invited_by", width: 20 },
    { header: "Date Attendded", key: "date_attended", width: 20 },
    { header: "Attending Cellgroup?", key: "attending_cell_group", width: 30 },
    { header: "Cellgroup Leader", key: "cell_leader_name", width: 30 },
    { header: "Ministry", key: "church_ministry", width: 30 },
    { header: "Consolidation", key: "consolidation", width: 30 },
    { header: "Trainings", key: "trainings", width: 30 },
    { header: "Willing to Train?", key: "willing_training", width: 15 },
    { header: "Reason", key: "reason", width: 15 },
    { header: "Water Baptized?", key: "water_baptized", width: 15 },
    { header: "Households", key: "households", width: 30 },
    { header: "Member Status", key: "member_status", width: 20 },
  ];

  // Style header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" }, // slate-800
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 22;

  // Borders
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Add rows
  members.forEach((m) => {
    const rowData = {
      ...m,
      prev_church_attendee: m.prev_church_attendee ? "Yes" : "No",
      attending_cell_group: m.attending_cell_group ? "Yes" : "No",
      willing_training: m.willing_training ? "Yes" : "No",
      water_baptized: m.water_baptized ? "Yes" : "No",
    };
    worksheet.addRow(rowData);
  });

  // Return buffer for download
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function generateMemberTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Members");

  // Hidden sheet for dropdown options
  const listSheet = workbook.addWorksheet("Lists");
  listSheet.state = "veryHidden";

  // Dropdown value lists
  listSheet.getColumn("A").values = ["Gender", "M", "F"];
  listSheet.getColumn("B").values = ["Marital Status", "Single", "Married", "Divorced", "Widowed"];
  listSheet.getColumn("C").values = [
    "Age Group",
    "Children",
    "Young Adult",
    "Young Married",
    "Middle Adult",
    "Senior Adult",
  ];
  listSheet.getColumn("D").values = ["Ministry", "Content", "Ushering", "Media"];
  listSheet.getColumn("E").values = ["Yes/No", "Yes", "No"];
  listSheet.getColumn("F").values = ["Member Status", "Active", "Inactive"];

  // Headers (structured for your importer)
  worksheet.columns = [
    { header: "Last Name", key: "last_name", width: 20 },
    { header: "First Name", key: "first_name", width: 20 },
    { header: "DOB", key: "date_of_birth", width: 20 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Marital Status", key: "marital_status", width: 15 },
    { header: "Age Group", key: "age_group", width: 15 },
    { header: "Address", key: "address", width: 25 },
    { header: "Contact No.", key: "contact_number", width: 20 },
    { header: "Previous Church Attendee?", key: "prev_church_attendee", width: 25 },
    { header: "Previous Church Name", key: "prev_church_name", width: 25 },
    { header: "Invited By", key: "invited_by", width: 20 },
    { header: "Date Attended", key: "date_attended", width: 20 },
    { header: "Attending Cellgroup?", key: "attending_cell_group", width: 25 },
    { header: "Cellgroup Leader", key: "cell_group_leader", width: 30 },
    { header: "Ministry", key: "church_ministry", width: 25 },

    // --- Trainings (structured, matches importer normalizeTrainings) ---
    { header: "Life Class", key: "Life Class", width: 20 },
    { header: "SOL 1", key: "SOL 1", width: 20 },
    { header: "SOL 2", key: "SOL 2", width: 20 },
    { header: "SOL 3", key: "SOL 3", width: 20 },

    // --- Other fields ---
    { header: "Willing to Train?", key: "willing_training", width: 20 },
    { header: "Consolidation", key: "consolidation", width: 30 },
    { header: "Reason", key: "reason", width: 20 },
    { header: "Water Baptized?", key: "water_baptized", width: 20 },

    // --- Household structure ---
    {
      header:
        'Households (Format: Name - Relationship - DOB, comma separated)',
      key: "households",
      width: 50,
    },

    { header: "Member Status", key: "member_status", width: 20 },
  ];

  // Style header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" }, // slate-800
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 22;

  // Borders
  worksheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Add dropdowns for validation
  for (let row = 2; row <= 100; row++) {
    worksheet.getCell(`D${row}`).dataValidation = {
      type: "list",
      formulae: ["=Lists!$A$2:$A$3"],
      showErrorMessage: true,
      errorTitle: "Invalid Gender",
      error: "Select M or F.",
    };
    worksheet.getCell(`E${row}`).dataValidation = {
      type: "list",
      formulae: ["=Lists!$B$2:$B$5"],
      showErrorMessage: true,
      errorTitle: "Invalid Marital Status",
      error: "Select a valid marital status.",
    };
    worksheet.getCell(`F${row}`).dataValidation = {
      type: "list",
      formulae: ["=Lists!$C$2:$C$7"],
      showErrorMessage: true,
      errorTitle: "Invalid Age Group",
      error: "Select a valid age group.",
    };
    worksheet.getCell(`O${row}`).dataValidation = {
      type: "list",
      formulae: ["=Lists!$D$2:$D$4"],
      showErrorMessage: true,
      errorTitle: "Invalid Ministry",
      error: "Select a valid ministry.",
    };

    // YES/NO dropdowns (for all boolean fields)
    const yesNoCols = ["I", "M", "T", "W"];
    yesNoCols.forEach((col) => {
      worksheet.getCell(`${col}${row}`).dataValidation = {
        type: "list",
        formulae: ["=Lists!$E$2:$E$3"],
        showErrorMessage: true,
        errorTitle: "Invalid Choice",
        error: "Select Yes or No.",
      };
    });

    worksheet.getCell(`Y${row}`).dataValidation = {
      type: "list",
      formulae: ["=Lists!$F$2:$F$3"],
      showErrorMessage: true,
      errorTitle: "Invalid Status",
      error: "Select a valid status.",
    };
  }

  // Freeze header
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
