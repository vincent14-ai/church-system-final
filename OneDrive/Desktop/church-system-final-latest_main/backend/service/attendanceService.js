import supabase from "../config/db.js";
import { normalizeToLocalDate } from "../utils/date.js";

export async function setAttendance(member_id, date, status) {
  try {
    // Convert to YYYY-MM-DD
    const normalizedDate = date.split("T")[0];

    const { error } = await supabase
      .from("attendance")
      .upsert(
        {
          member_id,
          date: normalizedDate,
          status,
        },
        {
          onConflict: "member_id,date", // must match your uniqueness constraint
        }
      );

    if (error) {
      console.error("Supabase attendance upsert error:", error);
      throw error;
    }

    return { success: true, message: "Attendance saved." };
  } catch (err) {
    console.error("Error saving attendance:", err);
    throw err;
  }
}

export async function getAttendanceByDate(date) {
  const normalizedDate = date.split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select(`
      member_id,
      date,
      status,
      member_data (
        first_name,
        last_name,
        age_group
      )
    `)
    .eq("date", normalizedDate)
    .order("member_data(last_name)")
    .order("member_data(first_name)");

  if (error) throw error;

  // Flatten for frontend compatibility
  return data.map(a => ({
    id: a.member_id,
    fullName: `${a.member_data.last_name} ${a.member_data.first_name}`,
    ageGroup: a.member_data.age_group,
    date: a.date,
    status: a.status,
  }));
}


export async function getAttendanceSummaryByDate(date) {
  const normalizedDate = date.split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("date", normalizedDate);

  if (error) throw error;

  const presentCount = data.filter(a => a.status === "present").length;
  const absentCount = data.filter(a => a.status === "absent").length;
  const totalCount = data.length;

  return { presentCount, absentCount, totalCount };
}


export async function getFilteredAttendance(filters) {
  const { search, ageGroup, status, dateFrom, dateTo } = filters;

  let query = supabase
    .from("attendance")
    .select(`
      member_id,
      date,
      status,
      member_data (
        first_name,
        last_name,
        age_group,
        member_status
      )
    `);

  if (search) {
    query = query.or(`member_data.first_name.ilike.%${search}%,member_data.last_name.ilike.%${search}%`);
  }

  if (ageGroup && ageGroup !== "all") {
    query = query.eq("member_data.age_group", ageGroup);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (dateFrom && dateTo) {
    query = query.gte("date", dateFrom).lte("date", dateTo);
  } else if (dateFrom) {
    query = query.gte("date", dateFrom);
  } else if (dateTo) {
    query = query.lte("date", dateTo);
  }

  query = query.order("date", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  const records = data.map(a => ({
    id: a.member_id,
    fullName: `${a.member_data.first_name} ${a.member_data.last_name}`,
    ageGroup: a.member_data.age_group,
    memberStatus: a.member_data.member_status,
    date: a.date,
    status: a.status,
  }));

  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const totalCount = records.length;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return {
    records,
    summary: { presentCount, absentCount, totalCount, rate },
  };
}


