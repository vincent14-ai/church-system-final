import supabase from "../config/db.js";

// 🔹 Add a new member
export async function addMember(memberData) {
  console.log('Backend received memberData:', memberData);
  const {
    photo_url, first_name, last_name, marital_status, date_of_birth, gender, contact_number, prev_church_attendee,
    address, age_group, prev_church, invited_by, date_attended, attending_cell_group, cell_leader_name,
    church_ministry, consolidation, reason, water_baptized, spiritual_trainings, willing_training,
    member_status, household_members,
  } = memberData;

  // 1️⃣ Insert into member_data
  const { data: member, error } = await supabase
    .from("member_data")
    .insert([{
      photo_url, first_name, last_name, marital_status, date_of_birth, gender, contact_number, prev_church_attendee,
      address, age_group, prev_church, invited_by, date_attended, attending_cell_group, cell_leader_name,
      church_ministry, consolidation, reason, water_baptized, willing_training, member_status,
      created_at: new Date(),
    }])
    .select()
    .single();

  if (error) throw error;

  const memberId = member.member_id;

  // 2️⃣ Insert spiritual trainings
  if (spiritual_trainings && typeof spiritual_trainings === "object") {
    const typeMap = { LifeClass: "Life Class", SOL1: "SOL 1", SOL2: "SOL 2", SOL3: "SOL 3" };
    const trainingsToInsert = Object.keys(spiritual_trainings)
      .filter(k => spiritual_trainings[k] === true && !k.endsWith("Year"))
      .map(k => ({
        member_id: memberId,
        training_type: typeMap[k] || k,
        year: spiritual_trainings[`${k}Year`] || null
      }));

    if (trainingsToInsert.length) {
      const { error: tError } = await supabase.from("spiritual_trainings").insert(trainingsToInsert);
      if (tError) throw tError;
    }
  }

  // 3️⃣ Insert household members
  if (household_members && household_members.length) {
    const householdsToInsert = household_members.map(h => ({
      member_id: memberId,
      name: h.name,
      relationship: h.relationship,
      date_of_birth: h.date_of_birth
    }));

    const { error: hError } = await supabase.from("household_members").insert(householdsToInsert);
    if (hError) throw hError;
  }

  return { id: memberId, ...memberData };
}

