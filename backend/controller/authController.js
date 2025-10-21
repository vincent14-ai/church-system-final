import { loginUser } from "../service/authService.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await loginUser(email, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
