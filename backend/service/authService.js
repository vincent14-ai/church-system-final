import db from "../config/db.js";

export async function loginUser(email, password) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password]
  );

  if (rows.length === 0) return null;

  const user = rows[0];
  return { id: user.id, email: user.email, role: user.role };
}
