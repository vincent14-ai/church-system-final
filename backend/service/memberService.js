import db from "../config/db.js";

export async function addMember(memberData) {
  const {
    first_name, last_name, marital_status, date_of_birth, gender, contact_number, prev_church_attendee,
    address, age_group, prev_church, invited_by, date_attended, attending_cell_group, cell_leader_name,
    church_ministry, consolidation, reason, water_baptized, spiritual_trainings, willing_training,
    member_status, created_at, household_members,
  } = memberData;

  // Insert into `member_data`
  const createdAt = new Date();
  const [result] = await db.query(
    `INSERT INTO member_data
     (first_name, last_name, marital_status, date_of_birth, gender, contact_number, prev_church_attendee, 
      address, age_group, prev_church, invited_by, date_attended, attending_cell_group, cell_leader_name, 
      church_ministry, consolidation, reason, water_baptized, willing_training, member_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name, last_name, marital_status, date_of_birth, gender, contact_number, prev_church_attendee,
      address, age_group, prev_church, invited_by, date_attended, attending_cell_group, cell_leader_name,
      church_ministry, consolidation, reason, water_baptized, willing_training, member_status, createdAt,
    ]
  );

  const memberId = result.insertId;

  // Insert trainings if provided
  let trainingArray = [];

  if (spiritual_trainings && typeof spiritual_trainings === "object") {
    const typeMap = {
      LifeClass: "Life Class",
      SOL1: "SOL 1",
      SOL2: "SOL 2",
      SOL3: "SOL 3",
    };

    for (const key of Object.keys(spiritual_trainings)) {
      if (spiritual_trainings[key] === true && !key.endsWith("Year")) {
        trainingArray.push({
          training_type: typeMap[key] || key,  // <- this line changed
          year: spiritual_trainings[`${key}Year`] || null,
        });
      }
    }
  }

  if (trainingArray.length > 0) {
    for (const t of trainingArray) {
      await db.query(
        `INSERT INTO spiritual_trainings (member_id, training_type, year) VALUES (?, ?, ?)`,
        [memberId, t.training_type, t.year]
      );
    }
  }

  // Insert household members if provided
  if (household_members && household_members.length > 0) {
    for (const h of household_members) {
      await db.query(
        `INSERT INTO household_members (member_id, name, relationship, date_of_birth) VALUES (?, ?, ?, ?)`,
        [memberId, h.name, h.relationship, h.date_of_birth]
      );
    }
  }

  return { id: memberId, ...memberData };
}

export async function getMembers(filters = {}) {
  const {
    search, gender, marital_status, age_group,
    member_status, date_from, date_to,
  } = filters;

  let whereClauses = [];
  let params = [];

  // 👇 Dynamically add conditions
  if (search) {
    whereClauses.push("(m.first_name LIKE ? OR m.last_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (gender) {
    whereClauses.push("m.gender = ?");
    params.push(gender);
  }

  if (marital_status) {
    whereClauses.push("m.marital_status = ?");
    params.push(marital_status);
  }

  if (age_group) {
    whereClauses.push("m.age_group = ?");
    params.push(age_group);
  }

  if (member_status) {
    whereClauses.push("m.member_status = ?");
    params.push(member_status);
  }

  if (date_from && date_to) {
    whereClauses.push("m.date_attended BETWEEN ? AND ?");
    params.push(date_from, date_to);
  }

  // Build final WHERE clause
  const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  const [rows] = await db.query(`
    SELECT 
      m.member_id, m.first_name, m.last_name, m.marital_status, m.date_of_birth,m.gender, 
      m.contact_number, m.prev_church_attendee, m.address, m.age_group, m.prev_church, m.invited_by, 
      m.date_attended, m.attending_cell_group, m.cell_leader_name, m.church_ministry, 
      m.consolidation, m.willing_training, m.reason, m.water_baptized, m.member_status, m.created_at,
      GROUP_CONCAT(DISTINCT CONCAT(st.training_type, ' (', st.year, ')') SEPARATOR ', ') AS trainings,
      GROUP_CONCAT(DISTINCT CONCAT(hm.name, ' - ', hm.relationship, ' (', hm.date_of_birth, ')') SEPARATOR '; ') AS households
    FROM member_data m
    LEFT JOIN spiritual_trainings st ON m.member_id = st.member_id
    LEFT JOIN household_members hm ON m.member_id = hm.member_id
    ${whereSQL}
    GROUP BY m.member_id
  `, params);


  return rows;
}

export async function getMembersForAttendance() {
  const [rows] = await db.query("SELECT member_id AS id, CONCAT(first_name, ' ', last_name) AS fullName, age_group AS ageGroup, member_status FROM member_data");

  return rows;
}