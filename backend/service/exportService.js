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
    { header: "Cellgroup Leader", key: "cell_group_leader", width: 30 },
    { header: "Ministry", key: "church_ministry", width: 30 },
    { header: "Consolidation", key: "consolidation", width: 30 },
    { header: "Trainings", key: "trainings", width: 30 },
    { header: "Willing to Train?", key: "willing_training", width: 15 },
    { header: "Reason", key: "reason", width: 15 },
    { header: "Water Baptized", key: "water_baptized", width: 15 },
    { header: "Households", key: "households", width: 30 },
    { header: "Member Status", key: "member_status", width: 20 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" }, // slate-800
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add rows
  members.forEach((m) => {
    worksheet.addRow(m);
  });

  // Auto style borders
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Return buffer for download
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
