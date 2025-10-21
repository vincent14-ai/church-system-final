import { addMember, getMembers, getMembersForAttendance } from "../service/memberService.js";

export async function createMember(req, res) {
  try {
    const {
      first_name, last_name, marital_status, date_of_birth, gender, contact_number, prev_church_attendee, address, age_group,
      prev_church, invited_by, date_attended, attending_cell_group, cell_leader_name, church_ministry, consolidation, reason, water_baptized, spiritual_trainings, 
      willing_training, member_status, created_at, household_members, 
    } = req.body;

    if (!first_name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // 🔥 Pass the whole object instead of a million args
    const newMember = await addMember({
      first_name, last_name, marital_status, date_of_birth, gender, contact_number, prev_church_attendee, address, age_group,
      prev_church, invited_by, date_attended, attending_cell_group, cell_leader_name, church_ministry, consolidation, reason, water_baptized, spiritual_trainings, 
      willing_training, member_status, created_at, household_members, 
    });

    res.status(201).json(newMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

export async function readMembers(req, res) {
  try {
    const filters = req.query; // grab query params
    const members = await getMembers(filters);
    res.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
}

export async function readMembersForAttendance(req, res) {
  try {
    const members = await getMembersForAttendance();
    res.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
}