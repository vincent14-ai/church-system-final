import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/jwt.js";

export async function loginUser(email, password) {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) return null;

  const user = rows[0];

  // Validate password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return null;

  // Generate JWT using your config utility
  const token = generateToken(user.id);

  // Return both user info and token
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  };
}