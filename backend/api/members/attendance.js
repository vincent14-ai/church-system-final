import { getMembersForAttendance } from "../../service/memberService.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const members = await getMembersForAttendance();
    res.status(200).json(members);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch members for attendance" });
  }
}
