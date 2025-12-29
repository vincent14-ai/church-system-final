import { addMember, getMembers } from "../../service/memberService.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const filters = req.query;
      const members = await getMembers(filters);
      res.status(200).json(members);

    } else if (req.method === "POST") {
      const newMember = await addMember(req.body);
      res.status(201).json(newMember);

    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
