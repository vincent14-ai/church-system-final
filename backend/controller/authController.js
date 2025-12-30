import jwt from "jsonwebtoken";
import { createRefreshToken, generateToken } from "../config/jwt.js";
import { loginUser } from "../service/authService.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await loginUser(email, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const refreshToken = createRefreshToken({ id: user.user.id });
    // Set SameSite=None so the cookie can be sent with cross-site requests (required for fetch XHR).
    // Secure should be true in production (HTTPS). For local development we keep secure=false.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      email: user.user.email,
      role: user.user.role,
      token: user.token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function refreshToken(req, res) {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateToken(decoded.id);
    return res.json({ token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}
