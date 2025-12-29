import jwt from "jsonwebtoken";
import { generateToken } from "../../config/jwt.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return res.status(401).json({ message: "No refresh token" });
    }

    // 🔹 Manually parse cookies
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(c => c.split("="))
    );

    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const newAccessToken = generateToken(decoded.id);

    return res.status(200).json({ token: newAccessToken });

  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}
