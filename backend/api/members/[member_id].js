import { getMemberByIdService, updateMemberService, deleteMemberService } from "../../service/memberService.js";

export default async function handler(req, res) {
  const { member_id } = req.query; // Vercel uses req.query for dynamic routes

  try {
    if (req.method === "GET") {
      const member = await getMemberByIdService(member_id);
      if (!member) return res.status(404).json({ message: "Member not found" });
      res.status(200).json(member);

    } else if (req.method === "PUT") {
      const result = await updateMemberService(member_id, req.body);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Member not found" });
      res.status(200).json({ message: "Member updated successfully" });

    } else if (req.method === "DELETE") {
      const result = await deleteMemberService(member_id);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Member not found" });
      res.status(200).json({ message: "Member deleted successfully" });

    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
