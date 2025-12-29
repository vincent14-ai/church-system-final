import { createRefreshToken } from "../../config/jwt.js";
import { loginUser } from "../../service/authService.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await loginUser(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const refreshToken = createRefreshToken({ id: user.user.id });

    // ✅ Manually set cookie (NO cookie-parser in serverless)
    res.setHeader("Set-Cookie", [
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=None; Secure`
    ]);

    return res.status(200).json({
      email: user.user.email,
      role: user.user.role,
      token: user.token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