// 🔹 Get members with optional filters
export async function getMembers(filters = {}) {
  const {
    search, gender, marital_status, age_group,
    member_status, date_from, date_to,
  } = filters;

  // Start query
  let query = supabase
    .from('member_data')
    .select(`
      member_id,
      photo_url,
      first_name,
      last_name,
      marital_status,
      date_of_birth,
      gender,
      contact_number,
      prev_church_attendee,
      address,
      age_group,
      prev_church,
      invited_by,
      date_attended,
      attending_cell_group,
      cell_leader_name,
      church_ministry,
      consolidation,
      willing_training,
      reason,
      water_baptized,
      member_status,
      created_at,
      spiritual_trainings (
        training_type,
        year
      ),
      household_members (
        name,
        relationship,
        date_of_birth
      )
    `)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  // Filters
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }

  if (gender) query = query.eq('gender', gender);
  if (marital_status) query = query.eq('marital_status', marital_status);
  if (age_group && age_group !== 'all') query = query.eq('age_group', age_group);
  if (member_status && member_status !== 'all') query = query.eq('member_status', member_status);
  if (date_from && date_to) {
    query = query.gte('date_attended', date_from).lte('date_attended', date_to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  // Optionally format trainings and households as strings like your original SQL
  const formatted = data.map((member) => ({
    ...member,
    trainings: member.spiritual_trainings
      .map(t => `${t.training_type} (${t.year})`)
      .join(', '),
    households: member.household_members
      .map(h => `${h.name} - ${h.relationship} (${h.date_of_birth})`)
      .join('; '),
  }));

  return formatted;
}

// 🔹 Get member for attendance
export async function getMembersForAttendance() {
  const { data, error } = await supabase.from("member_data").select(`
    member_id, first_name, last_name, age_group, member_status
  `);

  if (error) throw error;

  // Perform concatenation in JavaScript
  return data.map(member => ({
    id: member.member_id,
    fullName: `${member.first_name} ${member.last_name}`,
    age_group: member.age_group,
    member_status: member.member_status
  }));
}

// 🔹 Get single member by ID
export async function getMemberByIdService(member_id) {
  const { data, error } = await supabase
    .from('member_data')
    .select(`
      member_id,
      photo_url,
      first_name,
      last_name,
      marital_status,
      date_of_birth,
      gender,
      contact_number,
      prev_church_attendee,
      address,
      age_group,
      prev_church,
      invited_by,
      date_attended,
      attending_cell_group,
      cell_leader_name,
      church_ministry,
      consolidation,
      willing_training,
      reason,
      water_baptized,
      member_status,
      created_at,
      spiritual_trainings (
        training_type,
        year
      ),
      household_members (
        name,
        relationship,
        date_of_birth
      )
    `)
    .eq('member_id', member_id)
    .single(); // ensures only one row is returned

  if (error) {
    console.error('Error fetching member:', error);
    return null;
  }

  // Format trainings and households as concatenated strings
  const member = {
    ...data,
    trainings: data.spiritual_trainings
      .map(t => `${t.training_type} (${t.year})`)
      .join(', '),
    households: data.household_members
      .map(h => `${h.name} - ${h.relationship} (${h.date_of_birth})`)
      .join('; '),
  };

  return member;
}

// 🔹 Update member info
export async function updateMemberService(member_id, updatedData) {
  // Update main member_data table
  const { error: mError } = await supabase
    .from("member_data")
    .update({
      photo_url: updatedData.photo_url,
      first_name: updatedData.first_name,
      last_name: updatedData.last_name,
      marital_status: updatedData.marital_status,
      date_of_birth: updatedData.date_of_birth,
      gender: updatedData.gender,
      contact_number: updatedData.contact_number,
      prev_church_attendee: updatedData.prev_church_attendee,
      address: updatedData.address,
      age_group: updatedData.age_group,
      prev_church: updatedData.prev_church,
      invited_by: updatedData.invited_by,
      date_attended: updatedData.date_attended,
      attending_cell_group: updatedData.attending_cell_group,
      cell_leader_name: updatedData.cell_leader_name,
      church_ministry: updatedData.church_ministry,
      consolidation: updatedData.consolidation,
      willing_training: updatedData.willing_training,
      reason: updatedData.reason,
      water_baptized: updatedData.water_baptized,
      member_status: updatedData.member_status
    })
    .eq("member_id", member_id);

  if (mError) throw mError;

  // Delete old trainings and insert new ones
  await supabase.from("spiritual_trainings").delete().eq("member_id", member_id);

  if (updatedData.spiritual_trainings) {
    const typeMap = { LifeClass: "Life Class", SOL1: "SOL 1", SOL2: "SOL 2", SOL3: "SOL 3" };
    const trainingsToInsert = Object.keys(updatedData.spiritual_trainings)
      .filter(k => updatedData.spiritual_trainings[k] === true && !k.endsWith("Year") && k !== "willing_training")
      .map(k => ({
        member_id,
        training_type: typeMap[k] || k,
        year: updatedData.spiritual_trainings[`${k}Year`] || null
      }));

    if (trainingsToInsert.length) {
      const { error: tError } = await supabase.from("spiritual_trainings").insert(trainingsToInsert);
      if (tError) throw tError;
    }
  }

  // Delete old households and insert new ones
  await supabase.from("household_members").delete().eq("member_id", member_id);

  if (updatedData.household_members && updatedData.household_members.length) {
    const householdsToInsert = updatedData.household_members.map(h => ({
      member_id,
      name: h.name,
      relationship: h.relationship,
      date_of_birth: h.date_of_birth
    }));

    const { error: hError } = await supabase.from("household_members").insert(householdsToInsert);
    if (hError) throw hError;
  }

  return { success: true };
}

// 🔹 Delete member
export async function deleteMemberService(member_id) {
  await supabase.from("spiritual_trainings").delete().eq("member_id", member_id);
  await supabase.from("household_members").delete().eq("member_id", member_id);
  const { error } = await supabase.from("member_data").delete().eq("member_id", member_id);
  if (error) throw error;

  return { success: true };
}
